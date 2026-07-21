---
name: mx-deck-design
description: MX실 표준 제안서/덱 HTML 생성 시스템. Figma "데일리 미션" 덱(코웨이 BEREX 제안서)에서 실측 추출한 규격 — 화이트 배경 + #F3F3F3 카드(라디우스 30px) + #171717 잉크, 검정 챕터 디바이더, 번호+우측목차 섹션 오프너, Pretendard 3웨이트 타이포 스케일(120/72/44/24/18/16). 슬라이드형 제안서·컨셉덱·리서치덱을 HTML로 만들 때 사용. 트리거: "덱 만들어줘", "제안서 정리", "MX 덱", "슬라이드로 정리", "BEREX 스타일로".
---

# MX Deck Design — 실 표준 제안서 덱 시스템

Figma 표준 덱(1920×1080, 82모듈)과 같은 포맷의 HTML 덱을 만드는 시각 시스템.
**목표: 누가 언제 만들어도 같은 덱으로 보이게.** 컬러·타이포·마진은 손대지 않고 내용만 갈아끼운다.

## 언제 쓰나

- 클라이언트 제안서(리서치 → 전략 → 컨셉 흐름)를 HTML 덱으로
- 리서치 결과·트렌드 정리·무드보드를 팀 표준 포맷으로 공유할 때
- Figma 덱을 만들기 전 초안을 빠르게 조판해볼 때

쓰지 말 것: 에디토리얼 리포트(그건 `list-deck-design`), 인터랙티브 대시보드.

## 디자인 토큰 — Figma 실측값

```css
:root {
  --bg:        #FFFFFF;   /* 콘텐츠 슬라이드 배경 */
  --bg-dark:   #0A0A0A;   /* 커버·디바이더 배경 */
  --bg-dark2:  #1C1C1E;   /* 섹션 오프너 배경 (커버보다 한 톤 밝게) */
  --card:      #F3F3F3;   /* 카드 표면 */
  --ink:       #171717;   /* 잉크 & 다크 강조 카드 배경 */
  --ink-inv:   #FFFFFF;
  --muted:     #9C9C9C;   /* 출처·보조 */
  --meta:      #B0B0B0;   /* 헤더 메타 (50% 톤) */

  --sans: "Pretendard Variable", Pretendard, -apple-system,
          "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;

  --r-card: 30px;         /* 카드 라디우스 — 항상 30 */
}
```

**액센트 컬러는 토큰에 없다** — 프로젝트마다 1색만 가져와서 `--accent`로 주입한다
(예: BEREX 딥블루, 웨이크메이크 코랄). 무채색 시스템 + 포인트 1색이 이 덱의 정체성.

### 분류·태그·차트용 포인트 팔레트 (MAXOS 대시보드 v8 차용)

기본은 무채색+액센트 1색이지만, **여러 항목을 구분해야 하는 구간**(다계열 차트, 상태 태그,
카테고리 뱃지)에서는 실 대시보드 v8의 기능 팔레트를 그대로 차용한다. 항상 deep/soft 쌍으로:
deep은 텍스트·라인·채움, soft는 그 뒤 배경.

```css
:root {
  --sig:       #2F3E5F;  --sig-soft:    #EEF1F7;  /* 시그니처 네이비 — 기본 강조·1계열 */
  --pt-blue:   #1D4ED8;  --pt-blue-soft:  #DBEAFE;  /* 진행중·데이터 2계열 */
  --pt-green:  #2D7A4F;  --pt-green-soft: #E5F2E9;  /* 긍정·완료·상승 */
  --pt-amber:  #C77A0F;  --pt-amber-soft: #FFF6E5;  /* 주의·중립 경고 */
  --pt-red:    #B23B3B;  --pt-red-soft:   #FDECEC;  /* 부정·리스크·하락 */
  --pt-purple: #8B5CF6;                             /* 보조 분류 (soft: #EDE9FE) */
  --pt-pink:   #7A1F4A;  --pt-pink-soft:  #FBE7F1;  /* 디자인 카테고리 */
}
```

사용 룰:
- 다계열 차트 색 순서: `--sig` → `--pt-blue` → `--pt-green` → `--pt-amber` → `--pt-purple` (5계열 초과면 차트를 쪼갠다)
- 상태 태그: `배경 soft + 글자 deep` 조합 고정 (예: 완료 = green-soft 배경 + green 글자)
- 의미 없는 장식으로 쓰지 않는다 — **구분이 필요할 때만.** 구분이 없으면 무채색+액센트 1색으로 복귀.

