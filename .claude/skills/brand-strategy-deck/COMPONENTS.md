# COMPONENTS — 재사용 컴포넌트 카탈로그

`template.html`의 CSS 클래스와 1:1 대응한다. 모든 마크업은 GRAIN 골든 예시(`references/grain-golden-example.html`)에서 실측 추출했다.
**새로 디자인하지 말 것.** 아래 스니펫의 텍스트만 교체한다.

색 토큰: `--t1 #2D7A4F` · `--t2 #C77A0F` · `--t3 #999` · `--t4 #B23B3B` · `--link #2454C7` · 카드 `#FFF` · 페이지 `#EBEBEB`.

---

## 1. 프로젝트 요약 카드 · `.snap-item`
```html
<div class="snap-grid">
  <div class="snap-item"><div class="k">Client</div><div class="v">코웨이</div></div>
  <div class="snap-item"><div class="k">Category</div><div class="v">프리미엄 리빙 오브젝트</div></div>
</div>
```

## 2. 브랜드 팩트 카드 · `.snap-item` (팩트북용)
프로젝트 요약과 같은 컴포넌트를 재사용. `k`=항목(가격대·헤리티지·보유자산), `v`=값.

## 3. 경쟁 브랜드 카드 · `.brand-card` + `.tier-badge`
```html
<div class="brand-card">
  <span class="tier-badge tier-1">T1</span>
  <div class="brand-mark">브랜드명 — 라인</div>
  <div class="brand-meta"><b>국가</b> 미국 · <b>가격대</b> $375–475<br><b>타깃</b> 40-60대 콜렉터</div>
  <div class="brand-desc"><b>핵심메시지</b> 한 줄 요약 + 우리와의 관계</div>
  <div class="brand-source"><a href="URL" target="_blank">도메인 ↗</a></div>
</div>
```
- 출처 없으면 `<div class="brand-source">공식 URL 미확보 — 추가 검증 필요</div>` (링크 없이).

## 4. Category A/B/C 카드 · `.cat-card` 헤더 + `.brand-grid`
```html
<div class="cat-label" style="margin-top:24px;">Category A</div>
<h2 class="cat-title" style="font-size:26px;">장인·소재가 말하는 럭셔리</h2>
<div class="cat-bullets"><div>공통 관점 한 줄</div><div>우리에게 주는 함의</div></div>
<div class="brand-grid"> … .brand-card × N … </div>
```

## 5. 출처 등급 T1/T2/T3/T4 · `.tier-badge`
| 등급 | 색 | 의미 |
|---|---|---|
| T1 | 초록 `--t1` | 공식 1차 출처(브랜드 공식/공신력 매체) |
| T2 | 앰버 `--t2` | 2차 신뢰 출처(리테일·업계지) |
| T3 | 회색 `--t3` | 미확인·추정, 검증 필요 |
| T4 | 빨강 `--t4` | 신뢰 낮음·반면교사 |
```html
<span class="tier-badge tier-3">T3</span>
```

## 6. 축 후보 카드 · `.axis-card`
```html
<div class="axis-grid">
  <div class="axis-card">
    <span class="pick on">채택</span>
    <div class="ax">장식적 ↔ 기능적</div>
    <p>소비자가 실제로 느끼는 대립. 럭셔리·기능 두 축을 가르는 핵심.</p>
  </div>
  <div class="axis-card">
    <span class="pick off">기각</span>
    <div class="ax">저가 ↔ 고가</div>
    <p>가격은 결과지 포지션 축이 아님 — 기각.</p>
  </div>
</div>
```

## 7. XY 포지셔닝 맵 · `.pmap`
```html
<div class="pmap">
  <div class="pm-title">Brand Positioning Map</div>
  <div class="pm-field">
    <span class="pm-axis top">리추얼소재</span>
    <span class="pm-axis bottom">일상소재</span>
    <span class="pm-axis left">장식적</span>
    <span class="pm-axis right">기능적</span>
    <!-- Goal: 비어있는 사분면 -->
    <div class="pm-node" style="top:8%; right:8%;"><div class="pm-goal">OUR<br>Goal</div></div>
    <!-- 경쟁 브랜드 노드: top/left/right/bottom % (좌표에서 환산) -->
    <div class="pm-node" style="top:22%; right:22%;">Assouline</div>
    <div class="pm-node" style="bottom:15%; left:10%;">Poketo</div>
  </div>
</div>
```
- 좌표 환산: `left% = (x+1)/2*100`, `top% = (1-(y+1)/2)*100` (y 위쪽이 +).

