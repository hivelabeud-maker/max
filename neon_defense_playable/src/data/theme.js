/* ============================================================================
   theme.js — 색 / 문구 / 스토어 URL.  ★ IP 교체 지점 (10분)

   ⚠️ 2차(NEON DEFENSE)에서 무드 규칙이 바뀌었다. 1차의 "플랫·조용한 UI" 규칙은
   여기서 폐기된다. 되돌리지 말 것 — 근거는 docs/00_인수인계.md 참조.

   무드: 어두운 우주 + 네온. 발광을 허용한다 (shadowBlur / 반투명 겹침).
   배경이 거의 검정이라 UI 는 얇은 네온 라인으로 떠 있어야 읽힌다.
   면을 넓게 칠하면 우주가 사라지므로 채우기는 좁게, 라인은 밝게 간다.

   팔레트 3축 (브리프 레퍼런스1 실측):
     시안  #8ef0ff — 아군 계열. 탄막·XP·게이지·HUD 라인
     마젠타 #ff5fd6 — 폭발·충격파·궁극기
     잉크  #050310 — 우주 바탕. 순검정(#000)이 아니라 아주 옅은 보라를 섞는다
   ========================================================================== */
var FONT = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",system-ui,sans-serif';

/* UI 스킨 — 'flat'(기본) | 'dot'(도트 프레임 변주) | 'uihd'(납품본). 빌드가 재할당한다 */
var UI_STYLE = 'flat';

var THEME = {
  storeUrl : 'https://hivelab.co.kr',

  /* 문구 */
  tutorial : '드래그로 이동',
  resultTitle : 'STAGE CLEAR',
  resultSub   : '전 구역 정리 완료',
  ctaLabel : '이 게임이 궁금하다면?',
  labelKill : '처치',
  labelTime : '생존',
  labelBonus : '클리어 보너스',
  labelReward : '보상',
  labelHP : 'HP',
  labelKillL : '처치 수',      /* 결과 히어로 행용 긴 라벨 */
  labelTimeL : '생존 시간',
  labelWave : '웨이브',        /* 중앙 상단 카운터 (5단계) */
  labelShield : 'SHIELD',      /* 우하단 실드 게이지 (5단계) */

  /* ── 네온 3축 ────────────────────────────────────────────────────────
     아래 팔레트 전체가 이 3색에서 파생된다. 새 색을 즉흥으로 만들지 말고
     여기서 뽑아 쓸 것 — 색이 늘어나면 우주의 검정이 먼저 죽는다.        */
  neonC   : '#8ef0ff',    /* 시안 — 아군·정보 */
  neonM   : '#ff5fd6',    /* 마젠타 — 폭발·위협 */
  neonV   : '#a77bff',    /* 보라 — 두 색 사이 전이용 */
  neonW   : '#ffffff',    /* 백열 코어 — 발광의 중심만 */

  /* ── 패널 ────────────────────────────────────────────────────────────
     ink   : 패널 바탕 (우주가 비쳐야 하므로 불투명하지 않다)
     line  : 1px 네온 구분선
     text / textDim : 글자 2단계                                          */
  ink     : 'rgba(6,4,20,.74)',
  inkSolid: '#050310',
  line    : 'rgba(142,240,255,.22)',
  text    : '#eaf9ff',
  textDim : 'rgba(186,226,244,.58)',

  hp     : '#ff3b6b',
  hpTrack: 'rgba(142,240,255,.12)',

  /* ── 게이지 공통 (상단 진행 / 하단 HP 가 같은 디자인 시스템을 쓴다) ──
     트랙은 우주보다 어둡게 파서 채움의 발광이 도드라지게 한다. */
  trackBg  : '#080618',
  trackEdge: '#02010a',

  /* 스탯 카드 — 국소 패널. 전폭 딤이 아니다 */
  panel    : 'rgba(7,6,24,.80)',
  panelEdge: 'rgba(142,240,255,.24)',
  /* 도트 스킨 전용 — 불투명 단색 (도트 프레임은 반투명이면 계단이 뭉개져 보인다) */
  dotPanel : '#0b0a22',
  dotEdge  : '#2a3a66',
  dotDark  : '#02010a',
  dotHi    : 'rgba(142,240,255,.12)',
  /* uihd 스킨 — 납품본. 다크 퍼플/골드(1차 던전 킷) → 딥스페이스/시안으로 교체 */
  hdPanel  : '#0a0824',
  hdEdge   : '#2b3c6e',
  hdDark   : '#02010c',
  hdStud   : '#8ef0ff',
  hdStudG  : '#ff5fd6',
  hdCta    : '#2fae43',
  hdCtaHi  : '#7ce96b',
  hdCtaEdge: '#157031',
  hdCtaDark: '#06230e',
  marker   : '#d9f8ff',     /* 진행 게이지 다이아 마커 */
  xp     : '#8ef0ff',
  danger : '#ff3b6b',
  gold   : '#ffd25f',
  cta    : '#22c55e',       /* CTA 만 난색 유지 — 네온 화면에서 유일한 초록이라 즉시 찾힌다 */

  dmgNormal:'#ffffff', dmgCrit:'#ffd25f', dmgSkill:'#8ef0ff',

  /* ── 우주 배경 (이미지 0장. screens.js drawBG 폴백이 전부 그린다) ──────
     bgTop/bgBot  화면 상하 그라디언트
     nebA/nebB    성운 얼룩 2개 — 검정만 있으면 화면이 죽어서 아주 옅게 깐다
     ground       (구 지면) 우주 바탕색. 이제 띠가 아니라 전면이다
     groundLine   격자선. 알파를 낮게 유지할 것 — 별보다 세지면 우주가 실내가 된다
     star / starDim  별 2단계                                            */
  bgTop:'#0b0726', bgBot:'#04020e',
  nebA :'rgba(60,30,140,.30)', nebB:'rgba(12,90,130,.26)',
  ground:'#04020e', groundLine:'rgba(142,240,255,.075)',
  star:'#ffffff', starDim:'rgba(178,222,255,.62)'
};
