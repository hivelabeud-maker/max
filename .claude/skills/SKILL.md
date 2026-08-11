---
name: design-reference-moodboard
description: >-
  사용자가 UI/웹사이트 디자인 작업이나 제안을 준비하면서 "레퍼런스 찾아줘", "디자인 참고자료 모아줘", "무드보드 만들어줘",
  "이런 느낌의 사이트 벤치마킹 해줘", "N번 빼고 다시 찾아줘", "N번이랑 비슷한 거 더 찾아줘" 등 시각적 디자인 레퍼런스를
  요청하거나 기존 무드보드를 번호 기준으로 추가/제외/업데이트하려 할 때 사용. Awwwards, CSS Design Awards, GDWEB
  세 사이트에서만, 실제 반응도·인기도(커뮤니티 평점/심사점수/WINNER 여부)를 확인해 레퍼런스를 검색하고, 콘텐츠가 실제로 있는
  기업사이트를 우선하며, 대상 기업의 업종에 갇히지 않고 스타일이 맞으면 다른 업종 사이트도 적극 활용해서 평범한 레이아웃 /
  트렌디하지만 정돈된 레이아웃 / 매우 트렌디하고 과감한 인터랙션 세 단계에 걸쳐 고르게(Tier당 6개, 총 18개) 후보를 구성해
  매번 1번부터 새로 번호를 매긴 카드로 무드보드 HTML 문서를 만들어준다.
---

# 디자인 레퍼런스 무드보드 스킬

UI/웹사이트 디자인 작업이나 제안을 준비할 때, 디자인 레퍼런스를 조사하고 정해진 고정 템플릿(라이트 테마 HTML 문서)으로 정리해주는 스킬이다. 목표는 세 가지다: (1) 디자이너가 하나하나 찾아다니지 않아도 근거 있는 큐레이션을 받아볼 수 있게 하는 것, (2) 회사명이 무엇이든 "레퍼런스 찾아줘"라고만 하면 항상 같은 톤·구조의 결과물이 나오게 해서 매번 문서 포맷을 새로 디자인할 필요가 없게 하는 것, (3) 콘텐츠가 빈약한 단일 랜딩페이지가 아니라 실제 기업사이트 수준의 밀도 있는 레퍼런스를 찾아주는 것.

**중요: 7단계에 있는 HTML/CSS 템플릿은 절대 임의로 바꾸지 않는다.** 색상, 레이아웃 구조(3열 그리드), 카드 안에 들어가는 요소, 좌측 정렬, 상단 로고, 이미지/타이틀 클릭 링크는 모두 사용자가 여러 차례 명시적으로 확정한 스펙이다. 매번 이 템플릿을 그대로 재사용하고, 안에 들어가는 텍스트·이미지·레퍼런스 데이터만 프로젝트에 맞게 채운다.

## 1단계 — 브리프 파악 (신규 프로젝트인 경우)

레퍼런스를 찾기 전에 아래 정보를 사용자에게 확인한다 (이미 대화에서 알 수 있으면 다시 묻지 않는다):

- **프로젝트/업종**: 어떤 종류의 사이트인가 (예: "OOO 기업사이트 제안")
- **참고할 특정 경쟁사/업계 사이트**가 있는지
- **레퍼런스 개수**: 기본값은 **Tier당 6개, 총 18개** (7단계 템플릿이 3열×2행 배열에 맞춰져 있기 때문). 사용자가 다른 개수를 요청하면 그에 맞추되, 템플릿의 3열 그리드 구조는 유지한다.
- **중점적으로 볼 요소**: 전체적인 룩앤필인지 특정 컴포넌트인지

같은 프로젝트를 이어서 다듬는 요청(아래 6단계)이면 이 질문은 생략한다.

레퍼런스의 성격은 기본적으로 **실제 운영 중인 기업사이트**로 잡는다. 회사소개·사업영역·지속가능경영·IR·채용 등 여러 섹션을 갖춘, 콘텐츠 밀도가 있는 사이트를 우선한다. 단일 제품 랜딩페이지, 단발성 캠페인 마이크로사이트, 개인 포트폴리오는 콘텐츠가 빈약해 보이기 쉬우므로 기본값에서는 피하고, Tier 3처럼 인터랙션 자체가 목적인 경우에만 보조적으로 섞는다.

