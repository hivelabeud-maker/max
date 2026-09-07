# 제안서 고도화용 외부 스킬 스캔 (GitHub, 2026-09)

조사 대상: GitHub 공개 저장소의 Claude Skill(`SKILL.md`) 자산 중 **제안서의 논리·근거·구조를 강화하는** 것들.
MECE·피라미드 원칙 같은 컨설팅 논리 프레임, 정보분석(Structured Analytic Techniques) 계열, 브랜드·디자인 에이전시 워크플로우 3갈래로 나눠 정리했다.

---

## 1. 컨설팅 논리 프레임 — 제안서 뼈대용

### fzfclee/consulting-skills — 스킬 58개 (Apache-2.0)
https://github.com/fzfclee/consulting-skills

가장 밀도가 높다. 스킬마다 `Required Inputs / When Not To Use / Step-by-Step 표 / Output` 구조가 고정돼 있고, 다른 스킬로 넘기는 조건까지 적혀 있다. 우리 `.claude/skills` 문법과 그대로 호환된다.

제안서에 바로 쓸 것:
- 구조화: `mece-framework`, `issue-tree`, `hypothesis-tree`, `metrics-tree`, `evidence-map`
- 논증: `deductive-reasoning`, `inductive-reasoning`, `abductive-reasoning`, `first-principles-thinking`, `assumption-inventory`, `signal-vs-noise-filter`
- 진단: `five-whys-root-cause`, `fishbone-diagram`, `constraint-analysis`, `systems-thinking`, `5w1h-analysis`
- 시장·포지셔닝: `competitive-positioning`, `porter-five-forces`, `pestel-analysis`, `swot-analysis`, `jobs-to-be-done`, `kano-model`, `customer-segmentation`
- 설득·의사결정: `decision-matrix`, `weighted-scorecard`, `cost-benefit-analysis`, `effort-impact-matrix`, `rice-scoring`, `wsjf-prioritization`, `risk-matrix`, `pre-mortem`
- 수주 관리: `deal-strategy-map`, `account-plan`, `win-loss-review`, `stakeholder-power-map`, `power-interest-grid`, `raci-matrix`, `communications-plan`
- 디자인 리서치 겸용: `empathy-map`, `user-journey-mapping`, `service-blueprint`, `affinity-diagram`, `mind-map-analysis`

### subhashdasyam/mck-skills — 스킬 22개
https://github.com/subhashdasyam/mck-skills

맥킨지 방법론을 체인으로 엮은 세트다. `router` 스킬이 문제 유형을 보고 어떤 프레임을 태울지 정하고, 모든 체인이 `pyramid-principle`로 끝나 산출물이 된다.
- `pyramid-principle` — 지배 메시지(governing thought) 1문장 + MECE 3개 키라인 + 근거. `references/`에 governing-thought, rule-of-three, 귀납/연역 판별 가이드가 딸려 있다. **제안서 목차 설계에 그대로 쓸 수 있는 수준.**
- `scr-storyline` — Situation-Complication-Resolution 서사
- `seven-step-process` — 문제정의 7단계, `hypothesis-driven`, `issue-trees`, `mece`
- 분석 프레임: `market-sizing`, `profitability`, `industry-cost-curve`, `three-horizons`, `7s-framework`, `ge-mckinsey-matrix`, `consumer-decision-journey`, `strategic-control-map`

### sruthir28/enterprise-ai-skills — 스킬 15개
https://github.com/sruthir28/enterprise-ai-skills

산출물 제작 쪽에 특화. 제안서 조판 단계와 겹친다.
- `storyline-builder` — 스토리라인 한 줄 = 슬라이드 제목 1장. 제목은 주제가 아니라 발견을 쓴다("시장은 40% 성장, 매출은 5% 감소" vs "시장 분석")
- `top-down-memo`, `decision-memo-builder`, `scpr-framework`, `synthesis`
- `mckinsey-critic` — 제안서 자체 검수. 우리 `critic`·`review-panel`과 붙일 만하다
- `mckinsey-charts`, `deck-pipeline`, `issue-tree-builder`, `hypothesis-tree`, `stakeholder-map`, `workshop-designer`

### itzcull/thinking-skills — 스킬 25개
https://github.com/itzcull/thinking-skills

발상·구조화 사고도구 모음. `minto-pyramid`, `issue-trees`, `abstraction-laddering`, `ladder-of-inference`, `iceberg-model`, `cynefin-framework`, `six-thinking-hats`, `inversion`, `second-order-thinking`, `hard-choice-model`, `concept-map`, `impact-effort-matrix`.
`abstraction-laddering`은 컨셉 한 문장을 올렸다 내렸다 하며 다듬는 도구라 `concept-director`와 궁합이 맞는다.

### Chiakai-Chang/MECE-Autopilot
https://github.com/Chiakai-Chang/MECE-Autopilot
MECE 원탁 토론을 자동으로 굴려 복잡한 판단을 쪼갠다. 우리 `review-panel`의 상위 호환 아이디어.

---

## 2. 근거·검증 계열 — 팩트체커 강화용

### radarist/structured-analytic-skills — 스킬 70개
https://github.com/radarist/structured-analytic-skills

