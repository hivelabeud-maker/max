/* ============================================================================
   orb.js — 표적 오브. 표류 · 벽 반사 · 피격 · 분열

   1차(neon_defense)의 enemy.js 를 대체한다. 성격이 완전히 다르다:
     · 적은 주인공에게 몰려왔다. 오브는 주인공에게 관심이 없다 — 그냥 떠다닌다
     · 적은 죽으면 사라졌다. 오브는 죽으면 작은 오브 둘로 쪼개진다
     · 적에게 맞으면 HP 가 깎였다. 오브는 주인공을 때리지 않는다
       (레퍼런스에 HP 게이지가 없다. 실패 조건은 체력이 아니라 목표·시간이다)

   ■ 왜 Grid 를 그대로 쓰나
     탄–오브 충돌은 1차와 같은 공간 해시(core/grid.js)로 푼다. 분열 상한이
     190이라 브루트포스도 돌긴 하지만, 탄이 초당 200발 넘게 날아다니므로
     (200 × 190 = 38,000 검사/프레임) 격자가 없으면 프레임이 무너진다.
   ========================================================================== */
var Orbs = {
  qbuf: [],
  spawnAcc: 0,

  init: function () {
    Game.orbs = new Pool(function () {
      return { on:false, x:0, y:0, vx:0, vy:0, t:4, r:0, hp:0, col:0,
               hit:0, ph:0, dieT:0, born:0 };
    }, ORB_SET.cap);
  },

  reset: function () { Game.orbs.reset(); this.spawnAcc = 0; },

  def: function (tier) { return ORB_SET.tiers[tier - 1]; },

  /* ── 오브가 돌아다닐 수 있는 사각형 ────────────────────────────────────
     Stage.pf 는 화면 바닥까지다. 그대로 쓰면 오브가 CTA·조이스틱 위로
     굴러가서 버튼을 가린다. 아래는 CTA 상단에서 끊는다.
     ※ 매 프레임 호출되므로 계산은 가볍게 유지할 것 */
  field: function () {
    var pf = Stage.pf, bot = HUD.ctaTop() - 6;
    return { x: pf.x + 4, y: pf.y + 6, w: pf.w - 8, h: Math.max(120, bot - pf.y - 6) };
  },

  /* 화면 색 — 티어가 낮을수록(작을수록) 밝다.
     같은 색상환을 쓰되 명도만 바꿔서 "같은 계열의 작은 조각"으로 읽히게 한다 */
  colorOf: function (o) {
    var base = THEME.orbCols[o.col % THEME.orbCols.length];
    return base;
  },

  spawn: function (tier, x, y, vx, vy, col) {
    var d = this.def(tier); if (!d) return null;
    var o = Game.orbs.get();
    var pf = this.field();
    o.t = tier; o.r = d.r; o.hp = d.hp;
    o.col = (col === undefined) ? ri(THEME.orbCols.length) : col;
    o.x = (x === undefined) ? rnd(pf.x + 40, pf.x + pf.w - 40) : x;
    o.y = (y === undefined) ? rnd(pf.y + 40, pf.y + pf.h - 40) : y;
    if (vx === undefined) {
      var a = rnd(0, 6.2832), s = ORB_SET.drift * d.speed;
      o.vx = Math.cos(a) * s; o.vy = Math.sin(a) * s;
    } else { o.vx = vx; o.vy = vy; }
    o.hit = 0; o.dieT = 0; o.ph = rnd(0, 6.2832); o.born = Game.wt;
    return o;
  },

  /* ── 피격 ────────────────────────────────────────────────────────────────
     반환값 true = 이 탄이 소모됐다. 오브는 관통되지 않는다 — 관통시키면
     탄 하나가 화면을 쓸어버려서 조준할 이유가 사라진다 */
  hit: function (o, dmg) {
    if (o.dieT > 0) return false;
    o.hp -= (dmg || 1);
    o.hit = 0.08;
    if (o.hp <= 0) { this.pop(o); return true; }
    /* 안 깨졌을 때도 반응이 있어야 "때리고 있다"가 읽힌다 */
    FX.burst(o.x, o.y, 2, this.colorOf(o), 150, 1.6);
    return true;
  },

  /* ── 터짐 + 분열 ─────────────────────────────────────────────────────── */
  pop: function (o, noSplit) {
    if (o.dieT > 0) return;
    var d = this.def(o.t), col = this.colorOf(o);
    o.dieT = 0.14;

    Game.pops += 1;
    Combo.add();                        /* 콤보 창 갱신 — 배수는 Combo 가 갖는다 */
    Game.score += Math.round(d.score * Combo.mul());

    /* 터짐 이펙트 — 큰 오브일수록 크게. 크기 차이가 리듬을 만든다 */
    var big = o.t >= 3;
    FX.burst(o.x, o.y, big ? 16 : 7, col, big ? 300 : 210, big ? 3.0 : 2.2);
    FX.burst(o.x, o.y, big ? 8 : 3, THEME.boomC, big ? 260 : 180, big ? 2.2 : 1.5);
    FX.ring(o.x, o.y, o.r * 0.5, o.r * (big ? 3.4 : 2.6), big ? 0.26 : 0.18, col, big ? 3 : 2);
    if (big) {
      FX.slashBurst(o.x, o.y, 5, THEME.boomA, o.r * 5);
      FX.kick(o.t >= 4 ? 3.2 : 2.0, 0.07);
    }

    /* 분열 — 부모 속도에 반발을 더해 사방으로 흩어진다.
       부모 속도를 물려주지 않으면 제자리에서 겹쳐 나와 "쪼개졌다"가 안 읽힌다 */
    var n = noSplit ? 0 : d.split;
    if (n > 0 && Game.orbs.count() < ORB_SET.cap - n) {
      var a0 = rnd(0, 6.2832);
      for (var i = 0; i < n; i++) {
        var a = a0 + i * 6.2832 / n + rnd(-0.3, 0.3);
        var s = ORB_SET.burst * rnd(0.72, 1.15);
        this.spawn(o.t - 1,
                   o.x + Math.cos(a) * o.r * 0.5,
                   o.y + Math.sin(a) * o.r * 0.5,
                   o.vx * 0.35 + Math.cos(a) * s,
                   o.vy * 0.35 + Math.sin(a) * s,
                   o.col);
      }
    }
  },

  update: function (dt) {
    var fl = this.field(), self = this;
    Game.orbs.each(function (o) {
      if (o.dieT > 0) { o.dieT -= dt; if (o.dieT <= 0) Game.orbs.kill(o); return; }
      if (o.hit > 0) o.hit -= dt;

      o.x += o.vx * dt; o.y += o.vy * dt;

      /* 벽 반사 — 플레이 영역 안에 가둔다. 밖으로 나가면 표적이 사라져서
         후반에 화면이 텅 빈다 (분열로 늘어난 만큼 벽에 부딪혀 돌아와야 한다) */
      var l = fl.x + o.r, r = fl.x + fl.w - o.r;
      var t = fl.y + o.r, b = fl.y + fl.h - o.r;
      if (o.x < l) { o.x = l; o.vx = Math.abs(o.vx); }
      else if (o.x > r) { o.x = r; o.vx = -Math.abs(o.vx); }
      if (o.y < t) { o.y = t; o.vy = Math.abs(o.vy); }
      else if (o.y > b) { o.y = b; o.vy = -Math.abs(o.vy); }

      /* 분열 직후의 빠른 속도를 서서히 표류 속도로 되돌린다.
         안 하면 후반 화면이 총알처럼 튀어다녀서 조준이 불가능해진다 */
      var want = ORB_SET.drift * self.def(o.t).speed;
      var sp = Math.sqrt(o.vx * o.vx + o.vy * o.vy);
      if (sp > want) {
        var k = Math.max(want, sp - (sp - want) * 2.2 * dt) / sp;
        o.vx *= k; o.vy *= k;
      }
    });
  },

  /* 격자 갱신 — 탄 충돌 검사가 이걸 읽는다 */
  index: function () {
    Grid.clear();
    Game.orbs.each(function (o) { if (o.dieT <= 0) Grid.insert(o); });
  },

  /* ── 그리기 ──────────────────────────────────────────────────────────────
     순검정 배경이라 공은 "빛나는 원"으로 그린다:
       외곽 헤일로(가산) → 본체 → 상단 하이라이트 → 피격 시 흰 플래시
     레퍼런스의 공은 납작한 단색인데, 그건 배경이 완전 검정이라 단색만으로도
     충분히 떠 보이기 때문이다. 우리도 같은 이유로 그라디언트를 최소화한다   */
  drawAll: function () {
    var c = Stage.ctx;
    c.save();
    c.globalCompositeOperation = 'lighter';
    Game.orbs.each(function (o) {
      if (o.dieT > 0) return;
      var col = Orbs.colorOf(o);
      /* 헤일로는 아주 옅게. 처음엔 1.75r · 알파 .16 이었는데 공마다 큰 후광이
         생겨 화면이 뭉개졌다 — 레퍼런스의 공은 후광 없는 납작한 원이다.
         순검정 위에서 가장자리를 살짝 띄우는 정도만 남긴다 */
      c.globalAlpha = 0.10;
      c.fillStyle = col;
      c.beginPath(); c.arc(o.x, o.y, o.r * 1.35, 0, 6.2832); c.fill();
      c.globalAlpha = 1;
    });
    c.restore();

    Game.orbs.each(function (o) {
      if (o.dieT > 0) return;
      var col = Orbs.colorOf(o);
      var bob = Math.sin(Game.wt * 3.1 + o.ph) * (o.r * 0.05);
      c.fillStyle = col;
      c.beginPath(); c.arc(o.x, o.y + bob, o.r, 0, 6.2832); c.fill();
      /* 상단 하이라이트 — 공이 "구"로 읽히게 하는 최소 장치 */
      c.fillStyle = 'rgba(255,255,255,.22)';
      c.beginPath();
      c.arc(o.x - o.r * 0.3, o.y + bob - o.r * 0.34, o.r * 0.34, 0, 6.2832); c.fill();
      /* 남은 피격 수 — 3티어 이상만. 작은 공까지 표시하면 숫자 벽이 된다 */
      if (o.t >= 4 && o.hp < Orbs.def(o.t).hp) {
        c.globalAlpha = 0.85;
        c.fillStyle = '#000';
        c.font = '900 ' + (o.r * 0.9).toFixed(0) + 'px ' + FONT;
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('' + o.hp, o.x, o.y + bob + 1);
        c.globalAlpha = 1;
      }
      if (o.hit > 0) {
        c.globalAlpha = clamp(o.hit / 0.08, 0, 1) * 0.9;
        c.fillStyle = '#ffffff';
        c.beginPath(); c.arc(o.x, o.y + bob, o.r, 0, 6.2832); c.fill();
        c.globalAlpha = 1;
      }
    });
  },

  count: function () { return Game.orbs.count(); }
};
