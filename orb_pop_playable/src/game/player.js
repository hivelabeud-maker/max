/* ============================================================================
   player.js — 부유 + 조이스틱 조준 + 연사

   1차(디펜스)와 조작이 다르다:
     · 1차 — 드래그로 캐릭터가 "이동"하고 가장 가까운 적을 자동 조준
     · 여기 — 캐릭터는 거의 제자리에 뜬 채, 드래그가 "조준 방향"을 돌린다

   레퍼런스 실측 근거: 원본 영상에서 플레이어 오브가 1.2초간 (283,332) →
   (281,349) 로만 움직였다. 사실상 정지다. 움직이는 것은 조준뿐이고,
   그 조준을 훑으면서 나온 탄 줄기가 화면의 곡선 점선 궤적을 만든다.

   그래서 이동은 "미세 부유"로만 남겼다. 완전히 고정하면 정지 화면처럼 보인다.
   ========================================================================== */
var Player = {
  make: function () {
    return {
      x: Stage.W / 2, y: 0,
      tx: Stage.W / 2, ty: 0,
      k: 1, r: 15, fire: 0, walk: 0, moving: 0, hurt: 0, hurtCd: 0,
      aim: -Math.PI / 2, aimT: -Math.PI / 2, at: 0, shoot: 0, muzzle: 0,
      sweep: 0, seekT: 0
    };
  },

  layout: function (p) {
    p.k = Anim.has(CHARACTER.anim.idle.key)
        ? Anim.fit(CHARACTER.anim.idle.key, CHARACTER.hLogic)
        : fitScale(CHARACTER.sheet, CHARACTER.hLogic);
    var z0 = Player.zone();
    if (!p.ty) { p.ty = z0.cy; p.y = z0.cy; p.tx = z0.cx; p.x = z0.cx; }
    p.tx = clamp(p.tx, z0.x0, z0.x1);
    p.ty = clamp(p.ty, z0.y0, z0.y1);
  },

  /* 부유 존 — 아주 좁다. 레퍼런스의 플레이어는 제자리를 지킨다.
     ★ 세로 중심은 플레이 영역의 정중앙이 아니라 살짝 위다. 아래쪽은
       CTA·조이스틱이 먹으므로, 정중앙에 두면 캐릭터가 UI 에 붙어 보인다 */
  /* ── 고정 위치 ─────────────────────────────────────────────────────────
     ★ 발사대는 움직이지 않는다. 원본 영상에서 2.0~4.0초 동안 좌표가
       (143,232)에서 1px도 안 변했다 — 284폭 기준 가로 정중앙,
       플레이 영역 세로의 43% 지점이다.
     1차 구현은 리사주 곡선으로 부유시켰는데, 실장이 "중앙에서 쏘는 방식이
     반영이 안 됐다"고 지적한 게 이것이다. 되돌리지 말 것.
     세로를 43%로 잡는 이유: 오브가 위쪽에 몰려 있고 폭발도 위에서 나므로,
     발사대가 정중앙이면 폭발이 화면 밖으로 밀린다.                        */
  zone: function () {
    var top = Stage.pf.y, bot = HUD.ctaTop();
    var cx = Stage.W / 2, cy = top + (bot - top) * 0.43;
    return { cx: cx, cy: cy, x0: cx, x1: cx, y0: cy, y1: cy };
  },

  update: function (p, dt) {
    var A = CHARACTER.attack;

    /* ── 조준 ────────────────────────────────────────────────────────────
       드래그가 있으면 그 방향이 조준이 된다. 조이스틱 노브도 같은 값을 쓴다.
       손을 떼면 오토 조준으로 넘어간다 (광고는 대부분 무입력으로 재생된다) */
    if (Input.dx || Input.dy) {
      if (Stick.applyDrag(Input.dx, Input.dy)) p.aimT = Stick.angle();
    } else {
      Stick.active = false;
      if (!Input.everTouched || Input.idle > 0.9) {
        Player.autoAim(p, dt);
        Stick.follow(p.aimT, dt);
      }
    }

    /* 조준 회전은 항상 부드럽게 — 스냅시키면 탄 줄기가 끊어져서
       레퍼런스의 "곡선으로 이어지는 점선"이 안 나온다. 최단 회전 방향으로 돈다 */
    var d = p.aimT - p.aim;
    while (d > Math.PI) d -= 6.2831853;
    while (d < -Math.PI) d += 6.2831853;
    p.aim += d * (1 - Math.exp(-A.aimSpeed * dt));

    /* ── 위치 고정 ────────────────────────────────────────────────────────
       부유도 없다. 화면 회전·리사이즈로 중심이 바뀔 때만 수렴으로 따라간다 */
    var z = Player.zone();
    p.tx = z.cx; p.ty = z.cy;
    var sm = 1 - Math.exp(-14 * dt);
    p.x += (p.tx - p.x) * sm; p.y += (p.ty - p.y) * sm;
    p.moving = 0;                    /* 부유는 걷기가 아니다 — idle/fire 만 쓴다 */
    p.at += dt; p.walk += dt * 5;
    if (p.hurt > 0) p.hurt -= dt;
    if (p.shoot > 0) p.shoot -= dt;
    if (p.muzzle > 0) p.muzzle -= dt;

    /* ── 연사 ────────────────────────────────────────────────────────────
       rate 0.055초 = 초당 18발. 1차(0.16초)의 3배다.
       이 빠르기라야 조준을 훑었을 때 점이 "줄기"로 이어져 보인다 —
       레퍼런스 화면의 곡선 점선이 바로 이것이고, 궤적 예측선이 아니다.     */
    p.fire -= dt;
    if (p.fire <= 0) {
      p.fire = A.rate;
      p.shoot = 0.30; p.muzzle = 0.05;
      var M = CHARACTER.muzzle;
      var mx = p.x + Math.cos(p.aim) * M.r;
      var my = p.y + M.y + Math.sin(p.aim) * M.r * 0.7;
      var spread = A.spread * (1 - Combo.heat() * 0.4);   /* 달아오를수록 정밀해진다 */
      for (var j = 0; j < A.count; j++) {
        var a = p.aim + (A.count > 1 ? (j - (A.count - 1) / 2) * spread : 0);
        Bullets.spawn(mx, my, a, A.speed, A.dmg, 0);
      }
      FX.kick(0.5, 0.02);
    }
  },

  /* ── 오토 조준 ───────────────────────────────────────────────────────────
     "가장 가까운 표적"만 보면 조준이 딱딱 끊겨 기계처럼 보인다.
     대신 0.5초마다 목표를 새로 고르되, 고를 때 **오브가 몰려 있는 방향**에
     가중치를 준다. 그 사이에는 스윕을 얹어 조준이 계속 흐르게 한다 —
     이래야 화면에 곡선 점선이 남는다.                                        */
  autoAim: function (p, dt) {
    p.seekT -= dt;
    if (p.seekT <= 0) {
      p.seekT = 0.5;
      var bx = 0, by = 0, w = 0;
      Game.orbs.each(function (o) {
        if (o.dieT > 0) return;
        var dx = o.x - p.x, dy = o.y - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 400) return;
        /* 큰 오브에 가중 — 분열이 크게 터져서 콤보가 잘 붙는다 */
        var ww = (o.t * o.t) / (1 + d2 / 90000);
        bx += dx * ww; by += dy * ww; w += ww;
      });
      if (w > 0) p.sweep = Math.atan2(by, bx);
    }
    /* ── 스윕 속도가 곧 점 궤적의 길이다 ──────────────────────────────────
       원본 영상 실측: 0.8초 동안 궤적 방향이 약 150° 돌았다 = 3.3 rad/s.
       1차 구현은 진폭 0.62 × 주파수 1.35 = 0.84 rad/s 로 4배 느렸고,
       그래서 점이 한 자리에 뭉쳐 "일정 간격으로 늘어선 줄"이 안 나왔다.
       조준이 빠르게 훑어야 먼저 쏜 탄과 나중 탄의 각도가 벌어져 곡선이 그려진다. */
    p.aimT = p.sweep + Math.sin(Game.wt * 2.6) * 1.25
                     + Math.sin(Game.wt * 0.9 + 2.2) * 0.55;
  },

  /* 상황 → 애니 선택. 사격 직후 0.42초는 fire 를 유지해 깜빡임을 막는다. */
  pick: function (p) {
    var A = CHARACTER.anim;
    if (p.shoot > 0) return A.fire;
    if (p.moving) return A.run;
    return A.idle;
  },

  draw: function (p) {
    var c = Stage.ctx;
    var A = CHARACTER.aura;
    var R0 = A.radius, FLAT = A.flat;
    var footY = p.y + CHARACTER.hLogic * CHARACTER.footY;

    /* 발밑 그림자 — 링보다 먼저 (링이 위에 얹혀야 발광이 산다) */
    c.globalAlpha = CHARACTER.read.shadow; c.fillStyle = '#000';
    c.beginPath(); c.ellipse(p.x, footY, R0 * 0.42, R0 * 0.15, 0, 0, 6.2832); c.fill();
    c.globalAlpha = 1;

    /* ── 파이어 헤일로 — 가산 블렌딩. 검은 그림자 없이 이 링이 접지를 담당 ── */
    c.save();
    c.translate(p.x, footY);
    c.scale(1, FLAT);
    c.globalCompositeOperation = 'lighter';

    var og = c.createRadialGradient(0, 0, R0 * 0.55, 0, 0, R0 * 1.45);
    og.addColorStop(0.00, 'rgba(255,110,20,0)');
    og.addColorStop(0.42, 'rgba(255,120,25,.42)');
    og.addColorStop(0.62, 'rgba(255,90,15,.20)');
    og.addColorStop(1.00, 'rgba(255,80,10,0)');
    c.fillStyle = og;
    c.beginPath(); c.arc(0, 0, R0 * 1.45, 0, 6.2832); c.fill();

    /* 링 본체 — 넓은 주황 띠 → 밝은 코어 순서로 겹쳐 굽는다 */
    c.strokeStyle = 'rgba(255,140,30,.46)'; c.lineWidth = 11;
    c.beginPath(); c.arc(0, 0, R0, 0, 6.2832); c.stroke();
    c.strokeStyle = 'rgba(255,190,60,.70)'; c.lineWidth = 5.5;
    c.beginPath(); c.arc(0, 0, R0, 0, 6.2832); c.stroke();
    c.strokeStyle = 'rgba(255,245,170,1)'; c.lineWidth = 2.6;
    c.beginPath(); c.arc(0, 0, R0, 0, 6.2832); c.stroke();
    /* 앞쪽(아래 반원)이 더 밝게 — 레퍼런스의 전면 하이라이트 */
    c.strokeStyle = 'rgba(255,255,210,.85)'; c.lineWidth = 2.6;
    c.beginPath(); c.arc(0, 0, R0, 0.25, Math.PI - 0.25); c.stroke();

    /* 불티 — 링 주변을 아주 천천히 */
    for (var si = 0; si < A.sparks; si++) {
      var sa = si * (6.2832 / A.sparks) + Game.wt * 0.35 + si * si;
      var sr = R0 * (1.02 + 0.16 * Math.sin(si * 2.1 + Game.wt * 0.8));
      var ss = 1.3 + 0.8 * Math.sin(si * 3.7 + Game.wt * 1.3);
      c.fillStyle = 'rgba(255,200,80,.75)';
      c.beginPath(); c.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, ss, 0, 6.2832); c.fill();
    }
    c.restore();

    var flip = Math.cos(p.aim) < 0;
    var a = Player.pick(p);

    if (Anim.has(a.key)) {
      var f = Anim.frameAt(a.key, p.at, a.fps);
      var kick = p.muzzle > 0 ? -2.5 : 0;          /* 발사 반동 */
      Anim.draw(a.key, f, p.x + (flip ? -kick : kick), p.y, p.k, {
        flip: flip,
        tint: p.hurt > 0 ? '#ff5a6e' : null, tintA: 0.32
      });
      /* ── 조준 막대 ─────────────────────────────────────────────────────
         원본의 발사대는 "시안 오브 + 흰 막대"라 조준 방향이 한눈에 읽힌다.
         리타 스프라이트는 좌우 반전만 되고 방향을 못 알려주므로,
         같은 역할의 막대를 코드로 그려 붙인다. */
      var M3 = CHARACTER.muzzle;
      var sx = p.x + Math.cos(p.aim) * (M3.r - 4);
      var sy = p.y + M3.y + Math.sin(p.aim) * (M3.r - 4) * 0.7;
      var ex = p.x + Math.cos(p.aim) * (M3.r + 15);
      var ey = p.y + M3.y + Math.sin(p.aim) * (M3.r + 15) * 0.7;
      c.save();
      c.lineCap = 'round';
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 8;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = '#ffffff'; c.lineWidth = 5;
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
      c.restore();

      /* 총구 화염 — 스프라이트에 굽지 않고 코드로 (방향을 따라간다) */
      if (p.muzzle > 0) {
        var M2 = CHARACTER.muzzle;
        var mx = p.x + Math.cos(p.aim) * M2.r;
        var my = p.y + M2.y + Math.sin(p.aim) * M2.r * 0.7;
        var mk = p.muzzle / 0.06;
        c.save(); c.globalCompositeOperation = 'lighter';
        var fx2 = mx + Math.cos(p.aim) * 9, fy2 = my + Math.sin(p.aim) * 7;
        /* 총구 화염 — 2차에서 키우고 색을 네온으로 바꿨다.
           1차는 주황 코어(255,90,70)였는데 우주·네온 화면에서 혼자 난색이라
           탄막과 다른 물질처럼 보였다. 마젠타 헤일로 + 백열 코어로 통일한다.
           원뿔은 조준 방향으로만 뻗어서 "어디로 쐈는지"를 같이 알려준다 */
        c.fillStyle = 'rgba(255,95,214,' + (0.5 * mk).toFixed(3) + ')';
        c.beginPath(); c.arc(fx2, fy2, 17 * mk, 0, 6.2832); c.fill();
        c.fillStyle = 'rgba(255,160,235,' + (0.75 * mk).toFixed(3) + ')';
        c.beginPath(); c.arc(fx2, fy2, 9.5 * mk, 0, 6.2832); c.fill();
        c.fillStyle = 'rgba(255,255,255,' + (0.95 * mk).toFixed(3) + ')';
        c.beginPath(); c.arc(fx2, fy2, 5 * mk, 0, 6.2832); c.fill();
        var cone = 26 * mk, hw = 9 * mk;
        c.fillStyle = 'rgba(255,150,235,' + (0.42 * mk).toFixed(3) + ')';
        c.beginPath();
        c.moveTo(fx2 + Math.cos(p.aim + 1.5708) * hw, fy2 + Math.sin(p.aim + 1.5708) * hw * 0.7);
        c.lineTo(fx2 + Math.cos(p.aim) * cone,        fy2 + Math.sin(p.aim) * cone * 0.7);
        c.lineTo(fx2 + Math.cos(p.aim - 1.5708) * hw, fy2 + Math.sin(p.aim - 1.5708) * hw * 0.7);
        c.closePath(); c.fill();
        c.restore();
      }
      return;
    }

    /* 폴백 — 시트가 하나도 없을 때 */
    var bob = p.moving ? Math.sin(p.walk) * 3 : Math.sin(p.walk * 0.5) * 1.2;
    drawSprite(CHARACTER.sheet, p.x, footY + bob, fitScale(CHARACTER.sheet, CHARACTER.hLogic),
      { flip: flip, tint: p.hurt > 0 ? '#ffffff' : null, tintA: 0.55 });
  }
};
