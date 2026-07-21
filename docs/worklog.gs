/****************************************************************
 * 업무 로그 대시보드 — Google Apps Script
 * 하이브랩 MX센터 / 김효정
 *
 * 설치:
 *  1) 대상 Google 시트 열기 → 확장프로그램 → Apps Script
 *  2) 이 코드 전체 붙여넣기 → 저장
 *  3) 함수 목록에서 setup 선택 → 실행 (최초 1회 권한 승인)
 *     → 탭(설정/로그/투두/대시보드) 생성 + 이번 주 시드 + 트리거 등록
 *  4) 이후 '📋 업무로그' 메뉴에서 수동 갱신 가능
 *
 * 원칙: 입력은 '로그'·'투두' 탭 한 곳. 집계는 자동.
 *       이번 주(월요일 시작)부터 누적. 오래된 캘린더는 파싱하지 않음.
 ****************************************************************/

var TZ = 'Asia/Seoul';
var HRS = 2;                 // 블록당 시간
var TIMES = ['06–08','08–10','10–12','12–14','14–16','16–18','18–20','20–22','22–24'];

// 카테고리 마스터 (고정 순서) — [키, 이름, 배경, 글자, 분류 키워드]
var CATS = [
  ['AI',   'AI작업',      '#CECBF6', '#3C3489', ['ai','리서치','학습','툴','아이데이션','r&d','자동화']],
  ['견적', '제안/견적',   '#F5C4B3', '#712B13', ['견적','인건비','입찰','산정','제안서','단가']],
  ['디자인','디자인/GUI', '#F4C0D1', '#72243E', ['로고','가이드','gui','ui','비주얼','회사소개서','템플릿','디자인']],
  ['문서', '문서/리포트', '#B5D4F4', '#0C447C', ['내역서','리포트','결산','r&r','ppt','보고','문서','정리']],
  ['미팅', '미팅',        '#FAC775', '#633806', ['미팅','회의','티타임','킥오프','소통','컨설팅']],
  ['세일즈','세일즈/BD',  '#9FE1CB', '#085041', ['업세일즈','세일즈','수주','bd','연장','제안','영업']],
  ['운영', '운영/HR',     '#C0DD97', '#27500A', ['채용','인력','충원','인수인계','팀','관리','hr']]
];
var CATKEYS = CATS.map(function(c){return c[0];});

/* ── 이번 주 시드 (실데이터) ─────────────────────────────
   date, 시간대, 카테고리, 프로젝트, 메모, 실측(TRUE)/계획(FALSE) */
var SEED = [
  ['2026-06-23','08–10','미팅','내부','오전 주간회의',true],
  ['2026-06-23','10–12','운영','팀','팀원 커피타임(팀 소통)',true],
  ['2026-06-23','12–14','미팅','내부','점심 센터장·실장 티타임',true],
  ['2026-06-23','14–16','견적','올리브트리/코웨이','올리브트리 포폴(애니팡 머지)+코웨이 대금일정 조정 메일',true],
  ['2026-06-23','16–18','디자인','내부','회사소개서 업데이트 컨펌+명함 인수인계',true],
  ['2026-06-23','18–20','세일즈','넷마블','넷마블 업세일즈 고민(Claude)',true],
  ['2026-06-24','10–12','세일즈','넷마블','업세일즈 전략 상의(11시 출근)',true],
  ['2026-06-24','12–14','세일즈','넷마블','업세일즈 제안 문서 리서치·제작',true],
  ['2026-06-24','14–16','미팅','올리브트리','올리브트리 미팅',true],
  ['2026-06-24','16–18','미팅','내부','SNS 브랜딩 회의(17시)',true],
  ['2026-06-24','18–20','견적','코웨이','코웨이 수정피드백+3D 견적 대응',true],
  ['2026-06-24','20–22','견적','올리브영','올리브영 견적 수정',true],
  ['2026-06-24','22–24','견적','올리브영','올리브영 견적 수정(계속)',true],
  ['2026-06-25','10–12','세일즈','넷마블','[계획] 업세일즈 제안 문서 마무리',false],
  ['2026-06-25','12–14','세일즈','크래프톤','[계획] 박연옥 님 메일 발송+후속',false],
  ['2026-06-25','14–16','세일즈','내부','[계획] KPI 사업방안(KR1·KR3)',false],
  ['2026-06-25','16–18','문서','내부','[계획] 에이전트 진행물 리뷰·정리',false]
];

