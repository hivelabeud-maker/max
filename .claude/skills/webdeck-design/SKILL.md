---
name: webdeck-design
description: 사이드바 내비게이션 + 탭 전환형 단일 페이지 웹 문서(대응안·제안 페이지·정책 안내 등)를 HTML로 생성하는 시각 시스템. 순수 화이트 배경 + 무채색 라인(보더) 카드 + 포인트 4색(파랑·라임·핑크·오렌지) pill/accent, 다크 topbar와 다크 강조 카드로 대비. 좌측 고정 사이드바로 섹션을 오가고, 각 섹션은 지표 카드·플로우·AS-IS/TO-BE·비교표로 구성. Artifact URL로 고객사에 공유하기 좋음. 트리거: "웹 문서로 정리", "대응안 페이지 만들어", "웹으로 정리해줘", "사이드바 탭 문서", "웹덱", "이 레이아웃으로".
---

# WEBDECK Design — 사이드바 내비형 웹 문서 시스템

좌측 사이드바로 섹션을 넘기는 **단일 HTML 웹 문서**를 만드는 시각 시스템.
슬라이드 덱(`mx-deck-design`)이나 에디토리얼 리포트(`list-deck-design`)와 달리,
**한 페이지 안에서 탭으로 챕터를 오가는 인터랙티브 문서**다. Artifact로 게시해 URL 하나로 공유한다.

**목표: 누가 언제 만들어도 같은 문서로 보이게.** 토큰·레이아웃은 그대로 두고 내용만 갈아끼운다.

## 언제 쓰나

- 고객사 대상 대응 방안·운영 방안·정책 안내를 웹 페이지로 (예: 넷마블 AI 제작 대응 방안)
- 프로세스·일정·차별화처럼 **섹션이 6~8개로 나뉘고 탭으로 훑는** 문서
- Artifact URL 하나로 링크 공유하고, 필요하면 PDF로도 뽑아야 할 때

쓰지 말 것:
- 페이지 넘기는 슬라이드 제안서 → `mx-deck-design`
- 수치 중심 에디토리얼 리포트(stateofaidesign 스타일) → `list-deck-design`

## 시작 방법

```bash
cp .claude/skills/webdeck-design/template.html ./<프로젝트명>.html
# 텍스트만 치환. 토큰·레이아웃·스크립트는 손대지 않는다.
```

**Artifact로 게시할 때:** template.html의 `<!doctype>`·`<head>`·`<body>` 래퍼를 떼고
`<style>`부터 끝 `</script>`까지만 파일에 쓴다(하네스가 head를 자동으로 감쌈).
`favicon`·`title`·`description`을 붙여 게시하면 URL이 나온다. 같은 파일 경로로 재게시하면 URL 유지.

## 디자인 토큰 — 순수 화이트 단일 테마