## 2단계 — 레퍼런스 수집: 항상 3단계 스펙트럼으로, 대충 찾지 않는다

레퍼런스를 찾을 때마다, 결과가 아래 세 단계에 걸쳐 각 6개씩(총 18개) 채워지도록 구성한다:

- **Tier 1 — 평범한 레이아웃**: 업계 표준에 가까운, 검증된 안전한 레이아웃. 리스크가 거의 없는 선택.
- **Tier 2 — 트렌디하지만 정돈된 레이아웃**: 요즘 감각은 담되 구조는 여전히 예측 가능하고 정돈되어 있는 선택. 적당한 리스크.
- **Tier 3 — 매우 트렌디하면서 과감한 인터랙션**: WebGL, 3D, 파격적인 스크롤/모션 등 실험적 인터랙션이 두드러지는 선택. 가장 높은 리스크, 가장 큰 임팩트.

**대충 찾지 않는다 — 반응도/인기도를 반드시 확인한다.** 처음 눈에 띄는 후보로 채우지 말고, 실제로 좋은 반응을 받은 최신 트렌드 레퍼런스인지 다음 신호로 확인한다:
- **Awwwards**: 사이트 상세 페이지의 커뮤니티 평균 평점(Design/Usability/Creativity/Content 투표 평균), Site of the Day/Honorable Mention 여부.
- **CSS Design Awards**: 심사위원 최종 점수(Final Judge's Score, JPANEL), WOTD(Website of the Day) 또는 Special Kudos 여부.
- **GDWEB**: WINNER 배지 여부.

가능하면 각 레퍼런스의 실제 점수/등급을 선정 이유(reason)에 근거로 남긴다 (예: "커뮤니티 평균 평점 9점대", "CSSDA 심사점수 7.9의 Special Kudos"). 최신(최근 몇 개월 이내) 등재 항목을 우선한다.

**(A) 갤러리 사이트 검색 — 아래 세 곳만 사용한다.** 다른 갤러리 사이트(Dribbble, Behance, Land-book 등)는 쓰지 않는다.

- **Awwwards** — https://www.awwwards.com/websites/
- **CSS Design Awards** — https://www.cssdesignawards.com/
- **GDWEB** — https://www.gdweb.co.kr/sub/list.asp (국내 웹디자인 어워드. `Txt_word=` 검색 파라미터로 한글 키워드 검색 가능)

**(B) 업종에 갇히지 않는다 — 스타일이 맞으면 장르는 무관하다.** 대상 기업이 예를 들어 식품 회사라고 해서 검색을 식품/음료(Food & Drink) 카테고리에만 한정하지 않는다. 실제 검색 순서는 다음과 같다:

1. 먼저 대상 기업과 같은 업종(예: 식품)에서 직접적인 경쟁사·유사 기업 사이트를 1~2개 정도 찾아 감을 잡는다 (있으면 좋지만 필수는 아니다).
2. 이어서 **업종 필터를 풀고** Business & Corporate, Institutions, Technology, Luxury, Real Estate, Fashion, Startups 등 다양한 카테고리를 함께 탐색한다. GDWEB에서도 식품에 한정하지 말고 기업소개/제조/IT/금융서비스/에너지 등 여러 카테고리를 함께 확인한다.
3. 업종이 다르더라도 레이아웃·톤·정보구조·인터랙션 스타일이 해당 Tier에 맞고 실제 반응도(평점/심사점수/WINNER)가 검증되어 있다면 적극적으로 채택한다. 선정 이유(reason)에는 업종이 다르다는 점과, 그럼에도 어떤 스타일적 요소를 참고할 만한지를 함께 적는다 (예: "업종은 다르지만 정보구조와 타이포그래피 계층이 참고할 만합니다").
4. Tier 1을 찾을 때는 "business corporate", "institutions", "clean", "minimal" 같은 카테고리/태그를, Tier 3를 찾을 때는 "experimental", "WebGL", "3D", CSSDA의 `website-gallery?feature=WebGL` 갤러리와 Special Kudos/WOTD 목록을 업종 구분 없이 활용한다.

**(C) 경쟁사/업계 사이트 직접 확인** — 사용자가 언급했거나 (A)(B)에서 찾은 실제 서비스 사이트는 Claude in Chrome으로 직접 접속해서 살펴본다. 스크린샷 또는 `og:image`를 근거 이미지로 쓴다.

레퍼런스마다 다음을 기록한다: 이름(name), 출처(source: Awwwards/CSS Design Awards/GDWEB), 원본 URL(url), 이미지(image), **Tier(1/2/3)**, 특징 태그(tags, 2~4개), 선정 이유(reason, 한 문장~두 문장, 가능하면 반응도/점수 근거 포함, 업종이 다르면 그 점도 명시).

## 3단계 — 특징 태그 붙이기

각 레퍼런스마다 한눈에 훑을 수 있는 특징 태그를 2~4개 붙인다. 실제로 관찰한 특징에서 뽑는다 — 지어내지 않는다.

- **톤/색감**: 다크톤, 컬러풀, 모노톤, 블랙&화이트, 파스텔
- **레이아웃/구조**: 미니멀, 그리드, 풀스크린, 스크롤내러티브, 세로형메뉴
- **인터랙션/기술**: 3D, 모션그래픽, 패럴랙스, WebGL, 히어로영상
- **정보전달 방식**: 데이터시각화, 스토리텔링, 타이포그래피중심

## 4단계 — 순서 관리 (화면에는 번호를 표시하지 않는다)

**카드 위에는 #1, #2 같은 번호 배지를 넣지 않는다.** 대신 문서 안에서의 위치(Tier 1의 1~6번째 → Tier 2의 7~12번째 → Tier 3의 13~18번째, 즉 문서에 등장하는 순서)를 내부적으로 기억해 둔다.

사용자가 "3번 빼고 다시 찾아줘"처럼 번호로 지정하면, **가장 최근에 보여준 무드보드에서 몇 번째로 등장했는지**를 기준으로 어떤 레퍼런스를 가리키는지 판단한다. 새 무드보드를 만들 때마다 이 순서는 다시 1번째부터 계산된다 (영구 ID가 아니다).

## 5단계 — 데이터 저장 (내용은 누적, 화면 순서는 비영구)

무드보드마다 HTML과 짝을 이루는 JSON 데이터 파일을 만든다: `moodboard_data_{프로젝트명}.json`.

```json
{
  "project": "프로젝트명",
  "references": [
    {
      "name": "사이트/작업 이름",
      "source": "Awwwards | CSS Design Awards | GDWEB | 자사 현황 | 경쟁사 직접확인",
      "url": "https://...",
      "image": "https://... 또는 상대경로",
      "tier": 1,
      "tags": ["다크톤", "스크롤내러티브"],
      "reason": "선정 이유 (가능하면 반응도/점수 근거 포함, 업종이 다르면 명시)",
      "status": "active"
    }
  ]
}
```

규칙:
- 항목을 뺄 때는 배열에서 삭제하지 말고 `status`를 `"excluded"`로 바꾼다 (완전히 새로 시작하고 싶다는 요청이 아닌 이상 히스토리는 남긴다).
- 이 JSON은 작업 폴더에 만들고, 최종 HTML과 함께 outputs 폴더로 복사한다. 같은 프로젝트로 다시 요청이 오면 이 JSON을 먼저 찾아 읽고 이어서 작업한다 (없으면 새로 만든다).

## 6단계 — 번호로 다듬기 (이어서 요청하는 경우)

사용자가 "3번 빼고 더 찾아줘", "Tier 3으로 더", "1번 빼줘" 같은 요청을 하면:

1. 같은 프로젝트의 `moodboard_data_*.json`을 찾아 읽는다.
2. **직전에 보여준 무드보드에서 몇 번째로 등장했는지**를 기준으로 언급된 번호가 어떤 레퍼런스를 가리키는지 판단한다.
3. 해당 레퍼런스의 `status`를 `"excluded"`로 바꾼다.
4. 사용자가 새 관점이나 특정 Tier를 줬으면 2단계를 그 기준으로 다시 실행해서 새 항목을 추가한다 — 그 Tier가 6개를 유지하도록 채운다. 업종 제한 없이 스타일 기준으로 찾는다는 원칙은 여기서도 동일하게 적용한다.
5. JSON을 갱신하고, `active` 상태인 항목으로 7단계 템플릿을 다시 채워 새 HTML을 만든다.
6. 사용자에게는 무엇을 빼고 무엇을 추가했는지 짧게 요약한다.

## 7단계 — 무드보드 문서 작성: 고정 HTML/CSS 템플릿 (그대로 사용)

아래 템플릿을 **그대로** 사용한다. `<style>` 블록, 상단 로고, 카드 구조는 절대 바꾸지 않는다 — 오직 `《 》`로 표시된 부분만 프로젝트별 내용으로 채운다.

**핵심 규칙 (전부 사용자가 확정한 사항):**
- 라이트 테마 (`--bg:#f6f7f9`, 흰 카드 패널, 옅은 보더).
- Tier 색상은 이 순서 고정: **Tier 1 = `#FF00D4`, Tier 2 = `#790BE0`, Tier 3 = `#0B2BE0`** (CSS 변수 `--good`/`--warn`/`--bad`에 매핑되어 있다. 변수 이름은 예전 네이밍이 남은 것일 뿐, 실제 색은 항상 위 순서를 따른다).
- 상단에 로고 이미지를 **가운데 정렬**로 넣는다. 로고는 `rlogo.png`라는 파일명으로 HTML과 같은 폴더에 함께 저장해서 `<img src="rlogo.png">`로 참조한다 (base64 인라인은 렌더링이 깨지는 사례가 있었으므로 쓰지 않는다). 높이 19px, 가로는 비율 유지. 이 로고는 프로젝트와 무관하게 항상 동일하다.
- 로고를 제외한 모든 텍스트(설명 문단, Tier 제목/설명, 카드 안 텍스트, 종합 코멘트, 푸터)는 **좌측 정렬**.
- 레퍼런스 카드 안에는 **이미지, 제목, 특징 태그, 선정 이유**를 넣는다. **이미지와 제목은 각각 `<a href="{원본 url}" target="_blank" rel="noopener">`로 감싸서 클릭하면 새 탭에서 원본 사이트로 이동하도록 한다.** 카드 안에 번호 배지(#1 등)나 별도의 출처 텍스트 배지는 넣지 않는다.
- 카드의 텍스트 영역(`.ref-card .body`) 배경은 흰색이 아니라 카드와 같은 회색(`var(--bg)`)으로 통일한다.
- 각 Tier 섹션의 그리드는 **3열 고정** (`grid-template-columns:repeat(3, 1fr)`) — 레퍼런스 6개면 자연스럽게 3×2 배열이 된다. 900px 이하에서는 2열, 600px 이하에서는 1열로만 반응형 축소한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>《프로젝트명》 기업사이트 디자인 레퍼런스 무드보드</title>
<style>
  :root{
    --bg:#f6f7f9; --panel:#ffffff; --border:#e3e5e9; --text:#1d1f24; --sub:#6b7280;
    --accent:#111827; --accent-light:#f3f4f6;
    --good:#FF00D4; --good-light:#ffe3f9;
    --warn:#790BE0; --warn-light:#f0e3fc;
    --bad:#0B2BE0; --bad-light:#e3e8fc;
  }
  *{box-sizing:border-box;}
  body{
    margin:0;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic",sans-serif;
    background:var(--bg); color:var(--text); line-height:1.6;
  }
  .page-title{padding:28px 24px 4px; text-align:center;}
  .page-title-logo{height:19px; width:auto; display:inline-block;}

  .wrap{max-width:1180px; margin:0 auto; padding:20px 20px 80px;}
  header.top{margin-bottom:24px; text-align:left;}
  header.top p{color:var(--sub); margin:0 0 4px; font-size:14px; max-width:none;}

  .card{background:var(--panel); border:1px solid var(--border); border-radius:10px; padding:22px; margin-bottom:20px; text-align:left;}
  .card h2{font-size:16px; margin:0 0 4px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; text-align:left;}
  .card h2 .num{display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; color:#fff; font-size:12px; font-weight:700; flex-shrink:0;}
  .card .desc{color:var(--sub); font-size:12.5px; margin:2px 0 16px; text-align:left;}
  .card .desc .tier-tag{font-size:11px; font-weight:600; padding:2px 9px; border-radius:99px; margin-left:8px;}

  .tier1 h2 .num{background:var(--good);}
  .tier1 .desc .tier-tag{background:var(--good-light); color:var(--good);}
  .tier2 h2 .num{background:var(--warn);}
  .tier2 .desc .tier-tag{background:var(--warn-light); color:var(--warn);}
  .tier3 h2 .num{background:var(--bad);}
  .tier3 .desc .tier-tag{background:var(--bad-light); color:var(--bad);}

  .grid{display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;}
  .ref-card{position:relative; background:var(--bg); border:1px solid var(--border); border-radius:10px; overflow:hidden; display:flex; flex-direction:column; text-align:left;}
  .ref-card .thumb{width:100%; aspect-ratio:16/10; object-fit:cover; background:#eceef1; display:block;}
  .ref-card .thumb-link{display:block;}
  .ref-card .body{padding:14px 16px 16px; background:var(--bg); text-align:left;}
  .ref-card h3{font-size:14.5px; margin:0 0 8px; color:var(--text); text-align:left;}
  .ref-card h3 a{color:inherit; text-decoration:none;}
  .ref-card h3 a:hover{text-decoration:underline;}
  .ref-card .thumb-link:hover .thumb{opacity:.88;}
  .tags{display:flex; flex-wrap:wrap; gap:6px; margin-bottom:9px; justify-content:flex-start;}
  .tags span{font-size:10.5px; background:var(--accent-light); color:var(--sub); padding:3px 8px; border-radius:6px; border:1px solid var(--border);}
  .ref-card .reason{font-size:12.5px; color:var(--text); opacity:.82; line-height:1.55; margin:0; text-align:left;}

  .overall-text{font-size:13.5px; line-height:1.75; color:var(--text); background:var(--bg); border:1px solid var(--border); border-radius:8px; padding:14px 16px; margin-top:6px; text-align:left;}
  .overall-text p{margin:0 0 10px;}
  .overall-text p:last-child{margin-bottom:0;}

  footer{text-align:left; color:var(--sub); font-size:12px; margin-top:24px;}

  @media (max-width:900px){ .grid{grid-template-columns:repeat(2, 1fr);} }
  @media (max-width:600px){
    .grid{grid-template-columns:1fr;}
    .card h2{flex-direction:column; align-items:flex-start; gap:4px;}
  }
</style>
</head>
<body>

<header class="page-title">
  <img src="rlogo.png" alt="로고" class="page-title-logo">
</header>

<div class="wrap">
  <header class="top">
    <p>Awwwards / CSS Design Awards / GDWEB 세 곳에서만, 실제 반응도·인기도(커뮤니티 평점, 심사점수, WINNER 여부)를 확인해 고른 레퍼런스입니다. 리스크 낮음(핑크) → 중간(퍼플) → 높음(블루) 순으로 3단계, 각 6개씩 총 18개입니다.</p>
  </header>

  <!-- TIER 1 -->
  <section class="card tier1">
    <h2><span class="num">1</span>Tier 1 — 평범한 레이아웃</h2>
    <p class="desc">안전하고 정석적인 기업 사이트<span class="tier-tag">리스크 낮음</span></p>
    <div class="grid">
      <!-- 아래 ref-card를 6개 반복. 번호 배지 없음. 이미지·타이틀은 원본 url로 링크. -->
      <div class="ref-card">
        <a class="thumb-link" href="《원본 URL》" target="_blank" rel="noopener"><img class="thumb" src="《이미지 URL》" alt="《레퍼런스 이름》"></a>
        <div class="body">
          <h3><a href="《원본 URL》" target="_blank" rel="noopener">《레퍼런스 이름》</a></h3>
          <div class="tags"><span>《태그1》</span><span>《태그2》</span><span>《태그3》</span></div>
          <p class="reason">《선정 이유 — 반응도/점수 근거 포함, 업종이 다르면 명시》</p>
        </div>
      </div>
      <!-- ... 총 6개 ... -->
    </div>
  </section>

  <!-- TIER 2 -->
  <section class="card tier2">
    <h2><span class="num">2</span>Tier 2 — 트렌디하지만 정돈된 레이아웃</h2>
    <p class="desc">최신 톤을 따르되 구조는 명확<span class="tier-tag">리스크 중간</span></p>
    <div class="grid"><!-- ref-card 6개 --></div>
  </section>

  <!-- TIER 3 -->
  <section class="card tier3">
    <h2><span class="num">3</span>Tier 3 — 매우 트렌디하면서 과감한 인터랙션</h2>
    <p class="desc">WebGL/3D/실험적 구조 중심 · 고득점 위주<span class="tier-tag">리스크 높음</span></p>
    <div class="grid"><!-- ref-card 6개 --></div>
  </section>

  <!-- 종합 의견 -->
  <section class="card">
    <h2><span class="num" style="background:var(--accent);">✓</span>종합 코멘트</h2>
    <div class="overall-text">
      <p>《Tier 1 전반에 대한 코멘트》</p>
      <p>《Tier 2 전반에 대한 코멘트》</p>
      <p>《Tier 3 전반에 대한 코멘트》</p>
      <p>《이 프로젝트에 적용한다면 어떤 조합을 추천하는지》</p>
    </div>
  </section>

  <footer>Tier 1·2·3 각 6개씩 총 18개입니다. 다음에 이어서 다듬을 때는 moodboard_data_《프로젝트명》.json을 기준으로 진행됩니다.</footer>
</div>

</body>
</html>
```

파일명 예: `moodboard_{프로젝트명}.html`. 로고 파일 `rlogo.png`를 같은 폴더에 함께 저장한다 (없으면 이전에 저장해 둔 것을 재사용하거나, 사용자가 제공한 로고 이미지를 그 파일명으로 저장). 작업 폴더에서 만들고 완성되면 outputs 폴더로 복사한다. JSON 데이터 파일도 같이 복사한다.

## 8단계 — 전달

문서를 저장한 뒤 `present_files`로 HTML과 `rlogo.png`를 함께 사용자에게 보여준다. 응답에는 레퍼런스 개수와 Tier별 분포, 그리고 업종 외 레퍼런스를 얼마나 섞었는지를 한두 문장으로 요약한다.

## 참고

- 레퍼런스는 실제로 검색/방문해서 찾은 것만 사용한다. 확인하지 않은 사이트를 지어내지 않는다.
- 갤러리 소스는 Awwwards, CSS Design Awards, GDWEB 세 곳으로 고정한다.
- 레퍼런스는 대상 기업과 같은 업종에 한정하지 않는다. 스타일·레이아웃이 적합하고 반응도가 검증되어 있다면 다른 업종의 기업사이트도 적극 사용한다.
- 콘텐츠가 빈약한 단일 랜딩페이지·캠페인 마이크로사이트·개인 포트폴리오보다는 여러 섹션을 갖춘 실제 기업사이트를 우선한다.
- 7단계의 HTML/CSS 템플릿(색상, 3열 그리드, 카드 구성 요소, 좌측 정렬, 로고, 클릭 링크)은 프로젝트가 바뀌어도 절대 바꾸지 않는다 — 회사명이 무엇이든 항상 이 템플릿으로 나온다.
- 카드 안에는 번호 배지·출처 텍스트 배지를 넣지 않는다. 이미지·제목(링크)·태그·선정 이유만 넣는다.

## Figma로 가져가기 (참고 — 자동화 불가, 안내만)

무드보드가 완성되면 사용자가 각 레퍼런스를 Figma에 "레이어가 살아있는 상태로" 가져가고 싶어할 수 있다. 이건 지금 가진 도구로 자동 실행할 수 없다 — Figma MCP 도구는 기존 Figma 파일을 읽고 쓰는 용도이지, 임의의 외부 웹사이트를 통째로 레이어로 변환하는 기능이 아니기 때문이다. 대신 다음을 안내한다:

1. Figma 커뮤니티 플러그인 **html.to.design** (‹div›RIOTS 제작)을 설치하라고 안내한다. URL을 붙여넣으면 텍스트/버튼/이미지가 각각 편집 가능한 레이어로 변환된다. 무료 플랜은 월 12회 제한이 있다.
2. 크롬에서 직접 캡처하고 싶다면 같은 팀에서 만든 **html.to.design 크롬 확장**을 함께 설치하면, 열려있는 탭을 바로 캡처해 Figma로 보낼 수 있다.
3. 이 스킬은 무드보드가 완성되면 `figma_import_urls_{프로젝트명}.txt` 파일을 함께 만들어, `active` 상태인 레퍼런스의 이름 + URL을 Tier 순서대로 정리해 사용자가 플러그인에 붙여넣기 쉽게 해준다 (JSON에는 url이 저장되어 있으므로 여기서 가져다 쓴다).
