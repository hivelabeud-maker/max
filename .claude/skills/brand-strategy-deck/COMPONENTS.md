# COMPONENTS — 대시보드 컴포넌트 카탈로그

`template.html`의 CSS 클래스와 1:1 대응. **`render.py`가 이 마크업을 자동으로 만든다** — 손으로 새로 짜지 않는다.
이 문서는 새 컴포넌트가 필요할 때(예: 새 뷰 추가) 기존 패턴을 참고하는 용도다.

색은 기본 모노톤 + `SKILL.md`의 포인트 4색 표만 쓴다(블루·라임·핑크·오렌지).

| 컴포넌트 | 클래스 | 쓰는 뷰 |
|---|---|---|
| 지표 카드 | `.card.metric` | 00 요약 |
| 진행 파이프라인 | `.flow` `.flow-step` | 00 요약 |
| 추천 결론 히어로 | `.decision` `.decision-side` | 00 요약 |
| 요청→재정의 대비 | `.request-vs` `.request-box` `.request-box.real` | 01 브리프 |
| 확인 질문 리스트 | `.question-list` `.question` | 01 브리프 |
| 조사 스트림 카드 | `.streams` `.stream` | 03 경쟁 리서치 |
| 필터+검색 바 | `.filters` `.filter` `.search` | 03·06 표 상단 |
| 데이터 표 | `.table-wrap` `.table` | 03·06 |
| Evidence ID 칩 | `.eid` | 표·인사이트 |
| 신뢰도 점 | `.confidence` (i.on = 채움) | 03 표 |
| 출처 등급 배지 | `.source-type.t1~t4` | 03·06 표, 10 출처 |
| 카테고리 카드 | `.cat-cards` `.cat-card2` | 03·06 |
| 축 후보 카드 | `.axis-grid` `.axis-card` `.axis-card.on` | 04 포지셔닝 |
| 포지셔닝 맵 | `.pmap` `.pm-field` `.pm-node` `.pm-node.goal` | 04 포지셔닝 |
| 화이트스페이스 카드 | `.ws-grid` `.ws-card.opp` `.ws-card.trap` `.ws-type` | 05 화이트스페이스 |
| Borrow/Translate/Avoid | `.bta` `.bta-card.b/.t/.a` | 06 이종업계 |
| 인사이트 카드 | `.insight-card` `.so-what` `.evidence-chips` | 07 인사이트 |
| 전략 카드(점수바) | `.strategy-card` `.strategy-card.recommended` `.score-bars` | 08 전략 대안 |
| 추천 히어로 | `.reco-hero` `.reco-head` `.reco-score` | 09 추천 전략 |
| 실행 원칙 | `.principles` `.principle` | 09 추천 전략 |
| 실행 로드맵 | `.roadmap` `.phase` | 09 추천 전략 |
| 하지 않을 것 | `.not-doing` `.no-card` | 09 추천 전략 |
| 리스크 행 | `.risk` `.risk-level.high/.medium` | 09 추천 전략 |
| 출처 카드 | `.source-card` | 10 출처 |
| 상태 태그 | `.tag` `.tag.green/.amber/.blue/.red` | 전역 |

---

## 필드 요구사항 (render.py가 읽는 최소 필드)

### 경쟁 브랜드 카드 (표 행)
브랜드명 · 경쟁 유형(direct/indirect/alternative/adjacent) · 국가 · 가격대 · 핵심 가치 · 포지셔닝 ·
우리와의 관련성 · 출처(tier+url) · 확신도 · Evidence ID. → `report-data.json: competitive_research.competitors[]`

### 이종업계 사례 (표 행)
사례명 · 산업 · 국가 · 해결한 문제 · 방식 · 빌릴 원리 · 출처(tier+url) · Evidence ID.
→ `report-data.json: cross_industry_research.cases[]`

### 출처 등급 (전역 규칙)
- `T1` 공식 홈페이지·공시·공식 인터뷰·정부/기관 자료 → 블루
- `T2` 신뢰 언론·산업 리포트·전문 매체 → 라임
- `T3` 유통 사이트·리뷰·커뮤니티 → 핑크
- `T4` 추정·미검증 → 오렌지, 본문 근거로 쓰지 않고 검증 대상으로 표시

### 화이트스페이스 카드
이름 · 사분면 · 왜 비었나 · 수요 신호 · 시장 근거 · 유형(`TRUE OPPORTUNITY`/`EMERGING SPACE`/`FALSE WHITE SPACE`/`CAPABILITY GAP`).
opp(기회) 계열은 라임, trap(함정) 계열은 오렌지.

### 전략 대안 카드
전략명 · 한 줄 요약 · 자산×기회 연결 · 위험 · 포기할 것 · 7기준 점수(customer/differentiation/feasibility/durability/evidence 등, 0~5) · 종합점수(0~35).
추천안은 `.strategy-card.recommended` + 리본, 색은 모노톤 강조(포인트색 남용 금지).