정보기관식 구조적 분석기법(SATs)을 스킬화했다. **출처 신뢰도와 근거 등급을 다루는 자산은 여기가 가장 두껍다.**
- 출처 검증: `rate-source-admiralty`(A1~F6 등급), `triangulate-sources`, `sift-source-check`, `claim-provenance`, `verify-citations`, `grounded-fact-check`, `quality-of-information-check`
- 반증·레드팀: `analysis-of-competing-hypotheses`, `red-team-claim`, `steelman-argument`, `key-assumptions-check`, `premortem-analysis`, `critique-report`
- 추정·수치: `estimate-market-size`, `quantitative-sanity-check`, `reference-class-forecasting`, `bayesian-update`, `expected-value-decision-tree`, `brier-score-calibration`, `estimative-language`(단정 표현 강도 통제)
- 미래·시나리오: `scenario-planning`, `futures-wheel`, `three-horizons`, `horizon-scanning`, `backcasting`, `wardley-map-drafting`, `apply-hype-cycle`, `causal-layered-analysis`, `cross-impact-analysis`
- 조판: `pyramid-principle`, `write-sbar-brief`, `write-imrad-report`, `cite-ieee`

우리 `marketer` v8.1의 T1~T4 출처 티어는 `rate-source-admiralty`로 등급 근거를 보강할 수 있다.

---

## 3. 디자인·브랜드 에이전시 워크플로우

### rampstackco/claude-skills — 스킬 100개+
https://github.com/rampstackco/claude-skills

디지털 에이전시 실무 전 공정을 스킬로 쪼갠 세트. 우리 업무 범위와 가장 가깝다.
- 브랜드: `brand-discovery`, `brand-ideation`, `brand-archetype-system`, `brand-identity`, `brand-voice`, `brand-style-guide`, `logo-design`
- 크리에이티브: `creative-brief`, `creative-brief-selector`(브리프 유형 판별), `creative-direction`, `art-direction`, `design-standards`, `design-system`
- 리서치: `discovery-research-synthesis`, `ux-research`, `journey-mapping`, `jtbd-framing`, `competitor-experience-audit`, `usability-testing`
- 설계: `information-architecture`, `funnel-flow-architecture`, `content-strategy`, `content-brief-authoring`

### nthnclrk/enablement-skills — 스킬 38개
https://github.com/nthnclrk/enablement-skills

수주·영업 자산 쪽. `proposal-rfp-orchestrator`(RFP 응답 오케스트레이션), `value-prop-and-positioning`, `battlecard-builder`, `objection-library-builder`, `executive-briefing-builder`, `one-pager-and-slide-outline`, `case-study-extractor`, `win-loss-synthesis`, `mutual-action-plan-builder`, `discovery-rubric-auditor`.
`objection-library-builder`는 클라이언트 예상 반론을 미리 쌓아두는 구조라, 제안 PT 대비에 쓸모가 있다.

### mohitagw15856/pm-claude-skills — 스킬 1,000개+ (잡다)
https://github.com/mohitagw15856/pm-claude-skills
품질 편차가 크다. 골라 쓸 것만: `consulting-proposal`, `proposal-skeleton`, `proposal-writer`, `rfp-response`, `rfp-scoring-matrix`, `deck-narrative-arc`, `deck-outline-first`, `deck-review-rubric`, `deck-autopsy`, `exec-vs-working-deck`, `slide-density-rules`, `persuasion-brief`, `strategic-narrative-generator`, `poke-holes-in-this`, `red-team-my-plan`, `pre-mortem-panel`, `evidence-grading`, `assumption-audit`.

---

## 4. 우리 저장소에 붙일 때 우선순위

지금 `.claude/skills`는 산출물 조판(덱·대시보드·스토리보드)에 쏠려 있고, **제안 내용의 논리를 세우는 스킬이 비어 있다.** 그 빈자리를 메우는 순서로 6개를 먼저 이식할 것을 제안한다.

| 순위 | 이식할 스킬 | 출처 | 우리 쪽 연결점 |
|---|---|---|---|
| 1 | `pyramid-principle` | subhashdasyam/mck-skills | `mx-deck-design` 목차 설계 앞단 |
| 2 | `mece-framework` + `issue-tree` | fzfclee/consulting-skills | `rfp-analyst` 4분류 정교화 |
| 3 | `storyline-builder` | sruthir28/enterprise-ai-skills | 슬라이드 제목 = 메시지 규칙 |
| 4 | `rate-source-admiralty` + `triangulate-sources` | radarist | `fact-checker`, `marketer` T1~T4 |
| 5 | `creative-brief` + `brand-discovery` | rampstackco | `concept-director` 입력 정리 |
| 6 | `objection-library-builder` | nthnclrk | 제안 PT 반론 대비 |

이식할 때 손볼 것: 전부 영어 원문이므로 한국어로 옮기고, CLAUDE.md의 anti-ai-writing·dumbify 규칙을 적용한다. 라이선스는 fzfclee가 Apache-2.0이라 표기만 하면 되고, 나머지는 저장소별 LICENSE를 확인해야 한다.

---

## 조사 방법 메모
GitHub 코드 검색(`filename:SKILL.md` + 프레임 키워드)으로 후보를 뽑고, 상위 10개 저장소를 얕은 클론해 스킬 목록과 본문 구조를 직접 확인했다. 목록은 2026-09-07 기준 HEAD.
