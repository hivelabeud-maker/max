# REPORT_SCHEMA — 브랜드 리서치·전략 덱 콘텐츠 구조

`deck.html`(좌측 번호 네비게이터형 대시보드)과 정본 `report-data.json`이 담아야 할 콘텐츠 구조.

> 원칙: 데이터 정본은 `report-data.json`(+ `outputs/*.md|json`). HTML에만 데이터를 두지 않는다.
> 모든 수치·브랜드·사례에 출처(T1~T4) + Evidence ID. 없으면 상태 태그(FACT~UNKNOWN)로 표시.
> `render.py`가 아래 12개 뷰를 `report-data.json` 하나로 자동 생성한다 — 뷰를 프로젝트마다 새로 짜지 않는다.
> 경쟁사·이종업계 리스트는 **표가 아니라 카드 그리드**(그룹 헤더 + 카드, 상단 필터 탭 유지)로 렌더링한다. 리스트가 길어질수록 표보다 스캔이 쉽다.

---

## HTML 뷰 (좌측 네비게이터 00~11)

| # | 뷰 | 담는 내용 | report-data.json 소스 |
|---|---|---|---|
| 00 | 요약 대시보드 | 핵심 지표 4개 · 진행 파이프라인 · 추천 결론 요약 | project, recommended_strategy, insights[:3] |
| 01 | 브리프·문제 정의 | 클라이언트 요청 → 재정의 목표 → 진짜 문제 · 미확인 사항 | project, brand_factbook.unknowns |
| 02 | 브랜드 팩트북 | 목적·제공물·자산·격차·타깃 | brand_factbook |
| 03 | 경쟁 리서치 | 경쟁·대체 30+ **카드 그리드**(카테고리 그룹 + 유형 필터 탭) + 3~5 카테고리 | competitive_research.competitors/categories |
| 04 | 포지셔닝 맵 | 축 후보 3+ → 선정 축 → 좌표(근거 포함) | competitive_research.axis_candidates/selected_axes/positioning_points |
| 05 | 화이트스페이스 | 기회(TRUE/EMERGING) vs 함정(FALSE/CAPABILITY GAP) | competitive_research.whitespaces |
| 06 | 이종업계 | 사례 30+ **카드 그리드**(그룹 필터 탭) + 3~5 그룹 + Borrow/Translate/Avoid | cross_industry_research |
| 07 | 핵심 인사이트 | 관찰→긴장→so what, Evidence ID 연결 | insights |
| 08 | 브랜드 밸류 키워드 | 인사이트를 감각 언어 3갈래(A/B/C)로 번역 · 태그·설명·그래픽/사운드 힌트 | brand_value_keywords |
| 09 | 전략 대안 | 옵션별 7기준 점수바 비교 | strategy_options |
| 10 | 추천 전략 | 추천 이유·원칙·우선순위·하지 않을 것·리스크 | recommended_strategy |
| 11 | 출처·근거 추적 | 전체 출처 목록 + 조사 한계 | sources, limitations |

## 최소 통과 기준 (quality-gate 스킬과 연동)
- [ ] 팩트북(02) · 타깃 · 진짜 문제(01)
- [ ] 경쟁사 30+ 카드(03) · 3~5 카테고리(03) · 축 후보 3+(04) · 선정 축 근거(04) · 좌표 근거(04) · 화이트스페이스 기회+함정(05)
- [ ] 이종업계 30+ 카드(06) · 3~5 그룹(06) · Borrow/Translate/Avoid(06)
- [ ] 브랜드 밸류 키워드 3갈래(08) · 각 클러스터가 인사이트에 연결 · 감각이 서로 다름
- [ ] 전략 대안 2+(09) · 추천+미선택 이유(10) · 리스크·검증(10) · 출처(11)

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
  "brand_value_keywords": [
    { "id": "A", "title_top": "", "title_bottom": "", "tags": [], "description": "",
      "sensory_label": "그래픽 모티프·사운드", "sensory_note": "", "source_insight": "I1" }
  ],
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
