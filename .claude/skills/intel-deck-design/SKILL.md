---
name: intel-deck-design
description: 항목이 여러 개이고 각 항목마다 같은 구조의 깊은 정보가 붙는 자료를 좌측 번호 네비 + 뷰 전환형 대시보드 HTML로 만드는 시스템. 모노톤(화이트 바탕 + 중성 라인) + 포인트 4색(blue/lime/pink/orange) 고정, 다크 톱바, 246px 사이드바, JS 데이터 배열로 뷰 생성. 게임 팩트북·경쟁사 분석·회의록·리서치 인텔리전스처럼 "탭 눌러서 상세 보는" 내부용 자료에 사용. 트리거 "인텔 대시보드", "탭 구조로", "항목별 상세 보게", "리서치 OS", "팩트북 만들어줘", "대시보드로 정리".
---

# Intel Deck Design — 뷰 전환형 리서치 대시보드

여러 항목을 **좌측 번호 네비로 훑고, 눌러서 상세로 들어가는** 내부용 인텔리전스 사이트를 만드는 시각 시스템.
읽는 사람이 자기가 필요한 항목만 찾아 들어가는 **전략 리서치 플랫폼**처럼 보여야 한다.

## 언제 쓰나

- 대상이 **5개 이상**이고, 각 대상마다 **동일한 섹션 구조**로 정보가 붙을 때
  (게임 타이틀 14개 팩트북 / 경쟁사 20곳 분석 / 벤더 풀 / 캠페인 사후분석)
- 한 항목의 정보가 깊어서 한 화면에 다 못 넣을 때
- 읽는 사람이 **처음부터 끝까지 읽지 않고 필요한 항목만 찾아 들어가는** 자료일 때

**쓰지 말 것**
- 항목이 3개 이하 → `list-deck-design` (세로 스크롤 한 장이 낫다)
- 클라이언트 제안서·컨셉덱 → `mx-deck-design`
- 순서대로 읽어야 하는 서사형 리포트 → `list-deck-design`

세 스킬의 차이:

| 스킬 | 구조 | 읽는 방식 |
|---|---|---|
| `mx-deck-design` | 슬라이드 나열 | 발표자가 순서대로 넘긴다 |
| `list-deck-design` | 세로 스크롤 한 장 | 위에서 아래로 읽는다 |
| **`intel-deck-design`** | **좌측 네비 + 뷰 전환** | **필요한 항목만 찾아 들어간다** |

## 디자인 토큰

```css
:root{
  /* 기본 = 모노톤. 아래 4색 외에는 절대 새 색을 만들지 않는다 */
  --bg:#ffffff;--panel:#fff;--panel2:#fafafa;--ink:#161616;--muted:#77756e;--line:#e6e5e3;
  --accent:#1a1a17;--shadow:0 12px 30px rgba(24,24,24,.06);

  /* 포인트 4색(고정) — 분류·강조가 꼭 필요한 곳에만 */
  --pink:#ff86f6;--blue:#2e53f9;--lime:#c5ff79;--orange:#ff6e23;
  --pink2:#ffeafd;--blue2:#e7ecfe;--lime2:#eeffd9;--orange2:#ffe4d3;
}
```

### 4색 의미 배정 — 프로젝트마다 먼저 정하고 끝까지 지킨다

| 색 | 기본 의미 | 실제 적용 예 |
|---|---|---|
| **blue** | 핵심 정보 · 1순위 · 확정 | 캐릭터 등급 S, 세계관 키워드 칩, ORIGINAL IP 박스 |
| **lime** | 긍정 · 기회 · 사용 가능 | 등급 A, SAFE 라벨, 적합도 상 |
| **pink** | 보류 · 중간 위험 · 조건부 | CAUTION 라벨, 감정 동기 컬럼 |
| **orange** | 위험 · 회피 · 미확인 | DO NOT USE 라벨, AVOID 섹션, DATA GAP 박스 |

**한 문서 안에서 이 배정을 바꾸지 않는다.** 배정이 흔들리면 색이 정보를 잃는다.

## 필수 셋업

