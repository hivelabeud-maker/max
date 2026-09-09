/* ============================================================================
   hud.js — 네온 HUD (2차 · NEON DEFENSE)

   ⚠️ 규칙이 1차에서 통째로 뒤집혔다. 되돌리지 말 것.
   1차(pixel_survivor)는 "표시값 3개 / 플랫 / 조용한 UI"였다. 도트 아트가
   정보량이 많아서 UI 를 눌러야 했기 때문이다.
   2차 브리프는 정반대를 요구한다 — 레퍼런스처럼 조밀한 게임 UI 를 재현하고,
   시각적 자극으로 후킹하는 것이 최우선이다. 근거는 docs/00_인수인계.md.

   ■ 2차 규칙
     ① ★ 네온 스타일 유지 + 레퍼런스 레이아웃.
        한 번 완전 플랫으로 갔다가 실장 지시로 네온을 되살렸다
        ("ui는 버전 이전 걸로, 네온타입의 UI는 유지해도 되는 거야").
        정리하면 — **보이는 질감은 네온, 배치와 항목은 실게임 그대로**다:
          질감 : 발광·시안 라인·라운드 캡슐 허용
          배치 : 실게임 참고 영상의 위치·항목을 그대로 따른다
                (재화 2 · 웨이브 N/20 · 타이머 · 톱니 · 진행바 2단 ·
                 배율 · 콤보 · HP · 실드 · 스킬 피해 3행 + Lv 배지)
        둘을 섞는 게 요구사항이다. 한쪽만 보고 되돌리지 말 것.
     ② 표시값은 10개다 — 재화 2 · 웨이브 · 타이머 · 진행바 · 배율 · 콤보 ·
        HP · 실드 · 스킬 피해 4행. 레퍼런스 실측 항목 그대로다.
     ③ 하단 요소는 플레이 영역을 "덮는" 오버레이다. 세로를 예약하지 않는다.
        Stage.pf 를 건드리면 qa.js ① 의 play ≥ 430 이 즉시 깨진다.
     ④ ★ 화면 폭 전체를 덮는 딤/스크림 사각형은 여전히 절대 금지.
        (fillRect(0, y, W, n) 같은 것) — 배경 위에서 "검정 띠"로 보인다.
        3회 재발한 실수다. 가독성은 국소 패널과 strokeText 외곽선으로만.
        qa.js ⑥ 이 이 규칙을 자동 검사하고, 걸리면 빌드가 실패한다.
   전부 벡터 드로잉이라 어떤 배율에서도 깨지지 않는다.
   ========================================================================== */
