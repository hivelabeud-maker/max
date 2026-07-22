# REPORT_SCHEMA — 브랜드 리서치·전략 덱 콘텐츠 구조 (61섹션)

`deck.html`과 정본 `report-data.json`이 담아야 할 콘텐츠 구조. GRAIN 골든 예시(`references/grain-golden-example.html`)의 정보 밀도·흐름을 계승한다.

> 원칙: 데이터 정본은 `report-data.json`(+ `outputs/*.md|json`). HTML에만 데이터를 두지 않는다.
> 모든 수치·브랜드·사례에 출처(T1~T4) + Evidence ID. 없으면 상태 태그(FACT~UNKNOWN)로 표시.
> 프로젝트 성격상 불필요한 섹션은 숨길 수 있으나 **생략 이유를 기록**한다.

---

## HTML 섹션 (4 PART · 61)

### PART 1 — PROJECT & BRAND
1 Cover · 2 Executive Summary · 3 Project Snapshot · 4 RFP / Initial Brief · 5 Project Context ·
6 Brand at a Glance · 7 Brand Factbook · 8 Product·Service·Experience · 9 Target Definition ·
10 Current Brand Identity · 11 Name & Brand Story · 12 Brand Assets · 13 Brand Gaps ·
14 Unknowns & Validation Questions · 15 Current State vs Desired State · 16 Reframed Goal ·
17 Real Problem Definition · 18 Research Agenda

### PART 2 — COMPETITIVE LANDSCAPE
19 Market Definition · 20 Competitive Universe · 21 Direct Competitors · 22 Indirect Competitors ·
23 Alternatives · 24 Adjacent Categories · 25 Competitor Cards 30+ · 26 Competitive Category A ·
27 Competitive Category B · 28 Competitive Category C · 29 Additional Categories · 30 Category Deep Dive ·
31 Axis Candidate 01 · 32 Axis Candidate 02 · 33 Axis Candidate 03 · 34 Selected Axes ·
35 XY Positioning Map · 36 Quadrant Analysis · 37 Whitespace Opportunities · 38 False White Spaces ·
39 Competitive Implications

### PART 3 — CROSS-INDUSTRY RESEARCH
40 Cross-industry Research Scope · 41 Cross-industry Universe 30+ · 42 Cross-industry Case Cards ·
43 Cross-category Group A · 44 Cross-category Group B · 45 Cross-category Group C · 46 Additional Groups ·
47 What to Borrow · 48 What to Translate · 49 What to Avoid

### PART 4 — INSIGHT & STRATEGY
50 Core Findings · 51 Core Insights · 52 Opportunity Areas · 53 Strategy Option A · 54 Strategy Option B ·
55 Strategy Option C · 56 Strategy Comparison · 57 Recommended Strategy · 58 Strategic Principles ·
59 Risk & Validation Plan · 60 Sources · 61 Research Limitations

---

## 최소 통과 기준 (quality-gate 스킬과 연동)
- [ ] 팩트북(7) · 타깃(9) · 진짜 문제(17)
- [ ] 경쟁사 30+ 카드(25) · 3~5 카테고리(26~29) · 축 후보 3(31~33) · 선정 축(34) · XY맵+근거(35) · 화이트스페이스 기회+함정(37~38)
- [ ] 이종업계 30+ 카드(42) · 3~5 카테고리(43~46) · Borrow/Translate/Avoid(47~49)
- [ ] 전략 대안 2+(53~55) · 추천+미선택 이유(57) · 리스크·검증(59) · 출처(60)

---