배경은 **항상 순백(#fff)**. 다크모드는 쓰지 않는다(`color-scheme:light` 고정).
**카드는 그림자가 아니라 얇은 보더로 분리하는 "라인 카드"가 기본** — 무채색 라인 위에서 포인트 색이 튀도록.
포인트 4색은 **정체성이므로 유지** — 배경/무채색만 화이트 계열로 둔다.

```css
:root, :root[data-theme="dark"], :root[data-theme="light"]{
  --bg:#ffffff;      /* 페이지 배경 — 항상 순백 */
  --panel:#ffffff;   /* 카드 표면 (보더로 분리, 그림자 없음) */
  --panel2:#f5f5f5;  /* ★ 면처리 표준 그레이 — flat 카드·표 헤더·플로우 스텝·강조 열·note 배경 */
  --ink:#161616;     /* 잉크 & 다크 강조 카드 배경 */
  --muted:#6f6d66;   /* 보조 텍스트 */
  --line:#e6e4de;    /* 보더·디바이더 — 라인 카드의 핵심 */
  --accent:#1a1a17;  /* 사이드바 active·다크 카드 */
  --shadow:none;     /* 라인 카드 기본: 그림자 미사용 */

  /* 포인트 4색 (유지) — pill/섹션 도트/강조 텍스트 */
  --blue:#2e53f9;  --lime:#5fae1f;  --pink:#c14bb0;  --orange:#ff6e23;
  --blue2:#e7ecfe; --lime2:#eef7e0; --pink2:#fbeaf8; --orange2:#ffe4d3; /* 각 pastel 배경 */
  color-scheme:light;
}
```

- **라인 카드 = `border:1px solid var(--line)` + 그림자 없음.** 모든 `.card`가 기본으로 보더를 갖는다.
  변형: `.card.flat`은 배경만 `--panel2`로 한 톤 눌러 부차 정보에, `.card.metric`은 순백.
- **면처리(박스 배경)가 필요한 곳은 전부 `--panel2`(#f5f5f5) 중립 그레이로.** 색 면(파스텔 배경)으로 강조하지 않는다.
  강조 열(`.cmp .c-hivelab`)·안내 박스(`.note`)·AS-IS 카드·플로우 스텝 모두 회색 면 + 보더.
  포인트 색은 **면이 아니라 pill·라벨·강조 텍스트**로만 낸다(예: 회색 열 위에 파랑 pill — Mobbin 'Popular' 방식).
- **topbar(#151817)와 다크 강조 카드(`--ink` 배경)는 의도된 대비 요소** — 화이트로 바꾸지 않는다.
- 포인트 색은 `pill`·`section-title .dot`·`.card-body b` 강조·`v-eyebrow`에만. 장식으로 남발 금지.

## 타이포 위계

시스템 폰트 스택(`Apple SD Gothic Neo`·`Pretendard`·`Noto Sans KR` …), `letter-spacing:-.015em`.

| 레벨 | 크기 / 굵기 | 용도 |
|---|---|---|
| View Title (`.v-title`) | 30px / 800, `text-wrap:balance` | 섹션 대제목 (`.thin`으로 2번째 줄 약하게) |
| Metric Value (`.m-val`) | 30px / 900, `tabular-nums` | 지표 숫자 (`.m-unit` 14px) |
| Section Title (`.section-title`) | 12px / 800, 하단 보더 | 섹션 내 소제목 (앞에 컬러 `.dot`) |
| Card Title (`.card-tit`) | 14.5px / 800 | 카드 제목 |
| Lead (`.v-lead`) | 14px / muted, `max-width:660px` | 섹션 리드 문장 |
| Eyebrow (`.v-eyebrow`) | 11px / 800, 대문자, `--blue` | 섹션 라벨 (`Overview · 운영 체제`) |
| Pill (`.pill`) | 10.5px / 800, 라운드 100px | 카테고리/상태 뱃지 |
| Body (`.card-body`) | 13px / 1.68 | 카드 본문 |

숫자에는 `font-variant-numeric: tabular-nums`.

## 레이아웃 골격

```
.app
├─ .topbar (다크, sticky) — 좌: 브랜드 마크+타이틀 / 우: top-meta (Courier)
└─ .layout (grid 250px 1fr, 860px 이하 1단)
   ├─ .sidebar (sticky, 좌측 내비) — .nav-label 그룹 + .nav-item(.active) 버튼들
   └─ .main (max-width 1000px)
      └─ .view[.active] × N — 한 섹션 = 한 view (탭 전환)
.pdf-btn (우하단 고정) — window.print()
```

- 내비 클릭 → `data-v` 매칭되는 `.view`에 `.active` 토글(하단 `<script>`가 처리).
- `.nav-num`(Courier)은 **실제 순서가 정보일 때만** 붙인다(00~06). 순서가 의미 없으면 번호를 뺀다.

## 컴포넌트 레시피 — 골라 쓴다

### 지표 카드 — `.grid.cols-3 > .card.metric`
`.m-label`(라벨) + `.m-val`(큰 숫자 + `.m-unit`) + `.m-sub`(캡션). 한 줄에 2~3개.

### 카테고리 카드 — `.grid.cols-3 > .card.flat`
`.pill`(색상) + `.card-tit` + `.card-body`. 라인 카드에 배경만 `--panel2`로 한 톤 눌러 부차 정보용.

### 접수/처리 플로우 — `.flow`
`.flow-step`(현재 단계는 `.on` 다크) 사이에 `.flow-arr`(→). 자동 줄바꿈.

### 키-값 요청 표 — `.card.flat > .req-grid`
`grid-template-columns:150px 1fr`. 각 행은 `.req-row > .req-k + .req-v`.
채워 넣을 자리(예시 값)는 `.req-v > .ph`(muted)로 표시. 600px 이하 110px 1fr.

### AS-IS → TO-BE — `.tt-grid > .tt-card.asis / .tt-card.tobe`
좌 현재(옅은 배경)·우 개선(다크 `--ink` 배경, 지표는 라임). 각 카드 안에 `.flow` + `.tt-metric`.

### 비교표 — `.card.flat > .cmp-wrap > table.cmp`
`.cmp-wrap`는 `overflow-x:auto`(모바일 가로 스크롤). 강조 열은 `td.c-hivelab`(`--panel2` 회색 면).
**마지막 행 아래 여백/선 제거: `.cmp tr:last-child td{border-bottom:none}` 반드시 유지.**

### 주석 — `.note`
오렌지 톤 안내 박스(`.note b`=오렌지). 무채색 변형은 인라인 `style`로 `--panel2`.

### 푸터 — `.foot`
각 view 하단, Courier 11px. 좌: 문서 서명 / 우: `NN / 총개수`.

## PDF 추출 (내장)

- 우하단 `.pdf-btn`(`onclick="window.print()"`) — 고객이 직접 저장.
- `@media print`가 **모든 view를 펼치고**(`display:block!important` + `page-break-after`), 사이드바·버튼을 숨긴다.
  **팔레트는 `:root`를 그대로 상속** — 순백 단일 테마라 인쇄용 재정의가 필요 없다(화면 = PDF 동일).
  다크 topbar·다크 카드 배경은 `print-color-adjust:exact`로 유지.
- 실제 .pdf 파일 산출: 사전 설치 Chromium으로 렌더.
  ```bash
  CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf=out.pdf --virtual-time-budget=6000 "file://$PWD/파일.html"
  ```
  (standalone 문서 기준. Artifact 본문만 있는 파일은 doctype/head 래퍼를 씌워 렌더.)

## 반응형 규칙 (필수)

1. 절대좌표 금지 — 전부 flex/grid. 카드 개수가 늘면 자동 줄바꿈.
2. `.cols-2/3/4`는 720px 이하 1단, `.layout`은 860px 이하 1단.
3. 표·차트는 `overflow-x:auto` 컨테이너 안에 — 페이지 가로 스크롤 금지.
4. 포커스 가시성(`:focus-visible`)·모션 축소(`prefers-reduced-motion`) 유지.

## 흔한 실수

- 카드에 그림자를 다시 넣음 → 라인(보더) 카드가 기본. `box-shadow` 미사용.
- 다크모드 토큰을 되살림 → 이 시스템은 순백 단일 테마. `color-scheme:light` 고정.
- 배경을 크림색(#f2f1ee)으로 되돌림 → 배경은 항상 #fff.
- 포인트 색을 무채색으로 지움 → 4색은 정체성. 유지하되 남발은 금지.
- 비교표 마지막 행 여백 남김 → `tr:last-child td{border-bottom:none}`.
- `.nav-num` 번호를 순서 의미 없는데 붙임 → 순서가 정보일 때만.
- Artifact 게시 시 doctype/head를 그대로 붙여넣음 → `<style>`부터 붙인다.
