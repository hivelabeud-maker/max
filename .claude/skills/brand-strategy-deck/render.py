# -*- coding: utf-8 -*-
"""report-data.json → deck.html (Research & Strategy OS 대시보드 셸).
좌측 번호 네비 + 뷰 전환. 문장은 쉬운 우리말·한 문장 한 생각(anti-ai/dumbify)."""
import html, json
def e(s): return html.escape(str(s), quote=True)
TIERC={"T1":"t1","T2":"t2","T3":"t3","T4":"t4"}
def conf_dots(c):
    n={"High":3,"Mid":2,"Low":1}.get(c,2)
    return '<span class="confidence">'+''.join(f'<i class="{"on" if i<n else ""}"></i>' for i in range(3))+'</span>'
def pct(v,mx=5): return f"{v/mx*100:.0f}%"

def overview(d):
    p=d["project"]; r=d["recommended_strategy"]; cr=d["competitive_research"]; xr=d["cross_industry_research"]
    rec=next((s for s in d["strategy_options"] if s["id"]==r["option"]), d["strategy_options"][0])
    score=round(rec["total"]/35*100)
    t1=sum(1 for c in cr["competitors"] if c["sources"][0]["tier"]=="T1")
    metrics=[("검토한 브랜드·사례",cr["actual_count"]+xr["actual_count"],f"경쟁 {cr['actual_count']} · 이종 {xr['actual_count']}"),
        ("공식(T1) 출처",t1,"핵심 브랜드 교차검증"),("핵심 인사이트",len(d["insights"]),"전략까지 연결"),
        ("추천 전략 점수",score,f"7개 기준 합산 {rec['total']}/35")]
    mcards="".join(f'<div class="card metric"><div class="label">{e(k)}</div><div class="value">{v}</div><div class="sub">{e(s)}</div></div>' for k,v,s in metrics)
    steps=[("01","브리프","요청·목표·제약"),("02","문제 정의","진짜 결정 문제"),("03","팩트북","브랜드 사전 이해"),
        ("04","경쟁 리서치",f"{cr['actual_count']}개 조사"),("05","포지셔닝","축·좌표 근거"),("06","이종업계",f"{xr['actual_count']}개 차용"),
        ("07","인사이트","패턴·긴장·기회"),("08","전략","3개 비교")]
    flow="".join(f'<div class="flow-step done"><span class="check">✓</span><div class="num">{n}</div><strong>{e(t)}</strong><span>{e(s)}</span></div>' for n,t,s in steps[:-1])
    flow+=f'<div class="flow-step active"><div class="num">08</div><strong>{e(steps[-1][1])}</strong><span>{e(steps[-1][2])}</span></div>'
    keyev="".join(f'<div class="card flat"><span class="eid">{e(i["evidence_ids"][0])}</span><h3 style="margin-top:12px">{e(i["observation"])}.</h3><p>{e(i["opportunity"])}</p></div>' for i in d["insights"][:3])
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">PROJECT OVERVIEW</div>'
        f'<h2>한눈에 보는 결론과 진행 상태</h2><p>결론을 먼저 보고, 필요하면 근거와 사고 과정으로 내려갑니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">근거 검증 완료</span><span class="tag amber">리더 승인 대기</span><span class="tag">{e(d["research_mode"].upper())}</span></div></div>'
        f'<div class="grid cols-4">{mcards}</div>'
        f'<div class="section-title"><h3>진행 파이프라인</h3><p>품질 게이트는 고정, 조사 방식은 유동</p></div><div class="flow">{flow}</div>'
        f'<div class="section-title"><h3>이번 프로젝트의 추천 결론</h3><p>자세한 내용은 ‘추천 전략’에서</p></div>'
        f'<div class="decision"><div><div class="eyebrow">RECOMMENDED</div><h3>{e(rec["name"])}</h3><p>{e(rec["one_line"])}</p></div>'
        f'<div class="decision-side"><div class="eyebrow">STRATEGY SCORE</div><div class="score">{score}<small>/100</small></div>'
        f'<div class="why">{e(r["why"])}</div></div></div>'
        f'<div class="section-title"><h3>핵심 판단 근거</h3><p>결론에 바로 연결된 세 가지</p></div><div class="grid cols-3">{keyev}</div>')

