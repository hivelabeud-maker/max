# COMPONENTS — 재사용 컴포넌트 카탈로그

`template.html`의 CSS 클래스와 1:1 대응. 마크업은 GRAIN 골든(`references/grain-golden-example.html`)에서 실측 추출.
**새로 디자인하지 말 것.** 텍스트만 교체한다. 색: `--t1 #2D7A4F · --t2 #C77A0F · --t3 #999 · --t4 #B23B3B · --link #2454C7`, 카드 `#FFF`, 페이지 `#EBEBEB`.

정보 밀도 유지 원칙: **요약해서 줄이지 않는다.** 상세는 카드 펼침(`<details>`)·모달·필터로 탐색 가능하게.

| # | 컴포넌트 | 클래스 | 용도 |
|---|---|---|---|
| 1 | 프로젝트 요약 카드 | `.snap-item` | Snapshot·Context |
| 2 | RFP 요구사항 카드 | `.req-card` | RFP 4분류 |
| 3 | 브랜드 팩트 카드 | `.snap-item` | Factbook |
| 4 | 타깃 카드 | `.concept-card` | Target |
| 5 | 브랜드 자산 카드 | `.asset-card` | Brand Assets |
| 6 | 브랜드 격차 카드 | `.gap-card` | Brand Gaps |
| 7 | 경쟁 브랜드 카드 | `.brand-card` + `.tier-badge` | Competitor 30+ |
| 8 | 경쟁 유형 필터 | `.filter-bar` | Universe |
| 9 | Category A·B·C 카드 | `.cat-card` + `.brand-grid` | Categories |
| 10 | 출처 등급 배지 | `.tier-badge` | 전역 |
| 11 | 축 후보 카드 | `.axis-card` | Axis 01~03 |
| 12 | XY 포지셔닝 맵 | `.pmap` | Positioning |
| 13 | 좌표 상세 (펼침/모달) | `.coord-detail` / `<details>` | 좌표 근거 |
| 14 | 사분면 분석 카드 | `.quad-card` | Quadrant |
| 15 | 화이트스페이스 카드 | `.ws-card` (유형별) | Whitespace |
| 16 | 이종업계 사례 카드 | `.brand-card` (업계/공명) | Cross-industry |
| 17 | What to Borrow 카드 | `.bta-card.borrow` | Borrow |
| 18 | What to Translate 카드 | `.bta-card.translate` | Translate |
| 19 | What to Avoid 카드 | `.bta-card.avoid` | Avoid |
| 20 | 인사이트 카드 | `.insight-card` | Insights |
| 21 | 전략 대안 카드 | `.concept-card` | Strategy A/B/C |
| 22 | 전략 비교표 | `.compare-table` | Comparison |
| 23 | 리스크 카드 | `.risk-card` | Risk |
| 24 | 출처 목록 | `.src-list` | Sources |
| 25 | 조사 한계 카드 | `.limits` | Limitations |

---

### 2. RFP 요구사항 카드 · `.req-card`
```html
<div class="req-grid">
  <div class="req-card"><div class="rk">명시 요구</div><div class="rv">…</div></div>
  <div class="req-card"><div class="rk">숨은 니즈</div><div class="rv">…</div></div>
  <div class="req-card"><div class="rk">미정의</div><div class="rv">…</div></div>
  <div class="req-card"><div class="rk">위험</div><div class="rv">…</div></div>
</div>
```

### 7. 경쟁 브랜드 카드 · `.brand-card` (필수 최소 항목 + 펼침)
카드 표면엔 최소 항목, 상세는 `<details>`로.
```html
<div class="brand-card" data-type="direct">
  <span class="tier-badge tier-1">T1</span>
  <div class="brand-mark">브랜드명</div>
  <div class="brand-meta"><b>직접</b> · 미국 · $375–475 · 40-60대 콜렉터</div>
  <div class="brand-desc"><b>핵심가치</b> … · <b>포지셔닝</b> … · <b>관련성</b> …</div>
  <details><summary>상세</summary>
    <div class="brand-more">제품특징·경험·비주얼·강점·약점·좌표근거(X/Y)…</div>
  </details>
  <div class="brand-source"><a href="URL" target="_blank">도메인 ↗</a> <span class="ev">EV-C01</span></div>
</div>
```
출처 없으면 `<div class="brand-source">미확인 — 검증 필요 <span class="tier-badge tier-4">T4</span></div>`.