/* ══════════════ 설치 / 메뉴 ══════════════ */
function onOpen(){
  // 시트를 '열 때' 자동 실행되는 함수. 수동 실행하지 마세요(→ setup 실행).
  try{
    SpreadsheetApp.getUi().createMenu('📋 업무로그')
      .addItem('대시보드 갱신', 'refreshDashboard')
      .addItem('투두 자동분류(빈 카테고리 채움)', 'classifyTodos')
      .addSeparator()
      .addItem('초기 설치(setup)', 'setup')
      .addToUi();
  }catch(e){ /* UI 없는 context에서는 무시 */ }
}

function setup(){
  var ss = SpreadsheetApp.getActive();
  var errs = [];
  function step(name, fn){ try{ fn(); }catch(e){ errs.push('· '+name+': '+e.message); } }
  step('설정 탭',   function(){ ensureSettings_(ss); });
  step('로그 탭',   function(){ ensureLog_(ss); });
  step('투두 탭',   function(){ ensureTodo_(ss); });
  step('대시보드 탭', function(){ ensureDashboard_(ss); });
  step('트리거 등록', function(){ installTriggers_(); });
  step('대시보드 갱신', function(){ refreshDashboard(); });
  var msg = errs.length
    ? '일부 단계 실패 ⚠\n' + errs.join('\n') + '\n\n(탭은 생성되었을 수 있습니다. 이 메시지를 그대로 알려주세요.)'
    : '설치 완료 ✅\n탭: 설정 / 로그 / 투두 / 대시보드\n매일 19:00, 매월 1일 08:00 자동 갱신.';
  try{ SpreadsheetApp.getUi().alert(msg); }catch(e){ Logger.log(msg); }
}

/* ══════════════ 탭 생성 ══════════════ */
function ensureSettings_(ss){
  var sh = ss.getSheetByName('설정') || ss.insertSheet('설정');
  sh.clear();
  sh.getRange(1,1,1,4).setValues([['카테고리키','이름','배경색','글자색']]).setFontWeight('bold');
  var rows = CATS.map(function(c){return [c[0],c[1],c[2],c[3]];});
  sh.getRange(2,1,rows.length,4).setValues(rows);
  for(var i=0;i<CATS.length;i++){
    sh.getRange(i+2,2).setBackground(CATS[i][2]).setFontColor(CATS[i][3]);
  }
  sh.setColumnWidths(1,4,120);
}

function ensureLog_(ss){
  var sh = ss.getSheetByName('로그');
  if(!sh){
    sh = ss.insertSheet('로그');
    var head = ['날짜','요일','시간대','시간','카테고리','프로젝트','메모','실측','주차','월','반기','년'];
    sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold').setBackground('#f4f2ec');
    // 시드
    var body = SEED.map(function(r){return logRow_(r[0],r[1],r[2],r[3],r[4],r[5]);});
    sh.getRange(2,1,body.length,body[0].length).setValues(body);
    sh.setFrozenRows(1);
    // 카테고리 드롭다운
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(catNames_(),true).build();
    sh.getRange(2,5,500,1).setDataValidation(rule);
    sh.setColumnWidth(7,360);
  }
  return sh;
}

function ensureTodo_(ss){
  var sh = ss.getSheetByName('투두');
  if(!sh){
    sh = ss.insertSheet('투두');
    var head = ['할일','카테고리','프로젝트','상태','마감','메모','등록일'];
    sh.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold').setBackground('#f4f2ec');
    sh.setFrozenRows(1);
    var catRule = SpreadsheetApp.newDataValidation().requireValueInList(catNames_(),true).build();
    sh.getRange(2,2,500,1).setDataValidation(catRule);
    var stRule = SpreadsheetApp.newDataValidation().requireValueInList(['☐ 대기','진행','완료'],true).build();
    sh.getRange(2,4,500,1).setDataValidation(stRule);
    sh.setColumnWidth(1,320);
  }
  return sh;
}

function ensureDashboard_(ss){
  var sh = ss.getSheetByName('대시보드') || ss.insertSheet('대시보드');
  ss.setActiveSheet(sh);
  ss.moveActiveSheet(1);
  return sh;
}

