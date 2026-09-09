/* bullet.js — 직선 탄 + 관통 + 착탄 스플래시
   플레이어블 광고에서 사격의 역할은 "군집을 파내는 것"이다.
   단일 타격만으로는 스폰 속도를 못 따라가 캐릭터 주변에 몹이 겹겹이 쌓인다.
   착탄 지점 소범위 스플래시가 매 발마다 작은 포켓을 만들어
   "쏘면 그 주위가 비는" 그림을 보장한다. */
var Bullets = {
  qbuf: [], sbuf: [],
  init: function () {
    Game.bullets = new Pool(function () {
      return { on:false, x:0,y:0, vx:0,vy:0, a:0, dmg:0, pierce:0, life:0, big:0, hitIds:null };
    }, 320);
  },
  /* big=1 은 360° 볼리 탄 — 더 굵고 밝게 그려 "사방으로 뿜었다"가 읽히게 한다 */
  spawn: function (x, y, a, sp, dmg, pierce, big) {
    var b = Game.bullets.get();
    b.x = x; b.y = y; b.a = a; b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
    b.dmg = dmg; b.pierce = pierce || 0; b.life = 1.2; b.big = big ? 1 : 0;
    b.hitIds = b.hitIds || []; b.hitIds.length = 0;
  },

  /* 착탄 스플래시 — 주변 몹에 70% 피해 + 파열 링 */
  splash: function (x, y, dmg) {
    var S = CHARACTER.attack.splash;
    /* 링·파편은 확률 샘플링 — 초당 수십 번 터지므로 전부 그리면 낙서가 된다.
       대신 12% 는 "파열"로 크게 터뜨린다. 전부 같은 크기로 터지면 리듬이
       평평해서 아무리 많이 터져도 밋밋하게 읽힌다 */
    if (rand() < 0.12) {
      FX.ring(x, y, 4, S.r * 1.4, 0.18, 'rgba(255,190,245,.85)', 2.5);
      FX.ring(x, y, 2.5, S.r * 0.85, 0.13, 'rgba(255,255,255,.9)', 1.6);
      FX.slashBurst(x, y, 2, 'rgba(255,150,235,.9)', S.r * 1.5);
      FX.burst(x, y, 4, '#ffffff', 220, 1.8);
    } else if (rand() < 0.30) {
      FX.ring(x, y, 3, S.r * 0.7, 0.13, 'rgba(255,140,230,.7)', 1.5);
    }
    FX.burst(x, y, 2, '#ffffff', 170, 1.4);
    if (rand() < 0.55) FX.burst(x, y, 1, '#ff8ae0', 140, 1.7);
    var near = Grid.query(x, y, S.r, this.sbuf);
    for (var i = 0; i < near.length; i++) {
      var e = near[i]; if (!e.on || e.dieT > 0) continue;
      var dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < S.r * S.r)
        Enemies.damage(e, dmg * S.mul, THEME.dmgNormal, false);
    }
  },

  update: function (dt) {
    var self = this, pf = Stage.pf;
    Game.bullets.each(function (b) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < pf.x - 60 || b.x > pf.x + pf.w + 60 ||
          b.y < pf.y - 80 || b.y > pf.y + pf.h + 60) { Game.bullets.kill(b); return; }
      var near = Grid.query(b.x, b.y, 34, self.qbuf);
      for (var i = 0; i < near.length; i++) {
        var e = near[i]; if (e.dieT > 0 || !e.on) continue;
        if (b.hitIds.indexOf(e) >= 0) continue;
        var dx = e.x - b.x, dy = (e.y - e.def.hLogic * 0.42) - b.y;
        if (dx * dx + dy * dy < (e.r + 8) * (e.r + 8)) {
          /* 크리티컬 — 11% 확률로 2.4배. 금색 큰 숫자가 튀어올라
             똑같은 탄막에 강약이 생긴다 */
          var crit = rand() < 0.08;
          Enemies.damage(e, b.dmg * (crit ? 2.4 : 1),
                         crit ? THEME.dmgCrit : THEME.dmgNormal, crit);
          if (crit) { FX.ring(e.x, e.y - e.def.hLogic * 0.3, 3, 30, 0.18, THEME.dmgCrit, 2.5); }
          Bullets.splash(e.x, e.y - e.def.hLogic * 0.3, b.dmg);
          if (b.pierce > 0) { b.pierce--; b.hitIds.push(e); }
          else { Game.bullets.kill(b); return; }
        }
      }
    });
  },

  /* 트레이서 — 가산 블렌딩 발광 줄기. 몹 카펫 위에서도 탄 궤적이 읽힌다 */
  draw: function () {
    var c = Stage.ctx, B = CHARACTER.attack.bullet;
    c.save();
    c.globalCompositeOperation = 'lighter';
    Game.bullets.each(function (b) {
      /* 볼리 탄은 1.5배 — 사방으로 뿜는 순간에만 굵어져서 리듬이 생긴다 */
      var s = b.big ? 1.5 : 1, w = B.w * s, h = B.h * s;
      c.save(); c.translate(b.x, b.y); c.rotate(b.a + Math.PI / 2);
      /* 꼬리 글로우 — 혜성형 삼각 트레일 (몸통에서 뾰족하게 좁아진다).
         ★ 예전엔 폭 w*2 짜리 "사각형"이었다. 부채꼴 5발·방사 10발이 동시에
           나가면 옆 탄 트레일과 겹쳐 붙어서 하나의 판(면)처럼 보였다.
           끝을 좁혀 각 탄이 개별 줄기로 갈라지게 한다. */
      var tailLen = h * 2.1;
      var g = c.createLinearGradient(0, 0, 0, tailLen);
      g.addColorStop(0, 'rgba(255,95,214,.9)');
      g.addColorStop(0.45, 'rgba(255,120,225,.30)');
      g.addColorStop(1, 'rgba(255,95,214,0)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(-w * 0.62, 0); c.lineTo(w * 0.62, 0);
      c.lineTo(w * 0.10, tailLen); c.lineTo(-w * 0.10, tailLen);
      c.closePath(); c.fill();
      /* 헤드 벌브 — 밝은 코어가 앞장선다 */
      var hg = c.createRadialGradient(0, -h * 0.4, 1, 0, -h * 0.4, w * 1.5);
      hg.addColorStop(0, 'rgba(255,255,255,1)');
      hg.addColorStop(0.42, 'rgba(255,205,245,.8)');
      hg.addColorStop(1, 'rgba(255,120,220,0)');
      c.fillStyle = hg;
      c.beginPath(); c.arc(0, -h * 0.4, w * 1.5, 0, 6.2832); c.fill();
      c.fillStyle = B.color;
      c.fillRect(-w / 2, -h / 2, w, h * 0.8);
      /* 흰 코어 — 카펫 위에서도 탄이 끊기지 않고 읽힌다 */
      c.fillStyle = 'rgba(255,255,255,.92)';
      c.fillRect(-w * 0.22, -h * 0.42, w * 0.44, h * 0.6);
      c.restore();
    });
    c.restore();
  }
};
