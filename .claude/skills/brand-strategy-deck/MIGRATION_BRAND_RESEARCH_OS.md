# MIGRATION — 브랜드 리서치·전략 OS (팀 공용 승격) · 2026.07.21

기존 자산을 **삭제·전면교체 없이 재사용**해, RFP/신규 프로젝트마다 동일 수준의
`deck.html`을 생성하는 팀 공용 리서치·전략 파이프라인으로 승격했다.
(1차 구축 기록은 같은 폴더 `MIGRATION.md` 참조. 이 문서는 2차 확장 = DEEP·이종업계·61섹션.)

## 배경 / 문제
- 기존 `marketer`는 Task/Agent 툴이 없어 다른 에이전트를 실제 호출하지 못하고 사양을 흉내만 냈다.
- Manus 리서치(경쟁 30·클러스터·축·T1~T4)는 `library/prompts`에 흩어져 있고 HTML 산출과 끊겨 있었다.
- GRAIN·Boomi 골든은 `.gitignore(.claude/projects/*)`로 팀 저장소에 없었다. GRAIN은 제공 URL에서 확보.

## 변경 요약

### 신규 스킬 (marketer가 순서대로 호출)
| 스킬 | 역할 |
|---|---|
| `project-discovery/SKILL.md` | STEP 1~3: 프로젝트 성격·팩트북·타깃·문제 재정의 + 정보 상태 태그(FACT~UNKNOWN) |
| `wide-market-research/SKILL.md` | STEP 4~5: 경쟁 30+·카테고리 군집·축 후보 3+·XY맵·화이트스페이스 4유형·이종업계 30+ + T1~T4·Evidence ID |
| `insight-strategy/SKILL.md` | STEP 6~7: 인사이트(관찰→긴장→기회)·전략 대안 2+·추천(자산×기회 연결) |
| `quality-gate/SKILL.md` | 완료 게이트 5영역(프로젝트·경쟁·이종·전략·HTML) 체크리스트 |

### 확장/수정
| 파일 | 내용 |
|---|---|
| `brand-strategy-deck/REPORT_SCHEMA.md` | 22블록 → **4PART 61섹션** + `report-data.json` 전체 골격(competitors/cross_industry/insights/strategy/sources) |
| `brand-strategy-deck/COMPONENTS.md` | 13 → **25 컴포넌트**(RFP·자산·격차·필터·축·사분면·화이트스페이스 유형·BTA·인사이트·비교표·리스크·한계) |
| `brand-strategy-deck/template.html` | 슬롯형 재작성 — 4PART 섹션 마커 + 경쟁 유형 필터 JS + 신규 컴포넌트 CSS |
| `brand-strategy-deck/SKILL.md` | 골든 3종 참조·게이트 연동·13단계 생성 절차 |
| `brand-strategy-deck/references/maxos-golden-example.html` | `maxos-slide-example.html`에서 rename(요청 파일명 정렬) |
| `brand-strategy-deck/references/boomi-golden-example.html` | **stub 생성**(원본 미확보 — 확보 시 교체, 파일명 유지) |
| `.claude/agents/marketer.md` | Senior Brand Strategy Marketer로 재정의. 툴에 **Write·Edit·Skill·Bash 추가**. 18스텝 총괄 + 스킬 호출. |
| `CLAUDE.md` | "브랜드 리서치·전략 프로젝트" 운영 원칙 8줄 + 파이프라인 스킬 5종 등록 |

### 백업 (삭제 없음)
- `.claude/_backup_20260721/round2/` : `marketer.md` · `CLAUDE.md` · `brand-strategy-deck/`(확장 전 전체)
- 1차 백업 `.claude/_backup_20260721/` : `hivelab-proposal-style.md` · `marketer.md` · `CLAUDE.md`

## 재사용한 기존 자산
- GRAIN 덱의 색 토큰·타이포·`.brand-card`/`.tier-badge`/`.cat-card`/포지셔닝맵/`.concept-card`/`.strategy-slide` CSS 계승.
- Manus `manus-1-brand-planning.md`의 **경쟁 30 매트릭스·클러스터·축 3안·Source Tier T1~T4·Hypothesis 표기** 로직을 스킬로 정식화.
- `wide-research.md`(경쟁 30→8속성→3그룹) 원형을 `wide-market-research` 스킬 기준으로 흡수.
- `mx-deck-design/template.html` → maxos 골든(슬라이드 포맷 보조).
- `hivelab-proposal-style` 폴더 구조만 정식화(내용 보존).

## 새로 보강한 것
- **이종업계 와이드 리서치 30+**(경쟁 밖 차용 원리) + Borrow/Translate/Avoid — 기존엔 없던 축.
- **정보 상태 태그**(FACT/CLIENT CLAIM/INFERENCE/HYPOTHESIS/UNKNOWN)와 **Evidence ID** 연결 강제.
- **화이트스페이스 4유형**(TRUE/EMERGING/FALSE/CAPABILITY GAP) — 기회·함정 동시 표기 강제.
- `report-data.json` **데이터 정본화**(HTML에만 데이터 두지 않음) + `*_count` 게이트 대조.
- 프로젝트 폴더 표준 `inputs/outputs/deck.html`.

## 호환성 / 되돌리기
기존 에이전트(rfp-analyst, market-research, manus-1/2, runable-3, brand-pipeline)와 스킬은 **그대로 유지**.
`marketer`는 상위 오케스트레이터로서 이들과 충돌하지 않는다(마케터는 스킬 호출, brand-pipeline은 manus 계열 호출).
```bash
cp .claude/_backup_20260721/round2/marketer.md .claude/agents/marketer.md
cp .claude/_backup_20260721/round2/CLAUDE.md CLAUDE.md
cp -r .claude/_backup_20260721/round2/brand-strategy-deck/. .claude/skills/brand-strategy-deck/
```