폰트는 Pretendard 시스템 폰트 스택으로 처리한다.
⚠️ **Artifact로 발행할 경우 CSP가 외부 폰트 CDN을 차단**하므로 `<link>`로 Pretendard를 불러오면 조용히 대체 폰트로 떨어진다. 아래 스택을 그대로 쓴다.

```css
--sans:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,
       "Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",Arial,sans-serif;
--mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
```

`body`에 `letter-spacing:-.015em` 필수. 이게 없으면 한글이 헐거워 보인다.

## 타이포 위계 — 작고 촘촘하게

이 시스템의 정체성은 **정보 밀도**다. 일반 문서보다 폰트가 두 단계 작다.

| 역할 | 크기 | 굵기 |
|---|---|---|
| 페이지 타이틀 (h2) | 25px · `letter-spacing:-.04em` | 800 |
| HERO 한 줄 정의 | 23px · `line-height:1.35` | 800 |
| 섹션 제목 (h3) | 15px | 700 |
| 카드 제목 | 13px | 800 |
| 본문 | 10.5~11px · `line-height:1.6~1.7` | 400 |
| eyebrow / 라벨 | 9px · `letter-spacing:.12em` · 대문자 | 800 |
| 번호 · 메타 | 9px 모노 | 500 |

**11px 본문이 작아 보여도 줄이지 않는다.** 대시보드는 읽는 게 아니라 훑는 것이고, 한 화면에 들어가는 정보량이 이 포맷의 값어치다.

## 레이아웃 골격

```
┌─────────────────────────────────────────┐
│ 다크 톱바 #151817 · 72px · sticky        │
├──────────┬──────────────────────────────┤
│ 사이드바  │ main                          │
│ 246px    │ .view (한 번에 하나만 active)  │
│ #ffffff  │                              │
│ sticky   │ padding: 30px 34px 70px      │
│          │ max-width: 1600px            │
└──────────┴──────────────────────────────┘
```

- 사이드바 항목은 `nav-label`(그룹 헤더) + `nav-item`(번호 + 이름 + 뱃지)
- **그룹 헤더로 항목을 분류한다** (예: 자체 IP / 라이선스 IP / 미조사)
- active 상태는 `background:var(--accent); color:#fff`
- 모바일(740px 이하)에서 사이드바가 **가로 스크롤 탭바로 전환**된다

## 컴포넌트 레시피

### 1. HERO — 각 항목 최상단

`linear-gradient(135deg,#1a1a17,#2c2b26)` 다크 카드. 2열 그리드(1.5fr / .9fr).
좌측에 **한 줄 정의 + 해설 문단**, 우측에 **메타 KV 리스트 + 컬러 스와치**.

```html
<div class="hero">
  <div><div class="eyebrow">ONE-LINE DEFINITION</div>
    <h3>한 문장 정의</h3><p>왜 이 한 줄인가 — 해설</p></div>
  <div class="hero-side">
    <div class="kv2"><span>라벨</span><b>값</b></div>
    <div class="hero-swatch"><span style="background:#..."></span>...</div>
  </div>
</div>
```

스와치는 **그 항목의 톤을 색으로 먼저 보여주는 장치**다. 4칸 권장.

### 2. Metric Row — 인덱스 페이지 상단

`.grid.cols-4` + `.card.metric`. 큰 숫자(24px/900) + 라벨 + 서브.
숫자에 `letter-spacing:-.045em`.

### 3. 3분할 컬럼 (`.motiv`)

상단 3px 보더로 색을 배정한 3칸. 관점이 세 개일 때 쓴다.
(기능/감정/팬심, 강점/약점/기회 등)

### 4. 등급 카드 (`.chars`)

우상단에 **S/A/B/C 배지**가 붙은 카드 그리드. 배지 색:
`S`=blue / `A`=lime / `B`=회색 / `C`=연회색.
하단에 `border-top` 구분선 + 주의사항 한 줄.

### 5. TOP 5 스트립 (`.dna`)

5칸 균등 그리드. 번호(모노 blue) + 굵은 제목 + 설명 한 줄.
**핵심 요소를 딱 5개로 압축**할 때. 6개 이상이면 의미가 흐려진다.

### 6. SAFE / CAUTION / DO NOT USE (`.meme`)