## report-data.json 골격
```json
{
  "research_mode": "deep",
  "project": {
    "client": "", "project_name": "", "project_type": "", "background": "",
    "stated_request": "", "reframed_goal": "", "real_problem": "",
    "decision_to_make": "", "success_criteria": []
  },
  "brand_factbook": {
    "brand_name": "", "purpose": "", "products_services": [], "targets": [],
    "brand_assets": [], "brand_gaps": [], "unknowns": []
  },
  "competitive_research": {
    "required_count": 30, "actual_count": 0,
    "competitors": [
      { "id": "C01", "name": "", "type": "direct|indirect|alternative|adjacent",
        "country": "", "price": "", "target": "", "buyer_user": "", "value": "",
        "positioning": "", "features": "", "experience": "", "visual": "",
        "strengths": "", "weaknesses": "", "relevance": "",
        "x": 0.0, "x_reason": "", "y": 0.0, "y_reason": "",
        "sources": [ { "tier": "T1", "label": "", "url": "" } ], "confidence": "",
        "evidence_id": "EV-C01", "category": "A" }
    ],
    "categories": [
      { "id": "A", "name": "", "definition": "", "brand_ids": [], "common_target": "",
        "common_value": "", "common_message": "", "common_design": "", "buy_reason": "",
        "strength": "", "limit": "", "oversupplied": "", "undersupplied": "",
        "rep_source": "", "source_count": 0, "confidence": "",
        "deep_dive": { "core_value": "", "reps": [], "desire": "", "message": "",
          "visual": "", "strength": "", "weakness": "", "borrow": "", "avoid": "" } }
    ],
    "axis_candidates": [ { "id": 1, "x": "", "y": "", "picked": true, "reason": "", "reject_reason": "" } ],
    "selected_axes": { "x": { "left": "", "right": "" }, "y": { "top": "", "bottom": "" }, "reason": "", "rejected": [] },
    "positioning_points": [ { "id": "C01", "name": "", "x": 0.0, "y": 0.0, "x_reason": "", "y_reason": "", "evidence_id": "EV-C01", "confidence": "", "goal": false } ],
    "quadrants": [ { "name": "", "brands": [], "reading": "" } ],
    "whitespaces": [ { "name": "", "quadrant": "", "why_empty": "", "demand_signal": "",
      "market_basis": "", "asset_link": "", "feasibility": "", "score": 0, "risk": "",
      "validation": [], "sources": [], "type": "TRUE OPPORTUNITY|EMERGING SPACE|FALSE WHITE SPACE|CAPABILITY GAP" } ]
  },
  "cross_industry_research": {
    "required_count": 30, "actual_count": 0,
    "cases": [
      { "id": "X01", "name": "", "industry": "", "country": "", "problem_solved": "",
        "method": "", "why_worked": "", "customer_value": "", "resonance": "",
        "borrow": "", "avoid": "", "sources": [], "confidence": "", "evidence_id": "EV-X01", "category": "A" }
    ],
    "categories": [ { "id": "A", "name": "", "common_problem": "", "common_principle": "",
      "case_ids": [], "why_works": "", "apply": "", "transform": "", "avoid": "", "rep_source": "" } ],
    "what_to_borrow": [], "what_to_translate": [], "what_to_avoid": []
  },
  "insights": [ { "id": "I1", "observation": "", "evidence_ids": [], "why": "", "tension": "",
    "unmet_need": "", "opportunity": "", "meaning": "", "confidence": "" } ],
  "strategy_options": [ { "id": "A", "name": "", "one_line": "", "problem": "", "target": "",
    "value": "", "differentiation": "", "assets_used": [], "opportunity_link": "",
    "cross_industry_borrow": "", "execution": "", "effect": "", "risk": "", "conditions": "",
    "tradeoff": "", "evidence_ids": [],
    "scores": { "customer": 0, "brand_fit": 0, "differentiation": 0, "feasibility": 0, "durability": 0, "scalability": 0, "evidence": 0 } } ],
  "recommended_strategy": { "option_id": "", "why": "", "not_chosen": [], "why_not": "",
    "principles": [], "priorities": [], "risk": "", "validation": "", "success_criteria": "" },
  "sources": [ { "id": "EV-C01", "tier": "T1", "label": "", "url": "", "for": "" } ],
  "limitations": []
}
```
> 좌표 x/y는 -1.0~1.0. HTML 환산: `left% = (x+1)/2*100`, `top% = (1-(y+1)/2)*100`.
> `actual_count`는 실제 카드 수와 일치해야 한다(quality-gate 대조).
