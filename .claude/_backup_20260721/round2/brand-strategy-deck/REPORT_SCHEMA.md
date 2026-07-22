# REPORT_SCHEMA — 브랜드 리서치·전략 덱 콘텐츠 구조

`deck.html`(그리고 정본 `report-data.json`)이 반드시 담아야 할 **22개 콘텐츠 블록**의 순서·필수 요소를 정의한다.
GRAIN 골든 예시(`references/grain-golden-example.html`)에서 실제로 검증된 흐름이다.

> 원칙: **모든 수치·브랜드·주장에는 출처(매체명 + URL)와 등급(T1~T4)**을 붙인다. 없으면 "추정/미확인"으로 명시.
> 데이터는 `report-data.json`에 먼저 저장하고, HTML은 그로부터 생성한다. HTML에만 존재하는 데이터 금지.

---

## 블록 순서

| # | 블록 | 필수 요소 | 대응 컴포넌트 | JSON 키 |
|---|---|---|---|---|
| 1 | **Project Snapshot** | 클라이언트 · 카테고리 · 조사기준일 · 산출물 | snapshot 카드 | `project` |
| 2 | **RFP / 초기 브리프** | 명시요구 · 숨은니즈 · 미정의 · 위험 (4분류) | cat-bullets | `brief` |
| 3 | **브랜드 팩트북** | 브랜드명 · 제품/서비스 · 가격대 · 헤리티지 · 보유자산 · 지금 인상 | 브랜드 팩트 카드 | `factbook` |
| 4 | **타깃 정의** | 1차/2차 타깃 · 페르소나 · 니즈·불만 | 타깃 카드(concept-card) | `target` |
| 5 | **현재 상태 vs 목표 상태** | 영역별 현재↔목표 대비 표 | flow-table | `gap` |
| 6 | **목표 재정의** | 표면 목표 → 진짜 목표 한 줄 | note | `gap.reframe` |
| 7 | **진짜 해결 문제** | 한 문장 헤드라인 + 근거 3줄 (내부 POV) | pov | `problem` |
| 8 | **시장 정의** | 시장 범위·경계·기준시점 | cat-bullets | `market` |
| 9 | **경쟁사 전체 목록** | 조사 브랜드 전체(이름·업계·국가) | (report-data.json) | `competitors[]` |
| 10 | **경쟁사 카드** | 브랜드마다: 국가·가격대·타깃·핵심메시지·출처·등급 | 경쟁 브랜드 카드 | `competitors[]` |
| 11 | **3~5개 카테고리 군집** | 경쟁사를 A/B/C… 로 군집, 각 공통 관점 1줄 | Category 카드 | `categories[]` |
| 12 | **카테고리별 상세 분석** | 각 군집의 함의 + 소속 브랜드 그리드 | Category + brand-grid | `categories[].brands[]` |
| 13 | **XY축 후보와 선정 근거** | 축 후보 2~3쌍 + 채택/기각 사유 | 축 후보 카드 | `axes.candidates[]` |
| 14 | **XY 포지셔닝 맵** | 채택 X/Y축 + 브랜드 좌표 배치 + Goal 위치 | XY 포지셔닝 맵 | `axes.selected`, `positioning[]` |
| 15 | **사분면 분석** | 4개 사분면 각 군집·공백 해석 | cat-bullets | `positioning_analysis` |
| 16 | **화이트스페이스** | 빈자리 = 우리 자리. **기회 + 함정 반드시 함께** | 화이트스페이스 카드(기회/함정) | `whitespace` |
| 17 | **이종업계 크로스카테고리 사례** | 타 업계에서 공명하는 브랜드 + 공명 지점 + 출처 | 이종업계 레퍼런스 카드 | `cross_category[]` |
| 18 | **핵심 인사이트** | 리서치를 관통하는 한 문장 + 해설 | note | `insight` |
| 19 | **전략 대안** | 서로 겹치지 않는 방향 2~3 + 점수/리스크 | 전략 카드(concept-card) | `strategy_options[]` |
| 20 | **추천 전략** | 1안 + **브랜드 자산 ↔ 시장 기회 연결 논리** + 필드(톤·컬러·모션 등) | 추천 전략(strategy-slide) | `recommended` |
| 21 | **리스크와 검증 계획** | 차용/배제 + 리스크 + 검증(다음 라운드 조사) | 리스크 카드 | `risks[]`, `validation` |
| 22 | **출처와 조사 한계** | 전체 출처 목록(등급별) + 미확보·추정 항목 명시 | 출처 목록 | `sources[]`, `limits` |

---

## 최소 통과 기준 (이게 없으면 덱을 내지 않는다)

- [ ] 브랜드 팩트북이 채워졌는가 (블록 3)
- [ ] 경쟁사 카드 + 최소 3개 카테고리 군집 (블록 10~11)
- [ ] **모든 경쟁/이종 카드에 출처 또는 "미확인" 라벨** (블록 10·17·22)
- [ ] XY맵에 축 선정 근거가 있는가 (블록 13~14)
- [ ] 화이트스페이스에 **기회와 함정이 함께** (블록 16)
- [ ] 추천 전략이 브랜드 자산과 시장 기회를 **연결**하는가 (블록 20)

---

## report-data.json 골격

```json
{
  "project":   { "name": "", "title": "", "client": "", "category": "", "as_of": "YYYY.MM", "deliverable": "" },
  "brief":     { "explicit": [], "hidden": [], "undefined": [], "risks": [] },
  "factbook":  { "title": "", "cards": [ { "k": "", "v": "" } ], "note": "", "assets": [] },
  "target":    { "title": "", "personas": [ { "name": "", "who": "", "needs": "", "pains": "" } ] },
  "gap":       { "title": "", "rows": [ { "area": "", "current": "", "goal": "" } ], "reframe": "" },
  "problem":   { "headline": "", "body": "" },
  "market":    { "title": "", "bullets": [] },
  "competitors": [
    { "name": "", "industry": "", "country": "", "price": "", "target": "", "message": "",
      "tier": "T1|T2|T3|T4", "sources": [ { "label": "", "url": "" } ], "category": "A" }
  ],
  "categories": [ { "id": "A", "title": "", "bullets": [], "brand_ids": [] } ],
  "axes": {
    "candidates": [ { "axis": "", "picked": true, "reason": "" } ],
    "selected":  { "x": { "left": "", "right": "" }, "y": { "top": "", "bottom": "" } }
  },
  "positioning": [ { "name": "", "x": 0.0, "y": 0.0, "goal": false } ],
  "positioning_analysis": [],
  "whitespace": { "opportunity": "", "trap": "" },
  "cross_category": [
    { "name": "", "industry": "", "country": "", "resonance": "", "tier": "T1", "sources": [ { "label": "", "url": "" } ] }
  ],
  "insight": { "headline": "", "body": "" },
  "strategy_options": [ { "rank": "", "title": "", "mood": "", "fields": [], "score": "", "risk": "" } ],
  "recommended": {
    "label": "", "title": "", "bg_image": "",
    "asset_opportunity_link": "",
    "fields": [ { "k": "", "v": "", "d": "" } ]
  },
  "risks": [ { "keep": [], "drop": [] } ],
  "validation": "",
  "sources": [ { "tier": "T1", "label": "", "url": "" } ],
  "limits": ""
}
```

> 좌표(`positioning[].x/y`)는 -1.0 ~ 1.0 정규화. 0,0 = 원점. Goal은 `goal:true`.
> HTML 생성 시 `x`,`y`를 `left%`,`top%`로 환산(예: `left = (x+1)/2*100`).