def brief(d):
    p=d["project"]; f=d["brand_factbook"]
    unk="".join(f'<div class="question"><div><strong>{e(u)}</strong><span>확인 전까지 사실로 쓰지 않습니다</span></div><span class="tag amber">미확인</span></div>' for u in f["unknowns"])
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">BRIEF & PROBLEM</div>'
        f'<h2>요청을 그대로 하지 않고, 결정 문제로 바꿉니다</h2><p>가장 먼저 승인해야 하는 구간입니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">Gate 01 통과</span></div></div>'
        f'<div class="request-vs"><div class="request-box"><div class="label">CLIENT REQUEST</div><h3>{e(p["stated_request"])}</h3>'
        f'<p>요청 산출물 중심의 초기 브리프입니다.</p></div><div class="arrow">→</div>'
        f'<div class="request-box real"><div class="label">REFRAMED PROBLEM</div><h3>{e(p["real_problem"])}</h3>'
        f'<p>{e(p["reframed_goal"])}</p></div></div>'
        f'<div class="grid cols-2" style="margin-top:13px"><div class="card"><h3>의사결정 구조</h3><dl>'
        f'<div class="kv"><dt>고객사</dt><dd>{e(p["client"])}</dd></div>'
        f'<div class="kv"><dt>프로젝트 유형</dt><dd>{e(p["project_type"])}</dd></div>'
        f'<div class="kv"><dt>내려야 할 결정</dt><dd>{e(p["decision_to_make"])}</dd></div>'
        f'<div class="kv"><dt>성공 기준</dt><dd>{e(" · ".join(p["success_criteria"]))}</dd></div></dl></div>'
        f'<div class="card"><h3>배경과 목표</h3><dl>'
        f'<div class="kv"><dt>시작 배경</dt><dd>{e(p["background"])}</dd></div>'
        f'<div class="kv"><dt>재정의한 목표</dt><dd>{e(p["reframed_goal"])}</dd></div></dl></div></div>'
        f'<div class="section-title"><h3>지금의 가정과 미확인 사항</h3><p>추측을 사실처럼 쓰지 않도록 드러냅니다</p></div>'
        f'<div class="card flat"><div class="question-list">{unk}</div></div>')

def factbook(d):
    f=d["brand_factbook"]
    prod="".join(f"<div class='kv'><dt>제공물</dt><dd>{e(x)}</dd></div>" for x in f["products_services"])
    tgt="".join(f'<div class="card flat"><div class="eyebrow">TARGET</div><p style="margin-top:8px">{e(t)}</p></div>' for t in f["targets"])
    assets="".join(f'<li>{e(a)}</li>' for a in f["brand_assets"])
    gaps="".join(f'<li>{e(g)}</li>' for g in f["brand_gaps"])
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">BRAND FACTBOOK</div>'
        f'<h2>시장을 보기 전에 브랜드부터 이해합니다</h2><p>이후 문제 정의와 시장조사의 기준이 되는 문서입니다.</p></div>'
        f'<div class="head-meta"><span class="tag blue">{e(f["brand_name"])}</span></div></div>'
        f'<div class="grid cols-2"><div class="card"><h3>브랜드 기본</h3><dl>'
        f'<div class="kv"><dt>브랜드</dt><dd>{e(f["brand_name"])}</dd></div>'
        f'<div class="kv"><dt>한 줄 목적</dt><dd>{e(f["purpose"])}</dd></div>{prod}</dl></div>'
        f'<div class="card"><h3>자산과 격차</h3>'
        f'<p style="font-weight:700;color:var(--green);margin:0 0 5px">쓸 수 있는 자산</p><ul style="margin:0 0 12px;padding-left:16px;font-size:11px;line-height:1.7">{assets}</ul>'
        f'<p style="font-weight:700;color:var(--red);margin:0 0 5px">메워야 할 격차</p><ul style="margin:0;padding-left:16px;font-size:11px;line-height:1.7">{gaps}</ul></div></div>'
        f'<div class="section-title"><h3>타깃</h3><p>인구통계가 아니라 행동·욕구·선택 기준으로</p></div><div class="grid cols-2">{tgt}</div>')

