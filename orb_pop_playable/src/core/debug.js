/* debug.js — ?debug=1 : 판정 영역 / 원점 / 카운터. 교체 검증의 눈. */
var Debug = {
  on: !!Q.debug, fps: 0, _n: 0, _t: 0,
  tick: function (dt) {
    this._n++; this._t += dt;
    if (this._t >= 0.4) { this.fps = Math.round(this._n / this._t); this._n = 0; this._t = 0; }
  },
  draw: function () {
    if (!this.on) return;
    var c = Stage.ctx, p = Game.player;
    c.strokeStyle = '#ff2e4d'; c.lineWidth = 1;
    c.strokeRect(Stage.pf.x, Stage.pf.y, Stage.pf.w, Stage.pf.h);
    Game.orbs.each(function (e) {
      c.beginPath(); c.arc(e.x, e.y - e.def.hLogic * 0.42, e.r, 0, 6.2832); c.stroke();
      c.beginPath(); c.moveTo(e.x - 5, e.y); c.lineTo(e.x + 5, e.y); c.stroke();
    });
    c.strokeStyle = '#8ef0ff';
    c.beginPath(); c.arc(p.x, p.y - CHARACTER.hLogic * 0.4, p.r, 0, 6.2832); c.stroke();
    c.beginPath(); c.moveTo(p.x - 9, p.y); c.lineTo(p.x + 9, p.y); c.moveTo(p.x, p.y - 9); c.lineTo(p.x, p.y + 9); c.stroke();
    if (CHARACTER.muzzle) {
      c.strokeStyle = '#ffd23f';
      c.beginPath(); c.arc(p.x + CHARACTER.muzzle.x, p.y + CHARACTER.muzzle.y, 4, 0, 6.2832); c.stroke();
    }
    var L = [
      'state ' + Game.state + '   t ' + Game.t.toFixed(2) + '/' + TIMELINE.total,
      'fps ' + this.fps + '   orb ' + Game.orbs.count() + '   bullet ' + Game.bullets.count(),
      'pops ' + Game.pops + '   score ' + Game.score + '   combo x' + Combo.n,
      'render ' + RENDER.mode + ' x' + RENDER.scale + '   canvas ' + Stage.cv.width + 'x' + Stage.cv.height,
      'logic ' + Stage.W + 'x' + Stage.H + '   sprite ' + (getSprite(CHARACTER.sheet) || {}).src
    ];
    c.font = '700 12px monospace'; c.textAlign = 'left'; c.textBaseline = 'top';
    c.fillStyle = 'rgba(0,0,0,.66)'; c.fillRect(6, Stage.H - 88, 300, 82);
    c.fillStyle = '#8ef0ff';
    for (var i = 0; i < L.length; i++) c.fillText(L[i], 12, Stage.H - 83 + i * 15);
  }
};
