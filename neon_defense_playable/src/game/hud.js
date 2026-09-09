/* ============================================================================
   hud.js — 플랫 HUD

   도트 아트가 이미 정보량이 많다. UI 가 조금이라도 입체적이면 화면이 즉시
   지저분해진다. 그래서 이번 버전은 규칙을 넷으로 고정했다:
     ① 그라디언트·베벨·글로우 금지. 단색 면 + 1px 라인만.
     ② 모서리는 라운드 4px 이하. 캡슐 금지.
     ③ 표시하는 값은 3개뿐 — 처치 수 / 웨이브 진행 / HP.
     ④ ★ 화면 폭 전체를 덮는 딤/스크림 사각형 절대 금지.
        (fillRect(0, 0, W, n) 같은 것) — 배경 위에서 "검정 띠"로 보인다.
        3회 재발한 실수다. 가독성은 strokeText 외곽선으로만 해결한다.
        qa.js ⑥ 이 이 규칙을 자동 검사한다.
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

  draw: function () {
    var c = Stage.ctx, W = Stage.W;
    var PAD = this.PAD, cw = this.CARD_W, chh = this.CARD_H, cy0 = this.TOP;

    /* ⚠️ 상단에 전폭 딤/스크림을 절대 깔지 말 것 — 배경 위에서 "검정 띠"가 된다.
       가독성은 카드(국소 패널)가 담당한다. 카드 위에 글자 외곽선까지 겹치면
       탁해 보이므로 카드 안 텍스트는 stroke 없이 그린다. */
    c.textBaseline = 'alphabetic';

    /* ── ① 처치 카드 (좌) / ② 생존 카드 (우) ── */
    var left = Math.max(0, TIMELINE.cues[TIMELINE.cues.length - 1].t - Game.t);
    var mm = (left / 60) | 0, ss = (left % 60) | 0;
    var tt = mm + ':' + (ss < 10 ? '0' : '') + ss;
    var urgent = (Game.danger > 0 || left <= 10);

    var cards = [
      /* 표시값은 Game.kills 가 아니라 Game.killShown — 볼리 한 방에 30~50 이
         동시에 죽으면 원본 값은 뭉텅이로 튀어서 "덜컥덜컥" 올라간다.
         표시용 값만 따로 굴려 끊김 없이 흐르게 한다 (engine.js 에서 갱신) */
      { x: PAD,              ic: 'skull',     lab: THEME.labelKill, val: (Game.killShown | 0) + '', col: THEME.text },
      { x: W - PAD - cw,     ic: 'hourglass', lab: THEME.labelTime, val: tt,              col: urgent ? THEME.danger : THEME.text }
    ];
    for (var i = 0; i < cards.length; i++) {
      var cd = cards[i];
      HUD.card(cd.x, cy0, cw, chh);
      HUD.icon(cd.ic, cd.x + 31, cy0 + chh / 2, 32);
      c.textAlign = 'left';
      c.font = '700 11px ' + FONT;
      c.fillStyle = THEME.textDim;
      c.fillText(cd.lab, Stage.snap(cd.x + 58), Stage.snap(cy0 + 21));
      c.font = '800 26px ' + FONT;
      c.fillStyle = cd.col;
      /* ★ Stage.snap 필수 — 전역 변환이 scale*dpr(≈1.97) 소수 배율이라
         논리 좌표를 그대로 넘기면 글자가 반픽셀에 앉아 번져 보인다.
         특히 처치 수는 매 프레임 값이 바뀌어서 번짐이 잔상처럼 읽힌다 */
      c.fillText(cd.val, Stage.snap(cd.x + 58), Stage.snap(cy0 + 44));
    }

    /* ── ③ 진행 게이지 — 단일 바 + 다이아 마커 ────────────────────────────
       예전엔 3칸으로 쪼개져 있었는데 목업은 하나짜리 바에 마커가 붙는 형태다.
       웨이브 전 구간(첫 시작 ~ 마지막 끝)을 0~1 로 환산한다. */
    var sp = TIMELINE.waveSpan;
    var s0 = sp[0][0], s1 = sp[sp.length - 1][1];
    var r = clamp((Game.t - s0) / (s1 - s0), 0, 1);
    /* 바는 항상 노랑. 위험 신호는 타이머 숫자 색이 담당한다 —
       바까지 빨개지면 화면이 온통 붉어져서 오히려 긴장감이 안 읽힌다. */
    HUD.bar(PAD, cy0 + chh + 5, W - PAD * 2, this.BAR_TOP, r, THEME.xp,
            { radius: this.R_BAR, marker: THEME.marker });
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

  /* ── 플레이어 HP — CTA 바로 위. 상단 게이지와 같은 디자인 시스템 ──
     폭은 CTA 의 95%, 트랙 19 / 채움 14. 라벨과 수치는 바 안에 얹는다
     (바깥에 두면 세로 공간을 더 먹는다 — 화면을 가리지 않는 게 우선). */
  drawPlayerHP: function () {
    var c = Stage.ctx, W = Stage.W;
    var x0 = 22;                                  /* CTA 와 같은 좌측 기준선 */
    var bh = this.BAR_HP;
    var by = this.ctaTop() - bh - 8;
    var midY = by + bh / 2;
    var r  = clamp(Game.hp / Game.hpMax, 0, 1);
    var rg = clamp(Game.hpGhost / Game.hpMax, 0, 1);
    if (Game.hpHit > 0) Game.hpHit -= 1 / 60;
    var kick = Game.hpHit > 0 ? Math.sin(Game.hpHit * 42) * 1.6 * (Game.hpHit / 0.22) : 0;

    /* 좌측 — HP 라벨 + 하트. 바 바깥에 두어 바 안은 수치만 남긴다 */
    c.save();
    c.textAlign = 'left'; c.textBaseline = 'alphabetic';
    c.font = '800 10px ' + FONT;
    c.lineJoin = 'round'; c.lineWidth = 4; c.strokeStyle = 'rgba(6,9,18,.8)';
    c.strokeText(THEME.labelHP, x0 + kick, by - 9);
    c.fillStyle = THEME.text; c.fillText(THEME.labelHP, x0 + kick, by - 9);
    c.restore();
    HUD.icon('heart', x0 + kick + 17, midY + 3, 32);

    /* 바 — 하트 오른쪽부터 CTA 오른쪽 끝까지 */
    var bx = x0 + 42, bw = (W - 22) - bx;
    HUD.bar(bx + kick, by, bw, bh, r, THEME.hp,
            { ghost: rg, radius: this.R_HP, pad: 3 });

    /* 수치 — 바 중앙 (목업 형식) */
    c.save();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    var txt = Math.round(Game.hp) + ' / ' + Game.hpMax;
    c.font = '800 13px ' + FONT;
    c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = 'rgba(6,9,18,.85)';
    c.strokeText(txt, bx + kick + bw / 2, midY + 0.5);
    c.fillStyle = '#ffffff'; c.fillText(txt, bx + kick + bw / 2, midY + 0.5);
    c.restore();
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
