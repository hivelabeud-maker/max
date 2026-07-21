---
name: hivelab-proposal-style
description: Apply HIVELAB's monotone proposal design system when building HTML slide decks. Use when creating proposal slides, components, or layouts that follow HIVELAB's design language.
argument-hint: <component or page description>
allowed-tools: Read Grep Glob Bash Write Edit
---

Build the following using HIVELAB's proposal design system: $ARGUMENTS

## Reference Files

- Full specification: `HIVELAB_PROPOSAL_DESIGN_STYLE.md`
- Working slide deck (HTML with CSS variables): `proposal_pb_brand_2026.html`

When implementing, also read the HTML file above — it contains actual CSS custom properties and working slide/component examples that complement this specification.

---

# HIVELAB Proposal Design System

## 1. Visual Theme & Atmosphere

HIVELAB의 제안서는 모노톤(Monotone) 기반의 전문적이고 절제된 디자인을 사용합니다. 블랙/화이트/그레이스케일만으로 구성하되, 단 하나의 포인트 컬러 `#3E5A6C`(차분한 블루그레이)만 허용합니다. 보더리스(borderless) 카드 구조로 깔끔한 면 분할을 하며, 타이포그래피 위계를 통해 정보 계층을 명확히 전달합니다.

**Key Characteristics:**
- 모노톤 우선: 블랙/화이트/그레이만 사용, 포인트 컬러는 `#3E5A6C` 1가지
- 보더리스: 카드, 박스에 테두리 없음 — 배경색 차이로 구분
- 듀얼 폰트: Inter(영문) + Pretendard(한글)
- 다크/라이트 섹션 교차: 표지·목차·간지는 다크, 컨텐츠는 라이트
- 대형 숫자(800 weight) + 가벼운 본문(400 weight) 타이포 위계
- 슬라이드 1440×810px, 충분한 여백(최소 48px)

## 2. Color Palette & Roles

### Grayscale Base
- **Black** (`#000000`): Dark slide 기본 배경
- **Gray 900** (`#111111`): TOC 배경, 다크 요소
- **Gray 700** (`#333333`): 보조 텍스트 (dark)
- **Gray 500** (`#666666`): Label, Caption
- **Gray 300** (`#999999`): 부제, 설명 텍스트
- **Gray 100** (`#E5E5E5`): 라인, 구분선
- **Gray 50** (`#F5F5F5`): 카드 배경 (light)
- **White** (`#FFFFFF`): Light slide 기본 배경

### Point Colors — 의미(semantic) 기반 선택, 페이지당 1개만

컬러는 장식이 아니라 **콘텐츠의 의미**에 따라 결정합니다.
같은 맥락의 슬라이드가 연속되면 **같은 컬러를 계속 사용**하고, 맥락이 전환될 때만 컬러를 바꿉니다.

| Color | Code | 의미 · 사용 맥락 |
|-------|------|-------------------|
| **Lime** | `#AAFF45` | 긍정 · 달성 · 성장 · CTA · 최고 수치 — 성과/시장 데이터, 완료 상태 |
| **Violet** | `#7B4FFF` | 플로우 · 단계 · 여정 · 구조 — User Journey, 프로세스, 타임라인 |
| **Pink** | `#FF57D8` | 주의 환기 · 분기점 · 인사이트 — 눈길 끌기 (부정 의미 없음) |
| **Orange** | `#FF5714` | 리스크 · 경고 · 미달 · 부정 delta — 경고 맥락에만 사용 |

**규칙:**
- 한 페이지에 포인트 컬러 **2개 이상 절대 불가**
- 컬러 선택은 **콘텐츠 의미**가 결정 — 슬라이드마다 다른 색을 쓰는 것이 아님
- 예: 성과 데이터 슬라이드 3장 연속 → 3장 모두 lime / 리스크 분석 진입 시 → orange로 전환
- 라인 대신 면(surface)으로 구분

**포인트 컬러 사용 가능 위치 (한정적):**
- 차트 바 하이라이트 (최고값 바 1개)
- 비교 요소 · 데이터 시각화 강조
- 섹션 라벨 (12px uppercase)
- 배지/필 배경 (12% opacity)
- 면(surface block) 배경 — 그리드 영역 구분용

**포인트 컬러 사용 금지 위치:**
- **Hero Stat 숫자에 직접 사용 금지** — 수치 텍스트는 항상 `#000000`(light) / `#FFFFFF`(dark)
- 본문 텍스트
- 카드 전체 배경 (카드는 `#ECECEC` 고정)

### Data Visualization
- Primary: `#000000` (ink) — 모든 수치 텍스트 기본색
- Highlight: 해당 페이지의 포인트 컬러 1개만 — 차트 바·비교 요소에만 (텍스트 X)
- Secondary~: 그레이스케일 `#888888` → `#D0D0D0` 순차

