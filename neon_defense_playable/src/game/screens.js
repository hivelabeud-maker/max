/* ============================================================================
   screens.js — 배경 / 결과 화면

   배경은 이미지 0장이다. 어두운 우주(그라디언트 + 성운 + 별 3층 + 네온 격자)를
   전부 코드로 그린다 — 넷마블 아트 대기 없이 완주하기 위한 선택이다.
   값도 전부 코드 렌더(이미지에 숫자를 굽지 않는다).
   엔드카드는 제거했다 — 플레이 → 결과, 두 장면이 전부.
   ========================================================================== */
var Screens = {
  scroll: 0, drift: 0,
  _bgCv: null, _bgKey: '', bgMap: null,
  _spCv: null, _spKey: '', _stars: null, _rs: 0,

  /* 배경을 화면 크기로 미리 구워 캐시 — 매 프레임 대형 리샘플 방지 */
  bakeBG: function (key) {
    var s = getSprite(key); if (!s || s.src !== 'sheet') return null;
    var id = key + '|' + Stage.W + 'x' + Stage.H;
    if (this._bgKey === id) return this._bgCv;
    var cv = document.createElement('canvas');
    cv.width = Stage.W; cv.height = Stage.H;
    var g = cv.getContext('2d');
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    var k = Math.max(Stage.W / s.w, Stage.H / s.h);   /* cover */
    var w = s.w * k, h = s.h * k;
    g.drawImage(s.cv, (Stage.W - w) / 2, (Stage.H - h) / 2, w, h);
    /* 이미지 비율(u,v 0~1) → 논리 좌표 변환 맵 — 스폰 게이트가 쓴다.
       cover-fit 이라 화면 비율마다 오프셋이 달라지므로 반드시 이걸 통해 환산한다. */
    if (key === 'bg') this.bgMap = { x0: (Stage.W - w) / 2, y0: (Stage.H - h) / 2, w: w, h: h };
    /* 배경을 살짝 눌러 캐릭터·몹이 먼저 읽히게 한다.
       ※ 2차는 우주라 원본이 이미 거의 검정이다. 1차값(.12)을 그대로 쓰면
          딤이 두 번 걸려 화면이 통째로 죽는다 (2026-09-09 .12 → .05) */
    g.fillStyle = 'rgba(6,4,20,.05)';
    g.fillRect(0, 0, Stage.W, Stage.H);
    this._bgCv = cv; this._bgKey = id;
    return cv;
  },

  /* ── 우주 배경 전용 난수 ────────────────────────────────────────────────
     ⚠️ 전역 rand() 를 쓰지 말 것. 렌더가 게임 RNG 스트림을 소비하면 프레임
     수마다 시드가 어긋나 재현이 깨지고, qa.js 의 완주 수치가 실행마다 달라진다.
     아래 LCG 는 게임과 완전히 분리된 스트림이다.                            */
  _rnd: function () { this._rs = (this._rs * 1664525 + 1013904223) >>> 0; return this._rs / 4294967296; },

  /* 별 3층 — 화면 비율에 무관하게 쓰려고 0~1 단위 좌표로 만든다.
     lay 0 원경(작고 어둡다) · 1 중경 · 2 근경(밝고 반짝이며 시차로 흐른다) */
  mkStars: function () {
    this._rs = 0x5eed1e;               /* 고정 시드 — 빌드마다 같은 별자리 */
    var a = [], n = 210, i;
    for (i = 0; i < n; i++) {
      var lay = (i < 118) ? 0 : ((i < 176) ? 1 : 2);
      a.push({
        u  : this._rnd(), v: this._rnd(),
        r  : lay === 0 ? 0.55 + this._rnd() * 0.45
           : lay === 1 ? 0.95 + this._rnd() * 0.65
           :             1.35 + this._rnd() * 1.05,
        a  : lay === 0 ? 0.26 + this._rnd() * 0.28
           : lay === 1 ? 0.44 + this._rnd() * 0.32
           :             0.66 + this._rnd() * 0.34,
        ph : this._rnd() * 6.2832,
        fl : this._rnd() < 0.12,       /* 십자 플레어 — 밝은 별 몇 개만 */
        lay: lay
      });
    }
    this._stars = a;
  },

  /* ── 정적 3겹을 화면 크기마다 한 번만 굽는다 ──────────────────────────
     그라디언트 + 성운 2개 + 원경/중경 별 + 코너 비네트.
     매 프레임 그리는 건 이 캐시 1장 + 격자 + 근경 별뿐이다.            */
  bakeSpace: function () {
    var W = Stage.W, H = Stage.H, id = W + 'x' + H;
    if (this._spKey === id && this._spCv) return this._spCv;
    if (!this._stars) this.mkStars();

    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var g = cv.getContext('2d');

    var lg = g.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, THEME.bgTop); lg.addColorStop(1, THEME.bgBot);
    g.fillStyle = lg; g.fillRect(0, 0, W, H);

    /* 성운 — 검정만 깔면 화면이 죽는다. 아주 옅은 색 얼룩 2개로 깊이를 만든다 */
    var neb = [[0.24, 0.20, 0.62, THEME.nebA], [0.80, 0.74, 0.58, THEME.nebB]];
    for (var k = 0; k < neb.length; k++) {
      var nx = W * neb[k][0], ny = H * neb[k][1], nr = W * neb[k][2];
      var rg = g.createRadialGradient(nx, ny, 0, nx, ny, nr);
      rg.addColorStop(0, neb[k][3]); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }

    /* 원경·중경 별 — 정지. fillRect 로 찍어야 픽셀 그리드에 딱 앉아 선명하다 */
    for (var i = 0; i < this._stars.length; i++) {
      var st = this._stars[i]; if (st.lay === 2) continue;
      var x = st.u * W, y = st.v * H, r = st.r;
      g.globalAlpha = st.a;
      g.fillStyle = st.lay === 0 ? THEME.starDim : THEME.star;
      g.fillRect(x, y, r, r);
      if (st.fl) {                       /* 십자 플레어 */
        g.globalAlpha = st.a * 0.34;
        g.fillRect(x - 3.2, y + r / 2 - 0.4, 7.4, 0.8);
        g.fillRect(x + r / 2 - 0.4, y - 3.2, 0.8, 7.4);
      }
    }
    g.globalAlpha = 1;

    /* 코너 비네트 — 가장자리를 눌러 시선을 중앙(캐릭터)으로 모은다.
       FX.drawVignette 는 위기 연출용 빨강이라 상시 어둠은 여기서 굽는다 */
    var vg = g.createRadialGradient(W / 2, H * 0.52, Math.min(W, H) * 0.30,
                                    W / 2, H * 0.52, Math.max(W, H) * 0.72);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);

    this._spCv = cv; this._spKey = id;
    return cv;
  },

  drawBG: function (dt) {
    var c = Stage.ctx, W = Stage.W, H = Stage.H, i;
    this.scroll = (this.scroll + dt * 26) % 48;
    this.drift  = (this.drift + dt * 9) % H;

    var bg = this.bakeBG('bg');
    if (bg) { c.drawImage(bg, 0, 0); return; }

    /* 폴백 = 2차의 본 배경이다. 에셋 0장으로 우주를 완성한다 */
    c.drawImage(this.bakeSpace(), 0, 0);

    /* 네온 격자 — 아주 옅게. 별보다 세지면 우주가 실내 바닥으로 읽힌다 */
    c.strokeStyle = THEME.groundLine; c.lineWidth = 1;
    for (var y = this.scroll - 48; y < H + 48; y += 48) {
      c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    }
    for (var x = ((this.scroll * 0.5) % 48) - 48; x < W + 48; x += 48) {
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
    }

    /* 근경 별 — 유일하게 움직이는 층. 시차로 흐르고 숨쉬듯 밝기가 변한다.
       이 한 층만으로 "화면이 살아 있다"는 인상이 나온다 (원경까지 움직이면
       전체가 미끄러져 보여서 오히려 정지 화면처럼 느껴진다) */
    var tw = Game.t;
    for (i = 0; i < this._stars.length; i++) {
      var s2 = this._stars[i]; if (s2.lay !== 2) continue;
      var sy = (s2.v * H + this.drift) % H;
      var a2 = s2.a * (0.62 + 0.38 * Math.sin(tw * 2.1 + s2.ph));
      var sx = s2.u * W, r2 = s2.r;
      c.globalAlpha = a2 * 0.30;                       /* 헤일로 */
      c.fillStyle = THEME.neonC;
      c.fillRect(sx - r2, sy - r2, r2 * 3, r2 * 3);
      c.globalAlpha = a2;                              /* 백열 코어 */
      c.fillStyle = THEME.star;
      c.fillRect(sx, sy, r2, r2);
    }
    c.globalAlpha = 1;
  },

  resInstall: null, resReplay: null, resExit: null, resFxDone: false, _chFx: 0,
  _starFx: [0, 0, 0],

  /* ── 결과 ────────────────────────────────────────────────────────────────
     세로 순서: 리타(대기 애니) → 타이틀 → 부제 → 스탯 2줄 → 설치 버튼
     ──────────────────────────────────────────────────────────────────── */
  /* ── 결과 (목업 레이아웃) ─────────────────────────────────────────────
     위→아래: STAGE CLEAR 타이틀 이미지 → 리타 → 스탯 3줄 → (여백) → 설치 버튼.
     클리어 보너스 영역은 제거 — 별은 타이틀 이미지 안에 이미 있다. */
  /* ── 결과 화면 — 실게임의 라운드 클리어 패널 ────────────────────────────
     레퍼런스 종료 시퀀스(docs/reference/레퍼런스1_클리어_*.png) 실측 구성:

       CLEAR              대형 흰 글씨 + 아래 가로 구분선
       (시계) 05:27        클리어 시각
       피해 현황           라벨
       [아이콘][바][값]×3  인게임 스킬 피해 패널과 같은 행, 더 크게
       (코어 엠블럼)
       전리품              라벨
       [아이템 6개 + 개수]  둥근 사각 박스 하나에 가로로
       [초록 버튼]         원본은 "2배 받기". 우리는 설치 CTA 가 그 자리다

     ★ 1차의 STAGE CLEAR + 리타 + 스탯 3줄 구성을 이걸로 교체했다.
       실장 지시: "실제 이 레퍼런스 게임류처럼 동일한 게임이어야 하고,
       플레이가 종료되었을 때 상황도 같이 고려해서 디자인 업데이트".
       원본 타이틀 이미지(title_clear.png)는 1차 금·적 에셋이라 안 쓴다 —
       CLEAR 를 코드로 그리면 네온 톤과 어긋나지 않는다.
     ──────────────────────────────────────────────────────────────────── */
  LOOT: [
    { g:'coin',      n:'152' },
    { g:'dmg_fan',   n:'3'   },
    { g:'shield',    n:'1'   },
    { g:'dmg_burst', n:'1'   },
    { g:'gem',       n:'19'  },
    { g:'dmg_ring',  n:'21'  }
  ],

  drawResult: function (t) {
    var c = Stage.ctx, W = Stage.W, H = Stage.H;
    var k = eOut(clamp(t / 0.4, 0, 1));

    /* 배경은 인게임 그대로 두고 딤만 얹는다 — 원본도 게임 화면이 비쳐 보인다.
       전체화면 채우기라 qa.js ⑥ 의 "고정 높이 띠" 판정에 걸리지 않는다 */
    c.drawImage(this.bakeSpace(), 0, 0);
    c.fillStyle = 'rgba(4,2,14,' + (0.80 * k).toFixed(3) + ')';
    c.fillRect(0, 0, W, H);

    var g0 = HUD.ctaGeom();
    this.resInstall = { x: g0.x, y: g0.y, w: g0.w, h: g0.h };

    var cx = W / 2;
    var top = Stage.pf.y + 6;
    var bot = g0.y - 16;
    var avail = bot - top;

    /* ── 세로 배치 — 사용 가능한 높이에서 역산한다 ────────────────────────
       기기마다 세로가 크게 다르므로(810~1280) 고정 y 를 쓰면 짧은 기기에서
       전리품이 CTA 를 뚫는다. 블록 높이를 먼저 더하고 남는 만큼 간격을 준다 */
    var titleH = 46, timeH = 34, dmgLabelH = 20;
    var rowH = 26, rowGap = 7, rows = Damage.SRC.length;
    var dmgH = rows * rowH + (rows - 1) * rowGap;
    var lootLabelH = 20, lootH = 60;
    var blockH = titleH + timeH + dmgLabelH + dmgH + lootLabelH + lootH;
    var gap = clamp((avail - blockH) / 5, 6, 30);
    var y = top + Math.max(0, (avail - blockH - gap * 5) / 2);

    /* ── CLEAR ──────────────────────────────────────────────────────────── */
    var pop = eOut(clamp(t / 0.5, 0, 1));
    c.save();
    c.globalAlpha = k;
    c.shadowColor = 'rgba(142,240,255,.8)'; c.shadowBlur = 22 * pop;
    HUD.txt('CLEAR', Stage.snap(cx), Stage.snap(y + 34),
            '900 ' + (40 * (0.7 + pop * 0.3)).toFixed(0) + 'px ' + FONT,
            '#ffffff', 'center', 6);
    c.restore();
    c.strokeStyle = 'rgba(255,255,255,.26)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 120, y + 46.5); c.lineTo(cx + 120, y + 46.5); c.stroke();
    y += titleH + gap;

    /* ── 클리어 시각 ────────────────────────────────────────────────────── */
    var sv = Math.round(TIMELINE.cues[TIMELINE.cues.length - 1].t);
    var svTxt = '0' + ((sv / 60) | 0) + ':' + (sv % 60 < 10 ? '0' : '') + (sv % 60);
    HUD.glyph('clock', cx, y + 9, 9, THEME.textDim);
    HUD.txt(svTxt, Stage.snap(cx), Stage.snap(y + 32),
            '800 15px ' + FONT, THEME.text, 'center', 3.5);
    y += timeH + gap;

    /* ── 피해 현황 ──────────────────────────────────────────────────────── */
    HUD.txt('피해 현황', Stage.snap(cx), Stage.snap(y + 13),
            '800 13px ' + FONT, THEME.text, 'center', 3);
    y += dmgLabelH + gap * 0.4;

    var pw = Math.min(300, W - 80), px = cx - pw / 2;
    var iw = 30, vw = 74, bx2 = px + iw + 6, bw2 = pw - iw - 6 - vw - 6;
    var mx2 = 1, i;
    for (i = 0; i < rows; i++) mx2 = Math.max(mx2, Damage.shown[Damage.SRC[i].id]);
    for (i = 0; i < rows; i++) {
      var S = Damage.SRC[i], v = Damage.shown[S.id] || 0;
      var ry = y + i * (rowH + rowGap);
      HUD.card(px, ry, iw, rowH, 4);
      HUD.glyph(S.icon, px + iw / 2, ry + rowH / 2, 8, S.col, v > 0 ? 1 : 0.3);
      HUD.bar(bx2, ry + 4, bw2, rowH - 8, v / mx2, S.col, { radius: 4, pad: 1 });
      HUD.card(px + pw - vw, ry, vw, rowH, 4);
      HUD.txt(v > 0 ? Damage.fmt(v) : '-',
              Stage.snap(px + pw - 9), Stage.snap(ry + rowH - 8),
              '800 13px ' + FONT, v > 0 ? THEME.text : THEME.textDim, 'right', 3);
    }
    y += dmgH + gap;

    /* ── 전리품 ─────────────────────────────────────────────────────────── */
    HUD.txt('전리품', Stage.snap(cx), Stage.snap(y + 13),
            '800 13px ' + FONT, THEME.text, 'center', 3);
    y += lootLabelH + gap * 0.4;

    var L = this.LOOT, n = L.length;
    var lw = Math.min(320, W - 60), lx = cx - lw / 2;
    HUD.card(lx, y, lw, lootH - 4, 10);
    var cellW = lw / n;
    for (i = 0; i < n; i++) {
      var ccx = lx + cellW * (i + 0.5);
      /* 등장 순서를 어긋나게 해서 하나씩 채워지는 인상을 만든다 */
      var ka = clamp((t - 0.5 - i * 0.09) / 0.3, 0, 1);
      if (ka <= 0) continue;
      c.save(); c.globalAlpha = ka;
      HUD.glyph(L[i].g, ccx, y + 20, 10, THEME.neonC);
      HUD.txt(L[i].n, Stage.snap(ccx), Stage.snap(y + 46),
              '800 12px ' + FONT, THEME.text, 'center', 3);
      c.restore();
    }

    /* ── 설치 버튼 ────────────────────────────────────────────────────────
       ★ 레퍼런스의 초록 "2배 받기" 자리가 그대로 우리 CTA 자리다.
         원본도 결과 패널의 유일한 강조 버튼이 여기 있고 초록이다.
       기하는 HUD.ctaGeom() 단일 소스 — 인게임과 결과 화면이 "완전히 같은
       버튼"을 써야 동선 학습이 끊기지 않는다.
       ⚠️ 재작성하면서 한 번 빠뜨렸다. 이 호출이 없으면 결과 화면에
          버튼이 아예 안 그려진다(히트박스만 남아 보이지 않는 버튼이 된다). */
    var pulse = 1 + Math.sin(Game.wt * 3.2) * 0.012;
    c.save();
    c.globalAlpha = clamp((t - 0.35) / 0.35, 0, 1);
    c.translate(g0.x + g0.w / 2, g0.y + g0.h / 2);
    c.scale(pulse, pulse);
    c.translate(-g0.w / 2, -g0.h / 2);
    HUD.ctaFace(0, 0, g0.w, g0.h, UI_STYLE === 'uihd' ? 30 : 18);
    c.restore();
  },

  hit: function (r, x, y) { return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
};
