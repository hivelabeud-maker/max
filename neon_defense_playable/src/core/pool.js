/* pool.js — 엔티티 풀. 전투 중 GC 를 0 으로 유지한다. */
function Pool(factory, cap) {
  this.list = []; this.free = []; this.cap = cap || 512; this.factory = factory;
}
Pool.prototype.get = function () {
  var o;
  if (this.free.length) { o = this.free.pop(); }
  else {
    if (this.list.length >= this.cap) {          /* 상한 도달 — 가장 오래된 것 회수 */
      o = this.list.shift(); this.list.push(o); o.on = true; return o;
    }
    o = this.factory(); this.list.push(o);
  }
  o.on = true; return o;
};
Pool.prototype.kill = function (o) { if (o.on) { o.on = false; this.free.push(o); } };
Pool.prototype.each = function (fn) {
  for (var i = 0; i < this.list.length; i++) { var o = this.list[i]; if (o.on) fn(o, i); }
};
Pool.prototype.count = function () { var n = 0; for (var i = 0; i < this.list.length; i++) if (this.list[i].on) n++; return n; };
Pool.prototype.reset = function () {
  this.free.length = 0;
  for (var i = 0; i < this.list.length; i++) { this.list[i].on = false; this.free.push(this.list[i]); }
};