def competitors(d):
    cr=d["competitive_research"]
    types={"direct":"직접","indirect":"간접","alternative":"대체","adjacent":"인접"}
    cnt={k:sum(1 for c in cr["competitors"] if c["type"]==k) for k in types}
    streams="".join(f'<div class="stream active"><div class="count">{cnt[k]:02d}</div><strong>{e(v)} 경쟁</strong><p>{e({"direct":"같은 값·같은 고객","indirect":"다른 방식 같은 니즈","alternative":"향을 대신하는 선택","adjacent":"곁의 인접 시장"}[k])}</p></div>' for k,v in types.items())
    rows=""
    for c in cr["competitors"]:
        s=c["sources"][0]
        rows+=(f'<tr data-type="{e(c["type"])}"><td><span class="eid">{e(c["evidence_id"])}</span></td>'
            f'<td>{e(types.get(c["type"],c["type"]))}</td><td><b>{e(c["name"])}</b><br><span style="color:#999">{e(c["country"])} · {e(c["price"])}</span></td>'
            f'<td>{e(c["value"])}<br><span style="color:#999">{e(c["positioning"])}</span></td><td>{e(c["relevance"])}</td>'
            f'<td><span class="source-type {TIERC[s["tier"]]}">{e(s["tier"])}</span></td><td>{conf_dots(c["confidence"])}</td>'
            f'<td><a class="claim-link" href="https://{e(s["url"].split("//")[-1])}" target="_blank">출처↗</a></td></tr>')
    filt=('<div class="filters" data-table="compTable"><button class="filter active" data-filter="all">전체</button>'
        +''.join(f'<button class="filter" data-filter="{k}">{e(v)}</button>' for k,v in types.items())
        +'<input class="search" placeholder="브랜드·가치 검색" /></div>')
    cats="".join(f'<div class="cat-card2"><div class="cid">Category {c["id"]}</div><h4>{e(c["name"])}</h4>'
        f'<div class="brands">{e(" · ".join(c["brand_ids"]))}</div>'
        f'<div class="sw"><b>강점</b> {e(c["strength"])}<br><b>한계</b> {e(c["limit"])}</div></div>' for c in cr["categories"] if c["id"] in ("A","B","C"))
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">COMPETITIVE RESEARCH</div>'
        f'<h2>경쟁·대체 브랜드 {cr["actual_count"]}개를 한 표에서 봅니다</h2><p>사실·해석·출처를 나눠 담고, 프로젝트와 연결되는 것만 남깁니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">{cr["actual_count"]}개 조사</span><span class="tag">목표 {cr["required_count"]}+</span></div></div>'
        f'<div class="streams">{streams}</div>'
        f'<div class="section-title"><h3>경쟁 브랜드 표</h3><p>유형으로 거르거나 검색하세요</p></div>{filt}'
        f'<div class="table-wrap"><table class="table" id="compTable"><thead><tr><th>ID</th><th>유형</th><th>브랜드</th><th>핵심 가치·포지셔닝</th><th>우리와 연결</th><th>출처</th><th>신뢰도</th><th>링크</th></tr></thead><tbody>{rows}</tbody></table></div>'
        f'<div class="section-title"><h3>3개 카테고리 군집</h3><p>데이터에서 나온 묶음(그룹 먼저 정하지 않음)</p></div><div class="cat-cards">{cats}</div>')

