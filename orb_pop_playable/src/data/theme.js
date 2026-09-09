/* ============================================================================
   theme.js — 색 / 문구 / 스토어 URL.  ★ IP 교체 지점

   무드: 순검정 + 원색. 레퍼런스(Pop Orb) 실측이다.
   1차(neon_defense)의 어두운 우주·네온과 의도적으로 다르게 간다 —
   두 소재를 A/B 로 돌릴 때 변인이 "게임 방식"으로 좁혀져야 하기 때문이다.

   배경이 순검정(#000)이라 규칙이 하나 생긴다:
     화면에 올리는 것은 전부 "빛"이다. 어두운 색을 쓰면 그냥 안 보인다.
     회색조차 값을 충분히 올려야 형태가 잡힌다.
   ========================================================================== */
var FONT = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';

/* UI 스킨 — 'flat'(기본) | 'dot' | 'uihd'(납품본). 빌드가 재할당한다 */
var UI_STYLE = 'flat';

var THEME = {
  storeUrl : 'https://hivelab.co.kr',

  /* ── 앱바 / 랭킹 문구 ───────────────────────────────────────────────────
     ⚠️ 레퍼런스의 'Pop Orb' · 'Elite_Miner' · 'ICE FREEZE BALLS!' 는
        타 사 게임의 이름·콘텐츠다. 넷마블 광고에 그대로 넣으면 안 된다.
        아래 세 줄이 그 교체 지점이다 — 확정 문구가 오면 여기만 고친다.   */
  appTitle   : 'ORB POP',
  rankLabel  : 'TOP RANKED',
  rankName   : 'RITA_01',
  rankScore  : '75,420',
  labelRound : 'ROUND',
  labelGoal  : 'GOAL',
  labelLeft  : 'LEFT',
  labelCombo : 'COMBO',
  labelBonus : 'BONUS',        /* 인게임 콤보 보너스 */
  unlockText : '신규 오브 해금!',      /* 라운드 클리어 해금 문구 */

  /* 콤보 escalation 배너 — 레퍼런스 3단 구성 */
  banTempo   : 'Tempo Up!',
  banFrenzy  : 'HYPER FRENZY!!',
  banDominate: 'DOMINATION',

  /* 문구 */
  tutorial : '드래그로 조준',
  resultTitle : 'ROUND CLEAR',
  resultSub   : '목표 달성',
  ctaLabel : '이 게임이 궁금하다면?',
  labelKill : '팝',
  labelTime : '생존',
  labelClearBonus : '클리어 보너스',   /* 결과 화면 — 위 labelBonus 와 다른 값이다 */
  labelReward : '점수',
  labelHP : 'HP',
  labelKillL : '터뜨린 오브',
  labelTimeL : '생존 시간',

  /* ── 오브 원색 6종 ──────────────────────────────────────────────────────
     레퍼런스 실측: 파랑 · 초록 · 주황 · 빨강 · 회색 · 흰색.
     채도가 높고 서로 멀리 떨어진 색만 쓴다 — 순검정 위에서 색끼리 구분되어야
     "무엇을 터뜨렸는지"가 읽힌다. 중간색(연보라·베이지)은 검정에 먹힌다.   */
  orbCols : ['#3b82f6', '#22c55e', '#f97316', '#ef4444', '#a1a1aa', '#f4f4f5'],

  /* ── 패널 ── */
  ink     : 'rgba(18,18,20,.92)',
  inkSolid: '#0d0d0f',
  line    : 'rgba(255,255,255,.16)',
  text    : '#ffffff',
  textDim : 'rgba(255,255,255,.52)',

  appBar  : '#141416',       /* 상단 앱바 — 순검정보다 한 톤 밝게 해야 띠로 읽힌다 */
  appBarLn: '#26262a',

  score   : '#ffffff',
  goal    : '#f2b53c',       /* GOAL / COMBO / BONUS 계열 골드 */
  round   : '#38d9f0',       /* ROUND — 시안 */
  rank    : '#f2b53c',

  hp     : '#ef4444',
  hpTrack: 'rgba(255,255,255,.12)',
  trackBg  : '#141416',
  trackEdge: '#000000',
  panel    : 'rgba(20,20,24,.90)',
  panelEdge: 'rgba(255,255,255,.16)',
  dotPanel : '#141418',
  dotEdge  : '#3a3a42',
  dotDark  : '#000000',
  dotHi    : 'rgba(255,255,255,.10)',
  hdPanel  : '#141418',
  hdEdge   : '#3a3a42',
  hdDark   : '#000000',
  hdStud   : '#f2b53c',
  hdStudG  : '#38d9f0',
  hdCta    : '#2fae43',
  hdCtaHi  : '#7ce96b',
  hdCtaEdge: '#157031',
  hdCtaDark: '#06230e',
  marker   : '#ffffff',
  xp     : '#f2b53c',
  danger : '#ef4444',
  gold   : '#f2b53c',
  cta    : '#22c55e',

  dmgNormal:'#ffffff', dmgCrit:'#f2b53c', dmgSkill:'#38d9f0',

  /* ── 조이스틱 ── */
  stickRing : 'rgba(255,255,255,.13)',   /* 도넛 바탕 */
  stickEdge : 'rgba(255,255,255,.22)',
  stickKnob : 'rgba(230,230,235,.92)',

  /* ── 폭발 ── */
  boomA : '#ffd166',   /* 금색 — 레퍼런스 프렌지 구간의 지배색 */
  boomB : '#ff8c1a',
  boomC : '#ffffff',

  /* 배경 — 레퍼런스는 순검정이다. 그라디언트도 격자도 없다 */
  bgTop:'#000000', bgBot:'#000000',
  ground:'#000000', groundLine:'rgba(255,255,255,.03)'
};
