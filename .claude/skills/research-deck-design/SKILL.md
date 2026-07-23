---
name: research-deck-design
description: 좌측 번호 네비게이터 + 뷰 전환형 "리서치·전략 대시보드 덱"(Research & Strategy OS) HTML 생성 시스템. 모노톤 베이스 + 고정 포인트 4색(blue·lime·pink·orange=T1~T4), 00~11 12개 뷰(요약·브리프·팩트북·경쟁·포지셔닝·화이트스페이스·이종업계·인사이트·밸류키워드·전략대안·추천·출처), template.html 동반. 마케터/리서치 산출을 근거 추적까지 되는 대시보드로 조판할 때 사용. 트리거 "리서치 덱", "리서치·전략 deck", "R&S OS", "마케터 결과 덱으로", "포지셔닝 맵 덱", "대시보드형 리서치 정리".
---

# Research & Strategy OS — 리서치·전략 대시보드 덱

리서치(경쟁·포지셔닝·트렌드)에서 전략(인사이트·대안·추천)까지 **근거를 추적하며 연결하는** 뷰 전환형 대시보드 HTML.
**목표: 누가 언제 만들어도 같은 덱으로 보이게.** 색·타이포·레이아웃은 손대지 않고 내용만 갈아끼운다.
슬라이드가 아니라 **좌측 번호 네비 + 우측 뷰 전환** 구조다. 스크롤 리포트도, PPT형 제안서도 아니다.

## 언제 쓰나 / 안 쓰나

**쓴다**
- `marketer` 에이전트 산출(시장조사→포지셔닝→트렌드·레퍼런스→발산)을 대시보드로 정리할 때
- 브랜드/제품 리서치·전략 문서를 "결론 먼저, 근거는 아래로" 구조로 볼 때
- 경쟁·이종 사례가 많고(20~60개), 출처 추적이 중요할 때

**안 쓴다**
- 에디토리얼 리포트(수치를 잡지형으로) → `list-deck-design`
- 슬라이드형 제안서·컨셉덱(1920×1080 페이지 넘김) → `mx-deck-design`

## 만드는 법 (핵심)

1. `.claude/skills/research-deck-design/template.html`을 **복사**해서 시작한다. CSS·JS·네비 골격은 절대 손대지 않는다.
2. `{{...}}` 플레이스홀더와 `<!-- 반복 -->` 표시된 카드만 실제 내용으로 교체·복제한다.
3. topbar/sidebar의 `{{프로젝트명}}`·`{{프로젝트 유형}}`, 그리고 네비 뱃지 `{{N}}`을 **실제 항목 수**로 채운다.
4. Pretendard는 CDN link로 들어간다 — Artifact/오프라인 배포 시 CSP로 막히면 시스템 폰트로 폴백된다(레이아웃은 유지). 상관없으면 그대로 둔다.

## 디자인 토큰 — 손대지 않는다

```css
--bg:#f2f1ee; --panel:#fff; --panel2:#faf9f6; --ink:#161616; --muted:#77756e; --line:#e3e1da;
--accent:#1a1a17;   /* 잉크 강조(네비 active·decision·reco-head 배경) */
/* 고정 포인트 4색 — 이 4색 외 새 색 금지 */
--pink:#ff86f6;  --blue:#2e53f9;  --lime:#c5ff79;  --orange:#ff6e23;
--pink2:#ffeafd; --blue2:#e7ecfe; --lime2:#eeffd9; --orange2:#ffe4d3;  /* 각 soft 배경 */
```

**4색 의미 배정(고정)** — 분류·강조가 꼭 필요한 곳에만 쓴다:

| 색 | 티어 | 의미 |
|---|---|---|
| blue | T1 | 핵심 정보 · 공식 출처 · 채택 축 |
| lime | T2 | 긍정 · 기회(opportunity) · 완료 |
| pink | T3 | 보류 · 중간 위험 |
| orange | T4 | 위험 · 회피(trap) · 하지 않을 것 |

`.source-type.t1~t4`, `.tag.blue/green/amber/red`, `.risk-level.high/medium`가 이 배정을 그대로 쓴다.

## 12개 뷰 스펙 (네비 순서)