## 3. Typography Rules

### Font Families
- **영문**: `Inter` (`--font-en`)
- **한글**: `Pretendard` (`--font-kr`)

### Hierarchy

| Role | Size | Weight | Line Height | Notes |
|------|------|--------|-------------|-------|
| Cover Title | 160px | 700 | 0.9 | 표지 메인 타이틀 |
| TOC Title | 110px | 700 | 0.95 | 목차 "TABLE OF CONTENTS" |
| Divider Title | 64px | 700 | 1.05 | 섹션 간지 타이틀 |
| Hero Stat Large | 120px | 800 | 1 | 핵심 수치 (대) |
| Hero Stat | 96px | 800 | 1 | 핵심 수치 (중) |
| H1 | 36px | 700 | 1.3 | 슬라이드 제목 |
| H2 | 22px | 600 | 1.4 | 소제목 |
| Body | 15px | 400 | 1.7 | 본문 |
| Caption | 12px | 300 | 1.6 | 출처, 부가 설명 |
| Label | 11px | 500 | — | 섹션 라벨 (uppercase, tracking 0.12em) |

## 4. Component Stylings

### Card
- Background: `#ECECEC` (light) / `rgba(255,255,255,0.08)` (dark)
- Radius: 8px
- Padding: 28px 32px
- Border: **none** (보더/라인 없음 — 면으로만 구분)

### Badge / Pill
- Background: 해당 포인트 컬러의 12% opacity (예: `rgba(170,255,69,0.15)`)
- Radius: 999px
- Padding: 6px 14px
- Font: 13px

### Chart Bar
- 기본: 그레이스케일 단색 (`#D0D0D0` → `#666666` 순차)
- 하이라이트: 해당 페이지 포인트 컬러 1개만 (최고값 바에만 적용)

## 5. Slide Types & Layout

### Cover (Slide 1)
- 배경: `#000000` (순흑)
- Grid 3-row: Header 80px / Body / Footer 60px
- Header: 3열 그리드 — `[HIVELAB · 프로젝트명]` | `[PROPOSAL]` | `[2026]`
- Body: 하단 정렬, greeting(52px light) + 대형 타이틀(180px bold)
- Footer: 중앙 정렬, 저작권 + 면책 문구

### Table of Contents (Slide 2)
- 배경: `#000000` (is-dark)
- Grid 3-row, Body `3fr 9fr` 2열
- 좌측: 대형 "TABLE OF CONTENTS" (110px bold white)
- 우측: 2열 그리드, 섹션별 그룹핑 (번호 + 대문자 타이틀 + 항목 리스트)
- 구분: 하단 면 (border-bottom `rgba(255,255,255,0.15)`)

### Chapter (Section Divider)
- 배경: `#000000` (is-dark)
- Body: 3열 그리드 `2fr 7fr 3fr`
- 좌: 대형 번호 (120px, 35% opacity)
- 중: 대형 타이틀 (100px bold)
- 우: 1줄 설명 (15px, 50% opacity)

### Content Slides — 면(Surface) 분할 레이아웃
컨텐츠 슬라이드는 **면 블록 분할**이 핵심. 작은 카드를 나열하지 않고 대형 면으로 영역을 나눈다.

**레이아웃 유형:**
- **비대칭 분할 (50/50, 5:7, 4:8)**: 좌 텍스트 + 우 컬러 면 블록 (또는 반대)
- **3열 풀하이트 그리드**: 각 열이 면 블록 (마지막 열 다크 반전 가능)
- **다크+라이트 면 분할**: 좌측 다크 면에 대형 수치 + 우측 라이트 면에 2×2 그리드
- **풀 컬러 면**: 한쪽 영역 전체를 포인트 컬러 배경으로, 그 위에 차트/데이터

**면 블록 규칙:**
- 포인트 컬러는 **면 블록 배경**으로 대담하게 사용 (텍스트 컬러가 아님)
- 면 블록 위의 텍스트/차트는 블랙 또는 `rgba(0,0,0,0.N)` 계열
- 다크 면 블록 (`#000`) 위의 텍스트는 화이트
- 면 구분선 대신 1px gap 또는 배경색 차이로 분리
- 여백 충분히 — 면 블록 내부 padding 최소 48px

**기존 카드 사용 시:**
- `#ECECEC` 배경, 8px radius, 테두리 없음
- 풀하이트 카드 (작은 카드 나열 X) — 열 전체를 채우는 면으로 사용

### Closing
- 배경: `#000000` (is-dark)
- 중앙 정렬, 대형 "THANK YOU" (140px bold white)
- 연락처 (18px, 70% opacity)
- Footer: 저작권 + 면책 (Cover와 동일 구조)

## 6. Layout Principles

### Spacing System
- Slide: 1920×1080px
- Margin: 80px (전체 동일)
- 요소 간 gap: 16~48px
- 최소 내부 여백: 48px

