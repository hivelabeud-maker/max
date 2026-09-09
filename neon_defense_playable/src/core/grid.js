/* grid.js — 공간 해시. 탄 200 × 적 220 을 O(n) 으로 처리한다. */
var Grid = {
  cell: 34, map: null, keys: null,
  init: function () { this.map = {}; this.keys = []; },
  clear: function () {
    for (var i = 0; i < this.keys.length; i++) this.map[this.keys[i]].length = 0;
  },
  _k: function (cx, cy) { return cx * 4096 + cy; },
  insert: function (e) {
    var cx = (e.x / this.cell) | 0, cy = (e.y / this.cell) | 0, k = this._k(cx, cy);
    var b = this.map[k];
    if (!b) { b = this.map[k] = []; this.keys.push(k); }
    b.push(e);
  },
  /* 반경 r 안의 후보를 out 에 담아 돌려준다 (정확 판정은 호출부에서) */
  query: function (x, y, r, out) {
    out.length = 0;
    var c = this.cell;
    var x0 = ((x - r) / c) | 0, x1 = ((x + r) / c) | 0;
    var y0 = ((y - r) / c) | 0, y1 = ((y + r) / c) | 0;
    for (var cx = x0; cx <= x1; cx++) for (var cy = y0; cy <= y1; cy++) {
      var b = this.map[this._k(cx, cy)];
      if (b) for (var i = 0; i < b.length; i++) out.push(b[i]);
    }
    return out;
  }
};