def positioning(d):
    cr=d["competitive_research"]; s=cr["selected_axes"]
    ac="".join(f'<div class="axis-card {"on" if a["picked"] else ""}"><span class="pick {"y" if a["picked"] else "n"}">{"채택" if a["picked"] else "제외"}</span>'
        f'<div class="ax">{e(a["x"])}</div><p>{e(a["reason"])}</p></div>' for a in cr["axis_candidates"])
    nodes=f'<div class="pm-node goal" style="left:90%;top:8%;">{e(d["brand_factbook"]["brand_name"])}<br>목표</div>'
    for pt in cr["positioning_points"]:
        left=(pt["x"]+1)/2*100; top=(1-(pt["y"]+1)/2)*100
        nodes+=f'<div class="pm-node" style="left:{left:.0f}%;top:{top:.0f}%;" title="X: {e(pt["x_reason"])} / Y: {e(pt["y_reason"])}">{e(pt["name"])}</div>'
    quad="".join(f'<div class="card flat"><h3 style="margin:0 0 6px">{e(q["name"])}</h3><p>{e(q["reading"])}</p></div>' for q in cr["quadrants"])
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">POSITIONING MAP</div>'
        f'<h2>축부터 고르고, 근거 있는 좌표만 찍습니다</h2><p>감으로 점을 찍지 않습니다. 근거 없는 브랜드는 맵에서 뺍니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">축 후보 {len(cr["axis_candidates"])}개</span></div></div>'
        f'<div class="section-title"><h3>축 후보</h3><p>고객이 실제로 느끼는 대립인지 확인</p></div><div class="axis-grid">{ac}</div>'
        f'<div class="section-title"><h3>포지셔닝 맵</h3><p>선정 축: {e(s["reason"])}</p></div>'
        f'<div class="pmap"><div class="pm-title">Brand Positioning Map</div><div class="pm-field">'
        f'<span class="pm-axis top">{e(s["y_top"])}</span><span class="pm-axis bottom">{e(s["y_bottom"])}</span>'
        f'<span class="pm-axis left">{e(s["x_left"])}</span><span class="pm-axis right">{e(s["x_right"])}</span>{nodes}</div></div>'
        f'<div class="section-title"><h3>사분면 읽기</h3><p>어디가 붐비고 어디가 비었나</p></div><div class="grid cols-2">{quad}</div>')

def whitespace(d):
    cr=d["competitive_research"]
    cards=""
    for w in cr["whitespaces"]:
        cls="opp" if w["kind"]=="opp" else "trap"
        cards+=(f'<div class="ws-card {cls}"><span class="ws-type">{e(w["type"])}</span><h4>{e(w["name"])}</h4>'
            f'<p><b>어디:</b> {e(w["quadrant"])}</p><p><b>왜 비었나:</b> {e(w["why_empty"])}</p>'
            f'<p><b>수요 신호:</b> {e(w["demand_signal"])}</p><div class="crit"><b>근거:</b> {e(w["market_basis"])}</div></div>')
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">WHITESPACE</div>'
        f'<h2>빈자리를 기회와 함정으로 나눕니다</h2><p>비어 있다고 다 기회가 아닙니다. 수요·정당성·역량을 함께 봅니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">기회</span><span class="tag red">함정</span></div></div>'
        f'<div class="ws-grid">{cards}</div>'
        f'<div class="card flat" style="margin-top:14px"><h3>판단 기준 4가지</h3><dl>'
        f'<div class="kv"><dt>Market Gap</dt><dd>정말 공급이 부족한가</dd></div>'
        f'<div class="kv"><dt>Customer Demand</dt><dd>사려는 신호가 있는가</dd></div>'
        f'<div class="kv"><dt>Brand Right</dt><dd>우리가 그 자리를 차지할 이유가 있는가</dd></div>'
        f'<div class="kv"><dt>Capability Fit</dt><dd>실제로 만들 수 있는가</dd></div></dl></div>')

