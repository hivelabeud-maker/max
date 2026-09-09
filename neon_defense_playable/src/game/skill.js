/* ============================================================================
   skill.js — 이번 버전은 스킬 시스템이 없다.
   선택 카드 · 필드 버프 버블 · 파워업 전부 제거했다. 남은 것은 피날레의
   "섬멸" 연출 하나뿐. 광고 길이가 24초라 배울 게 하나라도 늘면 손해다.
   ========================================================================== */
var Skills = {
  qbuf: [],

  reset: function () {},
  update: function (dt) {},
  drawWorld: function () {},

  /* 광역 폭발 — 피날레 파동에서 쓴다 */
  boom: function (x, y, r, dmg, col) {
    FX.ring(x, y, 8, r, 0.34, col, 5);
    FX.burst(x, y, 14, col, 300, 3.5);
    FX.kick(5, 0.14);
    var near = Grid.query(x, y, r, this.qbuf);
    for (var i = 0; i < near.length; i++) {
      var e = near[i]; if (!e.on || e.dieT > 0) continue;
      var dx = e.x - x, dy = e.y - y;
      if (dx * dx + dy * dy < r * r) Enemies.damage(e, dmg, col, true, 'ultimate');
    }
  },

  /* 섬멸 — 19.5초 자동 발동. 화면 전체 소멸 */
  ultimate: function () {
    var p = Game.player;
    FX.bang('#ffffff', 0.42); FX.kick(16, 0.7);
    Game.hitstop = Math.max(Game.hitstop, 0.10);
    FX.ring(p.x, p.y, 20, Stage.H, 0.75, '#ffffff', 10);
    FX.ring(p.x, p.y, 20, Stage.H * 0.7, 0.55, THEME.gold, 6);
    FX.ring(p.x, p.y, 12, Stage.H * 0.45, 0.42, '#ffe9a8', 4);
    FX.slashBurst(p.x, p.y, 14, '#ffffff', Stage.H * 0.62);
    FX.slashBurst(p.x, p.y, 9, THEME.gold, Stage.H * 0.4);
    FX.burst(p.x, p.y, 40, THEME.gold, 620, 4);
    var list = [];
    Game.enemies.each(function (e) { if (e.dieT <= 0) list.push(e); });
    /* 숫자는 최대 10개만. 500마리 전부 띄우면 화면이 숫자 벽으로 덮여
       정작 보여줘야 할 "전멸하는 그림"이 사라진다. */
    var nShow = Math.min(10, list.length), step = Math.max(1, (list.length / nShow) | 0);
    for (var i = 0; i < list.length; i++) {
      var e = list[i];
      if (i % step === 0 && i / step < nShow)
        FX.num(e.x, e.y - e.def.hLogic * 0.5, '' + (999 + ri(9000)), THEME.gold, 20);
      /* 잔여 체력을 섬멸 행에 더한다 — kill() 은 피해를 거치지 않고 즉사시키므로
         여기서 넣지 않으면 화면을 통째로 비운 기술의 피해가 0으로 남는다.
         500마리 잔여체력이 한 번에 들어와 15.7k 같은 수치가 자연스럽게 나온다 */
      Damage.add('ultimate', e.hp);
      Enemies.kill(e);
    }
    /* HP 는 회복시키지 않는다 — 여기서 만렙으로 되돌리면 마지막 2초에 게이지가
       갑자기 꽉 차서, 그때까지 깎여온 연출이 통째로 없던 일이 된다 */
    /* 레퍼런스는 섬멸 직후 화면 한가운데 CLEAR 가 크게 뜨고,
       그 상태로 잠깐 머물다 결과 패널로 넘어간다. 그 첫 박자를 여기서 연다 */
    Game.clearT = 0;
    FX.vignette = 0;
  }
};

function roundRect(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}
