/* ============================================================================
   stick.js — 하단 중앙 조이스틱 (레퍼런스 실측 요소)

   ■ 장식이 아니다
     "눌러도 반응 없는 버튼 = 광고 이탈 요인"이다. 이 조이스틱은 Input 드래그를
     실제로 받아 조준을 돌린다. 손을 안 대면 오토 조준 방향을 노브가 따라가서,
     보는 사람 눈에는 "누군가 조작하고 있다"로 읽힌다.

   ■ CTA 와 히트박스가 겹치면 안 된다
     레이아웃상 CTA 가 조이스틱 바로 위에 온다. engine.js 의 handleTap 이
     CTA 를 먼저 검사하므로, 조이스틱 반경이 CTA 사각형까지 올라오면
     조이스틱을 눌러도 스토어로 나가버린다. geom() 이 두 영역을 분리한다.

   ■ 좌표
     화면 하단 중앙. 지름은 논리 112px 고정 — 화면이 길어져도 조이스틱은
     엄지 크기라 같이 커질 이유가 없다.
   ========================================================================== */
var Stick = {
  R: 56,          /* 도넛 바깥 반지름 */
  KR: 21,         /* 노브 반지름 */
  BOT: 26,        /* 화면 하단 여백 */
  ax: 0, ay: -1,  /* 현재 노브 방향(단위 벡터) */
  mag: 0,         /* 노브가 중심에서 벗어난 정도 0~1 */
  active: false,  /* 지금 손가락이 올라와 있나 */

  geom: function () {
    return { cx: Stage.W / 2, cy: Stage.H - this.BOT - this.R, r: this.R };
  },

  /* 조이스틱 상단 y — CTA 하한이 된다 */
  top: function () { return this.geom().cy - this.R; },

  reset: function () { this.ax = 0; this.ay = -1; this.mag = 0; this.active = false; },

  /* 조준 방향을 넘겨받아 노브를 따라가게 한다(오토플레이용).
     즉시 스냅시키면 기계처럼 보여서 지수수렴으로 부드럽게 따라붙인다 */
  follow: function (aimA, dt) {
    var tx = Math.cos(aimA), ty = Math.sin(aimA);
    var k = 1 - Math.exp(-9 * dt);
    this.ax += (tx - this.ax) * k;
    this.ay += (ty - this.ay) * k;
    var m = Math.sqrt(this.ax * this.ax + this.ay * this.ay) || 1;
    this.ax /= m; this.ay /= m;
    this.mag += (0.82 - this.mag) * k;
  },

  /* 손가락 입력 — 드래그 벡터를 노브 위치로 삼는다.
     "조이스틱 안을 눌러야만 동작"으로 만들면 광고에서 아무도 못 찾는다.
     화면 어디를 끌어도 조준이 돌아가고, 노브는 그 방향을 표시한다 */
  applyDrag: function (dx, dy) {
    var m = Math.sqrt(dx * dx + dy * dy);
    if (m < 0.001) return false;
    this.ax = dx / m; this.ay = dy / m;
    this.mag = clamp(m / 42, 0.25, 1);
    this.active = true;
    return true;
  },

  angle: function () { return Math.atan2(this.ay, this.ax); },

  /* 탭 판정 — engine.js handleTap 이 CTA 보다 먼저 부른다.
     반경을 조금 넉넉히(+10) 잡아 엄지로 눌러도 잡히게 한다 */
  hit: function (x, y) {
    var g = this.geom(), dx = x - g.cx, dy = y - g.cy, r = this.R + 10;
    return dx * dx + dy * dy <= r * r;
  },

  draw: function () {
    var c = Stage.ctx, g = this.geom();
    var kx = g.cx + this.ax * this.R * 0.46 * this.mag;
    var ky = g.cy + this.ay * this.R * 0.46 * this.mag;

    /* 도넛 — 반투명 회색 원. 레퍼런스가 딱 이 형태다 */
    c.fillStyle = THEME.stickRing;
    c.beginPath(); c.arc(g.cx, g.cy, this.R, 0, 6.2832); c.fill();
    c.strokeStyle = THEME.stickEdge; c.lineWidth = 1.5;
    c.beginPath(); c.arc(g.cx, g.cy, this.R - 0.75, 0, 6.2832); c.stroke();

    /* 방향 힌트 — 노브가 향한 쪽에 짧은 호. 조준 방향을 손 밑에서도 알려준다 */
    c.save();
    c.globalAlpha = 0.5 + Combo.heat() * 0.4;
    c.strokeStyle = THEME.goal; c.lineWidth = 3; c.lineCap = 'round';
    var a = this.angle();
    c.beginPath(); c.arc(g.cx, g.cy, this.R - 6, a - 0.42, a + 0.42); c.stroke();
    c.restore();

    /* 노브 — 그림자 한 겹 + 본체. 눌린 느낌은 크기로 준다 */
    c.fillStyle = 'rgba(0,0,0,.55)';
    c.beginPath(); c.arc(kx + 2, ky + 3, this.KR, 0, 6.2832); c.fill();
    c.fillStyle = THEME.stickKnob;
    c.beginPath(); c.arc(kx, ky, this.KR * (this.active ? 0.92 : 1), 0, 6.2832); c.fill();
  }
};