## 남은 수동 판단
- **Boomi 골든 미확보**: stub 상태. 실제 Boomi `deck.html`을 `references/boomi-golden-example.html`로 덮어쓰면 활성화.
- **DEEP 30+30 실데이터**: 실제 "마케터 돌려" 실행 시 WebSearch로 확보. 샘플(LUMEN)은 구조·파이프라인 검증용이라 실카운트는 30 미만(아래 검증 리포트에 명시).
- **폰트 CDN**: 샌드박스 프록시가 Pretendard CDN 차단 → 시스템 폰트 폴백(실환경 정상).

## 3차 개정 — 대시보드 셸 전환 + 자동 렌더러 (같은 날 후속)
사용자 피드백 2건 반영: (1) 상단 탭 구분이 잘 안 보임 → 좌측 네비게이터로 교체, (2) HTML 문장이 AI 티가 나고 읽기 어려움 → anti-ai-writing/dumbify 강제.
추가로 사용자가 참조 HTML(좌측 번호 네비 + 뷰 전환형 대시보드)을 제공해 `template.html`을 전면 교체했다.

| 변경 | 내용 |
|---|---|
| `template.html` | GRAIN 스크롤형 → **좌측 번호 네비게이터(00~10) + 뷰 전환형 대시보드**로 전면 교체. 데스크톱 사이드바 고정, 740px 이하 상단 가로 필 바 |
| `render.py` (신규, 스킬 폴더로 승격) | `report-data.json → deck.html` **결정론적 렌더러**. CLI로 직접 실행(`python3 render.py data.json out.html`) — 다음 회차부터 슬롯을 손으로 채우지 않고 이 스크립트로 자동 생성 |
| 색 시스템 | 그린/앰버/레드 임의 배색 → **모노톤 + 포인트 4색 고정**(`#2e53f9` 블루=T1·핵심정보, `#c5ff79` 라임=T2·기회, `#ff86f6` 핑크=T3·중간위험, `#ff6e23` 오렌지=T4·위험·회피). 분류가 필요한 곳(출처 등급·화이트스페이스·리스크)에만 사용, 장식 금지 |
| `SKILL.md`/`REPORT_SCHEMA.md`/`COMPONENTS.md` | 61섹션 스크롤 구조 → **11개 뷰 대시보드 구조**로 재작성. 생성 절차를 "슬롯 채우기"에서 "render.py 실행"으로 변경 |
| 글쓰기 필터 | `SKILL.md`에 anti-ai-writing/dumbify 규칙 명문화(본문 중2 난도·한 문장 한 생각·구체성 레벨3+·부정병렬 금지). `marketer.md`에도 상시 원칙으로 추가 |
| LUMEN 샘플 | `render.py` 로컬 사본 제거, `build_deck.py`가 스킬 폴더의 `render.py`를 직접 import하도록 정리(정본 이원화 방지) |

**검증**: 스킬 `render.py`로 LUMEN 재빌드 → 슬롯 미충전 0, div/section 태그 균형 OK, 포인트 4색 전부 사용 확인, 구 identity 색(#1c3f3a 등) 잔존 없음.

**남은 수동 판단**: `references/grain-golden-example.html`은 이제 "1차 골든"이 아니라 정보 밀도·출처 표현을 참고하는 보조 자료로 격하됨 — SKILL.md에 반영함. Boomi 골든 stub 상태는 그대로.

## 4차 개정 — 카드 그리드 전환 + 브랜드 밸류 키워드 신설 (같은 날 후속)
사용자 피드백 2건 반영: (1) 경쟁·이종업계 리스트가 길어질 때 표는 스캔하기 어려움 → 카드 그리드로 교체(필터 탭은 유지), (2) "브랜드 밸류 키워드"가 파이프라인에 없었음(Manus-1의 "전략 키워드 10→5→3" 발산이 새 스킬로 이어지지 않았음) → 신설.

| 변경 | 내용 |
|---|---|
| `template.html`/`render.py` | 03(경쟁 리서치)·06(이종업계)의 `<table>` → **카테고리 그룹 헤더 + `.brand-grid` 카드**(5→3→2→1열 반응형). 필터 탭(`.filters`)은 그대로 두고 JS를 테이블 행이 아닌 `[data-type]` 카드에 대해 동작하도록 일반화 |
| 신설 뷰 08 · 브랜드 밸류 키워드 | 인사이트를 감각 언어 3갈래(A/B/C)로 번역하는 페이지. 2행 타이틀·태그 3개·설명·그래픽모티프·사운드 힌트. 좌측 네비 00~11로 재번호(기존 08 전략대안→09, 09 추천전략→10, 10 출처→11) |
| `insight-strategy/SKILL.md` | STEP 6.5로 브랜드 밸류 키워드 신설. 각 클러스터가 인사이트 ID에 연결되도록 강제(근거 없이 감각적으로 지어내지 않음) |
| `report-data.json` 스키마 | `brand_value_keywords[]` 필드 추가 |
| LUMEN 샘플 | 인사이트 3개(I1~I3) 각각에 대응하는 감각 클러스터 3개(왁스 무늬·돌 용기·저녁 전환) 추가, 카드 그리드로 재빌드 |

**검증**: `<table>` 0개, `.brand-card` 60개(경쟁30+이종30), `.group-block` 7개, `.bvk-col` 3개, div/section 태그 균형 OK, 필터 버튼 9개 정상 동작.
