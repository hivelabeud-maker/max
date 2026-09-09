/* ============================================================================
   anim.js — 프레임 애니메이션 레이어 (sprite.js 위에 얹는다)

   시트는 "가로 스트립" 하나 = 애니 하나. 메타는 data/atlas.js (prep_anim.py 생성).
     n  프레임 수 · fw/fh 셀 크기 · ax/ay 셀 안의 원점 위치(0~1 비율)

   ★ 원점(ax,ay)은 원본 캔버스 중심이다. 리타의 idle/run/fire 가 같은 원점을
     공유하므로 애니를 갈아타도 캐릭터가 튀지 않는다. 몬스터도 동일.
   ========================================================================== */
var Anim = {
  _tint: {},

  has: function (key) {
    if (typeof ATLAS === 'undefined' || !ATLAS[key]) return false;
    var s = Sprites.cache[key];
    return !!(s && s.src === 'sheet');
  },

  meta: function (key) {
    return (typeof ATLAS !== 'undefined') ? ATLAS[key] : null;
  },

  /* 표시 높이(논리 px) → 배율. 셀 높이 = 콘텐츠 높이라 그대로 나눈다.

     ★ 1배를 넘지 않는다 — 시트 아트를 원본 해상도보다 크게 그리면 바이리니어로
       뭉개진다. 결과 화면이 1.248배로 확대하다가 캐릭터가 다 뭉개진 적이 있다.
       요청 높이가 셀보다 크면 "요청보다 작게, 대신 선명하게" 그린다.
       (축소는 얼마든지 괜찮다 — 인게임은 전부 1배 미만이라 영향 없음) */
  fit: function (key, hLogic) {
    var m = this.meta(key);
    return m ? Math.min(1, hLogic / m.fh) : 1;
  },

  /* 재생 시간 → 프레임 번호 (루프) */
  frameAt: function (key, t, fps) {
    var m = this.meta(key); if (!m) return 0;
    var f = Math.floor(t * (fps || 12)) % m.n;
    return f < 0 ? f + m.n : f;
  },

  /* 스트립 전체를 한 색으로 구운 실루엣 — 피격 플래시용. 색당 1장만 만든다. */
  silhouette: function (key, col) {
    var id = key + '|' + col, c = this._tint[id];
    if (c) return c;
    var s = Sprites.cache[key]; if (!s || s.src !== 'sheet') return null;
    var cv = document.createElement('canvas');
    cv.width = s.w; cv.height = s.h;
    var g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.drawImage(s.cv, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = col; g.fillRect(0, 0, s.w, s.h);
    this._tint[id] = cv;
    return cv;
  },

  /* (x, y) = 원점.  k = 셀 배율.
     opt: { flip, alpha, tint, tintA, squash, tilt } */
  draw: function (key, frame, x, y, k, opt) {
    var m = this.meta(key); if (!m) return false;
    var s = Sprites.cache[key]; if (!s || s.src !== 'sheet') return false;
    opt = opt || {};
    var c = Stage.ctx;
    var fw = m.fw, fh = m.fh;
    var sx = (frame % m.n) * fw;
    var w = fw * k, h = fh * k;
    var ox = m.ax * w, oy = m.ay * h;      /* 원점까지의 오프셋 */

    c.save();
    /* snap — 정지에 가까운 대상(결과 화면 캐릭터)을 디바이스 픽셀 격자에 앉힌다.
       ★ 논리 좌표만 Math.round 하면 소용없다. 전역 변환이 scale*dpr(≈1.44)로
         소수 배율이라 논리 정수가 디바이스 반픽셀이 된다. Stage.snap 이 그걸 처리한다.
       계속 움직이는 대상(인게임 캐릭터)에 걸면 튀므로 쓰지 않는다. */
    if (opt.snap) c.translate(Stage.snap(x), Stage.snap(y));
    else c.translate(x, y);
    if (opt.tilt) c.rotate(opt.tilt);
    if (opt.squash) c.scale(1 / opt.squash, opt.squash);
    if (opt.flip) c.scale(-1, 1);
    if (opt.alpha !== undefined) c.globalAlpha = opt.alpha;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(s.cv, sx, 0, fw, fh, -ox, -oy, w, h);
    if (opt.tint) {
      var t = this.silhouette(key, opt.tint);
      if (t) {
        c.globalAlpha = (opt.tintA === undefined ? 0.7 : opt.tintA) *
                        (opt.alpha === undefined ? 1 : opt.alpha);
        c.drawImage(t, sx, 0, fw, fh, -ox, -oy, w, h);
      }
    }
    c.restore();
    return true;
  },

  /* 사용자 제공 UI 아이콘(시트)을 (cx, cy) 중심에 높이 h 로 그린다.
     시트가 없으면 false — 호출부가 도트 폴백으로 넘어간다.
     소스보다 크게는 절대 그리지 않는다 (fit 과 같은 1배 상한). */
  pic: function (key, cx, cy, h, alpha) {
    var s = Sprites.cache[key];
    if (!s || s.src !== 'sheet') return false;
    var k = Math.min(1, h / s.h);
    var w = s.w * k; h = s.h * k;
    var c = Stage.ctx;
    c.save();
    if (alpha !== undefined) c.globalAlpha = alpha;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(s.cv, Stage.snap(cx - w / 2), Stage.snap(cy - h / 2), w, h);
    c.restore();
    return true;
  },

  /* 도트(PIXELART)를 (cx, cy) "중심"에 높이 h 로 그린다.
     drawSprite 는 발밑 기준이라 별·젬 같은 장식에는 맞지 않는다.

     ★ 도트가 뭉개지지 않게 하는 세 가지 (셋 다 지켜야 한다):
       ① 배율을 정수로 스냅한다 — 1.4배 같은 값은 픽셀 격자를 무너뜨린다
       ② 1배 미만으로 축소하지 않는다 — 축소는 도트를 지운다. 최소 1배
       ③ 회전하지 않는다 — 임의 각도 회전은 어떤 보간을 써도 도트를 뭉갠다
     크기 변화는 정수 배율 계단(1x → 2x → 3x)으로만 준다. 그래야 "도트답게"
     톡톡 튄다. 부드러운 크기 보간이 필요하면 그건 도트로 할 일이 아니다.
     opt: { alpha, tint } */
  dot: function (key, cx, cy, h, opt) {
    var s = getSprite(key); if (!s) return false;
    opt = opt || {};
    var base = s.box.h || s.h;
    var k = Math.max(1, Math.round(h / base));     /* ①② 정수 스냅 + 1배 하한 */
    var c = Stage.ctx;
    c.save();
    c.translate(Math.round(cx), Math.round(cy));   /* 반픽셀 위치도 흐림의 원인 */
    if (opt.alpha !== undefined) c.globalAlpha = opt.alpha;
    c.imageSmoothingEnabled = false;
    var src = opt.tint ? getSilhouette(key, opt.tint) : s;
    if (!src) src = s;
    c.drawImage(src.cv,
      Math.round(-(s.box.x + s.box.w / 2) * k), Math.round(-(s.box.y + s.box.h / 2) * k),
      s.w * k, s.h * k);
    c.restore();
    return true;
  },

};
