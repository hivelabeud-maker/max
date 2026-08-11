/* ===== GCI RENDER LAYER ===== */
const ALL = [].concat(G, G2, G3, G4).sort((a,b)=>a.no.localeCompare(b.no));
const esc = s => String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const ND = "NOT ENOUGH PUBLIC DATA";
const isND = v => !v || String(v).indexOf("NOT ENOUGH") === 0 || v === "—";
const sbCls = s => s === "COMMUNITY SIGNAL" ? "COMMUNITY" : s;
const sb = s => `<span class="sb ${sbCls(s)}">${esc(s)}</span>`;
const stars = v => isND(v)
  ? `<span class="bv nd">${esc(v||ND)}</span>`
  : `<span class="bv">${esc(v)}</span>`;

/* ---------- HOME ---------- */
function homeView(){
  const cards = ALL.map(g=>{
    const ip = IPCLASS[g.ipClass];
    const lead = g.heat && g.heat[0] ? g.heat[0].n : ND;
    const icon = g.iconic5 && g.iconic5[0] ? g.iconic5[0][0] : ND;
    return `<button class="gcard" data-go="${g.id}"
        data-name="${esc(g.name+' '+g.short+' '+g.genre+' '+lead+' '+icon+' '+(g.coreFantasy.code||''))}"
        data-ip="${g.ipClass}" data-genre="${esc(g.genre)}" data-status="${g.status}" data-mat="${g.maturity}">
      <div class="gsw">${g.sw.map(c=>`<span style="background:${c}"></span>`).join("")}</div>
      <div class="gin">
        <div class="gtop"><span class="gnm">${esc(g.name)}</span>
          <span class="gip ${ip.tone}">${esc(ip.label)}</span></div>
        <div class="gmeta">${esc(g.genre)}<br>${esc(g.release)}</div>
        <div class="gfan">◆ ${esc(g.coreFantasy.code)}</div>
        <div class="gchar"><b>대표</b> ${esc(lead)}<br><b>상징</b> ${esc(icon)}</div>
        <div class="gbot"><span class="gmat ${g.maturity}">MATURITY ${g.maturity}</span>
          <span class="gasset">${esc(g.asset)}</span></div>
      </div></button>`;
  }).join("");

  const genres = [...new Set(ALL.map(g=>g.genre))].sort();
  return `
  <div class="phead"><div class="ptitle"><div class="eyebrow">CREATIVE DECISION TOOL</div>
    <h2>14개 타이틀 인덱스</h2>
    <p>카드를 누르면 상세로 이동합니다. 상단 색띠는 화면 톤, ◆는 Core Fantasy입니다.</p></div>
    <div class="hmeta"><span class="tag lime">서비스 12</span><span class="tag orange">미출시 2</span>
    <span class="tag blue">자체·인수 7</span><span class="tag pink">라이선스 5</span></div></div>

  <div class="filters">
    <select id="fIp"><option value="">IP TYPE · 전체</option>
      ${Object.keys(IPCLASS).map(k=>`<option value="${k}">${esc(IPCLASS[k].label)}</option>`).join("")}</select>
    <select id="fGenre"><option value="">GENRE · 전체</option>
      ${genres.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join("")}</select>
    <select id="fStatus"><option value="">STATUS · 전체</option>
      <option value="LIVE">서비스 중</option><option value="UNRELEASED">미출시</option></select>
    <select id="fMat"><option value="">MATURITY · 전체</option>
      <option value="HIGH">HIGH</option><option value="MEDIUM">MEDIUM</option><option value="LOW">LOW</option></select>
    <span class="fcount" id="fCount"></span>
  </div>

  <div class="gcards" id="gcards">${cards}</div>

  <div class="sect"><h3><span class="sn">A</span>IP 분류 체계</h3><p>2분법 대신 실제 권리·개발 관계 기준</p></div>
  <div class="grid g3">${Object.keys(IPCLASS).map(k=>{
    const c = IPCLASS[k], list = ALL.filter(g=>g.ipClass===k);
    return `<div class="card"><h3><span class="gip ${c.tone}">${esc(c.label)}</span></h3>
      <p><b>${esc(c.desc)}</b><br><br>${list.map(g=>esc(g.short)).join(" · ")||"—"}</p></div>`;}).join("")}</div>

  <div class="sect"><h3><span class="sn">B</span>가장 강력한 자산이 무엇인가</h3><p>캐릭터가 항상 1순위라는 전제를 버린다</p></div>
  <div class="grid g4">${["CHARACTER","WORLD","SYSTEM","COMPETITION","POWER","UNKNOWN"].map(a=>{
    const list = ALL.filter(g=>g.asset===a); if(!list.length) return "";
    return `<div class="card flat"><h3>${a}</h3><p>${list.map(g=>
      `<b>${esc(g.short)}</b><br><span style="font-size:10px;color:#77756e">${esc(g.assetNote)}</span>`).join("<br><br>")}</p></div>`;
  }).join("")}</div>

  <div class="sect"><h3><span class="sn">C</span>혼동 방지</h3><p>소재를 섞으면 양쪽 광고가 모두 손해</p></div>
  <div class="grid g2">
    <div class="card"><h3>7DS GRAND CROSS ↔ Origin</h3>
      <p>같은 원작·같은 개발사(넷마블F&amp;C). <b>GC는 카드배틀(보는 게임), Origin은 오픈월드(걷는 게임).</b><br><br>
      가르는 법 — GC는 카드 UI를 반드시 넣고, Origin은 원경·이동을 반드시 넣는다.</p></div>
    <div class="card"><h3>몬길 ↔ 스톤에이지 키우기</h3>
      <p>둘 다 생물 수집이지만 <b>조작량이 정반대.</b> 몬길은 실시간 태그, 스톤에이지는 방치형.<br><br>
      가르는 법 — 몬길은 태그 전환, 스톤에이지는 자동 진행·누적 보상.</p></div>
    <div class="card"><h3>스톤에이지 ↔ KOF AFK</h3>
      <p>같은 방치형 + IP 향수 구조.<br><br>가르는 법 — KOF는 도트 그래픽, 스톤에이지는 펫 탑승. 비주얼이 완전히 달라 이것만 지키면 갈린다.</p></div>
    <div class="card"><h3>MMORPG 4종</h3>
      <p>레이븐2=헤븐스톤(CURSED POWER) / 뱀피르=흡혈(PREDATOR) / RF=3종족(BELONGING) / SOL=신권(DOMINION).<br><br>
      각 타이틀의 시그니처 오브젝트를 반드시 넣는다.</p></div>
  </div>

  <div class="sect"><h3><span class="sn">D</span>14개 전부에서 반복된 AI 원칙</h3><p>장르가 달라도 예외가 없었던 판단</p></div>
  <div class="grid g2">
    <div class="card"><h3 style="color:#4f6e1c">● 배경 · 세계관 확장 — 적합</h3>
      <p>캐릭터가 없으니 정확도 부담이 없고 세계관 톤만 맞추면 된다. 성채·행성·대륙·던전·신전·오락실 — <b>AI 이미지 작업은 여기서 시작한다.</b></p></div>
    <div class="card"><h3 style="color:var(--orange)">● 캐릭터 · 몬스터 · 시그니처 병기 — 비권장/금지</h3>
      <p>얼굴·무기·의상·문양이 조금만 틀려도 팬이 즉시 알아본다. 라이선스 IP 5종은 원작자 검수 대상이고,
      <b>왕좌의 게임은 배우 초상권까지 얽혀 실사화도 금지</b>다.</p></div>
  </div>

  <div class="note" style="margin-top:18px"><b>이 DB의 원칙</b> — 확인되지 않은 정보는 사실처럼 쓰지 않는다.
  출처는 <span class="sb OFFICIAL">OFFICIAL</span> <span class="sb MEDIA">MEDIA</span>
  <span class="sb COMMUNITY">COMMUNITY SIGNAL</span> <span class="sb UNVERIFIED">UNVERIFIED</span> 4단계로 구분했고,
  커뮤니티 반응은 팬덤 전체 의견처럼 서술하지 않았다. 채울 근거가 없는 칸은 <b>${ND}</b>로 남겼다.</div>`;
}