| # | 뷰(id) | 무엇을 담나 | 주요 컴포넌트 |
|---|---|---|---|
| 00 | 요약(`overview`) | 결론·지표·파이프라인·추천 한 줄 | `.grid.cols-4 .metric` · `.flow` · `.decision` |
| 01 | 브리프·문제정의(`brief`) | 요청 → 재정의한 결정 문제, 미확인 가정 | `.request-vs` · `.kv` · `.question` |
| 02 | 브랜드 팩트북(`factbook`) | 브랜드 기본·자산/격차·타깃 | `.card` · `.kv` |
| 03 | 경쟁 리서치(`competitors`) | 경쟁·대체 브랜드 카드(필터·검색) | `.streams` · `.cat-cards` · `.filters`+`.brand-grid` |
| 04 | 포지셔닝 맵(`positioning`) | 축 후보→채택, XY 좌표 배치 | `.axis-grid` · `.pmap`/`.pm-node` |
| 05 | 화이트스페이스(`whitespace`) | 빈자리를 기회/함정으로 판정 | `.ws-card.opp` · `.ws-card.trap` |
| 06 | 이종업계(`cross`) | 타 업계 원리 차용 카드 + BTA | `.cat-cards` · `.brand-grid` · `.bta` |
| 07 | 핵심 인사이트(`insights`) | 관찰→so-what→근거 chip | `.insight-card` · `.so-what` · `.evidence-chips` |
| 08 | 밸류 키워드(`keywords`) | 방향을 감각 언어 3갈래로 | `.bvk-grid`/`.bvk-col` |
| 09 | 전략 대안(`options`) | 3안 점수 비교(하나 추천) | `.strategy-card`(`.recommended`) · `.score-bars` |
| 10 | 추천 전략(`recommendation`) | 원칙·로드맵·하지 않을 것·리스크 | `.reco-hero` · `.principles` · `.roadmap` · `.not-doing` · `.risk` |
| 11 | 출처·근거 추적(`sources`) | 모든 출처(T1~T4)와 사용처 | `.source-card` |

## 마케터 5단계 → 뷰 매핑

`marketer` 산출을 이 순서로 꽂는다:

- RFP/브리프(없으면 대상 사이트 관찰) → **01**
- 대상 브랜드 현황 이해 → **02**
- 1 시장조사 + 2 와이드 리서치(DEEP) → **03**(경쟁 카드) + **04**(XY 맵) + **05**(빈자리)
- 3 디자인 리서치(트렌드·레퍼런스) → **06**(이종·차용)
- 종합 so-what → **07**, 밸류 키워드 → **08**
- 4 발산(방향 후보) → **09**, 추천 → **10**
- 전체 출처 → **11**, 요약 → **00**

## 컴포넌트 규칙

- **경쟁/이종 카드**: `.brand-card`의 `data-type`은 필터 버튼 `data-filter` 키와 반드시 일치(경쟁: `direct/indirect/alternative/adjacent`, 이종: `A/B/C`). 카드마다 출처 링크 + `EV-…` id.
- **그룹 블록**: `.group-block` = 그룹 하나. `.gcount`는 그 그룹 카드 수와 일치.
- **포지셔닝**: `.pm-node`는 `left/top`(%)로 배치, `.pm-node.goal`은 우리 목표 위치 1개(원형). `title`에 좌표 근거(출처 tier).
- **점수 바**: `.score-bars .bar i`의 `width%`는 점수(5→100%, 4→80%…)와 맞춘다. `.strategy-total b`는 합산.
- **네비 뱃지 = 실제 개수**: `overview`의 metric 숫자와 네비 `{{N}}`은 실제 채운 카드 수와 어긋나면 안 된다.

## 원칙 (마케터 산출과 동일)

- **출처 필수** — 모든 브랜드·수치·트렌드 주장에 출처 링크. 없으면 "추정/INFERENCE"로 표기하고 `sources` 뷰 한계에 남긴다.
- **객관 우선** — 유리한 결론 먼저 정하지 않는다. 구도를 그린 뒤 빈자리를 찾는다.
- **빈자리는 기회/함정 구분** — 수요 신호 없는 빈자리는 `.ws-card.trap`.
- **4색 외 신규 색 금지** — 분류가 더 필요하면 tier 재사용으로 해결.
- **PII·미공개 클라이언트 정보 미포함**.