이 시스템의 **가장 실무적인 컴포넌트**. 사용 가부를 색으로 못박는다.

```html
<div class="meme">
  <span class="lbl safe">SAFE</span>      <!-- lime -->
  <span class="lbl caution">CAUTION</span> <!-- pink -->
  <span class="lbl no">DO NOT USE</span>   <!-- orange -->
  <div class="mt">항목명</div>
  <div class="md">설명</div>
  <div>왜 그렇게 판정했는지 한 줄</div>
</div>
```

라벨만 붙이고 끝내지 않는다. **판정 근거를 반드시 한 줄 단다.**

### 7. Timeline (`.tl`)

4칸 그리드. 중요한 칸에 `.hot` 클래스 → 2px 검정 보더 + 배경 강조.
단순 연혁이 아니라 **인식이 바뀐 사건**만 넣는다.

### 8. Cheat Sheet (`.cheat`)

다크 헤더 + 6칸 그리드(1px gap hairline). 한 항목을 한 화면으로 압축.
`.cb.warn`은 AVOID 전용 — 라벨과 텍스트가 orange 계열.

### 9. DATA GAP (`.gap`)

orange2 배경 박스에 미확인·미조사 항목을 나열한다. 모든 항목 뷰 마지막에 배치.
**칸이 비면 추측으로 채우고 싶어진다. 이 박스가 그 칸을 대신 받아준다.**

## JS 구조 — 데이터와 마크업을 분리한다

항목이 10개면 HTML을 10번 반복하지 않는다. **데이터 배열 + 렌더 함수**로 만든다.

```js
const G = [ {id:"...", name:"...", ...}, ... ];

function itemView(g){ return `...템플릿 리터럴...`; }

const views = {index:indexView};
G.forEach(g => views[g.id] = () => itemView(g));

function show(id){
  main.innerHTML = `<section class="view active">${(views[id]||views.index)()}</section>`;
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active", b.dataset.view===id));
  window.scrollTo({top:0,behavior:"instant"});
}
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>show(b.dataset.view)));
main.addEventListener("click",e=>{const t=e.target.closest("[data-go]"); if(t) show(t.dataset.go);});
show("index");
```

- 인덱스 카드에 `data-go="항목id"` → 카드 클릭으로도 진입
- 사용자 입력이 들어가면 `esc()`로 이스케이프

## 인덱스 페이지 필수 3요소

첫 화면은 항목 나열만으로 끝내지 않는다.

1. **Metric Row** — 전체 규모를 숫자로
2. **항목 카드 그리드** — 색 스와치 + 이름 + 한 줄 정의 + 키워드 칩
3. **교차 인사이트** — 항목들을 나란히 놓았을 때만 보이는 것
   (예: "가장 헷갈리기 쉬운 조합", "전 항목에서 반복된 패턴")

3번을 빼면 개별 문서를 폴더에 모아둔 것과 결과가 같다. 이 포맷을 고른 이유가 3번에 있다.

## 빠른 시작

```bash
cp .claude/skills/intel-deck-design/template.html ./<프로젝트명>-intel.html
```

그 다음 `const G = [...]` 배열만 갈아끼운다. CSS·레이아웃·JS는 손대지 않는다.

## 흔한 실수

- **포인트 4색 의미 배정을 문서 중간에 바꿈** → 색이 정보를 잃는다. 처음에 정하고 끝까지 지킨다.
- **본문을 14px로 키움** → 밀도가 무너져 그냥 웹페이지가 된다. 10.5~11px 유지.
- **항목이 3개인데 이 포맷을 씀** → 네비가 허전하다. `list-deck-design`으로 간다.
- **DATA GAP을 생략** → 확인 안 된 걸 추측으로 채우게 된다. 이 박스가 그 유혹을 막는다.
- **SAFE/CAUTION 라벨만 붙이고 근거를 안 씀** → 읽는 사람이 판정을 신뢰하지 못한다.
- **Artifact 발행 시 Pretendard CDN `<link>` 사용** → CSP 차단으로 조용히 폰트가 깨진다.
- **인덱스에 교차 인사이트가 없음** → 항목별 문서를 그냥 묶은 것과 다를 게 없다.