def cross(d):
    xr=d["cross_industry_research"]
    rows=""
    for c in xr["cases"]:
        s=c["sources"][0]
        rows+=(f'<tr data-type="{e(c["category"])}"><td><span class="eid">{e(c["evidence_id"])}</span></td>'
            f'<td><b>{e(c["name"])}</b><br><span style="color:#999">{e(c["industry"])} · {e(c["country"])}</span></td>'
            f'<td>{e(c["problem_solved"])}</td><td>{e(c["method"])}</td><td><b>{e(c["borrow"])}</b></td>'
            f'<td><span class="source-type {TIERC[s["tier"]]}">{e(s["tier"])}</span></td>'
            f'<td><a class="claim-link" href="https://{e(s["url"].split("//")[-1])}" target="_blank">출처↗</a></td></tr>')
    filt=('<div class="filters" data-table="crossTable"><button class="filter active" data-filter="all">전체</button>'
        +''.join(f'<button class="filter" data-filter="{c["id"]}">{e(c["name"][:10])}</button>' for c in xr["categories"])
        +'<input class="search" placeholder="사례·원리 검색" /></div>')
    cats="".join(f'<div class="cat-card2"><div class="cid">Group {c["id"]}</div><h4>{e(c["name"])}</h4>'
        f'<div class="brands">{e(" · ".join(c["case_names"]))}</div>'
        f'<div class="sw"><b>원리</b> {e(c["common_principle"])}<br><b>적용</b> {e(c["apply"])}</div></div>' for c in xr["categories"])
    def li(items): return "".join(f"<li>{e(x)}</li>" for x in items)
    bta=(f'<div class="bta"><div class="bta-card b"><h4>WHAT TO BORROW · 가져올 원리</h4><ul>{li(xr["what_to_borrow"])}</ul></div>'
        f'<div class="bta-card t"><h4>WHAT TO TRANSLATE · 우리식으로 바꿀 것</h4><ul>{li(xr["what_to_translate"])}</ul></div>'
        f'<div class="bta-card a"><h4>WHAT TO AVOID · 따라하면 안 될 것</h4><ul>{li(xr["what_to_avoid"])}</ul></div></div>')
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">CROSS-INDUSTRY</div>'
        f'<h2>다른 업계 {xr["actual_count"]}곳에서 원리만 빌립니다</h2><p>유명해서가 아니라, 우리 문제와 맞닿는 사례만 골랐습니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">{xr["actual_count"]}개</span><span class="tag">목표 {xr["required_count"]}+</span></div></div>'
        f'{filt}<div class="table-wrap"><table class="table" id="crossTable"><thead><tr><th>ID</th><th>사례</th><th>해결한 문제</th><th>방식</th><th>빌릴 원리</th><th>출처</th><th>링크</th></tr></thead><tbody>{rows}</tbody></table></div>'
        f'<div class="section-title"><h3>3개 그룹</h3><p>공통 원리로 묶음</p></div><div class="cat-cards">{cats}</div>'
        f'<div class="section-title"><h3>가져오기 · 바꾸기 · 피하기</h3><p>표면 모방을 막는 정리</p></div>{bta}')

def insights(d):
    cards=""
    for i in d["insights"]:
        chips="".join(f"<span>{e(x)}</span>" for x in i["evidence_ids"])
        cards+=(f'<article class="insight-card"><div class="index">{e(i["id"])} · 확신도 {e(i["confidence"])}</div>'
            f'<h3>{e(i["observation"])}.</h3><p><b>왜:</b> {e(i["why"])} <b>긴장:</b> {e(i["tension"])}</p>'
            f'<div class="so-what"><div class="label">SO WHAT</div><strong>{e(i["opportunity"])}</strong></div>'
            f'<div class="evidence-chips">{chips}</div></article>')
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">KEY INSIGHTS</div>'
        f'<h2>요약이 아니라, 전략에 쓸 의미로 바꿉니다</h2><p>각 인사이트는 근거와 “그래서 뭘 하나”를 함께 답합니다.</p></div>'
        f'<div class="head-meta"><span class="tag green">근거 연결 100%</span></div></div><div class="grid cols-3">{cards}</div>')

