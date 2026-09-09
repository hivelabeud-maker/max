/* input.js — 조작은 드래그 1종. (사례분석 F2 대응)
   화면 어디서든 드래그하면 그 델타만큼 캐릭터가 움직인다.
   손가락이 캐릭터를 가리지 않고, 학습이 필요 없다. */
var Input = {
  down: false, x: 0, y: 0, dx: 0, dy: 0,
  everTouched: false, idle: 0,
  tap: null,          /* {x,y} — 한 프레임만 살아있음 */
  enabled: true,

  init: function () {
    var cv = Stage.cv, self = this, sx = 0, sy = 0, moved = 0;

    function pos(e) {
      var t = (e.touches && e.touches[0]) ? e.touches[0] : e;
      return Stage.toLocal(t.clientX, t.clientY);
    }
    function down(e) {
      if (!self.enabled) return;
      e.preventDefault();
      var p = pos(e); self.down = true; self.x = p.x; self.y = p.y;
      sx = p.x; sy = p.y; moved = 0;
      self.everTouched = true; self.idle = 0;
    }
    function move(e) {
      if (!self.down || !self.enabled) return;
      e.preventDefault();
      var p = pos(e);
      self.dx += p.x - self.x; self.dy += p.y - self.y;
      moved += Math.abs(p.x - self.x) + Math.abs(p.y - self.y);
      self.x = p.x; self.y = p.y; self.idle = 0;
    }
    function up(e) {
      if (!self.down) return;
      self.down = false;
      if (moved < 12) {
        var t = { x: sx, y: sy };
        self.tap = t;
        /* ★ 여기서 즉시 처리한다. rAF 로 미루면 사용자 제스처 체인이 끊겨
           window.open 이 팝업 차단에 걸린다 (설치 버튼이 안 눌리던 원인). */
        if (typeof handleTap === 'function') { handleTap(t); self.tap = null; }
      }
    }

    if (window.PointerEvent) {
      cv.addEventListener('pointerdown', down, { passive: false });
      cv.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
    } else {
      cv.addEventListener('touchstart', down, { passive: false });
      cv.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('touchend', up);
      cv.addEventListener('mousedown', down);
      cv.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
  },

  /* 프레임 끝에서 호출 — 소비된 델타/탭 비우기 */
  flush: function (dt) { this.dx = 0; this.dy = 0; this.tap = null; this.idle += dt; }
};