### Slide Structure
- **표지/목차/간지/클로징**: `display:grid; grid-template-rows: 80px 1fr 60px;` (3-row)
- **컨텐츠 슬라이드**: 면 분할 우선 — `grid-template-columns` 기반 레이아웃
  - 비대칭 분할: `grid-template-columns: 1fr 1fr` 또는 `5fr 7fr`
  - 풀 컬러 면 블록이 슬라이드 절반 이상 차지 가능
  - 3-row 구조를 강제하지 않음 — 면 블록이 엣지까지 확장
- Header(80px): 3열 그리드 `[좌] [중앙] [우]` (표지/목차 등 구조 슬라이드만)
- Footer(60px): `[좌 문서명] [우 버전/연도]`
- 다크↔라이트 교차 배치

## 7. Do's and Don'ts

### Do
- 블랙/화이트/그레이스케일 기본 + 포인트 컬러 4종(lime/violet/pink/orange) 중 택 1
- **한 페이지에 포인트 컬러 1개만** 사용 (라벨 + 관련 수치/바 등 동일 컬러)
- **콘텐츠 의미가 같으면 같은 컬러 유지** — 성과 슬라이드 연속 시 모두 lime, 프로세스 연속 시 모두 violet
- 면(surface)으로 영역 구분 — 카드 배경, 배지 배경 등
- 숫자/수치는 크고 굵게(800), 본문은 가볍게(400)
- 표지·목차·간지·클로징은 다크, 컨텐츠는 라이트
- 여백 충분히 확보 (최소 48px)
- 슬라이드 3-row 그리드 구조(Header/Body/Footer) 일관 유지

### Don't
- **한 페이지에 포인트 컬러 2개 이상 사용 절대 금지**
- **슬라이드마다 다른 색을 쓰는 것 금지** — 컬러는 의미 기반, 장식용 변주가 아님
- 라인/테두리(border) 사용 금지 — 면(surface)으로만 구분
- 포인트 컬러를 장식 용도로 남용 금지 — 차트 바·비교 요소·라벨에만 사용
- **수치 텍스트(Hero Stat)에 포인트 컬러 직접 사용 금지** — 숫자는 항상 블랙/화이트
- 좁은 여백으로 빽빽하게 채우지 않기 (여백 30~40% 유지)
- 동일 레이아웃 3회 이상 연속 금지 — 변주를 넣어 리듬감 유지

## 8. Navigation

- `←` / `→` 화살표 키로 슬라이드 이동
- `Space` 다음 슬라이드
- `Home` / `End` 처음/마지막
- 화면 좌/우 클릭

## 9. Agent Prompt Guide

### Quick Color Reference
- **Lime**: `#AAFF45` — 긍정 CTA · 달성 · 최고 수치
- **Violet**: `#7B4FFF` — 플로우 · 단계 · 섹션 구분
- **Pink**: `#FF57D8` — 주의 환기 · 분기점
- **Orange**: `#FF5714` — 리스크 · 부정 delta · 경고
- Dark background: `#000000`
- Light background: `#FFFFFF`
- Card (light): `#ECECEC`
- Card (dark): `rgba(255,255,255,0.08)`
- Text (light): `#000000` / `#525252` / `#A8A6A0`
- Text (dark): `#FFFFFF` / `rgba(255,255,255,0.85)` / `rgba(255,255,255,0.55)`

### Example Component Prompts
- "Create cover: #000000 background. Grid 3-row (80px/1fr/60px). 3-column header. 180px bold title bottom-aligned. Footer copyright+면책."
- "Build TOC: #000000 is-dark. Body 3fr/9fr grid. Left: 110px 'TABLE OF CONTENTS'. Right: 2-column section grid."
- "Build chapter divider: #000000. Body 3-column grid (2fr/7fr/3fr). Large faded number + 100px title + subtitle."
- "Build content slide: white bg. 80px margin. Label in lime/violet/pink/orange (1개만). Cards #ECECEC 8px radius no border."
- "Build chart: grayscale bars (#D0D0D0→#666666). 최고값 바 1개만 포인트 컬러. 페이지당 포인트 컬러 1종만."

---

## Instructions

1. Apply the design system above faithfully to the requested component/page
2. If you need additional detail, read `sample_proposal.html` for actual CSS variable definitions and working slide markup
3. **한 페이지에 포인트 컬러 1개만** — lime/violet/pink/orange 중 택 1
4. 라인/테두리 금지 — 면(surface)으로만 영역 구분
5. Use `Inter` (영문) + `Pretendard` (한글) font stack
6. Ensure 1920×1080px slide dimensions, 3-row grid (Header 80px / Body / Footer 60px)
7. Dark/light section alternation: cover·TOC·chapter·closing = dark, content = light
