/* ============================================================================
   stage.js — 캔버스 / 리사이즈 / 논리좌표 / 해상도
   ----------------------------------------------------------------------------
   ● 광고 모드 (기본)  : 폭 540 고정, 높이는 기기 비율을 따라감 → 레터박스 0
   ● 영상 모드 (?video=1): 540×960 정확히 9:16 고정 + 정수 배율 업스케일
                          RENDER.scale 하나만 올리면 4K 까지 그대로 커진다.
   ----------------------------------------------------------------------------
   ★ 규칙: 모든 좌표·폰트·선굵기는 "논리 단위(540 기준)"로만 쓴다.
     픽셀값을 하드코딩하지 않으므로 scale 1~8 어디서도 레이아웃이 깨지지 않는다.
   ========================================================================== */

var Q = (function () {
  var o = {}, s = (location.search || '').replace(/^\?/, '');
  if (s) s.split('&').forEach(function (kv) { var p = kv.split('='); o[p[0]] = p[1] === undefined ? '1' : p[1]; });
  return o;
})();

var RENDER = {
  mode  : Q.video ? 'video' : 'ad',
  baseW : 540,
  baseH : 960,                                  /* 영상 모드 전용 (정확히 9:16) */
  scale : Math.max(1, Math.min(8, parseInt(Q.scale || '2', 10) || 2)),
  fixedStep : !!Q.video                          /* 영상 모드는 고정 dt (재현성) */
};

/* ── 시드 난수 — video 모드에서 매 실행 동일 결과를 보장 (녹화 재현성) ── */
var _seed = 20260901;
function seed(n) { _seed = n >>> 0; }
function rand() { _seed = (_seed * 1664525 + 1013904223) >>> 0; return _seed / 4294967296; }

function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rnd(a, b) { return a + rand() * (b - a); }
function ri(n) { return (rand() * n) | 0; }
function eOut(t) { return 1 - Math.pow(1 - t, 3); }
function eIn(t) { return t * t * t; }

var Stage = {
  W: 540, H: 960,
  cv: null, ctx: null,
  scale: 1, offX: 0, offY: 0, dpr: 1,
  vw: 0, vh: 0,
  pf: { x: 0, y: 0, w: 540, h: 960 },   /* 플레이 영역 */

  init: function () {
    this.cv = document.getElementById('cv');
    this.ctx = this.cv.getContext('2d');
    this.resize();
    var self = this;
    window.addEventListener('resize', function () { self.resize(); });
    window.addEventListener('orientationchange', function () { setTimeout(function () { self.resize(); }, 120); });
  },

  resize: function () {
    this.W = RENDER.baseW;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (RENDER.mode === 'video') {
      /* 영상 모드 — 논리 540×960 고정, 백버퍼는 정수 배율 그대로 */
      this.H = RENDER.baseH;
      this.scale = RENDER.scale;
      this.dpr = 1;
      this.vw = this.W * this.scale; this.vh = this.H * this.scale;
      this.cv.width = this.vw; this.cv.height = this.vh;
      /* 화면보다 크면 CSS 로만 축소해서 보여준다 (백버퍼 해상도는 유지) */
      var fit = Math.min(1, Math.min(window.innerWidth / this.vw, window.innerHeight / this.vh));
      this.cv.style.width = (this.vw * fit) + 'px';
      this.cv.style.height = (this.vh * fit) + 'px';
      this.offX = 0; this.offY = 0;
    } else {
      /* 광고 모드 — 폭 고정 / 높이 가변 */
      var vw = Math.max(1, window.innerWidth), vh = Math.max(1, window.innerHeight);
      this.vw = vw; this.vh = vh;
      this.H = Math.round(clamp(this.W * vh / vw, 810, 1280));
      this.scale = Math.min(vw / this.W, vh / this.H);
      this.offX = (vw - this.W * this.scale) / 2;
      this.offY = (vh - this.H * this.scale) / 2;
      this.cv.style.width = vw + 'px'; this.cv.style.height = vh + 'px';
      this.cv.width = Math.floor(vw * this.dpr);
      this.cv.height = Math.floor(vh * this.dpr);
    }

    /* 플레이 영역: 상단 HUD 아래 ~ 하단 여백 위 */
    this.pf.x = 0; this.pf.w = this.W;
    /* 플레이 영역 상단 — 상단 HUD(재화·웨이브·타이머·진행바 2단) 아래.
       진행 바가 한 줄에서 두 줄로 늘어나며 86 → 110 이 됐다.
       여기를 줄이면 바와 몹이 겹친다 (qa.js ① 상단침범 검사가 70 하한을 본다) */
    this.pf.y = 110; this.pf.h = this.H - 110;
    if (typeof onStageResize === 'function') onStageResize();
  },

  /* 매 프레임 시작. 디바이스 픽셀 전체를 칠한 뒤 논리좌표로 전환 */
  begin: function (bg) {
    var c = this.ctx, k = this.scale * this.dpr;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = bg; c.fillRect(0, 0, this.cv.width, this.cv.height);
    c.setTransform(k, 0, 0, k, this.offX * this.dpr, this.offY * this.dpr);
    c.imageSmoothingEnabled = false;
  },

  /* 논리 좌표를 "디바이스 픽셀 격자"에 맞춘다.
     begin() 이 setTransform(scale*dpr) 로 소수 배율을 걸기 때문에,
     논리값만 Math.round 해봐야 실제 픽셀은 여전히 반픽셀에 앉는다.
     스프라이트를 또 한 번 리샘플시키는 원인이라 결과 화면 같은 정지 요소에 쓴다. */
  snap: function (v) {
    var k = this.scale * this.dpr;
    return k > 0 ? Math.round(v * k) / k : v;
  },

  toLocal: function (cx, cy) {
    var r = this.cv.getBoundingClientRect();
    var k = RENDER.mode === 'video' ? (r.width / this.W) : this.scale;
    return { x: (cx - r.left) / k, y: (cy - r.top) / k };
  }
};
