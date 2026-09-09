/* ============================================================================
   engine.js — 부트 / 루프 / 입력 라우팅
   ========================================================================== */
function onStageResize() {
  if (Game.player) Player.layout(Game.player);
}

function restart() {
  seed(20260901);
  Game.state = 'boot'; Game.t = 0; Game.wt = 0; Game.timeScale = 1;
  Game.score = 0; Game.scoreShown = 0; Game.pops = 0;
  Game.cleared = false; Game.clearBonus = 0;
  Game.kills = 0; Game.coins = 0; Game.killShown = 0;
  Game.hp = Game.hpMax = Game.hpGhost = CHARACTER.hp; Game.hpHit = 0;
  Game.hpU = Game.hpMax / 100; Game.hpRegenLock = 0;
  Game.press = 0; Game.lineHit = 0;
  Game.banner = { txt: '', t: 0, big: false }; Game.hint = { on: false, t: 0 };
  Game.cutin = 0; Game.danger = 0; Game.spawned = 0; Game.ended = false; Game.hitstop = 0;
  Orbs.reset(); Game.bullets.reset();
  FX.reset(); Skills.reset(); Combo.reset(); Stick.reset();
  Director.reset();
  Game.player = Player.make(); Player.layout(Game.player);
  Input.everTouched = false; Input.idle = 0; Input.enabled = true;
  CTA.fired = false;
}

/* ?t=20 → 해당 시각까지 즉시 시뮬레이션 (연출 확인·캡처용) */
function fastForward(sec) {
  var d = 1 / 60, guard = 0;
  while (Game.t < sec && guard++ < 60 * 120) {
    Director.update(d);
    var w = d * Game.timeScale; Game.wt += w;
    if (Game.state === 'tutorial' || Game.state === 'battle' ||
        Game.state === 'ultimate') {
      Combo.update(d);
      Player.update(Game.player, w); Orbs.update(w); Orbs.index(); Bullets.update(w);
    }
    FX.update(w); Input.flush(d);
  }
  /* 점프 직후 표시값이 0 부터 따라 올라가면 캡처 화면에 엉뚱한 수가 찍힌다 */
  Game.kills = Game.pops; Game.killShown = Game.pops; Game.scoreShown = Game.score;
}

function handleTap(p) {
  if (Game.state === 'result') {
    if (Screens.hit(Screens.resReplay, p.x, p.y)) { restart(); return; }
    if (Screens.hit(Screens.resInstall, p.x, p.y)) { CTA.fire(); return; }
    if (Director.resT > 1.0) CTA.fire();          /* 최종 화면 — 아무 곳 탭 = 설치 */
    return;
  }
  /* ★ 조이스틱을 CTA 보다 먼저 검사한다.
     CTA 가 조이스틱 바로 위에 있어서, 히트박스 여유(±8)가 겹치면
     조이스틱을 눌러도 스토어로 나가버린다. 조작이 먼저다 */
  if (Stick.hit(p.x, p.y)) return;
  if (HUD.hitCTA(p.x, p.y)) { CTA.fire(); return; }
}

