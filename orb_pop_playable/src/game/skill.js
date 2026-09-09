/* ============================================================================
   skill.js — 이 버전도 스킬 시스템이 없다.
   남은 것은 라운드 클리어의 "일제 폭발" 연출 하나뿐.
   광고 길이가 21.5초라 배울 게 하나라도 늘면 손해다.

   ※ 1차에서는 이 파일 맨 아래에 전역 roundRect 가 있었다(hud·screens 가 의존).
     이 프로젝트에서는 core/stage.js 로 옮겼다 — 원래 그쪽이 자리다.
   ========================================================================== */
var Skills = {
  qbuf: [],
  reset: function () {},
  update: function (dt) {},
  drawWorld: function () {},

  /* 라운드 클리어 — 19.5초 자동 발동. 화면의 오브가 한꺼번에 터진다.
     레퍼런스의 ROUND CLEAR 직전 프레임이 금색으로 가득 차 있어서
     "마지막에 전부 터진다"를 그대로 옮겼다 */
  roundClear: function () {
    var p = Game.player;
    Game.cleared = true;
    FX.bang(THEME.boomA, 0.38); FX.kick(14, 0.6);
    Game.hitstop = Math.max(Game.hitstop, 0.09);
    FX.ring(p.x, p.y, 20, Stage.H, 0.7, THEME.boomC, 9);
    FX.ring(p.x, p.y, 20, Stage.H * 0.7, 0.55, THEME.boomA, 6);
    FX.slashBurst(p.x, p.y, 16, THEME.boomA, Stage.H * 0.6);
    FX.burst(p.x, p.y, 44, THEME.boomA, 620, 4);

    /* 클리어 보너스 — 남은 오브가 많을수록 크다. 레퍼런스의 CLEAR BONUS +3,520 */
    var left = Game.orbs.count();
    Game.clearBonus = 1200 + left * 26;
    Game.score += Game.clearBonus;

    /* 숫자는 최대 10개만. 200개 전부 띄우면 화면이 숫자 벽으로 덮여
       정작 보여줘야 할 "전부 터지는 그림"이 사라진다 */
    var list = [];
    Game.orbs.each(function (o) { if (o.dieT <= 0) list.push(o); });
    var nShow = Math.min(10, list.length), step = Math.max(1, (list.length / nShow) | 0);
    for (var i = 0; i < list.length; i++) {
      if (i % step === 0 && i / step < nShow)
        FX.num(list[i].x, list[i].y, '+' + (99 + ri(400)), THEME.gold, 18);
    }
    FX.vignette = 0;
  }
};
