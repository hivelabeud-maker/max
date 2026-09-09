/* ============================================================================
   screens.js — 배경 / 결과 화면

   배경은 이미지 0장이다. 어두운 우주(그라디언트 + 성운 + 별 3층 + 네온 격자)를
   전부 코드로 그린다 — 넷마블 아트 대기 없이 완주하기 위한 선택이다.
   값도 전부 코드 렌더(이미지에 숫자를 굽지 않는다).
   엔드카드는 제거했다 — 플레이 → 결과, 두 장면이 전부.
   ========================================================================== */
var Screens = {
  scroll: 0,
  _bgCv: null, _bgKey: '', bgMap: null,

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

  /* ── 배경 — 순검정 ──────────────────────────────────────────────────────
     레퍼런스(Pop Orb)의 배경은 그라디언트도 별도 격자도 없는 순검정이다.
     1차(neon_defense)의 우주 배경을 통째로 걷어냈다.

     ★ 순검정을 고른 건 취향이 아니라 이 게임의 요구다.
       화면의 주인공이 "원색 공"과 "흰 탄 줄기"인데, 배경에 무늬가 있으면
       공의 색이 배경과 섞여 무엇을 터뜨렸는지가 안 읽힌다.
       유일하게 남긴 것은 콤보가 달아오를 때의 미세한 금색 광량이다 —
       화면 전체가 콤보 하나를 따라 뜨거워지는 연출의 바탕이다.          */
  drawBG: function (dt) {
    var c = Stage.ctx, W = Stage.W, H = Stage.H;
    c.fillStyle = '#000000'; c.fillRect(0, 0, W, H);

    var heat = (typeof Combo !== 'undefined') ? Combo.heat() : 0;
    if (heat > 0.02) {
      /* 중앙에서 번지는 금색 광량. 채우기는 화면 전체(0,0,W,H)라
         qa.js ⑥ 의 "고정 높이 띠" 판정에 걸리지 않는다 */
      var p = Game.player;
      var cx = p ? p.x : W / 2, cy = p ? p.y : H / 2;
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.85);
      g.addColorStop(0, 'rgba(255,170,60,' + (heat * 0.16).toFixed(3) + ')');
      g.addColorStop(0.55, 'rgba(255,120,30,' + (heat * 0.06).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
  },

  resInstall: null, resReplay: null, resExit: null, resFxDone: false, _chFx: 0,
  _starFx: [0, 0, 0],

  /* ── 결과 ────────────────────────────────────────────────────────────────
     세로 순서: 리타(대기 애니) → 타이틀 → 부제 → 스탯 2줄 → 설치 버튼
     ──────────────────────────────────────────────────────────────────── */
  /* ── 결과 (목업 레이아웃) ─────────────────────────────────────────────
     위→아래: STAGE CLEAR 타이틀 이미지 → 리타 → 스탯 3줄 → (여백) → 설치 버튼.
     클리어 보너스 영역은 제거 — 별은 타이틀 이미지 안에 이미 있다. */
  drawResult: function (t) {
    var c = Stage.ctx, W = Stage.W, H = Stage.H;
    var k = eOut(clamp(t / 0.4, 0, 1));

    /* 결과 화면도 순검정 — 인게임과 같은 바탕이라 장면 전환이 매끄럽다 */
    c.fillStyle = '#000000'; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(10,9,18,' + (0.68 * k).toFixed(3) + ')';
    c.fillRect(0, 0, W, H);

    /* 설치 버튼 자리 — 레이아웃 하한 */
    /* 버튼 기하 — 인게임과 동일 (HUD.ctaGeom 단일 소스) */
    var g0 = HUD.ctaGeom();
    var bw = g0.w, bh = g0.h, bx = g0.x, by = g0.y;
    this.resInstall = { x: bx, y: by, w: bw, h: bh };

    var pad = 34, pw = W - pad * 2;
    var rowH = 52, gap = 10;

    /* ── 프리레이아웃 ────────────────────────────────────────────────────
       타이틀+캐릭터+스탯을 "한 그룹"으로 묶어 세로 중앙에 앉힌다.
       화면 비율이 길어져도(반응형) 남는 여백이 위·아래로 均分되어
       시선이 중앙에 모인다 — 조각별로 따로 앉히면 갭이 흩어진다. */
    var G1 = 16, G2 = 36, BOT = 14;
    var ti = Sprites.cache['title_clear'];
    var hasTitle = !!(ti && ti.src === 'sheet');
    var tW = 0, tH = 66;
    if (hasTitle) {
      tW = Math.min(W * 0.84, ti.w); tH = tW * ti.h / ti.w;
      var tcap = H * 0.24;
      if (tH > tcap) { tH = tcap; tW = tH * ti.w / ti.h; }
    }
    var aKey = CHARACTER.anim.idle;
    var hasChar = Anim.has(aKey.key);
    var mA = hasChar ? Anim.meta(aKey.key) : null;
    var cellH = hasChar ? mA.fh : 0;
    var statsH = (UI_STYLE === 'uihd') ? (92 + 14 + 76) : (rowH * 3 + gap * 2);
    var chMax = (by - BOT) - 12 - tH - G1 - G2 - statsH;
    var ch = hasChar ? clamp(Math.min(H * 0.30, cellH, chMax), 90, cellH) : 0;
    var contentH = tH + G1 + ch + G2 + statsH;
    var startY = Math.max(10, Math.round((by - contentH) / 2) - 6);
    var tTop = startY;
    var charTop = tTop + tH + G1;
    var statsY = charTop + ch + G2;
    var titleCy = tTop + tH / 2;

    /* ── ① 타이틀 ── */
    var tk = eOut(clamp((t - 0.10) / 0.32, 0, 1));
    if (hasTitle) {
      if (tk > 0) {
        /* 등장 후엔 CTA 와 같은 펄스 — 축소/확대 호흡. 소스가 2배 해상도라
           ±1.2% 스케일에도 선명도가 유지된다 (축소 렌더 범위 안) */
        var tpu = tk >= 1 ? 1 + Math.sin(Game.wt * 2.6) * 0.012 : 1;
        c.save();
        c.globalAlpha = k * tk;
        c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
        c.translate(W / 2, tTop + tH / 2); c.scale(tpu, tpu);
        c.drawImage(ti.cv, -tW / 2, -tH / 2 + (1 - tk) * -14, tW, tH);
        c.restore();
      }
    } else {
      c.save(); c.globalAlpha = k * tk;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '800 38px ' + FONT; c.fillStyle = THEME.text;
      c.fillText(THEME.resultTitle, W / 2, tTop + 24 + (1 - tk) * 10);
      c.font = '700 13px ' + FONT; c.fillStyle = THEME.textDim;
      c.fillText(THEME.resultSub, W / 2, tTop + 56);
      c.restore();
    }
    if (tk >= 1 && !this.resFxDone) {
      this.resFxDone = true;
      FX.burst(W / 2, titleCy, 14, THEME.gold, 300, 3);
      FX.kick(3.5, 0.12);
    }

    /* ── ② 리타 — 타이틀 아래. 셀 높이(원본)를 넘겨 그리지 않는다 ── */
    var a = aKey;
    if (hasChar) {
      var ck = ch / cellH;
      var rise = (1 - eOut(clamp(t / 0.45, 0, 1))) * 14;
      var cy = Stage.snap(charTop + mA.ay * ch + Math.sin(Game.wt * 2.4) * 3 + rise);
      /* 링·그림자 = 실측 발끝 (bbox 도, 원점도 아님 — 무기 때문에 둘 다 어긋난다) */
      var fy = cy + (CHARACTER.feet.y - mA.ay) * ch;
      /* uihd — 총이 오른쪽으로 길어 원점 기준으론 몸이 왼쪽에 붙는다.
         스프라이트를 오른쪽으로 밀어 "몸(발) 중심"을 화면 중앙에 맞춘다. */
      var drawX = (UI_STYLE === 'uihd')
        ? W / 2 + (mA.ax - CHARACTER.feet.x) * mA.fw * ck
        : W / 2;
      var vxF = drawX + (CHARACTER.feet.x - mA.ax) * mA.fw * ck;   /* = 몸 중심 */

      /* 스포트라이트 — 위에서 내려오는 빛 기둥 */
      c.save();
      c.globalAlpha = k * 0.5;
      var sg = c.createLinearGradient(0, 0, 0, fy + 10);
      sg.addColorStop(0, 'rgba(255,214,120,.30)');
      sg.addColorStop(1, 'rgba(255,190,80,0)');
      c.fillStyle = sg;
      c.beginPath();
      c.moveTo(W / 2 - ch * 0.20, 0); c.lineTo(W / 2 + ch * 0.20, 0);
      c.lineTo(W / 2 + ch * 0.62, fy + 10); c.lineTo(W / 2 - ch * 0.62, fy + 10);
      c.closePath(); c.fill();
      c.restore();

      if (UI_STYLE === 'uihd') {
        /* 퍼플 발판 — 실측 발 중심(vxF)·발끝(fy)에 정확히 */
        c.globalAlpha = k;
        c.save(); c.translate(vxF, fy); c.scale(1, 0.32); c.translate(-vxF, -fy);
        var pg = c.createRadialGradient(vxF, fy, ch * 0.05, vxF, fy, ch * 0.40);
        pg.addColorStop(0.00, 'rgba(24,12,52,.95)');
        pg.addColorStop(0.55, 'rgba(110,72,235,.55)');
        pg.addColorStop(0.85, 'rgba(140,100,255,.25)');
        pg.addColorStop(1.00, 'rgba(140,100,255,0)');
        c.fillStyle = pg;
        c.beginPath(); c.arc(vxF, fy, ch * 0.40, 0, 6.2832); c.fill();
        c.strokeStyle = 'rgba(150,112,255,.65)'; c.lineWidth = 2.5;
        c.beginPath(); c.arc(vxF, fy, ch * 0.30, 0, 6.2832); c.stroke();
        c.restore();
      } else {
        c.save();
        c.globalAlpha = k * 0.34; c.fillStyle = '#000';
        c.beginPath(); c.ellipse(vxF, fy, ch * 0.24, ch * 0.066, 0, 0, 6.2832); c.fill();
        c.globalAlpha = k * 0.55;
        c.strokeStyle = 'rgba(255,200,90,.7)'; c.lineWidth = 1.5;
        c.beginPath(); c.ellipse(vxF, fy, ch * 0.26, ch * 0.072, 0, 0, 6.2832); c.stroke();
        c.restore();
      }

      /* 캐릭터 — snap 으로 디바이스 픽셀 격자에 */
      c.save(); c.globalAlpha = k;
      Anim.draw(a.key, Anim.frameAt(a.key, Game.wt, a.fps), drawX, cy, ck, { snap: true });
      c.restore();

      /* 떠다니는 별 — 결정적 위치 (영상 재현성) */
      for (var i = 0; i < 9; i++) {
        var ang = i * 0.698 + 0.4;
        var rad = ch * (0.42 + 0.22 * ((i * 7) % 5) / 4);
        var drift = Math.sin(Game.wt * 1.3 + i * 1.7) * 7;
        var sx = W / 2 + Math.cos(ang) * rad * 1.35;
        var sy = cy + Math.sin(ang) * rad * 0.92 + drift;
        var tw2 = 0.5 + 0.5 * Math.sin(Game.wt * 3.1 + i * 2.3);
        var big = (i % 3) === 0;
        Anim.dot(big ? 'star' : 'star_s', sx, sy, big ? 17 : 9,
          { alpha: k * (0.28 + tw2 * 0.62) });
      }

      if (t - this._chFx > 1.1) {
        this._chFx = t;
        FX.burst(W / 2 + rnd(-46, 46), cy + rnd(-26, 18), 4, THEME.gold, 130, 2.4);
      }
    }

    /* ── ③ 스탯 3줄 — 아이콘 + 라벨 왼쪽 / 값 오른쪽 ── */
    var shown = Math.round(Game.kills * eOut(clamp(t / 0.9, 0, 1)));
    var sv = Math.round(TIMELINE.cues[TIMELINE.cues.length - 1].t);
    var svTxt = ((sv / 60) | 0) + ':' + (sv % 60 < 10 ? '0' : '') + (sv % 60);
    var reward = Math.round(Game.kills * eOut(clamp(t / 0.9, 0, 1)) * 0.45);
    var rows = [
      ['swords', THEME.labelKill,   shown + '',  THEME.text],
      ['timer',  THEME.labelTime,   svTxt,       THEME.gold],
      ['gem',    THEME.labelReward, reward + '', THEME.text]
    ];
    if (UI_STYLE === 'uihd') {
      /* ── 위계형 스탯 (구성안 v2) ──
         ① 처치 = 히어로: [큰 아이콘] 처치 수 ……………… 큰 숫자(우)
         ② 생존/보상 = 반폭 패널 2개, 같은 한 줄 문법 */
      var r1h = 92, r2h = 76, gap2 = 14;
      if (!this._numFx) this._numFx = {};
      var NF = this._numFx, self2 = this;
      /* 카운트업: t0 부터 dur 동안 0→val. 완료 순간 1회 팝(0.25s) + 파열 */
      function cnt(t0, dur, val) {
        var q = eOut(clamp((t - t0) / dur, 0, 1));
        return { v: Math.round(val * q), done: q >= 1 };
      }
      function popScale(key, done, px2, py2) {
        if (!done) return 1;
        if (!NF[key]) { NF[key] = t; FX.burst(px2, py2, 6, THEME.gold, 170, 2.4); }
        var pt = t - NF[key];
        return pt < 0.25 ? 1 + 0.26 * (1 - pt / 0.25) : 1;
      }
      function popText(txt, ax, ay, ps, col) {
        c.save(); c.translate(ax, ay); c.scale(ps, ps);
        c.fillStyle = col; c.fillText(txt, 0, 0); c.restore();
      }

      var rkN = eOut(clamp((t - 0.30) / 0.32, 0, 1));
      if (rkN > 0) {
        c.save(); c.globalAlpha = k * rkN; c.translate(0, (1 - rkN) * 14);
        HUD.hdPanel(pad, statsY, pw, r1h);
        var m1 = statsY + r1h / 2;
        HUD.icon('swords', pad + 48, m1, 56);
        c.textAlign = 'left'; c.textBaseline = 'middle';
        c.font = '700 16px ' + FONT; c.fillStyle = THEME.textDim;
        c.fillText(THEME.labelKillL, pad + 88, m1);
        var kc = cnt(0.30, 1.35, Game.kills);
        var kps = popScale('k', kc.done, pad + pw - 60, m1 - 20);
        c.font = '800 46px ' + FONT; c.textAlign = 'right';
        popText(kc.v + '', pad + pw - 26, m1 + 2, kps, THEME.text);
        c.restore();
      }

      var ry1 = statsY + r1h + gap2;
      var half = Math.round((pw - gap2) / 2);
      rkN = eOut(clamp((t - 0.42) / 0.32, 0, 1));
      if (rkN > 0) {
        c.save(); c.globalAlpha = k * rkN; c.translate(0, (1 - rkN) * 14);
        var m2 = ry1 + r2h / 2;
        /* 좌 — 생존 시간 */
        HUD.hdPanel(pad, ry1, half, r2h);
        HUD.icon('timer', pad + 38, m2, 44);
        c.textAlign = 'left'; c.textBaseline = 'middle';
        c.font = '700 14px ' + FONT; c.fillStyle = THEME.textDim;
        c.fillText(THEME.labelTimeL, pad + 68, m2);
        var tc = cnt(0.45, 1.0, sv);
        var tTxt = ((tc.v / 60) | 0) + ':' + (tc.v % 60 < 10 ? '0' : '') + (tc.v % 60);
        var tps = popScale('t', tc.done, pad + half - 44, m2 - 16);
        c.font = '800 30px ' + FONT; c.textAlign = 'right';
        popText(tTxt, pad + half - 20, m2 + 1, tps, THEME.gold);
        /* 우 — 보상 (젬 수치만) */
        var rx2 = pad + half + gap2;
        HUD.hdPanel(rx2, ry1, half, r2h);
        HUD.icon('gem', rx2 + 38, m2, 44);
        c.textAlign = 'left';
        c.font = '700 14px ' + FONT; c.fillStyle = THEME.textDim;
        c.fillText(THEME.labelReward, rx2 + 68, m2);
        var rc = cnt(0.55, 1.2, Math.round(Game.kills * 0.45));
        var rps = popScale('r', rc.done, rx2 + half - 44, m2 - 16);
        c.font = '800 30px ' + FONT; c.textAlign = 'right';
        popText(rc.v + '', rx2 + half - 20, m2 + 1, rps, THEME.text);
        c.restore();
      }
    } else {
    for (var ri2 = 0; ri2 < rows.length; ri2++) {
      var rk = eOut(clamp((t - 0.30 - ri2 * 0.10) / 0.32, 0, 1));
      if (rk <= 0) continue;
      var ry = statsY + ri2 * (rowH + gap);
      c.save(); c.globalAlpha = k * rk;
      c.translate(0, (1 - rk) * 14);
      if (UI_STYLE === 'uihd') {
        HUD.hdPanel(pad, ry, pw, rowH);
      } else if (UI_STYLE === 'dot') {
        HUD.pixPanel(pad, ry, pw, rowH, THEME.dotPanel, THEME.dotEdge);
      } else {
        c.fillStyle = THEME.ink;
        roundRect(c, pad, ry, pw, rowH, 4); c.fill();
        c.strokeStyle = THEME.line; c.lineWidth = 1;
        roundRect(c, pad + 0.5, ry + 0.5, pw - 1, rowH - 1, 4); c.stroke();
      }
      var ih = 38;
      HUD.icon(rows[ri2][0], pad + 16 + ih / 2, ry + rowH / 2, ih);
      c.font = '700 13px ' + FONT; c.textAlign = 'left'; c.textBaseline = 'middle';
      c.fillStyle = THEME.textDim;
      c.fillText(rows[ri2][1], pad + 26 + ih, ry + rowH / 2);
      c.font = '800 26px ' + FONT; c.textAlign = 'right';
      c.fillStyle = rows[ri2][3];
      c.fillText(rows[ri2][2], pad + pw - 18, ry + rowH / 2 + 1);
      c.restore();
    }

    }

    /* ── 설치 버튼 ── */
    var pulse = 1 + Math.sin(Game.wt * 3.6) * 0.018;
    c.save(); c.globalAlpha = k;
    c.translate(bx + bw / 2, by + bh / 2); c.scale(pulse, pulse); c.translate(-bw / 2, -bh / 2);
    HUD.ctaFace(0, 0, bw, bh, UI_STYLE === 'uihd' ? 30 : 19);
    c.restore(); c.globalAlpha = 1;
  },

  hit: function (r, x, y) { return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
};