## 타이포 위계 — 실측 스케일 (Pretendard 3웨이트만)

| 레벨 | 크기 / 굵기 | 자간 | 용도 |
|---|---|---|---|
| Display | `clamp(64px, 8vw, 120px)` Bold | -0.019em | 강조 카드 히어로 숫자 |
| Stat | `clamp(44px, 5vw, 72px)` Bold | -0.02em | 통계 숫자 (단위는 절반 크기) |
| Divider Title | `clamp(56px, 9vw, 160px)` Bold | -0.03em | 검정 디바이더 대형 타이포 |
| Opener Title | `clamp(40px, 6vw, 90px)` Regular | -0.02em | 섹션 오프너 (번호 옆) |
| Quote | `clamp(24px, 2.5vw, 37px)` Regular | -0.02em | 인용문, 가운데 정렬 |
| Slide Title | `clamp(28px, 3vw, 44px)` Bold | -0.01em · lh 1.3 | 슬라이드 제목 |
| Card Label | 24px Bold | 0 | 카드 소제목 |
| Eyebrow | 18px SemiBold | 0 | 섹션명 (Research 등) |
| Body | 16px Regular · lh 1.4 | 0 | 본문 |
| Meta | 14px Regular · 50% | +0.5px | 상단 헤더 바 |
| Source | 12px · var(--muted) | 0 | 출처 (우하단 고정) |

숫자에는 항상 `font-variant-numeric: tabular-nums`.

## 마진 3단계 — 정보량에 따라 (의도된 변형, 통일하지 말 것)

| 클래스 | 데스크톱 좌우 패딩 | 언제 |
|---|---|---|
| `.m-divider` | `clamp(24px, 2.3vw, 45px)` | 디바이더 — 타이포가 주인공 |
| `.m-content` | `clamp(24px, 4.2vw, 80px)` | 기본 콘텐츠 |
| `.m-dense` | `clamp(24px, 5.7vw, 110px)` | 카드·데이터 많은 슬라이드 |

## 유연 레이아웃 규칙 (모바일에서 깨지지 않게 — 필수)

1. **절대좌표 금지.** 모든 배치는 flex/grid. 카드 개수가 3→5개가 되면 자동 줄바꿈되어야 한다.
2. 카드 행: `display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: clamp(16px, 2vw, 38px);`
3. 2컬럼(좌 타이틀 / 우 본문): `grid-template-columns: minmax(280px, 5fr) 7fr;` + `@media (max-width: 760px) { grid-template-columns: 1fr; }`
4. 폰트는 전부 `clamp()` — 위 표 그대로.
5. 슬라이드는 고정 1080px 높이가 아니라 `min-height: min(56.25vw, 100svh)` + 내용에 따라 늘어남.
6. 표·차트는 `overflow-x: auto` 컨테이너 안에 — 페이지 가로 스크롤 금지.

## 공통 골격 — 모든 슬라이드에 들어가는 것

**상단 메타 바** (3존, 14px, 50% 투명):
```html
<header class="meta-bar">
  <span>{고객사} X HIVELAB</span><span>PROPOSAL</span><span>{연도}</span>
</header>
```

**출처 라인** (데이터 쓴 슬라이드만, 우하단): `<p class="source">출처 : {매체} {연도}</p>`

## 모듈 레시피 — Figma 모듈명과 1:1 대응

Figma에서 고르듯 여기서도 골라 쓴다. 클래스명 = Figma 프레임명.

### `cover--main` — 표지
검정 배경. 좌상단 대형 타이틀(Display). 하단에 기밀 고지(12px muted) + DEVICE/DATE/CLIENT 3필드.

### `divider--*` — 챕터 디바이더
검정 배경, 영문 타이틀 + 한글 서브 두 줄. 마진 `.m-divider`. 텍스트 외 요소 없음.

### `section-0N--*` — 섹션 오프너
`--bg-dark2` 배경. 좌측 흐린 번호(01~07) + 대형 타이틀, 우측에 목차 리스트(`N.1 항목명` 형식, 14px).