/* ══════════════ 파생 계산 ══════════════ */
function logRow_(dateStr, slot, cat, proj, memo, actual){
  var d = new Date(dateStr + 'T00:00:00');
  var dow = ['일','월','화','수','목','금','토'][d.getDay()];
  return [dateStr, dow, slot, HRS, cat, proj||'', memo||'', actual?'실측':'계획',
          'W'+isoWeek_(d), Utilities.formatDate(d,TZ,'yyyy-MM'),
          (d.getMonth()<6?'상반기':'하반기'), d.getFullYear()];
}
function isoWeek_(d){
  var t=new Date(d); t.setHours(0,0,0,0);
  t.setDate(t.getDate()+3-((t.getDay()+6)%7));
  var w1=new Date(t.getFullYear(),0,4);
  return 1+Math.round(((t-w1)/86400000-3+((w1.getDay()+6)%7))/7);
}
function catNames_(){return CATS.map(function(c){return c[1];});}
function nameToKey_(name){for(var i=0;i<CATS.length;i++)if(CATS[i][1]===name)return CATS[i][0];return name;}

/* ══════════════ 투두 자동분류 ══════════════ */
function classify_(text){
  var t=(text||'').toLowerCase();
  for(var i=0;i<CATS.length;i++){
    var kws=CATS[i][4];
    for(var j=0;j<kws.length;j++){ if(t.indexOf(kws[j])>-1) return CATS[i][1]; }
  }
  return '';   // 미분류
}
function classifyTodos(){
  var sh=SpreadsheetApp.getActive().getSheetByName('투두');
  var last=sh.getLastRow(); if(last<2) return;
  var vals=sh.getRange(2,1,last-1,2).getValues(); // 할일, 카테고리
  for(var i=0;i<vals.length;i++){
    if(!vals[i][1] && vals[i][0]){ // 카테고리 비었으면 채움
      var g=classify_(vals[i][0]);
      if(g) sh.getRange(i+2,2).setValue(g);
    }
  }
  SpreadsheetApp.getActive().toast('투두 자동분류 완료');
}