## 8. 화이트스페이스 카드 · `.ws-grid` (기회 + 함정 필수 쌍)
```html
<div class="ws-grid">
  <div class="ws-card opp"><div class="h">기회 (Opportunity)</div>
    <div class="b">럭셔리 소재 + 실제 작동 기능의 교집합 — 아무도 안 함.</div></div>
  <div class="ws-card trap"><div class="h">함정 (Trap)</div>
    <div class="b">수요가 없어 빈 자리일 수 있음. 초기 수요 검증 없이는 위험.</div></div>
</div>
```

## 9. 이종업계 레퍼런스 카드 · `.brand-card` 재사용
경쟁 카드와 동일 컴포넌트. `brand-meta`에 `<b>업계</b>`, `brand-desc`에 `<b>공명 지점</b>`.
```html
<div class="brand-card"><span class="tier-badge tier-1">T1</span>
  <div class="brand-mark">NOMOS Glashütte</div>
  <div class="brand-meta"><b>업계</b> 정밀 시계 · <b>국가</b> 독일</div>
  <div class="brand-desc"><b>공명 지점</b> 사파이어 케이스백으로 무브먼트 노출 — 우리 철학과 겹침</div>
  <div class="brand-source"><a href="URL" target="_blank">도메인 ↗</a></div>
</div>
```

## 10. 전략 카드 · `.concept-card` (전략 대안 / 타깃 페르소나 공용)
```html
<div class="concept-card" style="border:2px solid var(--t1);">
  <span class="concept-score" style="color:var(--t1);">9/10</span>
  <div class="concept-rank">① 방향명 ⭐</div>
  <div class="concept-title">캘리브레이션된 도구</div>
  <div class="concept-mood">냉철 · 신뢰 · 클리니컬</div>
  <div class="concept-field"><b>컬러</b> 스틸그레이+스모크글라스</div>
  <div class="concept-risk">Risk: 정서적 매력 저하 가능</div>
</div>
```

## 11. 추천 전략(풀블리드) · `.strategy-slide`
```html
<div class="strategy-slide has-img" style="background-image:url('IMG');">
  <div class="strategy-inner">
    <div>
      <div class="strategy-label">추천 · 메인</div>
      <h2 class="strategy-title">Instrument Grade</h2>
      <div class="strategy-field"><div class="fk">Asset × Opportunity</div>
        <div class="fv">브랜드 자산 ↔ 시장 기회 연결</div>
        <div class="fd">보유한 정밀 제조 역량(자산) × 빈 럭셔리-기능 교집합(기회).</div></div>
    </div>
    <div></div>
  </div>
</div>
```
- 배경 이미지 없으면 `class="strategy-slide"`(has-img 제거), 단색 `#222` 배경 유지.

## 12. 리스크 카드 · `.risk-grid` (차용 ✅ / 배제 ❌)
```html
<div class="risk-grid">
  <div class="risk-card"><div class="keep">✅ 차용하는 것</div>
    <div class="b">Exposed Structure · Raw Surface · Grid Honesty</div></div>
  <div class="risk-card"><div class="drop">❌ 배제하는 것</div>
    <div class="b">거친 콘크리트 질감 · 의도적 비대칭</div></div>
</div>
```

## 13. 출처 목록 · `.src-list`
```html
<ul class="src-list">
  <li><span class="tier-badge tier-1">T1</span><a href="URL">assouline.com ↗</a> — Mirage Hourglass 제품 페이지</li>
  <li><span class="tier-badge tier-3">T3</span>L'Objet — 공식 URL 미확보, 추가 검증 필요</li>
</ul>
<p class="limits">조사 한계: T3 이하 8건은 가격·매출 미확인. 다음 라운드에서 1차 출처 보강 필요.</p>
```

---

## 보조 슬라이드 포맷 (선택)
슬라이드형(16:9) 산출이 필요하면 `references/maxos-slide-example.html`(MX 표준 덱)을 참조.
기본 리서치·전략 리포트는 위 스크롤형(GRAIN 문법)을 정본으로 한다.