var _last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  if (!_last) _last = now;
  var dt = RENDER.fixedStep ? (1 / 60) : Math.min((now - _last) / 1000, 1 / 30);
  _last = now;
  if (dt <= 0) dt = 1 / 60;

  Debug.tick(dt);
  if (Input.tap) handleTap(Input.tap);

  Director.update(dt);
  var wdt = dt * Game.timeScale;
  if (Game.hitstop > 0) { Game.hitstop -= dt; wdt *= 0.12; }   /* 히트스톱 — 큰 처치의 손맛 */
  Game.wt += wdt;

  var live = (Game.state === 'tutorial' || Game.state === 'battle' ||
              Game.state === 'ultimate');
  if (live) {
    Combo.update(dt);
    /* 점수 표시값 — 실제 score 를 부드럽게 따라간다.
       오브 분열 연쇄로 한 프레임에 수십 점이 들어오면 원본 값은 계단처럼 튄다.
       그대로 그리면 "느린 박자로 덜컥덜컥 올라간다"로 보인다 — 1차에서 실제로
       받은 지적이고 원인은 스무딩 부재였다. 남은 차이에 비례해 따라가되
       최소 속도를 둬서 작은 차이도 한 박자 안에 메운다 */
    var sGap = Game.score - Game.scoreShown;
    if (sGap > 0) Game.scoreShown = Math.min(Game.score, Game.scoreShown + Math.max(sGap * 6.5, 140) * dt);
    else Game.scoreShown = Game.score;
    Game.kills = Game.pops;                       /* 결과 화면 호환 */
    var kGap = Game.kills - Game.killShown;
    if (kGap > 0) Game.killShown = Math.min(Game.kills, Game.killShown + Math.max(kGap * 7.5, 30) * dt);
    else Game.killShown = Game.kills;
    Player.update(Game.player, wdt);
    Orbs.update(wdt);
    Orbs.index();               /* 격자 갱신 — 탄 충돌이 이걸 읽는다 */
    Bullets.update(wdt);
  }
  FX.update(wdt);

  /* ── 렌더 ── */
  Stage.begin('#000000');   /* 순검정 — 레퍼런스 배경과 같아서 레터박스 이음매가 안 보인다 */
  var c = Stage.ctx;
  c.save(); FX.applyShake();

  Screens.drawBG(wdt);
  /* 월드는 화면 전체를 쓴다. 예전처럼 y=76 에서 자르면 그 선에서 몹이 뚝 끊겨
     보이고, 그걸 가리려고 상단에 딤을 깔면 "검정 띠"가 된다. HUD 글자는
     자체 외곽선으로 읽히므로 몹이 뒤로 지나가도 문제없다. */
  c.save();
  if (live) {   /* result 는 곧바로 배경으로 덮이므로 월드를 그릴 필요가 없다 */
    Orbs.drawAll();                 /* 표적이 먼저 — 탄과 캐릭터가 그 위에 온다 */
    Player.draw(Game.player);
    Bullets.draw();
    FX.drawWorld();
    FX.drawVignette();
  }
  c.restore();
  c.restore();

  if (Game.state !== 'result') {
    HUD.draw();
    FX.drawUI();
    HUD.drawDominate();
    HUD.drawBanner();
    HUD.drawCTA();
    Stick.draw();               /* 조이스틱은 CTA 위에 — 손가락이 닿는 최상단 요소 */
  }
  if (Game.state === 'result') { Screens.drawResult(Director.resT); FX.drawUI(); }

  Debug.draw();
  if (window.__recPush) window.__recPush();   /* 영상 녹화 — 매 프레임 푸시 */
  Input.flush(dt);
}

/* 실제 시트가 인라인되어 있으면 먼저 로드한다. 실패해도 폴백으로 진행. */
function preload(cb) {
  if (typeof SHEET_DATA === 'undefined') return cb();
  var keys = [], k; for (k in SHEET_DATA) if (SHEET_DATA.hasOwnProperty(k)) keys.push(k);
  if (!keys.length) return cb();
  var done = 0, fired = false;
  function step() { if (++done >= keys.length && !fired) { fired = true; cb(); } }
  for (var i = 0; i < keys.length; i++) loadSheet(keys[i], SHEET_DATA[keys[i]], step);
  setTimeout(function () { if (!fired) { fired = true; cb(); } }, 2500);
}

function boot() {
  Stage.init();
  Grid.init();
  FX.init();
  Orbs.init();
  Bullets.init();
  Input.init();
  Game.hpMax = Game.hp = CHARACTER.hp; Game.hpU = Game.hpMax / 100;
  preload(function () {
    restart();
    if (Q.t) fastForward(parseFloat(Q.t) || 0);
    requestAnimationFrame(frame);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