### `market--stat-cards` — 통계 카드 3+1
연회색 카드 3개(330 기준, auto-fit) + 다크 강조 카드 1개(1.8배 폭, `--ink` 배경).
카드 내부: 우상단 큰 숫자(Stat, 우측정렬) / 하단에 라벨(24 Bold) + 캡션(16 Regular).
강조 카드 숫자는 Display 크기. **다크 강조 카드는 슬라이드당 1개만.**

### `two-col` — 좌 타이틀 / 우 본문 (기본 콘텐츠 골격)
좌: eyebrow(18 SemiBold) + 슬라이드 타이틀(44 Bold). 우: 본문 16px(678px 폭 기준).

### `pull-quote` — 인용
`" 문장 "` 형태, Quote 크기, 가운데 정렬. 슬라이드당 1개.

### `market--persona-quotes` — 페르소나 인용 카드
카드 3개 auto-fit. 각: 큰따옴표 인용문(16~18px) + 하단 `나이 · 직업 · 지역` 메타(muted).

### `research--category-case` — 리서치 케이스 그리드 (마케터 산출 표준)
카테고리 단위 케이스 정리. 상단에 카테고리 헤더(Category_Label 18 SemiBold + Main_Title 44 Bold + 불릿 1~2줄),
아래 케이스 카드 auto-fit 그리드. 각 카드: 이미지(또는 플레이스홀더) + 브랜드명(24 Bold) +
"훔칠 포인트" 한 줄(16px) + **출처 링크(12px muted, `브랜드명 ↗` 형식)**.
```html
<div class="case-card">
  <div class="ph">image</div>
  <div class="t-label">{브랜드명}</div>
  <p class="cap">{훔칠 포인트 한 줄}</p>
  <a class="src-link" href="{URL}">{도메인} ↗</a>
</div>
```

### `research--brand-detail` — 브랜드 상세 행
와이드 리서치용. 한 브랜드 = 한 행: 브랜드명(24 Bold) | 속성 메타(국가·가격대·타깃, 14px) |
핵심 메시지(16px) | 출처 링크. 행 사이 1px 보더.

### `trend--*` — 트렌드 카드 그리드
이미지/키워드 카드 auto-fit. 각: 영문 키워드(24 Bold) + 한글 설명 1~2줄(16px).

### `chart--*` — 차트
CSS 차트(막대·도넛). 단일 계열이면 `--ink` + 회색 + `--accent` 1색.
**계열이 2개 이상이면 위 포인트 팔레트 순서대로**(`--sig` → `--pt-blue` → …). 외부 라이브러리 기본 색 금지.

### `tag` — 상태·카테고리 태그
`배경 soft + 글자 deep`, 12px, 라디우스 6px, 패딩 3px 10px. 분류가 꼭 필요한 자리에만.

### `moodboard--*` — 무드보드
이미지 그리드 `repeat(auto-fill, minmax(200px, 1fr))`, gap 10px, 라디우스 12px.

### `cover--end` — 마지막 장
검정 배경, 가운데 "End Of Document" (Divider Title 크기).

## 페이지 구조 — 권장 시퀀스 (제안서 기준)

1. `cover--main` → 2. `cover--toc` → 3. `divider--rfp`(있으면) → 4. `section-01` 오프너 + 콘텐츠
→ 5. 리서치(포지셔닝 맵·통계) → 6. 트렌드/무드보드 → 7. 전략 → 8. 컨셉 → 9. `cover--end`

각 챕터 시작마다 디바이더 또는 오프너를 끼워 호흡을 만든다.

## 빠른 시작

```bash
cp .claude/skills/mx-deck-design/template.html ./<프로젝트명>-deck.html
# 텍스트만 치환. --accent 1색만 프로젝트 컬러로 교체.
```

## 흔한 실수

- 액센트를 2색 이상 씀 → 무채색+1색이 정체성. 1색만.
- 카드 라디우스를 8px, 16px로 바꿈 → 항상 30px.
- 다크 강조 카드를 여러 개 → 슬라이드당 1개.
- 절대좌표(position: absolute)로 카드 배치 → 내용 늘면 깨짐. grid auto-fit만.
- 디바이더에 본문을 넣음 → 디바이더는 타이포만.
- 출처 누락 → 수치 쓴 슬라이드는 우하단 12px 출처 필수.
- 헤더 메타 바 생략 → 전 슬라이드 공통. 빼면 다른 덱처럼 보인다.
