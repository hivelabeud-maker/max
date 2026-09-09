/* ============================================================================
   hud.js — ORB POP HUD (레퍼런스 2 재현)

   레퍼런스(`docs/reference/레퍼런스_poporb_*.png`) 실측 배치를 옮긴다:
     상단 앱바(아이콘 + 타이틀) · ROUND N(좌) · 대형 점수(중앙) ·
     GOAL: N LEFT · COMBO xN / BONUS +N · TOP RANKED(우) ·
     하단 중앙 조이스틱 · 그 위 CTA

   ■ 배경이 순검정이라 규칙이 하나다
     화면에 올리는 것은 전부 "빛"이다. 어두운 패널은 그냥 안 보이므로
     1차처럼 카드를 깔지 않는다. 글자는 외곽선 없이 그대로 얹어도 읽힌다.

   ■ ★ 상단 앱바는 전폭 딤 금지 규칙의 유일한 예외다
     레퍼런스에 화면 폭을 채우는 어두운 앱바가 있다. 이건 규칙이 막으려던
     "플레이 화면 위에 깔리는 스크림"이 아니라 앱 UI 그 자체다.
     규칙을 우회하지 않고 qa.js ⑥ 에 **명시적 예외**를 넣었다 —
     앱바 영역(y < APPBAR) 안의 채우기만 허용하고 그 아래는 여전히 실패시킨다.
     우회해서 통과시키면 규칙 자체가 무력해진다(3회 재발한 실수였다).

   ■ 세로 예산
     하단이 조이스틱(지름 112) + CTA 로 두 겹이다. Stage.pf 를 건드리지 않고
     ctaTop() 이 조이스틱 위를 가리키게 해서 qa.js ① 의 play ≥ 430 을 지킨다.
   ========================================================================== */
