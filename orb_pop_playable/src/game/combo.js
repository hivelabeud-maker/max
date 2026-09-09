/* ============================================================================
   combo.js — 콤보 카운터 + escalation 단계

   레퍼런스의 심장이다. 화면 전체가 이 값 하나를 따라 달아오른다:
     COMBO x8  → 배너 `Tempo Up!`
     COMBO x30 → 배너 `HYPER FRENZY!!` · 화면 톤이 금색으로
     COMBO x50 → `DOMINATION xN` 대형 텍스트 · 폭발이 화면을 덮는다

   ■ 왜 시간창 방식인가
     "연속으로 맞히면 오른다"가 아니라 "마지막 팝 이후 window 초 안에 또 터뜨리면
     오른다"로 만들었다. 오브가 분열해서 사방으로 흩어지므로 조준을 옮기는 사이가
     비는데, 엄격한 연속 판정이면 그 틈에 콤보가 끊겨 레퍼런스의 x76 이 안 나온다.
     ※ 창 길이가 곧 난이도 곡선이다. 1.25초로 뒀더니 초당 18발 연사에서는
       한 번도 안 끊겨 콤보가 x294 까지 갔다 — DOMINATION 이 상시 표시돼
       escalation 이 통째로 사라졌다. 0.85초로 줄이니 오브가 성긴 초반에는
       끊기고 빽빽한 후반에는 이어져서, 밀도가 그대로 리듬이 된다.

   ■ 단계 진입은 한 번만
     stage 가 올라간 프레임에만 배너를 띄운다. 매 프레임 검사하면 배너가
     계속 재발행돼서 화면에 눌어붙는다.
   ========================================================================== */
var Combo = {
  n: 0,           /* 현재 콤보 */
  best: 0,        /* 이번 판 최고 — 결과 화면용 */
  t: 0,           /* 남은 유지 시간 */
  window: 0.85,   /* 이 시간 안에 다음 팝이 없으면 끊긴다 */
  stage: 0,       /* 0 평온 · 1 Tempo · 2 Frenzy · 3 Domination */
  bonus: 0,       /* 마지막 팝의 보너스 점수 — HUD 가 읽는다 */

  /* ── 단계별 표시 자리가 다르다 (레퍼런스 실측) ──────────────────────────
     레퍼런스 s10 을 보면 세 문구가 동시에, 서로 다른 자리에 있다:
       상단 HUD  `HYPER FRENZY!!` (초록) + `COMBO x76`
       화면 중앙 `DOMINATION x76` (흰 대형)
     즉 큰 캔디 레터링 배너는 `Tempo Up!` 하나뿐이고, 나머지 둘은 배너가
     아니라 상시 표시다.
     ⚠️ 처음엔 셋 다 배너로 띄웠다가 DOMINATION 이 배너와 중앙 표시로
        두 겹 겹쳐 나왔다. banner:false 가 그 수정이다.                    */
  STAGES: [
    { at: 8,  key: 'banTempo',    banner: true  },   /* 대형 캔디 배너 */
    { at: 30, key: 'banFrenzy',   banner: false },   /* 상단 HUD 상시 */
    { at: 50, key: 'banDominate', banner: false }    /* 중앙 대형 상시 */
  ],

  reset: function () { this.n = 0; this.best = 0; this.t = 0; this.stage = 0; this.bonus = 0; },

  /* 콤보 배수 — 점수에 곱해진다.
     선형으로 올리면 후반 점수가 폭주해서 자릿수가 화면을 넘는다.
     루트로 눌러서 x76 일 때 약 5배가 되게 했다 */
  mul: function () { return 1 + Math.sqrt(Math.max(0, this.n)) * 0.46; },

  add: function () {
    this.n++; this.t = this.window;
    if (this.n > this.best) this.best = this.n;
    this.bonus = Math.round(15 + this.n * 2.5);

    for (var i = this.STAGES.length - 1; i >= 0; i--) {
      if (this.n >= this.STAGES[i].at && this.stage < i + 1) {
        this.stage = i + 1;
        if (this.STAGES[i].banner) {
          Game.banner.txt = THEME[this.STAGES[i].key];
          Game.banner.t = 1.2; Game.banner.big = true;
        }
        /* 단계 진입은 문구가 없어도 몸으로 알린다 — 화면 흔들림 + 히트스톱 */
        FX.kick(i >= 1 ? 7 : 3, 0.14);
        if (i >= 1) Game.hitstop = Math.max(Game.hitstop, 0.06);
        break;
      }
    }
  },

  update: function (dt) {
    if (this.t > 0) {
      this.t -= dt;
      if (this.t <= 0) { this.n = 0; this.stage = 0; }
    }
  },

  /* 화면 달아오름 0~1 — 배경 광량·폭발 크기·HUD 강조가 이 값을 공유한다.
     각자 따로 임계값을 두면 연출이 어긋나서 "같이 뜨거워지는" 인상이 깨진다 */
  heat: function () { return clamp(this.n / 60, 0, 1); }
};