/* ---------- GAME DETAIL ---------- */
const SECTS = [["ov","OVERVIEW"],["ic","ICONIC 5"],["ch","CHARACTER"],["vd","VISUAL DNA"],
  ["fl","FAN LANGUAGE"],["lm","LANDMINE"],["oip","ORIGINAL IP"],["tl","HISTORY"],["cs","CREATIVE"],["src","SOURCE"]];

function gameView(g){
  const ip = IPCLASS[g.ipClass];
  const jump = `<div class="qjump">${SECTS.map(s=>
    `<button data-j="${g.id}-${s[0]}">${s[1]}</button>`).join("")}</div>`;

  const cf = `<div class="cf"><div class="eyebrow">CORE FANTASY</div>
    <div class="cfcode">◆ ${esc(g.coreFantasy.code)}</div>
    ${g.coreFantasy.flow.length?`<div class="cfflow">${g.coreFantasy.flow.map((f,i)=>
      (i?'<i>→</i>':'')+`<span>${esc(f)}</span>`).join("")}</div>`:""}
    <p>${g.coreFantasy.desc}</p></div>`;

  const ic5 = g.iconic5[0][0]===ND || isND(g.iconic5[0][0])
    ? `<div class="nodata">${ND} — 게임 고유 시각 자산 미공개</div>`
    : `<div class="ic5">${g.iconic5.map((x,i)=>`<div class="icn">
        <span class="icnum">0${i+1}</span><span class="ictype">${esc(x[1])}</span>
        <strong>${esc(x[0])}</strong><span>${esc(x[2])}</span>
        ${x[3]&&x[3]!=="—"?`<span class="icstar">${esc(x[3])}</span>`:""}</div>`).join("")}</div>`;

  const heat = isND(g.heat[0].n)
    ? `<div class="nodata">${ND} — 캐릭터 구성 미공개</div>`
    : `<div class="chs">${g.heat.map(c=>`<div class="chc">
        <div class="chn">${esc(c.n)}</div><div class="chr">${esc(c.role)}</div>
        <div class="chbars">
          <span class="bk">FANDOM</span>${stars(c.heat)}
          <span class="bk">VISUAL</span>${stars(c.vis)}
          <span class="bk">UA</span>${stars(c.ua)}
          <span class="bk">SNS</span>${stars(c.sns)}</div>
        <div class="chrow"><b>WHY</b>${esc(c.why)}</div>
        ${c.scene&&c.scene!=="—"?`<div class="chrow"><b>SCENE</b>${esc(c.scene)}</div>`:""}
        ${c.rel&&c.rel!=="—"?`<div class="chrow"><b>REL</b>${esc(c.rel)}</div>`:""}
        ${c.line&&c.line!=="—"?`<div class="chrow"><b>LINE</b>${esc(c.line)}</div>`:""}
        ${c.nick&&c.nick!=="—"?`<div class="chrow"><b>NICK</b>${esc(c.nick)}</div>`:""}
        <div class="chrow"><b>NOW</b>${esc(c.now)}</div>
        <div class="chbasis">BASIS · ${esc(c.basis)}</div></div>`).join("")}</div>`;

  const vd = isND(g.vdna[0][0])
    ? `<div class="nodata">${ND} — 게임 비주얼 가이드 미공개</div>`
    : `<div class="vd"><div class="vdh"><span>VISUAL ELEMENT</span><span>MEANING</span><span>EMOTION</span><span>MARKETING USE</span></div>
       ${g.vdna.map(v=>`<div class="vdr"><span class="e">${esc(v[0])}</span><span class="m">${esc(v[1])}</span>
         <span class="em">${esc(v[2])}</span><span class="u">${esc(v[3])}</span></div>`).join("")}</div>`;

  const fl = isND(g.fanLang[0].t)
    ? `<div class="nodata">${ND} — 팬덤 언어 미조사</div>`
    : `<div class="fl">${g.fanLang.map(f=>`<div class="flc">
        <div class="flh"><span class="flt">${esc(f.t)}</span>
          <span class="fllbl ${f.risk}">${f.risk==='safe'?'SAFE':f.risk==='caution'?'CAUTION':'DO NOT USE'}</span></div>
        <div class="flrow"><b>ORIGIN</b>${esc(f.origin)}</div>
        <div class="flrow"><b>WHEN</b>${esc(f.when)}</div>
        <div class="flrow"><b>WHY POPULAR</b>${esc(f.why)}</div>
        <div class="flrow"><b>CURRENT</b>${esc(f.now)}</div>
        <div class="flrow" style="margin-top:2px">${sb(f.src)}</div>
        <div class="fluse"><b>USABILITY</b> ${esc(f.use)}</div></div>`).join("")}</div>`;

  const lm = `<div class="lm">${g.landmine.map(m=>`<div class="lmr">
      <span class="lmlv ${m.lv}">${m.lv}</span><span class="t">${esc(m.t)}</span>
      <span class="d">${esc(m.d)}</span><span class="w">${esc(m.why)} ${sb(m.src)}</span></div>`).join("")}</div>`;

  const oip = g.origIP ? `<div class="oip">
      <div class="oipc"><h4>ORIGINAL IP MEMORY</h4><p>${g.origIP.memory}</p></div>
      <div class="oipc"><h4>GAME VERSION</h4><p>${g.origIP.game}</p></div>
      <div class="oipc gap"><h4>IP GAP</h4><p>${g.origIP.gap}</p></div>
      <div class="oipc rights"><h4>IP SENSITIVITY / RIGHTS</h4><p>${esc(g.origIP.sens)}<br><br><b>${esc(g.origIP.rights)}</b></p></div>
    </div>` : `<div class="note">자체·인수 IP — 원작 분리 대상 아님. 외부 라이선스 제약 없음.</div>`;

  const tl = `<div class="tl">${g.timeline.map(t=>`<div class="tlr ${t.hot?'hot':''}">
      <span class="d">${esc(t.d)}</span><span class="e">${esc(t.e)}</span>
      <span class="f">${esc(t.fan)}</span><span class="m">${esc(t.mkt)}</span></div>`).join("")}</div>`;

  const s = g.starter;
  const cs = `<div class="cs">
    <div class="csc"><h4>UA VIDEO</h4>
      <div class="csrow"><b>CHARACTER</b>${esc(s.ua.char)}</div>
      <div class="csrow"><b>HOOK</b>${esc(s.ua.hook)}</div>
      <div class="csrow"><b>SITUATION</b>${esc(s.ua.sit)}</div>
      <div class="csrow"><b>WORLD</b>${esc(s.ua.world)}</div>
      <div class="csrow"><b>FANTASY</b>${esc(s.ua.fantasy)}</div>
      <div class="csrow"><b>FIRST 3S</b>${esc(s.ua.sec3)}</div>
      <div class="csrow avoid"><b>AVOID</b>${esc(s.ua.avoid)}</div></div>
    <div class="csc"><h4>DISPLAY / BANNER</h4>
      <div class="csrow"><b>HERO</b>${esc(s.banner.hero)}</div>
      <div class="csrow"><b>SYMBOL</b>${esc(s.banner.sym)}</div>
      <div class="csrow"><b>COPY</b>${esc(s.banner.copy)}</div>
      <div class="csrow"><b>BACKGROUND</b>${esc(s.banner.bg)}</div>
      <div class="csrow"><b>TRIGGER</b>${esc(s.banner.trigger)}</div></div>
    <div class="csc"><h4>SNS</h4>
      <div class="csrow"><b>MEME</b>${esc(s.sns.meme)}</div>
      <div class="csrow"><b>RELATION</b>${esc(s.sns.rel)}</div>
      <div class="csrow"><b>FAN LANG</b>${esc(s.sns.lang)}</div>
      <div class="csrow"><b>IDEA</b>${esc(s.sns.idea)}</div></div>
    <div class="csc"><h4>PROMOTION SITE</h4>
      <div class="csrow"><b>HERO</b>${esc(s.promo.hero)}</div>
      <div class="csrow"><b>WORLD</b>${esc(s.promo.world)}</div>
      <div class="csrow"><b>INTERACTION</b>${esc(s.promo.motif)}</div>
      <div class="csrow"><b>SCROLL</b>${esc(s.promo.scroll)}</div>
      <div class="csrow"><b>MOTION</b>${esc(s.promo.motion)}</div></div>
    <div class="csc" style="grid-column:1/-1"><h4>AI IMAGE / VIDEO</h4>
      <div class="csrow"><b>KEEP</b>${esc(s.ai.keep)}</div>
      <div class="csrow"><b>CHARACTER</b>${esc(s.ai.char)}</div>
      <div class="csrow"><b>WORLD</b>${esc(s.ai.world)}</div>
      <div class="csrow avoid"><b>AVOID</b>${esc(s.ai.avoid)}</div></div></div>`;

  return `${jump}
  <div class="phead" id="${g.id}-ov"><div class="ptitle"><div class="eyebrow">${g.no} · ${esc(ip.label)}</div>
    <h2>${esc(g.name)}</h2><p>${esc(g.genre)} · ${esc(g.dev)} · ${esc(g.release)}</p></div>
    <div class="hmeta"><span class="tag ${ip.tone}">${esc(ip.label)}</span>
      <span class="tag ${g.maturity==='HIGH'?'lime':g.maturity==='MEDIUM'?'blue':'orange'}">MATURITY ${g.maturity}</span>
      <span class="tag">ASSET · ${esc(g.asset)}</span></div></div>

  <div class="hero">
    <div><div class="eyebrow">01 · THIS GAME IS</div><h3>${esc(g.one)}</h3>
      <p><b>가장 강한 자산</b> — ${esc(g.assetNote)}</p></div>
    <div class="hside">
      <div class="kv2"><span>플랫폼</span><b>${esc(g.plat)}</b></div>
      <div class="kv2"><span>서비스 지역</span><b>${esc(g.region)}</b></div>
      <div class="kv2"><span>개발</span><b>${esc(g.dev)}</b></div>
      <div class="kv2" style="border-bottom:0"><span>상태</span><b>${g.status==='LIVE'?'서비스 중':'미출시'}</b></div>
      <div class="hsw">${g.sw.map(c=>`<span style="background:${c}"></span>`).join("")}</div>
      <div style="font-size:9px;color:rgba(255,255,255,.4)">화면 톤 — 비주얼 DNA 기반 (공식 컬러 아님)</div>
    </div></div>

  <div class="sect"><h3><span class="sn">01</span>CORE FANTASY</h3><p>이 게임이 파는 욕망 구조</p></div>
  ${cf}

  <div class="sect" id="${g.id}-ic"><h3><span class="sn">02</span>ICONIC 5</h3><p>무엇을 보여주면 팬이 바로 알아보는가</p></div>
  ${ic5}

  <div class="sect" id="${g.id}-ch"><h3><span class="sn">03</span>CHARACTER HEAT</h3><p>등장 순서가 아니라 인지도·활용도 기준 · 근거 없는 점수는 표기하지 않음</p></div>
  ${heat}

  <div class="sect" id="${g.id}-vd"><h3><span class="sn">04</span>VISUAL DNA</h3><p>Element → Meaning → Emotion → Marketing Use</p></div>
  ${vd}

  <div class="sect" id="${g.id}-fl"><h3><span class="sn">05</span>FAN LANGUAGE</h3><p>팬이 실제로 쓰는 말 · SAFE / CAUTION / DO NOT USE</p></div>
  ${fl}

  <div class="sect" id="${g.id}-lm"><h3><span class="sn">06</span>COMMUNITY LANDMINE</h3><p>Risk Level + 디자이너가 알아야 하는 이유</p></div>
  ${lm}

  <div class="sect" id="${g.id}-oip"><h3><span class="sn">07</span>ORIGINAL IP vs GAME</h3><p>"원작에서 유명하다"와 "지금 사용 가능하다"는 다르다</p></div>
  ${oip}

  <div class="sect" id="${g.id}-tl"><h3><span class="sn">08</span>HISTORY &amp; MEME TIMELINE</h3><p>업데이트 연혁이 아니라 인식이 바뀐 사건</p></div>
  ${tl}
  <div class="note" style="margin-top:11px"><b>MARKETING HISTORY</b> — ${esc(g.mktHistory)}</div>

  <div class="sect" id="${g.id}-cs"><h3><span class="sn">09</span>CREATIVE STARTER</h3><p>채널별 착수 지점</p></div>
  ${cs}

  <div class="sect" id="${g.id}-src"><h3><span class="sn">10</span>SOURCE &amp; DATA GAP</h3><p>출처 신뢰도 4단계 · 미확인 항목 명시</p></div>
  <div class="grid g2">
    <div><div class="srcs">${g.sources.map(x=>`<div class="srcr">${sb(x[1])}<span>${esc(x[0])}</span></div>`).join("")}</div></div>
    <div class="gapbox"><strong>DATA GAP — 추측으로 채우지 않은 항목</strong>
      <p>${g.gaps.map(x=>"· "+esc(x)).join("<br>")}</p></div>
  </div>

  <div class="footer-note">${esc(g.name)} · Observed 2026.08 · RESEARCH MATURITY ${g.maturity}</div>`;
}

