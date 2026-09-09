/* state.js — 전역 게임 상태 */
var Game = {
  state : 'boot',
  t     : 0,        /* 디렉터 시계 — 항상 실시간으로 흐른다 */
  wt    : 0,        /* 월드 시계 — timeScale 영향을 받는다 */
  timeScale : 1, hitstop : 0,
  kills : 0, coins : 0,
  killShown : 0,   /* 처치 수 표시용 — kills 를 부드럽게 따라간다 (engine.js) */
  hp : 1000, hpMax : 1000, hpFloor : 0.15, hpGhost : 1000, hpCap : 1000, hpHit : 0,
  hpU : 10,        /* hpMax / 100 — 피해·재생 스케일 단위. 최대치를 바꿔도 밸런스가 유지된다 */
  hpRegenLock : 0, /* 피격 직후 이 시간(초) 동안은 재생 정지 — 맞아도 안 깎이는 것처럼 보이는 문제 방지 */
  player : null,
  enemies : null, bullets : null, orbs : null,
  boss : null, bossAt : 0,
  press : 0,             /* 주인공 반경 안 적 수 (위기 지표) */
  lineHit : 0,           /* 방어선 피격 플래시 */
  banner : { txt:'', t:0 },
  hint   : { on:false, t:0 },
  cutin  : 0,
  danger : 0,
  spawned: 0,
  ended  : false,
  paused : false
};
