/* ============================================================================
   bullet.js — 직선 탄. 오브에 맞으면 소멸한다.

   1차(디펜스)와 다른 점 둘:
     ① 관통이 없다. 오브를 관통시키면 탄 하나가 화면을 쓸어버려서
        조준할 이유가 사라진다 — 이 게임은 조준이 전부다
     ② 착탄 스플래시가 없다. 분열이 이미 연쇄를 만들기 때문에 스플래시까지
        얹으면 조준과 무관하게 화면이 저절로 비워진다
   ========================================================================== */
var Bullets = {
  qbuf: [],
  init: function () {
    Game.bullets = new Pool(function () {
      return { on:false, x:0,y:0, vx:0,vy:0, a:0, dmg:0, life:0 };
    }, 420);
  },
  spawn: function (x, y, a, sp, dmg) {
    var b = Game.bullets.get();
    b.x = x; b.y = y; b.a = a; b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;
    b.dmg = dmg; b.life = 1.4;
  },

  update: function (dt) {
    var self = this, fl = Orbs.field();
    Game.bullets.each(function (b) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      /* ★ 경계는 Stage.pf 가 아니라 Orbs.field() 다.
         pf 는 화면 바닥까지라, 그걸 쓰면 탄이 CTA 버튼과 조이스틱 위를 가로질러
         날아간다 (실제 캡처에서 확인). 표적이 못 가는 곳에는 탄도 안 간다 */
      if (b.life <= 0 || b.x < fl.x - 20 || b.x > fl.x + fl.w + 20 ||
          b.y < fl.y - 20 || b.y > fl.y + fl.h + 20) { Game.bullets.kill(b); return; }
      /* 격자 질의 반경은 가장 큰 오브 반지름(29)에 여유를 더한 값이다.
         작게 잡으면 큰 오브의 가장자리를 스쳐도 안 맞는다 */
      var near = Grid.query(b.x, b.y, 40, self.qbuf);
      for (var i = 0; i < near.length; i++) {
        var o = near[i]; if (!o.on || o.dieT > 0) continue;
        var dx = o.x - b.x, dy = o.y - b.y;
        var rr = o.r + 3;
        if (dx * dx + dy * dy < rr * rr) {
          /* 착탄 지점에서 오브 색으로 튄다 — 무엇을 때렸는지가 읽힌다 */
          FX.burst(b.x, b.y, 2, Orbs.colorOf(o), 170, 1.4);
          Orbs.hit(o, b.dmg);
          Game.bullets.kill(b);
          return;
        }
      }
    });
  },

  /* ── 탄 그리기 ───────────────────────────────────────────────────────────
     레퍼런스의 탄은 "작은 흰 점"이다. 1차의 혜성형 마젠타 트레일을 그대로
     쓰면 줄기가 굵은 띠가 되어, 조준을 훑을 때 생기는 점선 궤적이 안 나온다.
     순검정 배경이라 흰 점 하나로도 충분히 읽힌다 — 코어 + 아주 옅은 후광. */
  draw: function () {
    var c = Stage.ctx, B = CHARACTER.attack.bullet;
    c.save();
    c.globalCompositeOperation = 'lighter';
    Game.bullets.each(function (b) {
      c.globalAlpha = 0.20;
      c.fillStyle = B.trail;
      c.beginPath(); c.arc(b.x, b.y, B.w * 1.5, 0, 6.2832); c.fill();
      c.globalAlpha = 1;
      c.fillStyle = B.color;
      c.beginPath(); c.arc(b.x, b.y, B.w * 0.52, 0, 6.2832); c.fill();
    });
    c.restore();
  }
};