### 8. 경쟁 유형 필터 · `.filter-bar` (JS 토글)
```html
<div class="filter-bar">
  <button data-f="all" class="on">전체</button><button data-f="direct">직접</button>
  <button data-f="indirect">간접</button><button data-f="alternative">대체</button><button data-f="adjacent">인접</button>
</div>
```
JS: 버튼 클릭 시 `.brand-card[data-type]` 표시/숨김.

### 11. 축 후보 카드 · `.axis-card`
```html
<div class="axis-card"><span class="pick on">채택</span><div class="ax">X: 소모품 ↔ 오브젝트</div>
  <p>고객 체감 대립 / 브랜드 차이 드러남 / 좌표 근거 수집 가능</p></div>
```

### 12·13. XY 포지셔닝 맵 + 좌표 펼침 · `.pmap`
```html
<div class="pmap"><div class="pm-title">Brand Positioning Map</div>
  <div class="pm-field">
    <span class="pm-axis top">리추얼</span><span class="pm-axis bottom">향</span>
    <span class="pm-axis left">소모품</span><span class="pm-axis right">오브젝트</span>
    <div class="pm-node" style="top:8%;right:8%;"><div class="pm-goal">OUR<br>Goal</div></div>
    <div class="pm-node" style="top:22%;right:22%;" title="X근거…/Y근거…">Assouline</div>
  </div>
</div>
```
좌표 근거는 `title` 속성 + 하단 `.coord-detail` 목록(모달 대체 가능).

### 14. 사분면 분석 카드 · `.quad-card`
```html
<div class="quad-grid">
  <div class="quad-card"><div class="qh">우상단</div><div class="qb">군집·공백 해석</div></div>
</div>
```

### 15. 화이트스페이스 카드 · `.ws-card` (유형 배지 필수)
```html
<div class="ws-grid">
  <div class="ws-card opp"><span class="ws-type">TRUE OPPORTUNITY</span><div class="h">기회</div>
    <div class="b">Market Gap·Demand·Brand Right·Capability Fit 평가 + 기회점수</div></div>
  <div class="ws-card trap"><span class="ws-type">FALSE WHITE SPACE</span><div class="h">함정</div>
    <div class="b">수요 없는 빈자리 — 리스크</div></div>
</div>
```

### 17·18·19. Borrow / Translate / Avoid · `.bta-card`
```html
<div class="bta-grid">
  <div class="bta-card borrow"><div class="h">WHAT TO BORROW</div><div class="b">가져올 원리</div></div>
  <div class="bta-card translate"><div class="h">WHAT TO TRANSLATE</div><div class="b">변환할 부분</div></div>
  <div class="bta-card avoid"><div class="h">WHAT TO AVOID</div><div class="b">모방 금지</div></div>
</div>
```

### 20. 인사이트 카드 · `.insight-card`
```html
<div class="insight-card"><div class="ih">관찰 → 패턴 → 긴장 → 인사이트</div>
  <div class="ib"><b>관찰</b> … <b>긴장</b> … <b>인사이트</b> …</div>
  <div class="ev">EV-C03, EV-X07 · 확신도 High</div></div>
```

### 21. 전략 대안 카드 · `.concept-card` (자산×기회 연결 필드 필수)
```html
<div class="concept-card" style="border:2px solid var(--t1);"><span class="concept-score" style="color:var(--t1);">28/35</span>
  <div class="concept-rank">A · 추천 ⭐</div><div class="concept-title">전략명</div>
  <div class="concept-field"><b>자산×기회</b> 보유 자산 × 화이트스페이스</div>
  <div class="concept-field"><b>포기</b> 선택 시 버리는 것</div>
  <div class="concept-risk">Risk: …</div></div>
```

### 22. 전략 비교표 · `.compare-table`
7기준(고객가치·브랜드적합·차별·실행·지속·확장·근거) 점수 행. GRAIN `Client×Mood Matrix` 문법 재사용.

### 16·23·24·25 및 1·3·4·5·6·10
1/3(`.snap-item`) · 4/21(`.concept-card`) · 10(`.tier-badge`) · 16(`.brand-card` 업계/공명) ·
23(`.risk-card` 차용✅/배제❌) · 24(`.src-list` + 등급 배지) · 25(`.limits`) — GRAIN 골든 마크업 그대로.

---
## 보조 슬라이드 포맷
16:9 슬라이드가 필요하면 `references/maxos-golden-example.html`(MX 표준 덱) 참조. 기본 리서치·전략 리포트는 GRAIN 스크롤형이 정본.