var HUD = {
  ctaRect: null,

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
  /* ── 패널 — 네온 캡슐 ────────────────────────────────────────────────
     반투명 잉크 면 + 시안 1px 테두리 + 안쪽 상단 하이라이트 한 줄.
     플랫 검정 박스로 갔다가 네온으로 되돌린 자리다(실장 지시).       */
  card: function (x, y, w, h, r) {
    var c = Stage.ctx;
    r = (r === undefined) ? 6 : r;
    c.fillStyle = THEME.panel;
    roundRect(c, x, y, w, h, r); c.fill();
    c.strokeStyle = THEME.panelEdge; c.lineWidth = 1;
    roundRect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
    /* 안쪽 상단 라인 — 유리면 느낌. 이 한 줄이 "네온 패널"과 "검은 박스"를 가른다 */
    c.strokeStyle = 'rgba(142,240,255,.16)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x + r, y + 1.5); c.lineTo(x + w - r, y + 1.5); c.stroke();
  },

  /* 아이콘 — 사용자 제공 시트(src/art/raw/ui/ic_*.png)가 있으면 그걸 쓰고,
     없으면 도트 폴백. 결과 화면이 이 함수를 쓴다. */
  IC: { skull:'ic_kill', hourglass:'ic_time', heart:'ic_hp',
        swords:'ic_kill', timer:'ic_time', gem:'ic_reward' },

  icon: function (key, cx, cy, target, alpha) {
    var sheet = this.IC[key];
    if (sheet && Anim.pic(sheet, cx, cy, target, alpha)) return target;
    var sp = getSprite(key); if (!sp) return 0;
    var base = sp.box.h || sp.h;
    var mul = Math.max(1, Math.round(target / base));
    Anim.dot(key, cx, cy, base * mul, alpha === undefined ? undefined : { alpha: alpha });
    return base * mul;
  },

  /* ── 네온 글리프 ────────────────────────────────────────────────────────
     HUD 아이콘을 시트가 아니라 벡터로 그린다. 2차에서 새로 필요해진 아이콘이
     여러 종인데 전부 시트로 만들면 넷마블 아트 대기가 생긴다.
     (cx, cy) 중심, r = 반지름.                                            */
  glyph: function (kind, cx, cy, r, col, alpha) {
    var c = Stage.ctx, i, a;
    c.save();
    if (alpha !== undefined) c.globalAlpha = alpha;
    c.strokeStyle = col; c.fillStyle = col;
    c.lineWidth = Math.max(1, r * 0.22); c.lineJoin = 'round'; c.lineCap = 'round';

    if (kind === 'coin') {
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.font = '900 ' + (r * 1.35).toFixed(1) + 'px ' + FONT;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('$', cx, cy + r * 0.06);

    } else if (kind === 'gem') {
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.92, -1.5708, 1.5708); c.fill();

    } else if (kind === 'clock') {
      c.beginPath(); c.arc(cx, cy, r, 0, 6.2832); c.stroke();
      c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx, cy - r * 0.55);
      c.moveTo(cx, cy); c.lineTo(cx + r * 0.42, cy + r * 0.20); c.stroke();

    } else if (kind === 'mult') {          /* 삼각 — 레퍼런스의 배수 아이콘 */
      c.beginPath();
      c.moveTo(cx - r * 0.7, cy - r); c.lineTo(cx + r * 0.8, cy); c.lineTo(cx - r * 0.7, cy + r);
      c.closePath(); c.fill();

    } else if (kind === 'gear') {
      c.beginPath(); c.arc(cx, cy, r * 0.46, 0, 6.2832); c.stroke();
      for (i = 0; i < 8; i++) {
        a = i * 0.7854;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68);
        c.lineTo(cx + Math.cos(a) * r,        cy + Math.sin(a) * r);
        c.stroke();
      }

    } else if (kind === 'dmg_fan') {
      for (i = -1; i <= 1; i++) {
        a = -1.5708 + i * 0.42;
        c.beginPath();
        c.moveTo(cx - Math.cos(a) * r * 0.2, cy - Math.sin(a) * r * 0.2);
        c.lineTo(cx + Math.cos(a) * r,       cy + Math.sin(a) * r);
        c.stroke();
      }
    } else if (kind === 'dmg_burst') {
      for (i = 0; i < 6; i++) {
        a = i * 1.0472;
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * r * 0.34, cy + Math.sin(a) * r * 0.34);
        c.lineTo(cx + Math.cos(a) * r,        cy + Math.sin(a) * r);
        c.stroke();
      }
    } else if (kind === 'dmg_ring') {
      c.beginPath(); c.arc(cx, cy, r * 0.92, 0, 6.2832); c.stroke();
      c.beginPath(); c.arc(cx, cy, r * 0.38, 0, 6.2832); c.fill();
    } else if (kind === 'dmg_ult') {
      c.beginPath();
      for (i = 0; i < 8; i++) {
        a = -1.5708 + i * 0.7854;
        var rr = (i % 2) ? r * 0.42 : r;
        if (i === 0) c.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        else         c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      c.closePath(); c.fill();

    } else if (kind === 'shield') {
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

  /* ── 재화 칩 — 네온 캡슐 ─────────────────────────────────────────────
     레퍼런스는 흰 알약이지만, 실장이 네온 UI 유지를 지시했다.
     형태(캡슐)와 위치는 레퍼런스를 따르고 질감만 네온으로 간다 —
     어두운 잉크 + 시안 테두리 + 은은한 외광.                          */
  chip: function (x, y, w, h) {
    var c = Stage.ctx, r = h / 2;
    c.save();
    c.shadowColor = 'rgba(142,240,255,.45)'; c.shadowBlur = 8;
    c.fillStyle = THEME.ink;
    roundRect(c, x, y, w, h, r); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(142,240,255,.55)'; c.lineWidth = 1.2;
    roundRect(c, x + 0.6, y + 0.6, w - 1.2, h - 1.2, r); c.stroke();
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
  /* ── 게이지 — 네온 트랙 ──────────────────────────────────────────────
     라운드 트랙 + 단색 채움 + 채움 머리의 옅은 발광.
     opt: { ghost, radius, pad, glow }                                    */
  bar: function (x, y, w, h, ratio, fill, opt) {
    var c = Stage.ctx;
    opt = opt || {};
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    var r = opt.radius === undefined ? Math.min(4, h / 2) : opt.radius;

    c.fillStyle = THEME.trackBg;
    roundRect(c, x, y, w, h, r); c.fill();

    var p = opt.pad === undefined ? 1 : opt.pad;
    var fh = h - p * 2, iw = w - p * 2;
    var fw = iw * clamp(ratio, 0, 1);
    c.save();
    roundRect(c, x + p, y + p, iw, fh, Math.max(0, r - 1));
    c.clip();
    if (opt.ghost !== undefined && opt.ghost > ratio + 0.002) {
      c.fillStyle = 'rgba(255,255,255,.45)';
      c.fillRect(x + p, y + p, iw * clamp(opt.ghost, 0, 1), fh);
    }
    if (fw > 0.5) {
      if (opt.glow !== false) { c.shadowColor = fill; c.shadowBlur = 7; }
      c.fillStyle = fill;
      c.fillRect(x + p, y + p, Math.round(fw), fh);
      c.shadowBlur = 0;
    }
    c.restore();

    c.strokeStyle = THEME.line; c.lineWidth = 1;
    roundRect(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
  },

  /* ── 상단 HUD ───────────────────────────────────────────────────────────
     실게임 참고 영상의 항목·위치를 그대로 옮기고 질감만 네온으로 간다.

       y  8~36   재화 칩 ①(좌)   ·  웨이브(중앙)        ·  톱니(우)
       y 40~68   재화 칩 ②(좌)   ·  N/20 + ×배수(중앙)  ·  타이머(중앙 우)
       y 74~82   진행 바 (웨이브 전체 진행)
       y 86~99   XP 바 (Lv.N/20 (xx.x%) 안쪽 · 오른쪽 끝에 ×1.4)
       Stage.pf.y = 110 ─────────── 아래는 플레이 영역
       콤보는 플레이 영역 안 상단에 뜬다 (레퍼런스도 XP 바 아래)

     ★ 겹침 방지 규칙
       중앙 열(웨이브·N/20)과 타이머는 x 로 분리한다. 예전엔 타이머가
       중앙에서 62px 떨어져 있어 20/20 같은 두 자리 웨이브에서 겹쳤다.
       지금은 중앙 블록 폭을 재고 그 오른쪽부터 타이머를 놓는다.
     ──────────────────────────────────────────────────────────────────── */
  draw: function () {
    var c = Stage.ctx, W = Stage.W, PAD = this.PAD;
    c.textBaseline = 'alphabetic';

    var wv = TIMELINE.waveAt(Game.t), wn = TIMELINE.waveSpan.length;
    var cxm = W / 2;

    /* ── ① 재화 칩 2개 (좌상단) ───────────────────────────────────────── */
    var chW = 96, chH = 26, chX = PAD;
    var chips = [
      { y:  8, g:'coin', col: THEME.gold,  v: (Game.coins | 0) + '' },
      { y: 40, g:'gem',  col: THEME.neonC, v: Damage.fmt(Damage.shown ? Damage.total : 0) }
    ];
    for (var i = 0; i < chips.length; i++) {
      var ch = chips[i], ccy = ch.y + chH / 2;
      HUD.chip(chX, ch.y, chW, chH);
      HUD.glyph(ch.g, chX + 16, ccy, 8, ch.col);
      HUD.txt(ch.v, Stage.snap(chX + chW - 11), Stage.snap(ccy + 5),
              '800 14px ' + FONT, THEME.text, 'right', 3);
    }

    /* ── ② 중앙 — 웨이브 / N·20 ──────────────────────────────────────── */
    HUD.txt(THEME.labelWave, Stage.snap(cxm), Stage.snap(30),
            '800 21px ' + FONT, THEME.text, 'center', 4);
    var wtxt = wv + '/' + wn;
    HUD.txt(wtxt, Stage.snap(cxm), Stage.snap(56),
            '800 18px ' + FONT, THEME.text, 'center', 3.5);

    /* 중앙 블록의 실제 폭을 재서 타이머 시작점을 잡는다 (겹침 방지) */
    c.font = '800 21px ' + FONT;
    var midW = Math.max(c.measureText(THEME.labelWave).width,
                        c.measureText(wtxt).width);

    /* ── ③ 배수 표시 (중앙 좌측) — 레퍼런스의 ▷ x1 ────────────────────── */
    var mx = cxm - midW / 2 - 30;
    HUD.glyph('mult', mx, 46, 7, THEME.text, 0.9);
    HUD.txt('\u00d71', Stage.snap(mx + 9), Stage.snap(60),
            '800 11px ' + FONT, THEME.text, 'left', 2.5);

    /* ── ④ 타이머 (중앙 우측) ─────────────────────────────────────────── */
    var left = Math.max(0, TIMELINE.cues[TIMELINE.cues.length - 1].t - Game.t);
    var mm = (left / 60) | 0, ss = (left % 60) | 0;
    var tt = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    var urgent = (Game.danger > 0 || left <= 10);
    var tx = cxm + midW / 2 + 16;
    HUD.glyph('clock', tx + 7, 36, 8, urgent ? THEME.danger : THEME.textDim);
    HUD.txt(tt, Stage.snap(tx), Stage.snap(60), '800 15px ' + FONT,
            urgent ? THEME.danger : THEME.text, 'left', 3.5);

    /* ── ⑤ 톱니 (우상단) ──────────────────────────────────────────────
       ⚠️ 순수 장식이다. handleTap 은 CTA 만 라우팅한다. 고객사에 알릴 것. */
    var gx = W - PAD - 15, gy = 28;
    c.save();
    c.shadowColor = 'rgba(142,240,255,.4)'; c.shadowBlur = 7;
    c.fillStyle = THEME.ink;
    c.beginPath(); c.arc(gx, gy, 15, 0, 6.2832); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(142,240,255,.5)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(gx, gy, 14.4, 0, 6.2832); c.stroke();
    HUD.glyph('gear', gx, gy, 9, THEME.neonC, 0.85);

    /* ── ⑥ 진행 바 2단 ────────────────────────────────────────────────
       위: 웨이브 전체 진행(흰색)  ·  아래: XP(시안) + 레벨 텍스트 + 배율
       레퍼런스가 정확히 이 두 줄 구성이다. 1차는 한 줄뿐이었다.        */
    var sp = TIMELINE.waveSpan;
    var s0 = sp[0][0], s1 = sp[sp.length - 1][1];
    var r = clamp((Game.t - s0) / (s1 - s0), 0, 1);
    var bw = W - PAD * 2;

    HUD.bar(PAD, 74, bw, 8, r, 'rgba(255,255,255,.88)', { radius: 4, pad: 1 });

    /* XP 는 웨이브 안에서의 진행이라 톱니바퀴처럼 반복해서 찬다 */
    var xpR = (r * wn) % 1;
    var lv = Math.min(wn, wv);
    HUD.bar(PAD, 86, bw, 13, xpR, THEME.xp, { radius: 5, pad: 1 });
    HUD.txt('Lv.' + lv + '/' + wn + ' (' + (xpR * 100).toFixed(1) + '%)',
            PAD + 7, 96, '800 8px ' + FONT, THEME.text, 'left', 2.5);
    HUD.txt('\u00d7' + (1 + r * 1.4).toFixed(1),
            Stage.snap(W - PAD - 7), Stage.snap(96),
            '900 10px ' + FONT, '#5dff8a', 'right', 2.5);
  },

  /* ── 공격 범위 점선 원 ───────────────────────────────────────────────────
     레퍼런스 실게임에 코어를 감싼 점선 원이 있다. 우리 화면에서 이 원이
     뜻하는 것은 360° 볼리 충격파의 도달 거리(player.js FX.ring 205)다 —
     장식이 아니라 실제 사거리를 그린다.
     캐릭터가 중앙 고정이므로 원도 화면 중앙에 붙박인다.
     탑다운 원근에 맞춰 세로를 0.86 으로 누른다.
     ※ setLineDash 는 소스 전체에서 여기만 쓴다. qa.js mkCtx 에 noop 스텁이
        있어 헤드리스 검사는 깨지지 않는다.                                */
  drawRange: function () {
    var p = Game.player; if (!p) return;
    var c = Stage.ctx, R = 205;
    c.save();
    c.setLineDash([9, 11]);
    c.lineDashOffset = -Game.wt * 14;
    c.strokeStyle = 'rgba(255,255,255,.34)'; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(p.x, p.y - 6, R, R * 0.86, 0, 0, 6.2832); c.stroke();
    c.setLineDash([]);
    c.strokeStyle = 'rgba(142,240,255,.10)'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(p.x, p.y - 6, R * 0.56, R * 0.56 * 0.86, 0, 0, 6.2832); c.stroke();
    c.restore();
  },

  /* ── CTA 기하 — 단일 소스. 인게임과 결과 화면이 "완전히 같은 버튼"을 쓴다.
     (두 화면의 버튼이 달라지면 동선 학습이 끊긴다 — 크기·위치·스킨 전부 여기서) */
  ctaGeom: function () {
    var W = Stage.W, H = Stage.H;
    var hd = (UI_STYLE === 'uihd');
    /* uihd — 강조는 "높이"에서 나온다. 낮고 길면 배너처럼 읽힌다.
       기본(50) 대비 약 2배 높이 + 폭 축소로 버튼답게. */
    var bw = hd ? Math.round(W * 0.88) : W - 44;
    var bh = hd ? 134 : 52;
    return { w: bw, h: bh, x: Math.round((W - bw) / 2), y: H - bh - 16 };
  },

  /* 하단 CTA 상단 y — 플레이 영역 하한을 결정한다 */
  ctaTop: function () {
    return this.ctaGeom().y - 8;
  },

  /* ── 설치 버튼 — 플랫 단색 + 1px 라인. 광택 스윕 없음 ── */
  /* CTA 면 — 인게임/결과 공용. 도트 스킨은 계단 프레임 + 하단 그림자 단 */
  ctaFace: function (x, y, w, h, fontPx) {
    var c = Stage.ctx;
    /* ── 네온 CTA ────────────────────────────────────────────────────────
       1차의 btn_cta.png(베벨·스터드가 구워진 픽셀 버튼)는 쓰지 않는다.
       완전 플랫으로 갔다가 실장 지시로 네온으로 되돌린 자리다 —
       면은 단색이되 외광 + 밝은 테두리 + 안쪽 상단 하이라이트로 발광시킨다.
       레퍼런스 실게임의 결과 화면 초록 버튼이 이 자리, 이 색이다.        */
    c.save();
    c.shadowColor = 'rgba(45,220,110,.75)'; c.shadowBlur = 18;
    c.fillStyle = THEME.cta;
    roundRect(c, x, y, w, h, 10); c.fill();
    c.restore();
    c.strokeStyle = 'rgba(180,255,205,.85)'; c.lineWidth = 2;
    roundRect(c, x + 1, y + 1, w - 2, h - 2, 10); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(x + 14, y + 4.5); c.lineTo(x + w - 14, y + 4.5); c.stroke();
    c.font = '800 ' + fontPx + 'px ' + FONT;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#ffffff';
    c.fillText(THEME.ctaLabel, Math.round(x + w / 2), Math.round(y + h / 2 + 1));
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

  /* ── 하단 오버레이 — HP / 실드 / 스킬 피해 현황 ─────────────────────────
     실게임 실측: 바 위에 'HP: 1000/1000' 텍스트, 바는 그냥 납작한 사각형.
     좌우로 HP·SHIELD 가 나뉘고, 그 아래 좌측에 스킬 피해 현황이 붙는다.
     ★ 전부 플레이 영역 "위에 뜨는" 오버레이다. Stage.pf 를 줄이지 않는다
       (줄이면 qa.js ① 의 play >= 430 이 깨진다).
     ──────────────────────────────────────────────────────────────────── */
  SKILL_W : 150,
  SKILL_ROW : 19,

  drawPlayerHP: function () {
    var c = Stage.ctx, W = Stage.W, PAD = this.PAD;
    var rows = Damage.SRC.length;
    var panelH = 14 + rows * this.SKILL_ROW;
    var panelY = this.ctaTop() - 6 - panelH;
    var barH = 11;
    var rowY = panelY - 20 - barH;
    if (Game.hpHit > 0) Game.hpHit -= 1 / 60;
    var kick = Game.hpHit > 0 ? Math.sin(Game.hpHit * 42) * 1.6 * (Game.hpHit / 0.22) : 0;

    /* ── HP (좌) — 라벨이 바 위에 온다 ─────────────────────────────────── */
    var hpW = Math.round(W * 0.42);
    var hr  = clamp(Game.hp / Game.hpMax, 0, 1);
    var hrg = clamp(Game.hpGhost / Game.hpMax, 0, 1);
    HUD.txt(THEME.labelHP + ': ' + Math.round(Game.hp) + '/' + Game.hpMax,
            PAD + kick, rowY - 6, '800 12px ' + FONT, THEME.text, 'left', 3.5);
    HUD.bar(PAD + kick, rowY, hpW, barH, hr, THEME.hp, { ghost: hrg, radius: 1, pad: 1 });

    /* ── SHIELD (우) ──────────────────────────────────────────────────── */
    var shX = W - PAD - hpW;
    var sr = Game.shieldMax > 0 ? clamp(Game.shield / Game.shieldMax, 0, 1) : 0;
    HUD.txt(THEME.labelShield + ': ' + Math.round(Game.shield) + '/' + Game.shieldMax,
            W - PAD, rowY - 6, '800 12px ' + FONT, THEME.text, 'right', 3.5);
    HUD.bar(shX, rowY, hpW, barH, sr, THEME.neonC, { radius: 1, pad: 1 });

    /* ── 스킬 피해 현황 (좌하단) ───────────────────────────────────────
       레퍼런스는 라벨 한 줄 + 행마다 [아이콘 박스][값 박스] 두 칸이다.
       카드 배경 없이 박스만 놓여 있어서 훨씬 가볍게 읽힌다.              */
    HUD.txt('스킬 피해 현황', PAD, panelY + 9, '800 10px ' + FONT, THEME.text, 'left', 3);
    var px = PAD, iw = 22, vw = this.SKILL_W - iw - 4;
    for (var i = 0; i < rows; i++) {
      var S = Damage.SRC[i], v = Damage.shown[S.id] || 0;
      var ry = panelY + 14 + i * this.SKILL_ROW;
      var rh = this.SKILL_ROW - 3;
      HUD.card(px, ry, iw, rh, 2);
      HUD.glyph(S.icon, px + iw / 2, ry + rh / 2, 6, S.col, v > 0 ? 1 : 0.3);
      HUD.card(px + iw + 4, ry, vw, rh, 2);
      HUD.txt(v > 0 ? Damage.fmt(v) : '-',
              Stage.snap(px + iw + 4 + vw - 7), Stage.snap(ry + rh - 4),
              '800 11px ' + FONT, v > 0 ? THEME.text : THEME.textDim, 'right', 2.5);
    }
  },

  /* ── 튜토리얼 힌트는 제거했다 ────────────────────────────────────────
     ★ 도트 손 · 좌우 셰브론 · "드래그로 이동" 문구를 전부 뺐다.
     이 소재는 드래그로 조작하는 게 아니다 — 캐릭터/발사대가 화면 중앙에
     고정돼 있고 전투는 자동으로 진행된다. 그런데 손이 좌우로 흔들리며
     "드래그로 이동"이라고 안내하면, 따라 해도 아무 일이 안 일어난다.
     반응 없는 안내는 없는 것만 못하다 (2026-09-09 실장 지시).
     되살리려면 먼저 조작을 되살릴 것 — 순서가 반대다.                    */
  drawHint: function () {},

  /* ── 웨이브 배너 — 얇은 라인 사이의 텍스트 한 줄 ── */
  drawBanner: function () {
    var B = Game.banner; if (B.t <= 0) return;
    var c = Stage.ctx, W = Stage.W, life = 1.3, k = 1 - B.t / life;
    var a = k < 0.18 ? k / 0.18 : (k > 0.78 ? 1 - (k - 0.78) / 0.22 : 1);
    var y = Stage.H * 0.30;
    var tw = 132;
    c.save();
    c.globalAlpha = clamp(a, 0, 1);
    c.font = '800 26px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#ffffff';
    c.fillText(B.txt, W / 2, y);
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1;
    var half = c.measureText(B.txt).width / 2 + 16;
    c.beginPath(); c.moveTo(W / 2 - tw, y); c.lineTo(W / 2 - half, y); c.stroke();
    c.beginPath(); c.moveTo(W / 2 + half, y); c.lineTo(W / 2 + tw, y); c.stroke();
    c.restore();
  },

  /* ── 인게임 CLEAR 텍스트 ────────────────────────────────────────────────
     레퍼런스는 마지막 웨이브를 정리한 직후 화면 한가운데 CLEAR 가 크게 뜨고,
     게임 화면이 비쳐 보이는 채로 잠깐 머물다 결과 패널로 넘어간다.
     그 첫 박자를 여기서 그린다 — 결과 패널(screens.drawResult)과 이어지는
     한 시퀀스이므로 글자 크기·발광을 맞춰 두었다.                        */
  drawClear: function () {
    if (Game.clearT < 0) return;
    Game.clearT += 1 / 60;
    var c = Stage.ctx, W = Stage.W;
    var t = Game.clearT;
    var pop = eOut(clamp(t / 0.45, 0, 1));
    var a = clamp(t / 0.2, 0, 1);
    var y = Stage.pf.y + (HUD.ctaTop() - Stage.pf.y) * 0.5;
    c.save();
    c.globalAlpha = a;
    c.shadowColor = 'rgba(142,240,255,.85)'; c.shadowBlur = 26 * pop;
    HUD.txt('CLEAR', Stage.snap(W / 2), Stage.snap(y),
            '900 ' + (44 * (0.55 + pop * 0.45)).toFixed(0) + 'px ' + FONT,
            '#ffffff', 'center', 7);
    c.restore();
  },

  hitCTA: function (x, y) {
    var r = this.ctaRect; if (!r) return false;
    return x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 8 && y <= r.y + r.h + 8;
  }
};