def options(d):
    labels=[("customer","고객가치"),("differentiation","차별성"),("feasibility","실행성"),("durability","지속성"),("evidence","근거")]
    cards=""
    rec=d["recommended_strategy"]["option"]
    for s in d["strategy_options"]:
        bars="".join(f'<div class="score-row"><span>{e(lab)}</span><div class="bar"><i style="width:{pct(s["scores"][k])}"></i></div><b>{s["scores"][k]}</b></div>' for k,lab in labels)
        rib='<span class="recommended-ribbon">추천</span>' if s["id"]==rec else ''
        cls=" recommended" if s["id"]==rec else ""
        cards+=(f'<article class="strategy-card{cls}">{rib}<div class="strategy-no">OPTION {e(s["id"])}</div>'
            f'<h3>{e(s["name"])}</h3><div class="one-line">{e(s["one_line"])}</div><div class="score-bars">{bars}</div>'
            f'<ul class="strategy-list"><li><strong>자산×기회</strong><span>{e("/".join(s["assets_used"]))} × {e(s["opportunity_link"])}</span></li>'
            f'<li><strong>위험</strong><span>{e(s["risk"])}</span></li><li><strong>포기</strong><span>{e(s.get("conditions",""))}</span></li></ul>'
            f'<div class="strategy-total"><span>종합</span><b>{s["total"]}</b></div></article>')
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">STRATEGY OPTIONS</div>'
        f'<h2>한 안이 아니라, 다른 선택지를 견줍니다</h2><p>무엇을 고르고 무엇을 버리는지 보여야 전략입니다.</p></div>'
        f'<div class="head-meta"><span class="tag">7개 기준 비교</span></div></div><div class="grid cols-3">{cards}</div>')

def recommendation(d):
    r=d["recommended_strategy"]
    rec=next((s for s in d["strategy_options"] if s["id"]==r["option"]), d["strategy_options"][0])
    score=round(rec["total"]/35*100)
    pr="".join(f'<div class="principle"><div class="n">{i+1:02d}</div><h4>{e(x)}</h4></div>' for i,x in enumerate(r["principles"]))
    ph="".join(f'<div class="phase"><div class="time">우선순위 {i+1}</div><h4>{e(x)}</h4></div>' for i,x in enumerate(r["priorities"]))
    nd=f'<div class="no-card"><strong>{e(r["not_chosen"])}</strong><p>{e(r["why_not"])}</p></div>'
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">RECOMMENDED STRATEGY</div>'
        f'<h2>추천안은 실행 원칙과 포기 항목까지 보여줍니다</h2><p>전략 문서의 최종 본문이자 다음 디자인 단계의 입력입니다.</p></div>'
        f'<div class="head-meta"><span class="tag amber">리더 승인 대기</span></div></div>'
        f'<div class="reco-hero"><div class="reco-head"><div><div class="eyebrow" style="color:rgba(255,255,255,.55)">RECOMMENDED</div>'
        f'<h3>{e(rec["name"])}</h3><p>{e(rec["one_line"])}<br><br><b style="color:#fff">추천 이유:</b> {e(r["why"])}</p></div>'
        f'<div class="reco-score"><b>{score}</b><span>SCORE / 100</span></div></div>'
        f'<div class="reco-body"><div class="section-title" style="margin-top:0"><h3>전략 원칙</h3><p>모든 실행을 판단하는 기준</p></div>'
        f'<div class="principles">{pr}</div>'
        f'<div class="section-title"><h3>실행 우선순위</h3></div><div class="roadmap">{ph}</div>'
        f'<div class="section-title"><h3>하지 않을 것</h3><p>전략의 경계</p></div><div class="not-doing">{nd}</div>'
        f'<div class="section-title"><h3>리스크와 검증</h3></div>'
        f'<div class="risk"><strong>{e(r["risk"])}</strong><span><b class="risk-level high">높음</b></span><span>핵심 위험</span><span>{e(r["validation"])}</span></div>'
        f'<div class="risk"><strong>성공 기준</strong><span><b class="risk-level medium">지표</b></span><span>측정</span><span>{e(r["success"])}</span></div>'
        f'</div></div>')