/* ══════════════ 대시보드 렌더 ══════════════ */
function refreshDashboard(){
  var ss=SpreadsheetApp.getActive();
  var log=ss.getSheetByName('로그'); if(!log) return;
  var last=log.getLastRow(); if(last<2){return;}
  var data=log.getRange(2,1,last-1,12).getValues();

  // 이번 주 / 이번 달 집계
  var thisWeek='W'+isoWeek_(new Date());
  var thisMonth=Utilities.formatDate(new Date(),TZ,'yyyy-MM');
  var byCatWeek=zero_(), byCatMonth=zero_(), byWeekMonth={};
  for(var i=0;i<data.length;i++){
    var r=data[i]; var catKey=nameToKey_(r[4]); var h=Number(r[3])||HRS;
    if(r[8]===thisWeek) byCatWeek[catKey]=(byCatWeek[catKey]||0)+h;
    if(r[9]===thisMonth){
      byCatMonth[catKey]=(byCatMonth[catKey]||0)+h;
      byWeekMonth[r[8]]=(byWeekMonth[r[8]]||0)+h;
    }
  }

  var sh=ss.getSheetByName('대시보드'); sh.clear();
  sh.getRange('A1').setValue('📅 업무 로그 대시보드').setFontSize(20).setFontWeight('bold');
  sh.getRange('A2').setValue('하이브랩 MX센터 · 김효정 · 갱신 '+Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HH:mm'))
    .setFontColor('#888');

  // 스탯 타일
  var totW=sum_(byCatWeek), totM=sum_(byCatMonth);
  var topW=top_(byCatWeek);
  sh.getRange('A4').setValue('이번 주('+thisWeek+') 기록').setFontColor('#888');
  sh.getRange('B4').setValue(totW+'h').setFontWeight('bold').setFontSize(14);
  sh.getRange('A5').setValue('이번 달('+thisMonth+') 기록').setFontColor('#888');
  sh.getRange('B5').setValue(totM+'h').setFontWeight('bold').setFontSize(14);
  sh.getRange('A6').setValue('이번 주 최다').setFontColor('#888');
  sh.getRange('B6').setValue(topW?catName_(topW):'—').setFontWeight('bold').setFontSize(14);

  // 카테고리별 표 (이번 달)
  var startRow=8;
  sh.getRange(startRow,1,1,3).setValues([['카테고리','시간(h)','비중']]).setFontWeight('bold').setBackground('#f4f2ec');
  var rowsOut=[]; var colors=[];
  for(var k=0;k<CATS.length;k++){
    var key=CATS[k][0], h=byCatMonth[key]||0;
    var pct=totM? Math.round(h/totM*100)+'%':'0%';
    rowsOut.push([CATS[k][1], h, pct]); colors.push(CATS[k][2]);
  }
  sh.getRange(startRow+1,1,rowsOut.length,3).setValues(rowsOut);
  for(var k=0;k<CATS.length;k++) sh.getRange(startRow+1+k,1).setBackground(CATS[k][2]).setFontColor(CATS[k][3]);

  // 차트 (이번 달 카테고리 막대)
  var chartRange=sh.getRange(startRow,1,rowsOut.length+1,2);
  sh.getCharts().forEach(function(c){sh.removeChart(c);});
  var chart=sh.newChart().asColumnChart()
    .addRange(chartRange).setPosition(startRow, 5, 0, 0)
    .setOption('title', thisMonth+' 카테고리별 시간')
    .setOption('legend',{position:'none'})
    .setOption('width',520).setOption('height',300).build();
  sh.insertChart(chart);

  // 주차별 추이 표
  var wr=startRow+CATS.length+3;
  sh.getRange(wr,1).setValue('주차별 추이(이번 달)').setFontWeight('bold');
  var wkeys=Object.keys(byWeekMonth).sort();
  if(wkeys.length){
    sh.getRange(wr+1,1,1,wkeys.length).setValues([wkeys]);
    sh.getRange(wr+2,1,1,wkeys.length).setValues([wkeys.map(function(w){return byWeekMonth[w];})]);
  }
  sh.setColumnWidth(1,140);
}
function zero_(){var o={};CATKEYS.forEach(function(k){o[k]=0;});return o;}
function sum_(o){var s=0;for(var k in o)s+=o[k];return s;}
function top_(o){var b=null,m=-1;for(var k in o){if(o[k]>m){m=o[k];b=k;}}return m>0?b:null;}
function catName_(key){for(var i=0;i<CATS.length;i++)if(CATS[i][0]===key)return CATS[i][1];return key;}

/* ══════════════ 트리거 ══════════════ */
function installTriggers_(){
  // 중복 제거
  ScriptApp.getProjectTriggers().forEach(function(t){
    var f=t.getHandlerFunction();
    if(f==='refreshDashboard'||f==='monthlySnapshot') ScriptApp.deleteTrigger(t);
  });
  // 매일 19:00 대시보드 갱신
  ScriptApp.newTrigger('refreshDashboard').timeBased().everyDays(1).atHour(19).inTimezone(TZ).create();
  // 매월 1일 08:00 전월 스냅샷
  ScriptApp.newTrigger('monthlySnapshot').timeBased().onMonthDay(1).atHour(8).inTimezone(TZ).create();
}

/* 매월 1일: 전월 요약을 '월간아카이브' 탭에 append */
function monthlySnapshot(){
  var ss=SpreadsheetApp.getActive();
  var log=ss.getSheetByName('로그'); if(!log||log.getLastRow()<2) return;
  var prev=new Date(); prev.setMonth(prev.getMonth()-1);
  var pm=Utilities.formatDate(prev,TZ,'yyyy-MM');
  var data=log.getRange(2,1,log.getLastRow()-1,12).getValues();
  var byCat=zero_();
  data.forEach(function(r){ if(r[9]===pm){ byCat[nameToKey_(r[4])]+= (Number(r[3])||HRS);} });
  var arc=ss.getSheetByName('월간아카이브');
  if(!arc){ arc=ss.insertSheet('월간아카이브');
    arc.getRange(1,1,1,2+CATS.length).setValues([['월','합계'].concat(catNames_())]).setFontWeight('bold');
  }
  var row=[pm, sum_(byCat)].concat(CATKEYS.map(function(k){return byCat[k];}));
  arc.appendRow(row);
  refreshDashboard();
}
