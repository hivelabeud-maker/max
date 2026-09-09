/* state.js — 전역 게임 상태 (ORB POP)

   1차(디펜스)와 다른 점: HP·실드가 없다.
   레퍼런스에 체력 게이지가 없고, 실패 조건이 "맞아 죽는 것"이 아니라
   "시간 안에 목표 점수를 못 채우는 것"이기 때문이다.
   HP 관련 필드는 결과 화면·엔진이 아직 참조하므로 남겨두되 쓰지 않는다. */
var Game = {
  state : 'boot',
  t     : 0,        /* 디렉터 시계 — 항상 실시간으로 흐른다 */
  wt    : 0,        /* 월드 시계 — timeScale 영향을 받는다 */
  timeScale : 1, hitstop : 0,

  /* ── ORB POP 핵심 수치 ──────────────────────────────────────────────── */
  score : 0,        /* 실제 점수 */
  scoreShown : 0,   /* 표시용 — score 를 부드럽게 따라간다 (engine.js).
                       분열 연쇄로 한 프레임에 수십 점이 들어와서 그대로
                       그리면 숫자가 계단처럼 튄다 (1차에서 지적받은 그 증상) */
  goal  : 18000,    /* 이번 라운드 목표. HUD 의 "GOAL: N LEFT" 가 이걸 쓴다.
                       레퍼런스는 라운드 중반에 목표에 닿고 나머지는 보너스로 간다.
                       너무 낮으면 초반에 0이 떠서 남은 시간이 긴장을 잃는다 */
  round : 2,        /* 표기용 — 레퍼런스가 ROUND 2 다 (1라운드는 튜토리얼 취급) */
  pops  : 0,        /* 터뜨린 오브 수 */
  cleared : false,  /* 목표 달성 여부 */
  clearBonus : 0,

  kills : 0, coins : 0, killShown : 0,   /* 결과 화면 호환 — pops 를 담는다 */

  /* HP — 이 프로젝트에서는 쓰지 않는다 (결과 화면·엔진 호환용) */
  hp : 1000, hpMax : 1000, hpFloor : 0.15, hpGhost : 1000, hpCap : 1000, hpHit : 0,
  hpU : 10, hpRegenLock : 0,

  player : null,
  orbs : null, bullets : null,
  press : 0, lineHit : 0,
  banner : { txt:'', t:0, big:false },
  hint   : { on:false, t:0 },
  cutin  : 0,
  danger : 0,
  spawned: 0,
  ended  : false,
  paused : false
};
