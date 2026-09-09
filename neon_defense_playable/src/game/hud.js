/* ============================================================================
   hud.js — 네온 HUD (2차 · NEON DEFENSE)

   ⚠️ 규칙이 1차에서 통째로 뒤집혔다. 되돌리지 말 것.
   1차(pixel_survivor)는 "표시값 3개 / 플랫 / 조용한 UI"였다. 도트 아트가
   정보량이 많아서 UI 를 눌러야 했기 때문이다.
   2차 브리프는 정반대를 요구한다 — 레퍼런스처럼 조밀한 게임 UI 를 재현하고,
   시각적 자극으로 후킹하는 것이 최우선이다. 근거는 docs/00_인수인계.md.

   ■ 2차 규칙
     ① 발광 허용. 우주 배경이 거의 검정이라 얇은 네온 라인이 떠야 읽힌다.
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
     레퍼런스 실측 배치를 그대로 옮긴다:
       좌: 재화 칩 2개(세로) · 중앙: 웨이브 라벨 + N/20 · 그 우측: 타이머 ·
       우: 톱니 · 아래: 진행 바 + 배율
     전부 y < 86 안에 들어간다 (Stage.pf.y = 86). 넘기면 몹이 HUD 뒤로 들어간다.
     ──────────────────────────────────────────────────────────────────── */
  draw: function () {
    var c = Stage.ctx, W = Stage.W, PAD = this.PAD;
    c.textBaseline = 'alphabetic';

    /* ── ① 재화 칩 2개 (좌상단) ──────────────────────────────────────────
       위: Game.coins — 이미 존재하고 fx.js 가 증가시키는데 1차에서는 어디에도
           표시되지 않던 값이다. 표시만 붙였다.
       아래: 누적 총 피해 — Damage.total. 큰 수가 계속 굴러가야 화면이 산다  */
    var chW = 92, chH = 24, chX = PAD;
    var chips = [
      { y: 10, g:'coin', col: THEME.gold,  v: (Game.coins | 0) + '' },
      { y: 38, g:'gem',  col: THEME.neonC, v: Damage.fmt(Damage.shown ? Damage.total : 0) }
    ];
    for (var i = 0; i < chips.length; i++) {
      var ch = chips[i];
      HUD.chip(chX, ch.y, chW, chH);
      HUD.glyph(ch.g, chX + 15, ch.y + chH / 2, 8, ch.col);
      HUD.txt(ch.v, Stage.snap(chX + chW - 10), Stage.snap(ch.y + chH / 2 + 5),
              '800 14px ' + FONT, THEME.text, 'right', 3);
    }

    /* ── ② 중앙 — 웨이브 N/20 ────────────────────────────────────────────
       1차는 1.3초짜리 배너로 웨이브를 알렸다. 20웨이브(웨이브당 ~1초)에서는
       배너가 상시 겹쳐서 화면을 덮는다. 레퍼런스처럼 상단 카운터로 바꾼다  */
    var wv = TIMELINE.waveAt(Game.t), wn = TIMELINE.waveSpan.length;
    var cxm = W / 2;
    HUD.txt(THEME.labelWave, cxm, 25, '800 13px ' + FONT, THEME.textDim, 'center', 3.5);
    HUD.txt(wv + '/' + wn, Stage.snap(cxm), Stage.snap(48),
            '900 22px ' + FONT, THEME.text, 'center', 4);

    /* ── ③ 타이머 (중앙 우측) — 남은 시간 mm:ss ──────────────────────────
       1차는 m:ss 였다. 레퍼런스가 03:26 형식이라 분도 두 자리로 맞춘다 */
    var left = Math.max(0, TIMELINE.cues[TIMELINE.cues.length - 1].t - Game.t);
    var mm = (left / 60) | 0, ss = (left % 60) | 0;
    var tt = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    var urgent = (Game.danger > 0 || left <= 10);
    var tx = cxm + 62;
    HUD.glyph('clock', tx, 41, 8, urgent ? THEME.danger : THEME.textDim);
    HUD.txt(tt, Stage.snap(tx + 13), Stage.snap(47), '800 17px ' + FONT,
            urgent ? THEME.danger : THEME.text, 'left', 3.5);

    /* ── ④ 톱니 (우상단) ─────────────────────────────────────────────────
       ⚠️ 순수 장식이다. handleTap(engine.js)은 CTA 만 라우팅하므로 눌러도
          반응하지 않는다. "눌러도 반응 없는 버튼 = 광고 이탈 요인"이라
          기능을 붙이거나 빼는 편이 원칙적으로 맞지만, 이번 건은 레퍼런스
          재현이 목적이라 장식으로 둔다. 고객사에 이 트레이드오프를 알릴 것.
          알파를 낮춰 "누르는 것"으로 덜 읽히게 해두었다 */
    HUD.glyph('gear', W - PAD - 13, 30, 12, THEME.textDim, 0.55);

    /* ── ⑤ 진행 바 + 배율 ────────────────────────────────────────────────
       바가 재는 것은 웨이브 전 구간(첫 시작 ~ 마지막 끝) 진행도다. 실제 값이다.
       레퍼런스 표기를 따라 왼쪽에 Lv.N, 오른쪽에 전투 배율을 얹는다 —
       배율은 진행도에서 파생시킨 연출 수치다(별도 시스템이 아니다).       */
    var sp = TIMELINE.waveSpan;
    var s0 = sp[0][0], s1 = sp[sp.length - 1][1];
    var r = clamp((Game.t - s0) / (s1 - s0), 0, 1);
    var barY = 62, barH = 11, mulW = 46;
    HUD.bar(PAD, barY, W - PAD * 2 - mulW - 6, barH, r, THEME.xp,
            { radius: this.R_BAR, marker: THEME.marker });
    HUD.txt('Lv.' + wv + '  ' + (r * 100).toFixed(1) + '%',
            PAD + 8, barY + barH - 2, '800 8px ' + FONT, THEME.text, 'left', 2.5);
    HUD.txt('\u00d7' + (1 + r * 1.4).toFixed(2),
            Stage.snap(W - PAD), Stage.snap(barY + barH - 1),
            '900 12px ' + FONT, THEME.neonC, 'right', 3);
  },

  /* ── 공격 범위 점선 원 ───────────────────────────────────────────────────
     레퍼런스에 주인공을 감싼 점선 원이 있다. 우리 화면에서 이 원이 뜻하는
     것은 360° 볼리의 충격파 도달 거리(player.js FX.ring 205)다 —
     장식이 아니라 실제 사거리를 그린다.
     탑다운 원근에 맞춰 세로를 0.86 으로 누른다(슬래시·헤일로와 같은 계수).
     ※ 월드 좌표계에서 그린다. engine.js 가 배경 직후·몹 앞에 호출하므로
        바닥 표시처럼 몹 밑에 깔린다.
     ※ setLineDash 는 소스 전체에서 여기만 쓴다. qa.js mkCtx 에 noop 스텁이
        있어 헤드리스 검사는 깨지지 않는다.                                */
  drawRange: function () {
    var p = Game.player; if (!p) return;
    var c = Stage.ctx, R = 205;
    c.save();
    c.setLineDash([9, 11]);
    c.lineDashOffset = -Game.wt * 14;      /* 천천히 흐른다 — 정지한 원은 죽어 보인다 */
    c.strokeStyle = 'rgba(142,240,255,.30)'; c.lineWidth = 1.4;
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

  /* ── 하단 오버레이 — HP / 실드 / 스킬 피해 현황 ─────────────────────────
     세로 순서(레퍼런스와 동일): HP·실드 한 줄 → 스킬 피해 패널 → CTA.
     ★ 전부 플레이 영역 "위에 뜨는" 오버레이다. Stage.pf 를 줄이지 않는다.
       (줄이면 qa.js ① 의 play ≥ 430 이 깨져 빌드가 막힌다)
     ★ 패널 폭은 전부 W 미만이다. 전폭 채우기는 qa.js ⑥ 이 잡는다.
     ──────────────────────────────────────────────────────────────────── */
  SKILL_W : 168,          /* 스킬 패널 폭 — 좌측에 붙는 좁은 기둥 */
  SKILL_ROW : 17,

  drawPlayerHP: function () {
    var c = Stage.ctx, W = Stage.W, PAD = this.PAD;
    var rows = Damage.SRC.length;
    var panelH = 16 + rows * this.SKILL_ROW + 4;   /* 헤더 + 행 + 아래 여백 */
    var panelY = this.ctaTop() - 6 - panelH;
    var barH = 18;
    var rowY = panelY - 7 - barH;          /* HP·실드 줄이 패널 위에 온다 */
    var midY = rowY + barH / 2;

    if (Game.hpHit > 0) Game.hpHit -= 1 / 60;
    var kick = Game.hpHit > 0 ? Math.sin(Game.hpHit * 42) * 1.6 * (Game.hpHit / 0.22) : 0;

    /* ── HP (좌) ──────────────────────────────────────────────────────── */
    var hpW = Math.round(W * 0.50) - PAD;
    var hr  = clamp(Game.hp / Game.hpMax, 0, 1);
    var hrg = clamp(Game.hpGhost / Game.hpMax, 0, 1);
    HUD.txt(THEME.labelHP + ': ' + Math.round(Game.hp) + '/' + Game.hpMax,
            PAD + kick, rowY - 5, '800 11px ' + FONT, THEME.text, 'left', 3.5);
    HUD.bar(PAD + kick, rowY, hpW, barH, hr, THEME.hp,
            { ghost: hrg, radius: this.R_HP, pad: 3 });

    /* ── 실드 (우) ─────────────────────────────────────────────────────
       Game.shield 는 2차 신규다. 피격 전에 먼저 깎이고, 안 맞는 동안 다시
       찬다 — 레퍼런스의 SHIELD 0/100 이 늘 0인 것과 달리 실제로 움직인다.
       (표시만 있고 아무것도 안 하는 게이지는 가짜로 읽힌다)              */
    var shX = Math.round(W * 0.58), shW = W - PAD - shX;
    var sr = Game.shieldMax > 0 ? clamp(Game.shield / Game.shieldMax, 0, 1) : 0;
    HUD.glyph('shield', shX + 6, rowY - 9, 6, THEME.neonC, 0.85);
    HUD.txt(THEME.labelShield + ': ' + Math.round(Game.shield) + '/' + Game.shieldMax,
            shX + 16, rowY - 5, '800 11px ' + FONT, THEME.textDim, 'left', 3.5);
    HUD.bar(shX, rowY, shW, barH, sr, THEME.neonC, { radius: this.R_HP, pad: 3 });

    /* ── 스킬 피해 현황 (좌하단 기둥) ───────────────────────────────────
       레퍼런스의 4~5행 패널. 값은 damage.js 의 스무딩된 표시값이고,
       미니 바는 그 판의 최대값 대비 비율이라 어느 기술이 지금 판을 끌고
       있는지가 길이로 읽힌다. 아직 안 쓴 기술은 '-' 로 비워 둔다 —
       레퍼런스도 하위 두 행이 비어 있다.                                */
    var px = PAD, pw = this.SKILL_W;
    HUD.card(px, panelY, pw, panelH);
    HUD.txt('스킬 피해 현황', px + 10, panelY + 12, '800 9px ' + FONT, THEME.textDim, 'left', 2.5);

    var mx = 1;
    for (var i = 0; i < rows; i++) mx = Math.max(mx, Damage.shown[Damage.SRC[i].id]);
    for (i = 0; i < rows; i++) {
      var S = Damage.SRC[i], v = Damage.shown[S.id] || 0;
      var ry = panelY + 16 + i * this.SKILL_ROW + this.SKILL_ROW / 2;
      HUD.glyph(S.icon, px + 13, ry, 5.5, S.col, v > 0 ? 1 : 0.28);
      /* 미니 트랙 — 국소 폭이라 전폭 딤 규칙과 무관하다 */
      var tx2 = px + 24, tw = pw - 24 - 46;
      c.fillStyle = 'rgba(142,240,255,.09)';
      roundRect(c, tx2, ry - 4, tw, 8, 4); c.fill();
      if (v > 0) {
        c.fillStyle = S.col;
        roundRect(c, tx2, ry - 4, Math.max(4, tw * (v / mx)), 8, 4); c.fill();
      }
      HUD.txt(v > 0 ? Damage.fmt(v) : '-', Stage.snap(px + pw - 9), Stage.snap(ry + 4),
              '800 11px ' + FONT, v > 0 ? THEME.text : THEME.textDim, 'right', 3);
    }
  },

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

  hitCTA: function (x, y) {
    var r = this.ctaRect; if (!r) return false;
    return x >= r.x - 8 && x <= r.x + r.w + 8 && y >= r.y - 8 && y <= r.y + r.h + 8;
  }
};