var HUD = {
  ctaRect: null,
  APPBAR : 52,      /* 상단 앱바 높이 — Stage.pf.y 와 맞물린다 */

  /* ── 치수 (논리 단위 = 540 기준. ×2 하면 1080 기준 px) ── */
  PAD     : 18,     /* 화면 좌우 여백 */
  TOP     : 12,     /* 상단 카드 y */
  CARD_W  : 152,    /* 스탯 카드 */
  CARD_H  : 52,
  R_CARD  : 8,      /* 카드 라운드 (16px) */
  BAR_TOP : 12,     /* 진행 게이지 트랙 (24px) */
  R_BAR   : 6,
  BAR_HP  : 22,     /* HP 트랙 (44px) */
  R_HP    : 8,
  PADF    : 2,      /* 트랙 안쪽 여백 → 채움 높이 = 트랙 - PADF*2 */

  /* ── 도트 프레임 — 모서리를 계단으로 깎은 8비트 패널 ──────────────────
     u = 계단 한 칸(논리 px). 반드시 불투명 단색 — 반투명이면 겹친 계단이 비쳐
     지저분해진다. 좌표는 전부 정수로 스냅해 계단을 또렷하게 유지한다. */
  pix: function (x, y, w, h, col, u) {
    var c = Stage.ctx; u = u || 3;
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    c.fillStyle = col;
    c.fillRect(x + 2 * u, y, w - 4 * u, u);
    c.fillRect(x + u, y + u, w - 2 * u, u);
    c.fillRect(x, y + 2 * u, w, h - 4 * u);
    c.fillRect(x + u, y + h - 2 * u, w - 2 * u, u);
    c.fillRect(x + 2 * u, y + h - u, w - 4 * u, u);
  },
  /* pix 와 같은 계단 사각을 "패스"로 — 게이지 채움 클리핑용 */
  pixPath: function (x, y, w, h, u) {
    var c = Stage.ctx; u = u || 3;
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    c.beginPath();
    c.moveTo(x + 2 * u, y);
    c.lineTo(x + w - 2 * u, y);
    c.lineTo(x + w - u, y + u);
    c.lineTo(x + w, y + 2 * u);
    c.lineTo(x + w, y + h - 2 * u);
    c.lineTo(x + w - u, y + h - u);
    c.lineTo(x + w - 2 * u, y + h);
    c.lineTo(x + 2 * u, y + h);
    c.lineTo(x + u, y + h - u);
    c.lineTo(x, y + h - 2 * u);
    c.lineTo(x, y + 2 * u);
    c.lineTo(x + u, y + u);
    c.closePath();
  },

  /* 외곽선(다크) → 프레임 → 본체 → 상단 하이라이트 순서로 겹쳐 굽는다 */
  pixPanel: function (x, y, w, h, fill, edge, u) {
    u = u || 3;
    this.pix(x - u, y - u, w + 2 * u, h + 2 * u, THEME.dotDark, u);
    this.pix(x, y, w, h, edge, u);
    this.pix(x + u, y + u, w - 2 * u, h - 2 * u, fill, u);
    var c = Stage.ctx; c.fillStyle = THEME.dotHi;
    c.fillRect(Math.round(x) + 3 * u, Math.round(y) + u, Math.round(w) - 6 * u, u);
  },

  /* 모서리 다이아 스터드 — 레퍼런스 프레임 킷의 포인트 장식 (패스, 도트 규칙 무관) */
  stud: function (x, y, r, col) {
    var c = Stage.ctx;
    x = Math.round(x); y = Math.round(y);
    c.beginPath();
    c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y);
    c.closePath();
    c.fillStyle = col; c.fill();
  },
  /* uihd 패널 — 다크 퍼플 계단 프레임 + 모서리 스터드 4개 */
  hdPanel: function (x, y, w, h, stud) {
    this.pix(x - 2, y - 2, w + 4, h + 4, THEME.hdDark, 2);
    this.pix(x, y, w, h, THEME.hdEdge, 2);
    this.pix(x + 2, y + 2, w - 4, h - 4, THEME.hdPanel, 2);
    var c = Stage.ctx; c.fillStyle = THEME.dotHi;
    c.fillRect(Math.round(x) + 6, Math.round(y) + 2, Math.round(w) - 12, 2);
    var col = stud || THEME.hdStud, ins = 11;
    this.stud(x + ins, y + ins, 4, col);
    this.stud(x + w - ins, y + ins, 4, col);
    this.stud(x + ins, y + h - ins, 4, col);
    this.stud(x + w - ins, y + h - ins, 4, col);
  },

  /* ── 스탯 카드 — 둥근 다크 패널 + 1px 테두리 ──
     ⚠️ roundRect + fill 로만 그린다. fillRect(0, y, W, n) 형태는 절대 금지
        (전폭 검정 띠 — qa.js 검사 ⑥ 이 빌드를 실패시킨다). 카드는 국소 패널이라 무관. */
  card: function (x, y, w, h) {
    if (UI_STYLE === 'uihd') { this.hdPanel(x, y, w, h); return; }
    if (UI_STYLE === 'dot') { this.pixPanel(x, y, w, h, THEME.dotPanel, THEME.dotEdge); return; }
    var c = Stage.ctx, r = this.R_CARD;
    c.fillStyle = THEME.panel;
    roundRect(c, x, y, w, h, r); c.fill();
    c.strokeStyle = THEME.panelEdge; c.lineWidth = 1;
    roundRect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
  },

  /* 아이콘 — 사용자 제공 시트(src/art/raw/ui/ic_*.png)가 있으면 그걸 쓰고,
     없으면 gen_icons.py 도트로 폴백한다. 시트 파일명 매핑: */
  IC: { skull:'ic_kill', hourglass:'ic_time', heart:'ic_hp',
        swords:'ic_kill', timer:'ic_time', gem:'ic_reward' },

  icon: function (key, cx, cy, target, alpha) {
    var sheet = this.IC[key];
    if (sheet && Anim.pic(sheet, cx, cy, target, alpha)) return target;
    /* 도트 폴백 — 목표 높이에 가장 가까운 정수 배율 */
    var s = getSprite(key); if (!s) return 0;
    var base = s.box.h || s.h;
    var mul = Math.max(1, Math.round(target / base));
    Anim.dot(key, cx, cy, base * mul, alpha === undefined ? undefined : { alpha: alpha });
    return base * mul;
  },

  /* ── 네온 글리프 ────────────────────────────────────────────────────────
     HUD 아이콘을 도트 시트가 아니라 벡터로 그린다. 2차에서 새로 필요해진
     아이콘이 8종인데(재화 2 · 시계 · 톱니 · 스킬 4) 전부 시트로 만들면
     넷마블 아트 대기가 생긴다. 몹과 같은 방식으로 코드로 그려 0장을 유지한다.
     (cx, cy) 중심, r = 반지름. col 하나만 받아 단색으로 그린다.        */
  glyph: function (kind, cx, cy, r, col, alpha) {
    var c = Stage.ctx, i, a;
    c.save();
    if (alpha !== undefined) c.globalAlpha = alpha;
    c.strokeStyle = col; c.fillStyle = col;
    c.lineWidth = Math.max(1, r * 0.22); c.lineJoin = 'round'; c.lineCap = 'round';

    if (kind === 'coin') {                       /* 재화 1 — 동전 */
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.font = '900 ' + (r * 1.35).toFixed(1) + 'px ' + FONT;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('$', cx, cy + r * 0.06);

    } else if (kind === 'gem') {                 /* 재화 2 — 반쪽 채운 원 */
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.92, -1.5708, 1.5708); c.fill();

    } else if (kind === 'clock') {               /* 타이머 */
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - r * 0.55);
      c.moveTo(cx, cy); c.lineTo(cx + r * 0.42, cy + r * 0.20); c.stroke();

    } else if (kind === 'gear') {                /* 설정 — 장식이다 (아래 drawGear 주석) */
      c.beginPath(); c.arc(cx, cy, r * 0.46, 0, 6.2832); c.stroke();
      for (i = 0; i < 8; i++) {
        a = i * 0.7854;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68);
        c.lineTo(cx + Math.cos(a) * r,        cy + Math.sin(a) * r);
        c.stroke();
      }

    } else if (kind === 'dmg_fan') {             /* 집중 사격 — 부채꼴 3줄기 */
      for (i = -1; i <= 1; i++) {
        a = -1.5708 + i * 0.42;
        c.beginPath();
        c.moveTo(cx - Math.cos(a) * r * 0.2, cy - Math.sin(a) * r * 0.2);
        c.lineTo(cx + Math.cos(a) * r,       cy + Math.sin(a) * r);
        c.stroke();
      }
    } else if (kind === 'dmg_burst') {           /* 착탄 폭발 — 사방 파편 */
      for (i = 0; i < 6; i++) {
        a = i * 1.0472;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.34, cy + Math.sin(a) * r * 0.34);
        c.lineTo(cx + Math.cos(a) * r,        cy + Math.sin(a) * r);
        c.stroke();
      }
    } else if (kind === 'dmg_ring') {            /* 전방위 난사 — 이중 링 */
      c.beginPath(); c.arc(cx, cy, r * 0.92, 0, 6.2832); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.38, 0, 6.2832); c.fill();
    } else if (kind === 'dmg_ult') {             /* 섬멸 — 침 박힌 코어 */
      c.beginPath();
      for (i = 0; i < 8; i++) {
        a = -1.5708 + i * 0.7854;
        var rr = (i % 2) ? r * 0.42 : r;
        if (i === 0) c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        else         c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      c.closePath(); c.fill();

    } else if (kind === 'shield') {              /* 실드 — 방패 */
      c.beginPath();
      c.moveTo(cx, cy - r);
      c.lineTo(cx + r * 0.8, cy - r * 0.5);
      c.lineTo(cx + r * 0.8, cy + r * 0.25);
      c.lineTo(cx, cy + r);
      c.lineTo(cx - r * 0.8, cy + r * 0.25);
      c.lineTo(cx - r * 0.8, cy - r * 0.5);
      c.closePath(); c.stroke();
    }
    c.restore();
  },

  /* 네온 칩 — 좌상단 재화처럼 작고 둥근 국소 패널.
     card() 는 uihd 계단 프레임이라 24px 칩에는 장식이 과하다 */
  chip: function (x, y, w, h) {
    var c = Stage.ctx, r = h / 2;
    c.fillStyle = THEME.ink;
    roundRect(c, x, y, w, h, r); c.fill();
    c.strokeStyle = THEME.line; c.lineWidth = 1;
    roundRect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
  },

  /* 외곽선 텍스트 — 우주/탄막 위에서도 읽히게. 전폭 딤의 대안이다 */
  txt: function (str, x, y, font, col, align, ow) {
    var c = Stage.ctx;
    c.font = font; c.textAlign = align || 'left';
    c.lineJoin = 'round'; c.lineWidth = ow || 3.5;
    c.strokeStyle = 'rgba(3,2,12,.82)';
    c.strokeText(str, x, y);
    c.fillStyle = col; c.fillText(str, x, y);
  },

  /* ── 공통 게이지 ────────────────────────────────────────────────────────
     어두운 네이비 트랙 + 1px 테두리 + 단색 채움. 그게 전부다.
     opt: { ghost, radius }                                                */
  bar: function (x, y, w, h, ratio, fill, opt) {
    var c = Stage.ctx;
    opt = opt || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var r = opt.radius === undefined ? Math.min(4, h / 2) : opt.radius;

    /* 트랙 */
    if (UI_STYLE === 'dot' || UI_STYLE === 'uihd') {
      var du = 2;
      var hd = (UI_STYLE === 'uihd');
      this.pix(x - du, y - du, w + du * 2, h + du * 2, hd ? THEME.hdDark : THEME.dotDark, du);
      this.pix(x, y, w, h, hd ? THEME.hdEdge : THEME.trackBg, du);
      if (hd) this.pix(x + du, y + du, w - du * 2, h - du * 2, '#100b1e', du);
    } else {
    c.fillStyle = THEME.trackBg;
    roundRect(c, x, y, w, h, r); c.fill();
    }

    /* 안쪽 채움 — 도트 스킨은 프레임과 같은 계단 패스로 클리핑한다.
       사각으로 채우면 깎인 모서리 밖으로 노랑이 삐져나온다. */
    var p = opt.pad === undefined ? HUD.PADF : opt.pad;
    var fh = h - p * 2, iw = w - p * 2;
    var fr = Math.min(r - 1, fh / 2);
    var dotSkin = (UI_STYLE === 'dot' || UI_STYLE === 'uihd');
    c.save();
    if (dotSkin) HUD.pixPath(x + p, y + p, iw, fh, 2);
    else roundRect(c, x + p, y + p, iw, fh, fr);
    c.clip();
    if (opt.ghost !== undefined && opt.ghost > ratio + 0.002) {
      c.fillStyle = 'rgba(255,255,255,.40)';
      c.fillRect(x + p, y + p, iw * clamp(opt.ghost, 0, 1), fh);
    }
    var fw = iw * clamp(ratio, 0, 1);
    if (fw > 0.5) {
      c.fillStyle = fill;
      c.fillRect(x + p, y + p, Math.round(Math.max(fh, fw)), fh);
    }
    c.restore();

    /* 진행 마커 — 채움 머리에 얹는 다이아.
       ★ 도트가 아니라 패스로 그리므로 회전해도 안전하다 (도트 회전 금지 규칙과 무관). */
    if (opt.marker && ratio > 0.001) {
      var d = h * 0.62;
      var mx = clamp(x + p + fw, x + p + d, x + w - p - d);
      var my = y + h / 2;
      c.beginPath();
      c.moveTo(mx, my - d); c.lineTo(mx + d, my);
      c.lineTo(mx, my + d); c.lineTo(mx - d, my);
      c.closePath();
      c.fillStyle = opt.marker; c.fill();
      c.strokeStyle = THEME.trackEdge; c.lineWidth = 1; c.stroke();
    }

    /* 바깥 테두리 — 마지막에 얹어야 채움이 밖으로 새 보이지 않는다 */
    if (UI_STYLE !== 'dot' && UI_STYLE !== 'uihd') {
      c.strokeStyle = THEME.trackEdge; c.lineWidth = 1;
      roundRect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
    }
  },

  /* ── 상단 HUD ───────────────────────────────────────────────────────────
     레퍼런스 실측 배치. 전부 y < Stage.pf.y 밖(앱바) 또는 플레이 영역 위에
     떠 있는 오버레이다 — 세로를 예약하지 않는다.
     ──────────────────────────────────────────────────────────────────── */
  draw: function () {
    var c = Stage.ctx, W = Stage.W, PAD = this.PAD;
    c.textBaseline = 'alphabetic';

    /* ── ① 앱바 ────────────────────────────────────────────────────────
       ★ 전폭 채우기다. qa.js ⑥ 의 명시적 예외 영역(y < APPBAR)이며,
         그 아래에서 같은 짓을 하면 여전히 빌드가 실패한다 */
    var AB = this.APPBAR;
    c.fillStyle = THEME.appBar; c.fillRect(0, 0, W, AB);
    c.fillStyle = THEME.appBarLn; c.fillRect(0, AB - 1, W, 1);

    /* 앱 아이콘 — 둥근사각 + 오브 3개. 레퍼런스 아이콘의 실루엣이다 */
    var ix = PAD, iy = 11, isz = 30;
    c.fillStyle = '#2b2b33';
    roundRect(c, ix, iy, isz, isz, 9); c.fill();
    var dots = [[0.34, 0.36, 0.19, THEME.orbCols[0]],
                [0.66, 0.40, 0.15, THEME.orbCols[2]],
                [0.48, 0.68, 0.17, THEME.orbCols[1]]];
    for (var q = 0; q < dots.length; q++) {
      c.fillStyle = dots[q][3];
      c.beginPath();
      c.arc(ix + isz * dots[q][0], iy + isz * dots[q][1], isz * dots[q][2], 0, 6.2832);
      c.fill();
    }
    c.font = '800 21px ' + FONT; c.textAlign = 'left';
    c.fillStyle = THEME.text;
    c.fillText(THEME.appTitle, Stage.snap(ix + isz + 11), Stage.snap(iy + 22));

    /* ── ② ROUND (좌) ─────────────────────────────────────────────────── */
    var topY = AB + 16;
    HUD.txt(THEME.labelRound + ' ' + Game.round, PAD, topY + 10,
            '800 12px ' + FONT, THEME.round, 'left', 3);

    /* ── ③ TOP RANKED (우) — 3줄 미니 블록 ────────────────────────────── */
    var rx = W - PAD;
    HUD.txt(THEME.rankLabel, rx, topY + 2,  '800 8px ' + FONT, THEME.textDim, 'right', 2.5);
    HUD.txt(THEME.rankName,  rx, topY + 13, '800 10px ' + FONT, THEME.text,   'right', 2.5);
    HUD.txt(THEME.rankScore, rx, topY + 25, '900 12px ' + FONT, THEME.rank,   'right', 3);

    /* ── ④ 대형 점수 (중앙) ────────────────────────────────────────────
       표시값은 Game.score 가 아니라 scoreShown — 분열 연쇄로 한 프레임에
       수십 점이 들어와 원본은 계단처럼 튄다 (engine.js 에서 스무딩) */
    var cxm = W / 2;
    var sc = Math.round(Game.scoreShown);
    var scTxt = sc.toLocaleString ? sc.toLocaleString('en-US') : ('' + sc);
    /* 콤보가 달아오르면 점수가 커지고 금색으로 물든다 — 화면 전체가 한 값을 따라간다 */
    var heat = Combo.heat();
    var scSz = 40 + heat * 8;
    c.save();
    if (heat > 0.25) { c.shadowColor = THEME.goal; c.shadowBlur = 10 + heat * 22; }
    HUD.txt(scTxt, Stage.snap(cxm), Stage.snap(topY + 32),
            '900 ' + scSz.toFixed(0) + 'px ' + FONT,
            heat > 0.5 ? THEME.goal : THEME.score, 'center', 5);
    c.restore();

    /* ── ⑤ GOAL: N LEFT ──────────────────────────────────────────────── */
    var left = Math.max(0, Game.goal - sc);
    var gTxt = left > 0
      ? (THEME.labelGoal + ': ' + (left.toLocaleString ? left.toLocaleString('en-US') : left) + ' ' + THEME.labelLeft)
      : (THEME.labelGoal + ' \u2713');
    HUD.txt(gTxt, Stage.snap(cxm), Stage.snap(topY + 50),
            '800 11px ' + FONT, left > 0 ? THEME.goal : THEME.round, 'center', 3);

    /* ── ⑥ COMBO xN / BONUS +N ───────────────────────────────────────
       콤보가 살아 있을 때만. 항상 띄우면 x1 이 계속 보여서 의미가 죽는다 */
    if (Combo.n >= 2) {
      var a = clamp(Combo.t / 0.35, 0, 1);
      c.save(); c.globalAlpha = a;
      var cy2 = topY + 74;
      /* 2단계 진입 후에는 COMBO 줄 위에 HYPER FRENZY!! 가 상시로 붙는다.
         레퍼런스도 배너가 아니라 이 자리에 초록 글씨로 계속 떠 있다 */
      if (Combo.stage >= 2) {
        HUD.txt(THEME.banFrenzy, Stage.snap(cxm), Stage.snap(cy2 - 2),
                '900 15px ' + FONT, '#8dff4d', 'center', 4);
        cy2 += 20;
      }
      HUD.txt(THEME.labelCombo + ' \u00d7' + Combo.n, Stage.snap(cxm), Stage.snap(cy2),
              '900 18px ' + FONT, THEME.goal, 'center', 4);
      HUD.txt(THEME.labelBonus + ' +' + Combo.bonus, Stage.snap(cxm), Stage.snap(cy2 + 15),
              '800 10px ' + FONT, THEME.textDim, 'center', 3);
      c.restore();
    }
  },

  /* ── CTA 기하 — 단일 소스. 인게임과 결과 화면이 "완전히 같은 버튼"을 쓴다.
     (두 화면의 버튼이 달라지면 동선 학습이 끊긴다 — 크기·위치·스킨 전부 여기서) */
  ctaGeom: function () {
    var W = Stage.W;
    var hd = (UI_STYLE === 'uihd');
    /* ★ 조이스틱 바로 위에 앉힌다.
       레퍼런스는 하단 중앙이 조이스틱 자리라 1차처럼 큰 버튼을 바닥에 깔 수 없다.
       높이는 1차(134)보다 낮은 92 — 조이스틱(지름 112)과 둘이 하단을 나눠 쓰므로
       버튼까지 크면 플레이 영역이 qa.js ① 의 하한(430)을 넘는다 */
    var bw = hd ? Math.round(W * 0.84) : W - 44;
    var bh = hd ? 92 : 50;
    var y = Stick.top() - 12 - bh;
    return { w: bw, h: bh, x: Math.round((W - bw) / 2), y: Math.round(y) };
  },

  /* 플레이 영역 하한 — CTA 위. 조이스틱·CTA 는 이 아래에 있다 */
  ctaTop: function () {
    return this.ctaGeom().y - 8;
  },

  /* ── 설치 버튼 — 플랫 단색 + 1px 라인. 광택 스윕 없음 ── */
  /* CTA 면 — 인게임/결과 공용. 도트 스킨은 계단 프레임 + 하단 그림자 단 */
  ctaFace: function (x, y, w, h, fontPx) {
    var c = Stage.ctx;
    var img = Sprites.cache['btn_cta'];
    if (img && img.src === 'sheet') {
      /* 사용자 버튼 이미지 — 3분할: 좌캡 / 중앙 늘림 / 우캡.
         통째로 늘리면 끝 장식이 찌그러진다. 캡 폭 = 소스 높이(장식이 그 안에 있음) */
      var sw = img.w, sh = img.h;
      var capS = Math.round(sh * 0.92);
      var capD = Math.round(h * capS / sh);
      c.save();
      c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
      c.drawImage(img.cv, 0, 0, capS, sh, x, y, capD, h);
      c.drawImage(img.cv, capS, 0, sw - capS * 2, sh, x + capD, y, w - capD * 2, h);
      c.drawImage(img.cv, sw - capS, 0, capS, sh, x + w - capD, y, capD, h);
      c.restore();
      /* 텍스트 — 플레이트 "페이스" 실측 중심 0.411h.
         이미지 하단 ~30% 가 베벨·그림자 밴드라 기하 중심(0.5h)은 낮아 보인다.
         (측정: 밝은 초록 행 밴드 y 31~195 / 275 — 버튼 이미지 교체 시 재측정) */
      c.font = '800 ' + fontPx + 'px ' + FONT;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#ffffff';
      c.fillText(THEME.ctaLabel, Math.round(x + w / 2), Math.round(y + h * 0.411));
      return;
    } else if (UI_STYLE === 'uihd') {
      /* 레퍼런스 초록 플레이트: 다크 외곽 → 딥그린 프레임 → 본체 → 상단 하이라이트 띠 + 스터드 */
      this.pix(x - 3, y - 3, w + 6, h + 6, THEME.hdCtaDark, 3);
      this.pix(x, y, w, h, THEME.hdCtaEdge, 3);
      this.pix(x + 3, y + 3, w - 6, h - 6, THEME.hdCta, 3);
      c.fillStyle = THEME.hdCtaHi;
      c.fillRect(Math.round(x) + 9, Math.round(y) + 3, Math.round(w) - 18, 3);
      c.fillStyle = 'rgba(0,0,0,.25)';
      c.fillRect(Math.round(x) + 9, Math.round(y + h) - 6, Math.round(w) - 18, 3);
      var ins = 12;
      this.stud(x + ins, y + ins, 3, THEME.hdCtaHi);
      this.stud(x + w - ins, y + ins, 3, THEME.hdCtaHi);
      this.stud(x + ins, y + h - ins, 3, THEME.hdCtaHi);
      this.stud(x + w - ins, y + h - ins, 3, THEME.hdCtaHi);
    } else if (UI_STYLE === 'dot') {
      this.pixPanel(x, y, w, h, THEME.cta, '#128a44');
      c.fillStyle = 'rgba(0,0,0,.22)';                 /* 눌리는 단 */
      c.fillRect(Math.round(x) + 6, Math.round(y + h) - 9, Math.round(w) - 12, 6);
    } else {
      c.fillStyle = THEME.cta;
      roundRect(c, x, y, w, h, 4); c.fill();
    }
    c.font = '800 ' + fontPx + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#ffffff';
    c.fillText(THEME.ctaLabel, x + w / 2, y + h / 2 + 1);
  },

  drawCTA: function () {
    var c = Stage.ctx;
    var g = this.ctaGeom();
    this.ctaRect = { x: g.x, y: g.y, w: g.w, h: g.h };
    var pulse = 1 + Math.sin(Game.wt * 3.2) * 0.012;
    c.save();
    c.translate(g.x + g.w / 2, g.y + g.h / 2); c.scale(pulse, pulse); c.translate(-g.w / 2, -g.h / 2);
    HUD.ctaFace(0, 0, g.w, g.h, UI_STYLE === 'uihd' ? 30 : 18);
    c.restore();
  },

  /* ── HP 게이지는 이 프로젝트에 없다 ──────────────────────────────────
     레퍼런스에 체력 표시가 없고, 실패 조건이 "맞아 죽는 것"이 아니라
     "시간 안에 목표 점수를 못 채우는 것"이기 때문이다.
     engine.js 가 더 이상 호출하지 않지만, 1차 코드를 참고하다 되살리는 일이
     없도록 빈 함수로 남겨 의도를 명시한다. */
  drawPlayerHP: function () {},

  /* ── 튜토리얼 — 도트 손 + 골드 셰브론 ──────────────────────────────────
     셰브론은 제자리에서 깜빡이고, 손만 좌우로 스윙한다.
     손이 그쪽에 닿으면 해당 셰브론이 밝아져서 "이 방향으로 끌어라"가 읽힌다.
     ──────────────────────────────────────────────────────────────────── */
  drawHint: function () {
    if (!Game.hint.on) return;
    var c = Stage.ctx, p = Game.player;
    var t = Game.hint.t;
    var cy = p.y + 116;              /* 파이어 헤일로 아래로 충분히 내린다 */
    var swing = Math.sin(t * 2.6) * 52;

    /* 셰브론 — 고정 위치. 손이 다가온 쪽이 밝아진다 */
    var blink = 0.42 + Math.sin(t * 5) * 0.18;
    Anim.dot('chevL', p.x - 100, cy, 28, { alpha: blink + (swing < -20 ? 0.45 : 0) });
    Anim.dot('chevR', p.x + 100, cy, 28, { alpha: blink + (swing > 20 ? 0.45 : 0) });

    /* 탭 펄스 링 — 손끝에서 퍼진다 */
    var ph = (t * 1.1) % 1;
    c.save();
    c.globalAlpha = (1 - ph) * 0.42;
    c.strokeStyle = '#ffcf3f'; c.lineWidth = 2;
    c.beginPath(); c.arc(p.x + swing, cy - 6, 12 + ph * 26, 0, 6.2832); c.stroke();
    c.restore();

    /* 손 — 스윙 + 진행 방향으로 살짝 기울기 */
    Anim.dot('hand', p.x + swing, cy + 10, 64);   /* 회전 금지 — 도트가 뭉개진다 */

    /* 문구 */
    c.save();
    c.globalAlpha = 0.9;
    c.font = '800 14px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = 5; c.strokeStyle = 'rgba(8,6,16,.75)';
    c.strokeText(THEME.tutorial, p.x, cy + 54);
    c.fillStyle = '#ffffff';
    c.fillText(THEME.tutorial, p.x, cy + 54);
    c.restore();
  },

  /* ── escalation 배너 ────────────────────────────────────────────────────
     레퍼런스의 3단 문구를 그대로 옮긴다:
       Tempo Up!(둥근 오렌지 그라디언트) → HYPER FRENZY!!(초록) → DOMINATION(흰 대형)
     Combo.add() 가 단계 진입 프레임에만 발행하므로 여기서는 그리기만 한다.
     big 이면 화면 폭을 넘길 만큼 크게 — 레퍼런스의 Tempo Up! 이 화면 밖으로
     삐져나갈 정도로 크다. 그 과감함이 "판이 뒤집혔다"를 만든다.            */
  drawBanner: function () {
    var B = Game.banner; if (B.t <= 0 || !B.txt) return;
    var c = Stage.ctx, W = Stage.W;
    var life = B.big ? 1.5 : 1.1, k = 1 - B.t / life;
    var a = k < 0.14 ? k / 0.14 : (k > 0.72 ? 1 - (k - 0.72) / 0.28 : 1);
    var pop = eOut(clamp(k / 0.16, 0, 1));
    var y = Stage.pf.y + (HUD.ctaTop() - Stage.pf.y) * 0.34;
    var sz = (B.big ? 46 : 32) * (0.5 + pop * 0.5) * (1 + Math.max(0, 1 - k / 0.3) * 0.12);

    c.save();
    c.globalAlpha = clamp(a, 0, 1);
    c.font = '900 ' + sz.toFixed(1) + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    /* 두꺼운 흰 외곽 → 세로 그라디언트 채움. 레퍼런스 캔디 레터링의 최소 재현 */
    c.lineJoin = 'round'; c.lineWidth = sz * 0.30; c.strokeStyle = '#ffffff';
    c.strokeText(B.txt, W / 2, y);
    c.lineWidth = sz * 0.16; c.strokeStyle = 'rgba(0,0,0,.55)';
    c.strokeText(B.txt, W / 2, y);
    var g = c.createLinearGradient(0, y - sz * 0.6, 0, y + sz * 0.6);
    if (Combo.stage >= 3)      { g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d8d8de'); }
    else if (Combo.stage >= 2) { g.addColorStop(0, '#b6ff5a'); g.addColorStop(1, '#3fbf2a'); }
    else                       { g.addColorStop(0, '#ffd166'); g.addColorStop(1, '#f2811a'); }
    c.fillStyle = g;
    c.fillText(B.txt, W / 2, y);
    c.restore();
  },

  /* ── DOMINATION xN — 3단계 진입 후 콤보가 유지되는 동안 상시 표시 ────────
     레퍼런스에서 이 텍스트는 배너처럼 지나가지 않고 화면에 눌러앉아 있다.
     콤보가 끊기면 같이 사라진다 */
  drawDominate: function () {
    if (Combo.stage < 3 || Combo.n < 50) return;
    var c = Stage.ctx, W = Stage.W;
    var y = Stage.pf.y + (HUD.ctaTop() - Stage.pf.y) * 0.30;
    var pulse = 1 + Math.sin(Game.wt * 6) * 0.03;
    c.save();
    c.globalAlpha = 0.92;
    c.font = '900 ' + (34 * pulse).toFixed(1) + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = 'rgba(0,0,0,.6)';
    var t = THEME.banDominate + ' \u00d7' + Combo.n;
    c.strokeText(t, W / 2, y);
    c.fillStyle = '#ffffff'; c.fillText(t, W / 2, y);
    c.restore();
  },

  hitCTA: function (x, y) {
    var r = this.ctaRect; if (!r) return false;
    return x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 8 && y <= r.y + r.h + 8;
  }
};