def sources(d):
    seen=set(); cards=""
    for s in d["sources"]:
        if (s["id"],s["url"]) in seen: continue
        seen.add((s["id"],s["url"]))
        cards+=(f'<div class="source-card"><div class="domain"><span class="source-type {TIERC[s["tier"]]}">{e(s["tier"])}</span><br>{e(s["for"])}</div>'
            f'<div><h4>{e(s["label"])}</h4><p><a href="{e(s["url"])}" target="_blank">{e(s["url"].split("//")[-1])} ↗</a></p></div>'
            f'<span class="used">{e(s["id"])}</span></div>')
    lim="".join(f'<div class="kv"><dt>한계</dt><dd>{e(x)}</dd></div>' for x in d["limitations"])
    return (f'<div class="page-head"><div class="page-title"><div class="eyebrow">SOURCES & LIMITS</div>'
        f'<h2>출처는 부록이 아니라 전략의 증거 지도입니다</h2><p>어떤 근거가 어디에 쓰였는지 추적합니다.</p></div>'
        f'<div class="head-meta"><span class="tag">총 {len(seen)}개</span></div></div>{cards}'
        f'<div class="card flat" style="margin-top:14px"><h3>조사 한계</h3><dl>{lim}</dl></div>'
        f'<div class="footer-note">데이터 정본은 report-data.json. 이 페이지는 그 뷰이며, JSON을 고치고 다시 생성할 수 있습니다.</div>')

SLOTS={"<!-- OVERVIEW -->":overview,"<!-- BRIEF -->":brief,"<!-- FACTBOOK -->":factbook,"<!-- COMPETITORS -->":competitors,
 "<!-- POSITIONING -->":positioning,"<!-- WHITESPACE -->":whitespace,"<!-- CROSS -->":cross,"<!-- INSIGHTS -->":insights,
 "<!-- OPTIONS -->":options,"<!-- RECOMMENDATION -->":recommendation,"<!-- SOURCES -->":sources}

def render(data, tpl):
    p=data["project"]; bn=data["brand_factbook"]["brand_name"]
    toks={"{{PROJECT_NAME}}":p["project_name"],"{{BRAND_INITIALS}}":(bn[:2].upper() if bn else "BR"),
        "{{RESEARCH_MODE}}":data["research_mode"].upper()+" MODE","{{PROJECT_SUBTITLE}}":p["project_type"]+" · v1.0",
        "{{COMP_COUNT}}":str(data["competitive_research"]["actual_count"]),
        "{{CROSS_COUNT}}":str(data["cross_industry_research"]["actual_count"]),
        "{{INSIGHT_COUNT}}":str(len(data["insights"])),"{{STRAT_COUNT}}":str(len(data["strategy_options"])),
        "{{SOURCE_COUNT}}":str(len({(s["id"],s["url"]) for s in data["sources"]}))}
    out=tpl
    for k,v in toks.items(): out=out.replace(k,e(v))
    out=out.replace("{{REPORT_DATA_JSON}}", json.dumps(data,ensure_ascii=False))
    for slot,fn in SLOTS.items(): out=out.replace(slot, fn(data))
    return out

if __name__=="__main__":
    import sys, pathlib
    if len(sys.argv) < 2:
        print("사용법: python3 render.py <프로젝트경로>/report-data.json [출력경로/deck.html]")
        print("  출력경로 생략 시 report-data.json과 같은 폴더에 deck.html로 저장")
        sys.exit(1)
    data_path = pathlib.Path(sys.argv[1])
    out_path = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else data_path.parent / "deck.html"
    tpl_path = pathlib.Path(__file__).parent / "template.html"
    data = json.load(open(data_path, encoding="utf-8"))
    html_out = render(data, tpl_path.read_text(encoding="utf-8"))
    out_path.write_text(html_out, encoding="utf-8")
    cr, xr = data["competitive_research"], data["cross_industry_research"]
    print(f"완료: {out_path}")
    print(f"경쟁 {cr['actual_count']}개 · 이종업계 {xr['actual_count']}개 · 출처 {len(data['sources'])}건")
