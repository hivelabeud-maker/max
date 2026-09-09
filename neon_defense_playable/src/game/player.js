/* player.js — 드래그 자유 이동 + 자동 조준 사격.
   리타는 프레임 애니 3종(idle / run / fire)을 상황에 따라 갈아탄다.
   원점이 셀 안에 기록돼 있어 애니를 바꿔도 위치가 튀지 않는다. */
var Player = {
  make: function () {
    return {
      x: Stage.W / 2, y: Stage.H * 0.52,
      tx: Stage.W / 2, ty: Stage.H * 0.52,
      k: 1, r: 15, fire: 0, walk: 0, moving: 0, hurt: 0, hurtCd: 0,
      aim: -Math.PI / 2, at: 0, shoot: 0, muzzle: 0,
      volT: 0, volTold: 0, volKills: 0, volKillT: 0
    };
  },

  layout: function (p) {
    p.k = Anim.has(CHARACTER.anim.idle.key)
        ? Anim.fit(CHARACTER.anim.idle.key, CHARACTER.hLogic)
        : fitScale(CHARACTER.sheet, CHARACTER.hLogic);
    var z0 = Player.zone();
    p.tx = clamp(p.tx, z0.x0, z0.x1);
    p.ty = clamp(p.ty, z0.y0, z0.y1);
  },

  /* 중앙 존 — 캐릭터가 이 안에만 머문다.
     구석으로 도망가면 몹 카펫이 한쪽에만 쌓여 "사방 포위"가 무너진다. */
  zone: function () {
    var cx = Stage.W / 2, cy = (Stage.pf.y + HUD.ctaTop()) / 2;
    var rx = Stage.W * 0.22, ry = (HUD.ctaTop() - Stage.pf.y) * 0.17;
    return { cx: cx, cy: cy, x0: cx - rx, x1: cx + rx, y0: cy - ry, y1: cy + ry };
  },

  update: function (p, dt) {
    var mv = CHARACTER.move;
    if (Input.dx || Input.dy) {
      p.tx += Input.dx * mv.drag; p.ty += Input.dy * mv.drag;
    } else if (!Input.everTouched || Input.idle > 1.2) {
      Player.auto(p, dt);
    }
    var cz = Player.zone();
    p.tx = clamp(p.tx, cz.x0, cz.x1);
    p.ty = clamp(p.ty, cz.y0, cz.y1);

    var ox = p.x, oy = p.y;
    var s = 1 - Math.exp(-mv.smooth * dt);
    p.x += (p.tx - p.x) * s; p.y += (p.ty - p.y) * s;
    p.moving = (Math.abs(p.x - ox) + Math.abs(p.y - oy)) > 0.35 ? 1 : 0;
    p.at += dt; p.walk += dt * (p.moving ? 13 : 5);
    if (p.hurt > 0) p.hurt -= dt;
    if (p.hurtCd > 0) p.hurtCd -= dt;
    if (p.shoot > 0) p.shoot -= dt;
    if (p.muzzle > 0) p.muzzle -= dt;

    /* ── 자동 사격 ── */
    var A = CHARACTER.attack;
    p.fire -= dt;
    var tgt = Enemies.nearest(p.x, p.y, A.range);
    if (tgt) p.aim = Math.atan2(tgt.y - p.y, tgt.x - p.x);
    if (p.fire <= 0 && tgt) {
      p.fire = A.rate;
      p.shoot = 0.42; p.muzzle = 0.06;
      var base = p.aim;
      var M = CHARACTER.muzzle;
      var mx = p.x + Math.cos(base) * M.r;
      var my = p.y + M.y + Math.sin(base) * M.r * 0.7;   /* 탑다운 원근 — 세로는 눌러서 */
      for (var j = 0; j < A.count; j++) {
        var a = base + (A.count > 1 ? (j - (A.count - 1) / 2) * A.spread : 0);
        Bullets.spawn(mx, my, a, A.speed, A.dmg, A.pierce);
      }
      /* 반복형(매 발) 이펙트는 조금만 올린다 — 크게 키우면 화면을 덮는다.
         손맛은 아래 볼리 같은 순간형에서 벌 것 */
      FX.burst(mx + Math.cos(base) * 10, my + Math.sin(base) * 10, 2, '#ff9fe4', 175, 1.7);
      FX.kick(1.3, 0.04);
    }

    /* ── 360° 방사 볼리 — 주기적으로 사방에 탄을 뿜는다 (영상의 핵심 액션) ──
       예고 → 발사 → 콤보 집계 3박자로 간다. 예고 없이 그냥 터지면
       눈이 못 따라와서 "많이 쐈다"로만 남고 "쓸어버렸다"가 안 읽힌다. */
    var V = A.volley;
    if (V) {
      p.volT += dt;

      /* 예고 — 0.24초 전 수축링. 바깥에서 안으로 조여들며 "모은다" */
      if (!p.volTold && p.volT >= V.every - 0.24 && Enemies.nearest(p.x, p.y, 520)) {
        p.volTold = 1;
        FX.ring(p.x, p.y - 6, 140, 20, 0.24, 'rgba(255,190,245,.9)', 3);
        FX.ring(p.x, p.y - 6, 104, 14, 0.24, 'rgba(255,255,255,.6)', 2);
      }

      if (p.volT >= V.every && Enemies.nearest(p.x, p.y, 520)) {
        p.volT = 0; p.volTold = 0;
        var n = V.n, a0 = rnd(0, 6.2832 / n);
        for (var vi = 0; vi < n; vi++) {
          var va = a0 + vi * 6.2832 / n;
          Bullets.spawn(p.x + Math.cos(va) * 16, p.y - 6 + Math.sin(va) * 11,
                        va, A.speed * 0.9, V.dmg, 1, 1);
        }
        /* 충격파 3겹 — 빠른 흰 링이 앞서고 마젠타·시안이 차례로 번진다.
           볼리는 1.1초에 한 번뿐인 순간형이라 크게 가야 손맛이 난다.
           (반복형과 달리 눈에 쌓이지 않는다 — 1차에서 뭉뚱그려 줄였다가
            "팡 터져서 흔들리는건 다 좋아"라고 정정받은 지점이다) */
        FX.ring(p.x, p.y - 6, 12, 118, 0.16, 'rgba(255,255,255,.95)', 5);
        FX.ring(p.x, p.y - 6, 20, 205, 0.34, 'rgba(255,120,225,.8)', 4);
        FX.ring(p.x, p.y - 6, 34, 262, 0.46, 'rgba(142,240,255,.42)', 2.5);
        FX.slashBurst(p.x, p.y - 6, 14, 'rgba(255,175,240,.9)', 205);
        FX.burst(p.x, p.y - 6, 22, '#ffd9f4', 380, 2.6);
        FX.burst(p.x, p.y - 6, 12, '#8ef0ff', 300, 2.0);
        FX.kick(6.2, 0.12);
        Game.hitstop = Math.max(Game.hitstop, 0.035);
        p.shoot = 0.42; p.muzzle = 0.06;
        /* 콤보 집계 창 열기 — 이 안에서 죽은 마리수를 세서 크게 꽂는다 */
        p.volKills = 0; p.volKillT = 0.60;
      }

      if (p.volKillT > 0) {
        p.volKillT -= dt;
        /* 캐릭터 머리 위가 아니라 상단 HUD 아래 고정 위치에 띄운다.
           처음엔 머리 위에 뒀는데 피크에서 ×69 같은 값이 주인공을 통째로
           가려서, 겹침을 없애려던 작업이 새 겹침을 만들었다.
           20마리 이상일 때만 — 매번 뜨면 그냥 배경 노이즈가 된다 */
        if (p.volKillT <= 0 && p.volKills >= 20) {
          /* 표기를 레퍼런스대로 'Combo N!!' 로 바꿨다. 금색 ×N 은 1차 던전
             팔레트의 잔재라 네온 화면에서 혼자 난색으로 떴다 */
          FX.punch(Stage.W / 2, Stage.pf.y + 74, 'Combo ' + p.volKills + '!!', THEME.neonC,
                   26 + Math.min(12, p.volKills * 0.14));
        }
      }
    }
  },

  /* 오토플레이 — 중앙을 지키며 천천히 선회한다. */
  auto: function (p, dt) {
    var z = Player.zone();
    var t = Game.wt;
    var ox = Math.sin(t * 0.62) * (z.x1 - z.cx) * 0.52 + Math.sin(t * 1.13 + 1.7) * 12;
    var oy = Math.sin(t * 0.47 + 2.1) * (z.y1 - z.cy) * 0.52 + Math.cos(t * 0.91) * 9;
    var ax = 0, ay = 0;
    Game.enemies.each(function (e) {
      if (e.dieT > 0) return;
      var dx = p.x - e.x, dy = p.y - e.y, d2 = dx * dx + dy * dy;
      if (d2 < 4900 && d2 > 1) { var w = (4900 - d2) / 4900; var d = Math.sqrt(d2); ax += dx / d * w; ay += dy / d * w; }
    });
    /* 회피가 너무 강하면 fast(빨강 돌격체)의 rmin 이 뚫려 있어도 플레이어가
       아예 안 붙어서 접촉 자체가 안 난다 — HP가 절대 안 깎이는 원인이었다.
       완전히 파묻히지만 않을 만큼만 밀어내고, 나머지는 fast 가 뚫고 온다 */
    var tx = z.cx + ox + clamp(ax * 18, -17, 17);
    var ty = z.cy + oy + clamp(ay * 18, -17, 17);
    p.tx += (tx - p.tx) * (1 - Math.exp(-2.2 * dt));
    p.ty += (ty - p.ty) * (1 - Math.exp(-2.2 * dt));
  },

  /* 접촉 피해 — 무적 시간으로 DPS 상한. 하한 15%, 사망 없음 */
  hurt: function (p, dmg) {
    if (Game.state !== 'battle' && Game.state !== 'tutorial') return;
    if (p.hurtCd > 0) return;
    p.hurt = 0.08; p.hurtCd = 0.50;
    Game.hp = Math.max(Game.hpMax * Game.hpFloor, Game.hp - (dmg || 4) * 0.42 * Game.hpU);
    Game.hpRegenLock = 1.6;   /* 맞은 티가 나도록 잠깐 재생을 멈춘다 */
    Game.hpHit = 0.22;
    FX.kick(4, 0.10);
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