/* ---------- ROUTER ---------- */
const main = document.getElementById("main");
const navList = document.getElementById("navList");
const groups = [["서비스 중 · 자체·인수 IP", g=>g.status==="LIVE" && ["OWN","LEGACY","ACQUIRED","EXT_PUB"].includes(g.ipClass)],
                ["서비스 중 · 라이선스 IP", g=>g.status==="LIVE" && ["LICENSED","LICENSED_EXP"].includes(g.ipClass)],
                ["미출시", g=>g.status==="UNRELEASED"]];
navList.innerHTML = groups.map(([label,fn])=>{
  const list = ALL.filter(fn); if(!list.length) return "";
  return `<div class="navlabel">${label}</div>` + list.map(g=>
    `<button class="nav-item" data-v="${g.id}" data-search="${esc(g.name+' '+g.short)}">
      <span class="nnum">${g.no}</span>${esc(g.short)}<span class="nbadge ${g.maturity}">${g.maturity[0]}</span></button>`).join("");
}).join("");

function show(id){
  const g = ALL.find(x=>x.id===id);
  main.innerHTML = `<section class="view active">${g?gameView(g):homeView()}</section>`;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.v===(g?id:"home")));
  document.getElementById("pill").textContent = g ? `${g.no} · ${g.short}` : "14 TITLES";
  window.scrollTo({top:0,behavior:"instant"});
  if(!g) bindFilters();
}

