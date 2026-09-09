#!/usr/bin/env node
/* ============================================================================
   qa.js — 빌드된 단일 HTML 을 헤드리스로 돌려 검증한다. (외부 패키지 불필요)
     ① 기기 13종 레이아웃      — 세로 10 + 가로 3. 요소 이탈 / 플레이 영역 확보
     ② 봇 완주                 — 타임라인대로 결과 화면 도달, 런타임 에러 0
     ③ 무입력 방치             — 오토플레이로도 완주, 사망 없음
     ④ 광고 규격               — 외부요청/금지API/CTA 자동발동
   사용:  node tools/qa.js
   ========================================================================== */
const fs = require('fs'), path = require('path');
/* 검사 대상 — 기본은 실제 납품본(UIHD). 예전엔 playable.html(flat) 로 고정돼 있어서
   UIHD 를 고쳐도 QA 는 손 안 댄 flat 을 검사하고 "전 항목 통과"를 찍었다.
   다른 변주를 보려면: node tools/qa.js playable_dot.html */
const HTML = path.join(__dirname, '..', 'dist', process.argv[2] || 'playable_uihd.html');
if (!fs.existsSync(HTML)) {
  console.error('빌드 파일이 없습니다: ' + HTML + '\n먼저 python3 tools/build.py --uihd 를 실행하세요.');
  process.exit(1);
}
console.log('검사 대상: ' + path.basename(HTML) + '\n');
const raw = fs.readFileSync(HTML, 'utf8');
const m = raw.match(/\/\*<<BODY\*\/([\s\S]*?)\/\*BODY>>\*\//);
if (!m) { console.error('BODY 마커를 찾지 못했습니다.'); process.exit(1); }
const SRC = m[1].replace(/"data:image\/[a-z]+;base64,[^"]+"/g, '"X"');

/* ---------------------------------------------------------- 스텁 환경 */
const noop = () => {};
const mkGrad = () => ({ addColorStop: noop });
function mkCtx() {
  const base = { canvas:{width:540,height:960}, createLinearGradient:mkGrad, createRadialGradient:mkGrad,
    measureText:()=>({width:10}), setLineDash:noop,
    getImageData:(x,y,w,h)=>({ data:new Uint8ClampedArray(w*h*4).fill(255) }) };
  return new Proxy(base, { get:(t,k)=> (k in t ? t[k] : noop), set:(t,k,v)=>{t[k]=v;return true;} });
}
const mkCanvas = () => ({ width:0, height:0, style:{}, getContext:mkCtx, addEventListener:noop,
  getBoundingClientRect:()=>({left:0,top:0,width:540,height:960}) });

function boot(w, h, search) {
  const g = global;
  g.location = { search: search || '' };
  g.document = { getElementById:mkCanvas, createElement:mkCanvas, addEventListener:noop, readyState:'complete' };
  const calls = { fetch:0, xhr:0, open:0, cta:0 };
  g.window = { innerWidth:w, innerHeight:h, addEventListener:noop,
    open:()=>{calls.open++;}, devicePixelRatio:2, PointerEvent:null,
    FbPlayableAd:{ onCTAClick:()=>{calls.cta++;} } };
  g.fetch = ()=>{calls.fetch++;};
  g.XMLHttpRequest = function(){ calls.xhr++; };
  let T = 0; g.performance = { now:()=>T };
  let cb = null; g.requestAnimationFrame = f => { cb = f; };
  g.setTimeout = (f)=>{ if (typeof f === 'function') f(); };
  g.Image = class { set src(v){ if (this.onerror) this.onerror(); } };
  const api = new Function('window','document','performance','requestAnimationFrame','setTimeout','location','fetch','XMLHttpRequest','Image',
    'return (function(){' + SRC + '\n return { Game:Game, Stage:Stage, Input:Input, Director:Director, CTA:CTA,' +
    ' TIMELINE:TIMELINE, RENDER:RENDER, Enemies:Enemies, restart:restart, handleTap:handleTap,' +
    ' Screens:Screens, HUD:HUD, CHARACTER:CHARACTER };})()'
  )(g.window, g.document, g.performance, g.requestAnimationFrame, g.setTimeout, g.location, g.fetch, g.XMLHttpRequest, g.Image);
  api.calls = calls;
  api.step = (ms)=>{ T += (ms===undefined?16.7:ms); const f=cb; cb=null; if(f) f(T); };
  api.run  = (n, each)=>{ for(let i=0;i<n;i++){ if(each) each(i, api); api.step(); } };
  return api;
}

let FAIL = 0;
const line = (n)=>console.log('─'.repeat(n||76));
const pad = (s,n)=>{ s=String(s); let w=0; for(const ch of s) w += /[가-힣]/.test(ch)?2:1; return s + ' '.repeat(Math.max(1,n-w)); };

/* ============================================== ① 기기 레이아웃
   ★ 가로(landscape) 3종은 2026-09-07 추가.
     AppLovin 공식 규격: "HTML ads must function properly in both landscape
     and portrait orientations." 그런데 그때까지 QA 는 세로 10종만 봤다.
     당시 실제로 돌려보니 레터박스로 정상 동작했지만, 검사에 없으면 앞으로
     깨져도 못 잡는다. 광고망 반려 사유이므로 검사로 승격한다. */
const DEVICES = [
  ['iPhone SE (16:9)',375,667], ['iPhone 15 Pro',393,852], ['iPhone 15 Pro Max',430,932],
  ['Galaxy S24',360,780], ['Galaxy Z Fold(접힘)',344,882], ['Pixel 8',412,915],
  ['툴바 큰 안드로이드',412,732], ['iPad Mini',744,1133], ['iPad 10.9 (4:3)',820,1180],
  ['갤럭시탭 (4:3)',800,1066],
  ['↻ iPhone 15 Pro 가로',852,393], ['↻ Galaxy S24 가로',780,360], ['↻ iPad 가로',1180,820]
];
console.log('\n① 기기 ' + DEVICES.length + '종 레이아웃 (세로 10 + 가로 3 · 하단 대형 CTA 기준)');
line();
console.log(pad('기기',22)+pad('뷰포트',12)+pad('논리캔버스',13)+pad('플레이영역',13)+pad('CTA',13)+'결과');
for (const [name,w,h] of DEVICES) {
  const a = boot(w,h); a.run(20);
  const S = a.Stage, bad = [];
  const cta = a.HUD.ctaRect;
  const play = a.HUD.ctaTop() - S.pf.y;
  if (S.pf.h < 480) bad.push('플레이영역부족');
  if (S.pf.y < 70) bad.push('상단침범');
  if (!cta) bad.push('CTA없음');
  else {
    if (cta.x < 8 || cta.x + cta.w > S.W - 8) bad.push('CTA가로이탈');
    if (cta.y + cta.h > S.H - 6) bad.push('CTA세로이탈');
    if (cta.h < 44) bad.push('CTA터치부족');
    if (cta.w > S.W * 0.95) bad.push('CTA과대');
  }
  if (play < 430) bad.push('플레이영역협소');
  if (bad.length) FAIL++;
  console.log(pad(name,22)+pad(w+'×'+h,12)+pad(S.W+'×'+S.H,13)+
    pad(Math.round(play)+'px',13)+pad(cta?(Math.round(cta.w)+'×'+Math.round(cta.h)):'-',13)+
    (bad.length?'실패 '+bad.join(','):'통과'));
}

/* ============================================== ② 봇 완주 (드래그 입력) */
console.log('\n② 봇 완주 — 24초 타임라인');
line();
{
  const a = boot(393,852);
  let err = null, minHP = Infinity, endAt = -1, peak = 0;
  try {
    a.run(60*28, (i, api)=>{
      if (api.Game.hp < minHP) minHP = api.Game.hp;
      if (api.Game.enemies && api.Game.enemies.count() > peak) peak = api.Game.enemies.count();
      if (endAt < 0 && api.Game.state === 'result') endAt = api.Game.t;
      /* 매 프레임 약간씩 드래그 */
      api.Input.dx = Math.sin(i/28)*4; api.Input.dy = Math.cos(i/37)*3;
      api.Input.everTouched = true; api.Input.idle = 0;

    });
  } catch(e) { err = e; }
  const G = a.Game;
  const rows = [
    ['런타임 에러', err ? ('실패 — '+err.message) : '0건'],
    ['최종 상태', G.state + (G.state==='result'?' (정상 — 결과 카드가 최종 화면)':' ← result 여야 함')],
    ['결과 화면 도달', (endAt<0?'미도달':endAt.toFixed(2)+'초') + ' / 예정 21.50초'],
    ['동시 최대 적', peak + '마리 (위기감 지표)'],
    ['최저 HP', Math.round(minHP) + ' / ' + G.hpMax + '  (하한 '+Math.round(G.hpMax*G.hpFloor)+')'],
    ['총 처치', G.kills + '마리'],
    ['총 스폰', G.spawned + '마리'],
    ['잔여 적', G.enemies.count() + '마리 (궁극기 후 0이어야 함)'],
    ['최종 HP', Math.round(G.hp) + ' / ' + G.hpMax + '  (사망 없음)'],
    ['CTA 자동발동', a.calls.cta===0 ? '0건 (정상)' : '실패 — '+a.calls.cta+'건'],
    ['외부 요청', (a.calls.fetch+a.calls.xhr+a.calls.open)===0 ? '0건' : '실패']
  ];
  for (const [k,v] of rows) console.log(pad(k,18)+v);
  if (err) FAIL++;
  if (G.state !== 'result') FAIL++;
  if (G.kills < 200) { console.log('  ! 처치 수가 적습니다 (연출 밀도 부족)'); FAIL++; }
  if (G.enemies.count() > 0) { console.log('  ! 궁극기 후 잔여 적 존재'); FAIL++; }
  if (a.calls.cta !== 0) FAIL++;
  if (endAt < 0 || Math.abs(endAt - 21.50) > 0.25) { console.log('  ! 결과 화면 도달 시각이 타임라인과 어긋남'); FAIL++; }
  if (minHP > G.hpMax*0.92) { console.log('  ! HP가 거의 안 깎임 — 위기감 부족'); FAIL++; }
  if (peak < 130) { console.log('  ! 동시 적 수가 적음 — 카펫 밀도 부족'); FAIL++; }
}

/* ============================================== ③ 무입력 방치 (오토플레이) */
console.log('\n③ 무입력 방치 — 오토플레이 완주');
line();
{
  const a = boot(393,852);
  let err = null;
  try { a.run(60*28); } catch(e){ err = e; }
  const G = a.Game;
  console.log(pad('런타임 에러',18) + (err ? '실패 — '+err.message : '0건'));
  console.log(pad('최종 상태',18) + G.state);
  console.log(pad('총 처치',18) + G.kills + '마리');
  console.log(pad('최종 HP',18) + Math.round(G.hp) + ' / ' + G.hpMax);
  if (err) FAIL++;
  if (G.state !== 'result') FAIL++;
  if (G.hp < G.hpMax*G.hpFloor - 0.01) { console.log('  ! HP 하한 붕괴'); FAIL++; }
}

/* ============================================== ④ 영상 모드 해상도 */
console.log('\n④ 영상 모드 (?video=1) — 정수 배율 업스케일');
line();
for (const sc of [1,2,3,4]) {
  const a = boot(1920,1080, '?video=1&scale='+sc);
  a.run(10);
  const S = a.Stage;
  const ok = (S.W===540 && S.H===960 && S.cv.width===540*sc && S.cv.height===960*sc);
  if (!ok) FAIL++;
  console.log(pad('scale='+sc,12)+pad('논리 '+S.W+'×'+S.H,18)+
              pad('출력 '+S.cv.width+'×'+S.cv.height,22)+(ok?'통과':'실패'));
}

/* ============================================== ⑤ 규격 문자열 검사 */
console.log('\n⑤ 광고 규격 (소스 검사)');
line();
const banned = [['localStorage',/localStorage/],['eval(',/\beval\s*\(/],
  ['document.write',/document\.write/],['XMLHttpRequest',/new\s+XMLHttpRequest/],
  ['fetch(',/\bfetch\s*\(/],['WebSocket',/WebSocket/],['<img src=',/<img\s/i],
  ['외부 리소스 태그',/(src|href)\s*=\s*["']https?:/i]];
const GEXIT = 'https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js';
const rawNoGExit = raw.split(GEXIT).join('');   /* google 빌드의 허용된 스크립트만 제외하고 검사 */
for (const [name, re] of banned) {
  const hit = re.test(name === '외부 리소스 태그' ? rawNoGExit : raw);
  if (hit) FAIL++;
  console.log(pad(name,22) + (hit ? '실패 — 발견됨' : '0건'));
}
/* ⑥ 전폭 딤(검정 띠) 금지 — 3회 재발한 실수라 빌드에서 막는다.
   판정: 캠버스 폭 전체(W/Stage.W)를 칠하면서 높이가 "고정 픽셀값"인 fillRect.
   높이가 H/Stage.H 인 것은 전체화면 채우기라 정상(배경·결과 딤). 6px 미만은 구분선. */
console.log('\n⑥ 전폭 딤(검정 띠) 금지 검사');
line();
{
  const src = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const re = /fillRect\s*\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(?:W|Stage\.W)\s*,\s*(-?[\d.]+)\s*\)/g;
  const hits = [];
  let m;
  while ((m = re.exec(src))) {
    if (Math.abs(parseFloat(m[1])) <= 2 && Math.abs(parseFloat(m[3])) >= 6) hits.push(m[0]);
  }
  if (hits.length) {
    FAIL++;
    console.log(pad('전폭 딤',22) + '실패 — ' + hits.length + '건: ' + hits.join(' / '));
    console.log('  ! 상단/하단 딤은 검정 띠로 보입니다. strokeText 외곽선을 쓰세요.');
  } else {
    console.log(pad('전폭 딤',22) + '0건 (전체화면 채우기는 정상 통과)');
  }
}

/* ⑦ 외부 URL 화이트리스트 — 구멍 하나를 막는다.
   기존엔 build.py 는 "경고"만 찍고, qa.js 는 <태그 src/href> 형태만 봤다.
   그래서 JS 문자열로 들어간 외부 URL(예: theme.js 의 storeUrl, 혹은 실수로 박은
   트래킹/CDN 주소)이 두 검사를 모두 통과해 출고될 수 있었다.
   허용: SVG 네임스페이스(w3.org) + theme.js 에 선언한 storeUrl 그 자체. 나머지는 실패. */
console.log('\n⑦ 외부 URL 화이트리스트');
line();
{
  const scan = SRC.replace(/data:[a-z/+.-]+;base64,[A-Za-z0-9+/=]*/gi, '');
  const found = [...new Set(scan.match(/https?:\/\/[^\s"'`)<>]+/g) || [])]
    .filter(u => !/^https?:\/\/(www\.)?w3\.org/.test(u));
  const store = (SRC.match(/storeUrl\s*:\s*['"]([^'"]+)['"]/) || [])[1] || '';
  /* Google Ads/AdMob 빌드만 exitapi.js 외부 로드를 "요구"한다 —
     공식: include the script .../exitapi.js and use ExitApi.exit().
     Meta·AppLovin 에서는 금지이므로, 이 파일에 실제로 그 스크립트가 있을 때만 허용한다. */
  const GOOGLE_EXIT = 'https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js';
  const isGoogle = raw.indexOf(GOOGLE_EXIT) >= 0;
  const bad = found.filter(u => u !== store && !(isGoogle && u === GOOGLE_EXIT));
  if (bad.length) {
    FAIL++;
    console.log(pad('허용 밖 외부 URL',22) + '실패 — ' + bad.length + '건: ' + bad.join(' / '));
    console.log('  ! storeUrl 외의 외부 주소는 광고 심사에서 반려됩니다.');
  } else {
    console.log(pad('허용 밖 외부 URL',22) + '0건' + (store ? '  (storeUrl: ' + store + ')' : ''));
  }
}

/* ⑧ CTA 발동 검사 — 이 빌드가 "어느 광고망용인지" 판별하고, 그 망의 API 를
   실제로 호출하는지 확인한다. 코드가 들어있는 것만으로는 부족하다 —
   블록 절단(build.py --net)이 잘못되면 CTA 가 아무것도 안 하는 파일이 나온다. */
console.log('\n⑧ CTA 발동 (광고망 규격)');
line();
{
  const has = { fb: /FbPlayableAd/.test(SRC), mraid: /mraid\.open/.test(SRC),
                exit: /ExitApi\.exit/.test(SRC), open: /window\.open/.test(SRC) };
  const net = has.open ? 'universal'
            : (has.fb && !has.mraid && !has.exit) ? 'meta'
            : (has.exit && !has.fb && !has.mraid) ? 'google'
            : (has.mraid && !has.fb && !has.exit) ? 'mraid' : '혼합';
  console.log(pad('빌드 판별',22) + net +
    '  (FbPlayableAd:'+(has.fb?'O':'X')+' mraid:'+(has.mraid?'O':'X')+
    ' ExitApi:'+(has.exit?'O':'X')+' window.open:'+(has.open?'O':'X')+')');

  if (net === '혼합') {
    FAIL++;
    console.log(pad('규격',22) + '실패 — 여러 광고망 API 가 섞여 있다.');
    console.log('  ! Meta 는 mraid 금지, AppLovin 은 window.open 을 클릭스루 실패로 본다.');
    console.log('  ! build.py --net meta|google|mraid 로 망별 빌드를 쓰세요.');
  } else {
    /* 실제로 발동하는지 — 각 망 API 를 스텁으로 심고 CTA.fire() 를 부른다 */
    const a = boot(393,852); a.run(5);
    let fired = null;
    global.window.FbPlayableAd = { onCTAClick: ()=>{ fired = 'FbPlayableAd'; } };
    global.window.mraid = { open: ()=>{ fired = 'mraid'; } };
    global.ExitApi = { exit: ()=>{ fired = 'ExitApi'; } };
    global.window.open = ()=>{ fired = 'window.open'; };
    try { a.CTA.fired = false; a.CTA.fire(); } catch(e) { fired = '에러: '+e.message; }
    const want = { meta:'FbPlayableAd', google:'ExitApi', mraid:'mraid', universal:'FbPlayableAd' }[net];
    const ok = fired === want;
    if (!ok) FAIL++;
    console.log(pad('탭 시 호출',22) + (fired || '아무것도 호출 안 함') +
      (ok ? '  통과' : '  실패 — ' + want + ' 이어야 함'));
  }

  /* Google 빌드는 exitapi.js 가 반드시 있어야 ExitApi 가 정의된다 */
  if (net === 'google') {
    const okScript = raw.indexOf('tpc.googlesyndication.com') >= 0;
    if (!okScript) FAIL++;
    console.log(pad('exitapi.js 로드',22) + (okScript ? '있음  통과' : '없음  실패 — ExitApi 가 정의되지 않는다'));
  }
}

const kb = fs.statSync(HTML).size/1024;
console.log(pad('파일 크기',22) + kb.toFixed(1)+' KB  (Meta 2MB 대비 '+(kb/2048*100).toFixed(1)+'%)');

line();
console.log(FAIL===0 ? '\n전 항목 통과\n' : '\n실패 '+FAIL+'건\n');
process.exit(FAIL===0?0:1);
