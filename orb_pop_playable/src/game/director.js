/* ============================================================================
   director.js — 연출 감독. TIMELINE 을 초 단위로 집행한다.
   디렉터 시계(Game.t)는 timeScale 과 무관하게 항상 실시간으로 흐른다.
   → 슬로우모션·스킬선택이 끼어도 총 길이는 TIMELINE.total 로 고정된다.
   ========================================================================== */
var Director = {
  ci: 0, acc: null, ultT: -1, resT: 0, endT: 0,

  reset: function () {
    this.ci = 0; this.ultT = -1; this.resT = 0; this.endT = 0;
    this.acc = [];
    for (var i = 0; i < TIMELINE.waves.length; i++) this.acc.push(0);
  },

  nextStateT: function (afterT) {
    for (var i = 0; i < TIMELINE.cues.length; i++) {
      var q = TIMELINE.cues[i];
      if (q.act === 'state' && q.t > afterT + 0.001) return q.t;
    }
    return TIMELINE.total;
  },

  apply: function (q) {
    if (q.act === 'state') Director.setState(q.v, q.n);
    else if (q.act === 'hint') Game.hint.on = true;
    else if (q.act === 'banner') { Game.banner.txt = q.v; Game.banner.t = 1.3; }
    else if (q.act === 'danger') Game.danger = 1;
  },

  setState: function (s, n) {
    Game.state = s;
    if (s === 'tutorial') { Game.timeScale = 1; }   /* 힌트 없음 — 아래 참조 */
    else if (s === 'battle') { Game.timeScale = 1; }
    else if (s === 'ultimate') {
      Game.timeScale = 0.22; Director.ultT = 0;
    }
    else if (s === 'result') {
      Game.timeScale = 1; Director.resT = 0; Input.enabled = true;
      Screens.resFxDone = false; Screens._starFx = [0, 0, 0]; Screens._chFx = 0; Screens._numFx = null;
      FX.burst(Stage.W / 2, Stage.H * 0.30, 26, THEME.gold, 380, 3.5);
    }
  },

  update: function (dt) {
    Game.t += dt;

    var cues = TIMELINE.cues;
    while (this.ci < cues.length && cues[this.ci].t <= Game.t) { this.apply(cues[this.ci]); this.ci++; }

    /* 스폰 스케줄 */
    if (Game.state === 'battle' || Game.state === 'tutorial') {
      var ws = TIMELINE.waves;
      for (var i = 0; i < ws.length; i++) {
        var w = ws[i];
        if (Game.t < w.a || Game.t > w.b) continue;
        this.acc[i] += w.rate * dt;
        while (this.acc[i] >= 1) {
          this.acc[i] -= 1;
          if (Orbs.count() < ORB_SET.cap - 8) Orbs.spawn(w.t);
        }
      }
    }

    /* 라운드 클리어 — 짧은 차징 후 화면의 오브를 전부 터뜨린다.
       1차의 "궁극기" 자리를 그대로 쓴다(상태명 'ultimate' 도 유지 — qa.js 가
       이 이름으로 완주를 검사한다). 연출만 바뀌었다: 섬멸이 아니라 클리어다 */
    if (this.ultT >= 0) {
      this.ultT += dt;
      if (this.ultT >= 0.55) { this.ultT = -1; Game.timeScale = 1; Skills.roundClear(); }
    }
    if (Game.state === 'ultimate' && this.ultT < 0) {
      /* 남은 것을 계속 정리한다. 분열로 다시 늘어나므로 한 번에 안 끝난다 —
         결과 화면 진입 시점(21.5초)에 0이 되어야 qa.js ② 가 통과한다 */
      Game.orbs.each(function (o) { if (o.dieT <= 0) { o.hp = 0; Orbs.pop(o, true); } });
    }
    if (Game.state === 'result') this.resT += dt;

    if (Game.banner.t > 0) Game.banner.t -= dt;
    if (Game.cutin > 0) Game.cutin -= dt;
    if (Game.hint.on) {
      Game.hint.t += dt;
      if (Input.everTouched || Game.t > 3.2) Game.hint.on = false;
    }
    if (Game.danger > 0 && Game.state !== 'battle') Game.danger -= dt * 2;
  }
};