function bindFilters(){
  const ids = ["fIp","fGenre","fStatus","fMat"].map(x=>document.getElementById(x));
  const cards = [...document.querySelectorAll(".gcard")];
  const cnt = document.getElementById("fCount");
  const apply = ()=>{
    const [ip,gn,st,mt] = ids.map(s=>s.value);
    const q = (document.getElementById("q").value||"").trim().toLowerCase();
    let n=0;
    cards.forEach(c=>{
      const ok = (!ip||c.dataset.ip===ip) && (!gn||c.dataset.genre===gn) &&
                 (!st||c.dataset.status===st) && (!mt||c.dataset.mat===mt) &&
                 (!q||c.dataset.name.toLowerCase().includes(q));
      c.classList.toggle("hide",!ok); if(ok) n++;
    });
    cnt.textContent = `${n} / ${cards.length} TITLES`;
  };
  ids.forEach(s=>s.addEventListener("change",apply));
  apply();
}

document.addEventListener("click",e=>{
  const nav = e.target.closest(".nav-item"); if(nav) return show(nav.dataset.v);
  const go = e.target.closest("[data-go]"); if(go) return show(go.dataset.go);
  const j = e.target.closest("[data-j]");
  if(j){ const el = document.getElementById(j.dataset.j); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); }
});

document.getElementById("q").addEventListener("input",e=>{
  const q = e.target.value.trim().toLowerCase();
  const navBtns = [...document.querySelectorAll(".nav-item[data-search]")];
  navBtns.forEach(b=>b.classList.toggle("hide", q && !b.dataset.search.toLowerCase().includes(q)));
  if(document.querySelector(".gcards")) bindFilters();
});

show("home");
