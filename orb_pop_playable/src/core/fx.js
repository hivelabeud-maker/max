/* fx.js — 데미지 숫자 / 히트 / 파티클 / 코인 / 셰이크 / 플래시 */
var FX = {
  nums: null, parts: null, coins: null, rings: null, slashes: null, confs: null,
  shake: 0, shakeMag: 0, flash: 0, flashCol: '#ffffff',
  vignette: 0,

  /* ⚠️ 풀 상한 — 2차에서 부채꼴 3→5발, 볼리 6→12발이 되면서 초당 파티클
     생성량이 2~3배가 됐다. 1차 상한 그대로 두면 Pool 이 가장 오래된 입자를
     회수해 파편이 수명을 못 채우고 뚝뚝 끊긴다 (2026-09-09 상향) */
  init: function () {
    this.nums  = new Pool(function () { return { x:0,y:0,vx:0,vy:0,t:0,life:0,txt:'',col:'#fff',sz:20,pop:0,on:false }; }, 150);
    this.parts = new Pool(function () { return { x:0,y:0,vx:0,vy:0,t:0,life:0,col:'#fff',sz:3,g:0,on:false }; }, 620);
    this.coins = new Pool(function () { return { x:0,y:0,vx:0,vy:0,t:0,life:0,ph:0,on:false }; }, 120);
    this.rings = new Pool(function () { return { x:0,y:0,r0:0,r1:0,t:0,life:0,col:'#fff',lw:3,on:false }; }, 90);
    this.slashes = new Pool(function () { return { x:0,y:0,a:0,r0:0,r1:0,t:0,life:0,col:'#fff',w:0,on:false }; }, 70);
    this.confs = new Pool(function () { return { x:0,y:0,vx:0,vy:0,rot:0,vr:0,t:0,life:0,col:'#fff',w:0,h:0,on:false }; }, 160);
  },
  reset: function () { this.nums.reset(); this.parts.reset(); this.coins.reset(); this.rings.reset();
    this.slashes.reset(); this.confs.reset();
    this.shake = 0; this.flash = 0; this.vignette = 0; },

  /* pop 0 = 일반 피해 · 1 = 크리티컬(더 크게 튀어오르고 옆으로 흩어진다)
     · 2 = 콤보 펀치(오버슈트 스케일). 숫자가 "터지는" 모션이 있어야
     같은 피해량이어도 타격이 세 보인다 — 광고에서 제일 싸게 먹히는 연출 */
  num: function (x, y, txt, col, sz, crit) {
    var o = this.nums.get();
    o.x = x + rnd(-8, 8); o.y = y;
    o.vx = crit ? rnd(-52, 52) : rnd(-16, 16);
    o.vy = crit ? rnd(-158, -124) : rnd(-96, -68);
    o.t = 0; o.life = crit ? 0.78 : 0.62;
    o.txt = txt; o.col = col || '#ffffff'; o.sz = sz || 21; o.pop = crit ? 1 : 0;
  },

  /* 콤보 펀치 — 볼리 한 방에 쓸어담은 마리수를 화면 한가운데 크게 꽂는다 */
  punch: function (x, y, txt, col, sz) {
    var o = this.nums.get();
    o.x = x; o.y = y; o.vx = 0; o.vy = -30; o.t = 0; o.life = 0.92;
    o.txt = txt; o.col = col || THEME.gold; o.sz = sz || 44; o.pop = 2;
  },
  burst: function (x, y, n, col, spd, sz) {
    for (var i = 0; i < n; i++) {
      var o = this.parts.get(), a = rnd(0, 6.2832), s = rnd(spd * 0.35, spd);
      o.x = x; o.y = y; o.vx = Math.cos(a) * s; o.vy = Math.sin(a) * s - 40;
      o.t = 0; o.life = rnd(0.26, 0.52); o.col = col; o.sz = sz || 3; o.g = 320;
    }
  },
  coin: function (x, y) {
    var o = this.coins.get();
    o.x = x; o.y = y; o.vx = rnd(-70, 70); o.vy = rnd(-210, -140); o.t = 0; o.life = 1.15; o.ph = rnd(0, 6.28);
  },
  ring: function (x, y, r0, r1, life, col, lw) {
    var o = this.rings.get();
    o.x = x; o.y = y; o.r0 = r0; o.r1 = r1; o.t = 0; o.life = life; o.col = col; o.lw = lw || 3;
  },
  hit: function (x, y, col) { this.burst(x, y, 4, col || '#ffffff', 200, 2); },

  /* 방사형 슬래시 — 궁극기·보스 처치의 "베어냈다" 연출 */
  slashBurst: function (x, y, n, col, r1) {
    for (var i = 0; i < n; i++) {
      var o = this.slashes.get();
      o.x = x; o.y = y; o.a = (i / n) * 6.2832 + rnd(-0.2, 0.2);
      o.r0 = rnd(8, 30); o.r1 = (r1 || 300) * rnd(0.75, 1.15);
      o.t = 0; o.life = rnd(0.24, 0.4); o.col = col || '#ffffff'; o.w = rnd(5, 11);
    }
  },

  CONF_COLS: ['#ffd23f', '#ff5c8a', '#8ef0ff', '#3ddc84', '#b45cff', '#ffffff'],

  /* 컨페티 비 — 위에서 하늘하늘 */
  confetti: function (n) {
    for (var i = 0; i < n; i++) {
      var o = this.confs.get();
      o.x = rnd(0, Stage.W); o.y = rnd(-Stage.H * 0.25, -10);
      o.vx = rnd(-40, 40); o.vy = rnd(120, 260); o.g = 0;
      o.rot = rnd(0, 6.28); o.vr = rnd(-7, 7);
      o.t = 0; o.life = rnd(1.8, 3.0);
      o.col = this.CONF_COLS[ri(this.CONF_COLS.length)]; o.w = rnd(6, 11); o.h = rnd(4, 7);
    }
  },

  /* 컨페티 캐논 — 구석에서 위로 쏘아올려 포물선으로 떨어진다 */
  confettiCannon: function (x, y, n, dir) {
    for (var i = 0; i < n; i++) {
      var o = this.confs.get();
      var a = -1.5708 + dir * rnd(0.12, 0.62);          /* 위쪽 + 안쪽으로 */
      var sp = rnd(420, 760);
      o.x = x + rnd(-8, 8); o.y = y;
      o.vx = Math.cos(a) * sp; o.vy = Math.sin(a) * sp; o.g = 620;
      o.rot = rnd(0, 6.28); o.vr = rnd(-10, 10);
      o.t = 0; o.life = rnd(1.5, 2.4);
      o.col = this.CONF_COLS[ri(this.CONF_COLS.length)]; o.w = rnd(6, 12); o.h = rnd(4, 8);
    }
  },
  kick: function (mag, dur) { this.shakeMag = Math.max(this.shakeMag, mag); this.shake = Math.max(this.shake, dur); },
  bang: function (col, dur) { this.flashCol = col || '#ffffff'; this.flash = Math.max(this.flash, dur || 0.22); },

  update: function (dt) {
    var self = this;
    this.nums.each(function (o) {
      o.t += dt; o.x += o.vx * dt; o.y += o.vy * dt;
      o.vx *= (1 - 3.2 * dt); o.vy += (o.pop === 2 ? 46 : 150) * dt;
      if (o.t >= o.life) self.nums.kill(o);
    });
    this.parts.each(function (o) {
      o.t += dt; o.x += o.vx * dt; o.y += o.vy * dt; o.vy += o.g * dt; o.vx *= (1 - 2.4 * dt);
      if (o.t >= o.life) self.parts.kill(o);
    });
    this.coins.each(function (o) {
      o.t += dt;
      if (o.t < 0.42) { o.x += o.vx * dt; o.y += o.vy * dt; o.vy += 720 * dt; }
      else {                                   /* HUD 코인칩으로 빨려감 */
        var k = eIn(clamp((o.t - 0.42) / (o.life - 0.42), 0, 1));
        o.x = lerp(o.x, 78, k * 0.5); o.y = lerp(o.y, 66, k * 0.5);
      }
      if (o.t >= o.life) { self.coins.kill(o); Game.coins++; }
    });
    this.rings.each(function (o) { o.t += dt; if (o.t >= o.life) self.rings.kill(o); });
    this.slashes.each(function (o) { o.t += dt; if (o.t >= o.life) self.slashes.kill(o); });
    this.confs.each(function (o) {
      o.t += dt; o.x += o.vx * dt; o.y += o.vy * dt; o.rot += o.vr * dt;
      if (o.g) { o.vy += o.g * dt; o.vx *= (1 - 0.9 * dt); }        /* 캐논 — 포물선 */
      o.vx += Math.sin(o.t * 6 + o.rot) * 30 * dt;
      if (o.t >= o.life || o.y > Stage.H + 20) self.confs.kill(o);
    });
    if (this.shake > 0) { this.shake -= dt; if (this.shake <= 0) this.shakeMag = 0; }
    if (this.flash > 0) this.flash -= dt;
  },

  applyShake: function () {
    if (this.shake > 0) {
      var m = this.shakeMag * (this.shake > 0.001 ? 1 : 0);
      Stage.ctx.translate(rnd(-m, m), rnd(-m, m));
    }
  },

  drawWorld: function () {
    var c = Stage.ctx;
    /* ── 가산 블렌딩 ────────────────────────────────────────────────────────
       슬래시·링·파편은 전부 "빛"이다. 1차는 일반 블렌딩이라 던전 배경 위에서
       물감처럼 얹혔는데, 우주 배경에서는 그게 탁한 얼룩으로 보인다.
       탄(bullet.js draw)은 이미 lighter 를 쓰고 있어 이펙트만 재질이 달랐다.
       겹칠수록 밝아지는 게 네온의 기본 성질이라 여기서 맞춘다.
       ※ 코인은 스프라이트라 제외한다 — lighter 를 걸면 형태가 날아간다 */
    c.save();
    c.globalCompositeOperation = 'lighter';
    this.slashes.each(function (o) {
      var k = o.t / o.life;
      var r = lerp(o.r0, o.r1, eOut(k));
      var tail = lerp(o.r0, o.r1, eOut(Math.max(0, k - 0.28)));
      c.globalAlpha = (1 - k) * 0.95;
      c.strokeStyle = o.col; c.lineCap = 'round';
      c.lineWidth = o.w * (1 - k * 0.6);
      c.beginPath();
      c.moveTo(o.x + Math.cos(o.a) * tail, o.y + Math.sin(o.a) * tail * 0.86);
      c.lineTo(o.x + Math.cos(o.a) * r,    o.y + Math.sin(o.a) * r * 0.86);
      c.stroke(); c.globalAlpha = 1;
    });
    this.rings.each(function (o) {
      var k = o.t / o.life, r = lerp(o.r0, o.r1, eOut(k));
      c.globalAlpha = 1 - k; c.strokeStyle = o.col; c.lineWidth = o.lw;
      c.beginPath(); c.arc(o.x, o.y, r, 0, 6.2832); c.stroke(); c.globalAlpha = 1;
    });
    this.parts.each(function (o) {
      c.globalAlpha = 1 - o.t / o.life; c.fillStyle = o.col;
      c.fillRect(o.x - o.sz / 2, o.y - o.sz / 2, o.sz, o.sz); c.globalAlpha = 1;
    });
    c.restore();
    this.coins.each(function (o) {
      var sq = 1 + Math.sin(o.t * 16 + o.ph) * 0.28;
      drawSprite('coin', o.x, o.y, 2, { squash: sq > 0.2 ? sq : 0.2 });
    });
  },

  drawUI: function () {
    var c = Stage.ctx;
    this.nums.each(function (o) {
      var k = o.t / o.life;
      c.globalAlpha = k < 0.7 ? 1 : (1 - (k - 0.7) / 0.3);
      var sz;
      if (o.pop === 2) {
        /* 오버슈트 — 0.13초에 1.18배까지 갔다가 1.0 으로 안착 */
        var e2 = eOut(clamp(o.t / 0.13, 0, 1));
        sz = o.sz * (0.34 + e2 * 0.84) * (1 + Math.max(0, 1 - o.t / 0.32) * 0.16);
      } else {
        sz = o.sz * (1 + (1 - eOut(clamp(o.t / (o.pop ? 0.14 : 0.12), 0, 1))) * (o.pop ? 1.15 : 0.6));
      }
      c.font = '900 ' + sz.toFixed(1) + 'px ' + FONT;
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.lineJoin = 'round'; c.lineWidth = sz * 0.28; c.strokeStyle = 'rgba(8,4,20,.85)';
      c.strokeText(o.txt, o.x, o.y);
      /* 콤보 펀치만 금색 발광 한 겹 — 일반 숫자는 플랫 유지(가독) */
      if (o.pop === 2) { c.shadowColor = o.col; c.shadowBlur = sz * 0.5; }
      c.fillStyle = o.col; c.fillText(o.txt, o.x, o.y);
      c.shadowBlur = 0;
      c.globalAlpha = 1;
    });
    this.confs.each(function (o) {
      c.save(); c.translate(o.x, o.y); c.rotate(o.rot);
      c.globalAlpha = o.t > o.life - 0.4 ? (o.life - o.t) / 0.4 : 1;
      c.fillStyle = o.col; c.fillRect(-o.w / 2, -o.h / 2, o.w, o.h * (0.4 + Math.abs(Math.sin(o.t * 9)) * 0.6));
      c.restore(); c.globalAlpha = 1;
    });
    if (this.flash > 0) {
      c.globalAlpha = clamp(this.flash / 0.22, 0, 1) * 0.9;
      c.fillStyle = this.flashCol; c.fillRect(-20, -20, Stage.W + 40, Stage.H + 40);
      c.globalAlpha = 1;
    }
  },

  /* 위기 비네트 — 전장(상단 ~ 방어선)에만 깔린다. 하단 UI 존은 침범하지 않음 */
  /* 위기 비네트 — 플레이 영역 전체에 부드럽게.
     예전엔 방어선(lineY) 기준 사각형으로 클립해서 화면 중간에
     하드 엣지("검정 화면")가 생겼다. 클립 제거하고 반경만으로 감쇠시킨다. */
  drawVignette: function () {
    if (this.vignette <= 0) return;
    var c = Stage.ctx;
    var top = 76, bot = Stage.H;
    var cy = (top + bot) / 2, rh = (bot - top) / 2;
    var g = c.createRadialGradient(Stage.W / 2, cy, rh * 0.30, Stage.W / 2, cy, rh * 1.08);
    g.addColorStop(0, 'rgba(255,40,60,0)');
    g.addColorStop(0.55, 'rgba(255,40,60,' + (this.vignette * 0.07).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(255,40,60,' + (this.vignette * 0.26).toFixed(3) + ')');
    c.fillStyle = g; c.fillRect(0, top, Stage.W, bot - top);
  }
};
