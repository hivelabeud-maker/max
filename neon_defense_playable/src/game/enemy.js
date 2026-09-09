/* ============================================================================
   enemy.js — 사방 분대 스폰 → 중앙의 리타를 포위한다.
   슬라임은 전부 정면 뷰라 좌우 반전이 필요 없다. walk 스트립을 개체마다
   다른 위상으로 재생해서 같은 애니여도 군집이 기계적으로 보이지 않게 한다.
   ========================================================================== */
var Enemies = {
  qbuf: [],
  sqLeft: 0, sqX: 0, sqY: 0, sqN: 0, sqPh: 0, sqSide: 0, sqTotal: 0,

  init: function () {
    this.sqLeft = 0; this.sqTotal = 0;
    Game.enemies = new Pool(function () {
      return { on:false, x:0,y:0, cx:0, cy2:0, cph:0, side:0, ent:0,
               hp:0, max:0, def:null, sheet:'', k:1, r:9, rmin:0,
               ph:0, at:0, hit:0, hitCd:0, spdM:1, dieT:0, frz:0 };
    }, 1000);
  },

  /* 사방 중 한 변에서 10~16마리가 한 분대로 등장 */
  spawn: function (typeKey, spdM, hpM) {
    var D = ENEMY_SET.types[typeKey]; if (!D) return null;
    var e = Game.enemies.get();
    var pf0 = Stage.pf;
    if (typeKey === 'grunt' || typeKey === 'fast') {
      if (this.sqLeft <= 0) {
        this.sqLeft = 10 + ri(7);
        /* 첫 4개 분대는 상→하→좌→우 순환 — "사방에서 나온다"를 오프닝에 보장 */
        this.sqSide = (this.sqTotal < 4) ? (this.sqTotal % 4) : ri(4);
        this.sqTotal++;
        this.sqPh = rnd(0, 6.2832);
        this.sqN = 0;
        /* ── 게이트 스폰 — 배경의 뚫린 통로에서만 나온다 ──
           ENEMY_SET.gates(이미지 비율) 를 bgMap 으로 논리 좌표에 환산.
           배경이 없으면(폴백) 예전처럼 변 전체에서 랜덤. */
        var m = (typeof Screens !== 'undefined') ? Screens.bgMap : null;
        var G = ENEMY_SET.gates;
        function pickU(list) { var g = list[ri(list.length)]; return rnd(g[0], g[1]); }
        if (this.sqSide === 0) {
          this.sqX = m ? m.x0 + pickU(G.top) * m.w : rnd(70, Stage.W - 70);
          this.sqY = -30;
        } else if (this.sqSide === 1) {
          this.sqX = m ? m.x0 + pickU(G.bottom) * m.w : rnd(70, Stage.W - 70);
          this.sqY = pf0.y + pf0.h + 26;
        } else if (this.sqSide === 2) {
          this.sqX = -26;
          this.sqY = m ? m.y0 + pickU(G.left) * m.h : rnd(pf0.y + 90, pf0.y + pf0.h - 90);
        } else {
          this.sqX = Stage.W + 26;
          this.sqY = m ? m.y0 + pickU(G.right) * m.h : rnd(pf0.y + 90, pf0.y + pf0.h - 90);
        }
        this.sqX = clamp(this.sqX, 40, Stage.W - 40);
        if (this.sqSide >= 2) this.sqY = clamp(this.sqY, pf0.y + 60, pf0.y + pf0.h - 60);
      }
      var i = this.sqN++; this.sqLeft--;
      var cols = 5, cw = 24;
      var col = i % cols, row = (i / cols) | 0;
      var o1 = (col - (cols - 1) / 2) * cw + ((row % 2) ? 8 : 0) + rnd(-4, 4);
      var o2 = row * 24 + rnd(0, 7);
      if (this.sqSide === 0)      { e.x = this.sqX + o1; e.y = this.sqY - o2; }
      else if (this.sqSide === 1) { e.x = this.sqX + o1; e.y = this.sqY + o2; }
      else if (this.sqSide === 2) { e.x = this.sqX - o2; e.y = this.sqY + o1; }
      else                        { e.x = this.sqX + o2; e.y = this.sqY + o1; }
      e.cx = this.sqX; e.cy2 = this.sqY; e.cph = this.sqPh; e.side = this.sqSide;
    } else {                                     /* 탱커·중장갑·엘리트 — 분대 호위 */
      e.x = clamp((this.sqX || Stage.W / 2) + rnd(-70, 70), -26, Stage.W + 26);
      e.y = clamp((this.sqY || -30) + rnd(-30, 30), -44, pf0.y + pf0.h + 40);
      e.side = this.sqSide; e.cx = 0; e.cph = rnd(0, 6.2832);
    }
    e.ent = 0;
    e.def = D; e.max = D.hp * (hpM || 1); e.hp = e.max;
    e.sheet = D.sheet;
    e.k = Anim.has(e.sheet + '_walk')
        ? Anim.fit(e.sheet + '_walk', D.hLogic)
        : fitScale(e.sheet, D.hLogic);
    e.r = D.r;
    /* 개체별 숨구멍 반경 — 덩치에 비례. 개체마다 흔들어서 클리어링 가장자리가
       완벽한 원으로 보이지 않게 한다(원이 보이면 즉시 가짜로 읽힌다).
       보스는 위압감이 우선이라 훨씬 가까이 붙게 둔다. */
    e.rmin = (D.rmin != null) ? D.rmin + rnd(-3, 3)
           : (D.cutin ? 58 : 62 + D.r * 0.9) + rnd(-5, 5);
    e.ph = rnd(0, 6.2832); e.at = rnd(0, 3);      /* 애니 위상 분산 */
    e.hit = 0; e.hitCd = 0; e.spdM = spdM || 1; e.dieT = 0; e.frz = 0;
    Game.spawned++;
    return e;
  },

  nearest: function (x, y, range) {
    var best = null, bd = range * range;
    Game.enemies.each(function (e) {
      if (e.dieT > 0) return;
      var dx = e.x - x, dy = e.y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = e; }
    });
    return best;
  },

  damage: function (e, amt, col, big) {
    if (e.dieT > 0) return;
    e.hp -= amt;
    if (e.hitCd <= 0) { e.hit = 0.07; e.hitCd = 0.20; }
    /* 데미지 숫자는 큰 타격만. 초당 수십 발이라 전부 띄우면 주인공이 숫자에 파묻힌다. */
    if (big || rand() < 0.10)
      FX.num(e.x, e.y - e.def.hLogic * 0.75, (amt | 0) + '',
             col || THEME.dmgNormal, big ? 20 : 12, big);
    FX.hit(e.x, e.y - e.def.hLogic * 0.3, col || '#ffffff');
    if (e.hp <= 0) Enemies.kill(e);
  },

  kill: function (e) {
    if (e.dieT > 0) return;
    e.dieT = 0.20;
    Game.kills += 1;
    /* 볼리 직후 집계창이 열려 있으면 이 처치를 콤보에 담는다 */
    if (Game.player && Game.player.volKillT > 0) Game.player.volKills++;
    var col = ENEMY_SET.cols[e.sheet] || '#9fb4ff';
    var cy = e.y - e.def.hLogic * 0.2;
    var big = !!e.def.hpbar;
    FX.burst(e.x, cy, big ? 22 : 7, col, big ? 340 : 230, big ? 3.4 : 2.5);
    if (big) {
      FX.burst(e.x, cy, 10, '#ffffff', 300, 2);
      FX.ring(e.x, cy, 8, 92, 0.32, '#ffffff', 2.5);
      FX.slashBurst(e.x, cy, 5, col, 120);
      FX.kick(5, 0.14);
      Game.hitstop = Math.max(Game.hitstop, 0.04);
    }
    if (rand() < e.def.drop) FX.coin(e.x, e.y - 10);
  },

  update: function (dt) {
    var self = this, p = Game.player;
    var press = 0;
    Grid.clear();
    Game.enemies.each(function (e) { if (e.dieT <= 0) Grid.insert(e); });

    Game.enemies.each(function (e) {
      if (e.dieT > 0) {
        e.dieT -= dt;
        if (e.dieT <= 0) Game.enemies.kill(e);
        return;
      }
      if (e.frz > 0) { e.frz -= dt; return; }

      e.at += dt;
      var sp = e.def.speed * e.spdM;
      var dx = p.x - e.x, dy = p.y - e.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 1;

      /* 진입 구간은 대형을 유지하며 안쪽으로, 들어오면 추격 → 사방 포위 */
      var pfe = Stage.pf, M = 34;
      if (!e.ent) {
        if (e.x > M && e.x < Stage.W - M && e.y > pfe.y + M && e.y < pfe.y + pfe.h - M) e.ent = 1;
      }
      if (!e.ent) {
        var sway = Math.sin(Game.wt * 1.3 + e.cph) * 16;
        if (e.side === 0)      { e.y += sp * 1.35 * dt; if (e.cx) e.x += (e.cx + sway - e.x) * 0.7 * dt; }
        else if (e.side === 1) { e.y -= sp * 1.35 * dt; if (e.cx) e.x += (e.cx + sway - e.x) * 0.7 * dt; }
        else if (e.side === 2) { e.x += sp * 1.35 * dt; if (e.cy2) e.y += (e.cy2 + sway - e.y) * 0.7 * dt; }
        else                   { e.x -= sp * 1.35 * dt; if (e.cy2) e.y += (e.cy2 + sway - e.y) * 0.7 * dt; }
      } else {
        e.x += dx / d * sp * dt;
        e.y += dy / d * sp * dt;
      }

      /* 분리력 — 몸이 살짝 겹칠 만큼만. 낮추면 뭉쳐서 오히려 빈약해 보인다.
         반경·힘은 몹 크기에 종속 — 몹을 키우면 여기도 같이 키워야 카펫이 유지된다 */
      var near = Grid.query(e.x, e.y, 22, self.qbuf), sx = 0, sy = 0;
      for (var i = 0; i < near.length; i++) {
        var o = near[i]; if (o === e) continue;
        var ox = e.x - o.x, oy = e.y - o.y, od = ox * ox + oy * oy;
        if (od > 0.01 && od < 484) { var kk = 1 - od / 484; sx += ox * kk; sy += oy * kk; }
      }
      e.x += sx * 6.2 * dt; e.y += sy * 6.2 * dt;
      e.x = clamp(e.x, -30, Stage.W + 30);
      if (e.hit > 0) e.hit -= dt;
      if (e.hitCd > 0) e.hitCd -= dt;

      /* ── 주인공 숨구멍 ────────────────────────────────────────────────────
         반드시 이동·분리가 끝난 뒤에 잰다. 프레임 앞쪽의 낡은 좌표로 밀면
         추격·분리가 그 뒤에 다시 밀어넣어 매 프레임 조금씩 새어 들어온다.

         세로를 0.82 로 눌러서 잰다 = 위아래로 더 넓은 타원 구멍이 파인다.
         스프라이트가 세로로 길어서, 같은 거리라도 위아래 몹이 캐릭터를
         훨씬 심하게 덮기 때문. 드로잉이 발밑 y 정렬이라 아래쪽 몹은
         캐릭터 "위에" 그려진다 — 겹침의 진짜 원인이 여기였다. */
      var AY = 0.82;
      dx = p.x - e.x; dy = (p.y - e.y) * AY;
      d = Math.sqrt(dx * dx + dy * dy) || 1;

      /* 1단 — 소프트 필드. 카펫이 구멍 주위로 유기적으로 휘어 들어온다 */
      if (d < 150) {
        /* fast(빨강 돌격체)만 살짝 덜 밀려 포켓을 찌른다 — 위기감용.
           예전엔 0.5 였는데 그 배수로는 캐릭터 위에 올라탔다 — 그건 이 아래
           하드 바닥(rmin)이 아직 없던 시절 얘기. 지금은 rmin:24 가 최소 거리를
           보장하므로 겹쳐 보일 일은 없고, 0.85 로는 접촉(hurt) 사거리까지
           못 들어와 HP가 절대 안 깎였다. 0.55 로 다시 낮춰서 실제로 닿게 한다 */
        var push = (150 - d) / 150 * 240 * (e.def.speed > 120 ? 0.42 : 1);
        e.x -= dx / d * push * dt; e.y -= dy / d * push * dt;
        dx = p.x - e.x; dy = (p.y - e.y) * AY;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
      }

      /* 2단 — 하드 바닥. 힘은 같은 크기의 힘에 지므로 어떤 값을 줘도
         피크 물량에서는 뚫린다. 위치를 직접 잠가야 겹침이 0 이 된다 */
      if (d < e.rmin) {
        var kf = e.rmin / d;
        e.x = p.x - dx * kf;
        e.y = p.y - dy * kf / AY;
      }

      if (d < e.r + p.r + 6) Player.hurt(p, e.def.dmg);
      if (d < 150) press++;
    });

    Game.press = press;
    if (Game.state === 'battle' || Game.state === 'tutorial') {
      FX.vignette = clamp(1 - Game.hp / Game.hpMax, 0, 1) * 0.42;
    }
  },

  zbuf: [],

  /* 발밑 y — 깊이 정렬 기준. 스프라이트 그림자와 같은 지점 */
  gy: function (e) { return e.y + e.def.hLogic * 0.30; },

  /* ── 깊이 정렬 렌더 ──────────────────────────────────────────────────────
     탑다운에서 캐릭터를 몬스터 위 고정 레이어로 그리면, 캐릭터보다 앞(아래)에
     있는 몹까지 등 뒤로 들어가 깊이가 깨진다. 발밑 y 오름차순으로 전부 정렬하고
     캐릭터를 자기 발밑 위치에 끼워 넣는다 — 몹끼리의 겹침도 함께 정리된다. */
  drawAll: function (p) {
    var list = this.zbuf; list.length = 0;
    Game.enemies.each(function (e) { list.push(e); });
    list.sort(function (a, b) { return Enemies.gy(a) - Enemies.gy(b); });
    var pf = p.y + CHARACTER.hLogic * CHARACTER.footY;
    var placed = false;
    for (var i = 0; i < list.length; i++) {
      if (!placed && Enemies.gy(list[i]) > pf) { Player.draw(p); placed = true; }
      Enemies.drawOne(list[i]);
    }
    if (!placed) Player.draw(p);
  },

  drawOne: function (e) {
    var c = Stage.ctx;
    {
      var key = e.sheet + '_walk';
      var anim = Anim.has(key);

      if (e.dieT > 0) {
        var t = 1 - e.dieT / 0.20;
        if (anim) {
          Anim.draw(key, Anim.frameAt(key, e.at, e.def.fps), e.x, e.y, e.k * (1 + t * 0.5), {
            alpha: 1 - t, squash: 1 + t * 0.35, tint: t < 0.55 ? '#ffffff' : null, tintA: 1
          });
        } else {
          drawSprite(e.sheet, e.x, e.y, e.k * (1 + t * 0.5),
            { alpha: 1 - t, squash: 1 + t * 0.35, sil: t < 0.55 ? '#ffffff' : null });
        }
        return;
      }

      /* 발밑 그림자 — 접지감. 슬라임이 떠 보이지 않게 */
      c.globalAlpha = 0.24; c.fillStyle = '#000';
      c.beginPath();
      c.ellipse(e.x, e.y + e.def.hLogic * 0.30, e.def.hLogic * 0.24, e.def.hLogic * 0.085, 0, 0, 6.2832);
      c.fill();
      c.globalAlpha = 1;

      if (anim) {
        Anim.draw(key, Anim.frameAt(key, e.at, e.def.fps), e.x, e.y, e.k, {
          tint: e.hit > 0 ? '#ffffff' : (e.frz > 0 ? '#8be9ff' : null),
          tintA: e.frz > 0 ? 0.55 : 0.7
        });
      } else {
        var bob = Math.sin(Game.wt * 7 + e.ph) * 0.9;
        drawSprite(e.sheet, e.x, e.y + bob, e.k, {
          squash: 1 + Math.sin(Game.wt * 9 + e.ph) * 0.05,
          tint: e.hit > 0 ? '#ffffff' : null, tintA: 0.7
        });
      }

      if (e.def.hpbar && e.hp < e.max) {
        var w = e.def.hLogic * 0.72, hh = 3, x = e.x - w / 2, y = e.y - e.def.hLogic * 0.62;
        c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x - 1, y - 1, w + 2, hh + 2);
        c.fillStyle = THEME.danger; c.fillRect(x, y, w * clamp(e.hp / e.max, 0, 1), hh);
      }
    }
  }
};
