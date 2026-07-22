---
name: brand-strategy-deck
description: 브랜드 리서치·전략 결과를 GRAIN 골든 예시와 동일한 시각 문법의 deck.html로 생성하는 스킬. 프로젝트·브랜드 팩트북·경쟁사 30+ 카드·카테고리 군집·XY 포지셔닝 맵·화이트스페이스·이종업계 30+ 리서치·인사이트·전략 대안·추천 전략·출처를 4PART 61섹션 구조로 조판한다. marketer가 리서치·전략을 Markdown/JSON으로 끝낸 뒤 최종 단계에서 호출한다. 트리거 "리서치 덱 만들어줘", "전략 덱 HTML", "브랜드 전략 리포트", "deck.html 생성", "GRAIN 같은 형식".
---

# Brand Strategy Deck — 리서치·전략 HTML 생성 스킬 (STEP 18)

리서치·전략(01~12 산출물)을 **매 프로젝트 같은 구조·같은 디자인**의 `deck.html`로 출력한다.
디자인은 프로젝트마다 새로 짜지 않는다 — GRAIN 골든 예시 시각 문법을 계승한다.

## 참조 파일 (반드시 먼저 읽기)
| 파일 | 용도 |
|---|---|
| `REPORT_SCHEMA.md` | 4PART 61섹션 + `report-data.json` 골격 + 최소 통과 기준 |
| `COMPONENTS.md` | 25개 재사용 컴포넌트 마크업(텍스트만 교체) |
| `template.html` | GRAIN CSS·nav·필터 JS 포함 슬롯형 템플릿 |
| `references/grain-golden-example.html` | **1차 골든** — 정보 밀도·카드·포지셔닝맵·리서치→전략 흐름 완성 사례 |
| `references/maxos-golden-example.html` | 16:9 슬라이드 포맷 골든 |
| `references/boomi-golden-example.html` | (원본 확보 시 교체 · 현재 stub) |

## 골든 예시의 역할
정보 밀도 · 섹션 전개 · 카드 크기/배치 · 카테고리 표현 · 출처 표현 · 포지셔닝 맵 · 화이트스페이스 ·
리서치→전략 연결 흐름을 판단하는 기준. GRAIN 고유 브랜드명·전략 문구·조사 결과는 복사하지 않는다.

## 생성 절차
1. **원본 확인** — `outputs/01~12` + `report-data.json` 존재 확인. 없으면 marketer/해당 스킬로 되돌림.
2. **누락 필드 확인** — `report-data.json`을 `REPORT_SCHEMA.md` 골격과 대조.
3. **게이트 검증** — `quality-gate` 스킬 기준 통과 확인(경쟁 30+, 이종 30+, 출처, 축 근거, 화이트스페이스 기회/함정, 자산×기회 연결). 미달 시 HTML 완성 처리하지 않고 추가 조사.
4. **template.html 복사** → `deck.html`.
5. **슬롯 채우기** — `<!-- SLOT -->` 마커에 `COMPONENTS.md` 마크업으로 데이터 삽입.
   경쟁사 30+ · 이종업계 30+ 실제 카드 렌더링. 주요 3카테고리 우선 노출. XY맵 좌표 근거 연결.
6. **출처** — 모든 카드에 출처 링크 또는 "미확인"(T4) 라벨 + Evidence ID. 60번 섹션에 전체 출처 목록.
7. **반응형 점검** — 모바일·데스크톱. 가로 스크롤 금지.
8. 저장 → 프로젝트 `deck.html`.

## 절대 규칙
- **디자인 재발명 금지.** 색·타이포·카드 라디우스(10~16px)·등급 배지 = GRAIN 규격 고정.
- **정보 밀도 유지.** HTML용으로 새로 요약해 축소하지 않는다. 상세는 카드 펼침(`<details>`)·필터로 탐색.
- **출처 없는 수치·단정 금지.** 없으면 "추정/미확인"(T4) + 검증 대상 표시.
- **화이트스페이스는 기회와 함정(4유형)을 함께.**
- **추천 전략은 브랜드 자산과 시장 기회를 연결.**
- 데이터는 `report-data.json`이 정본. HTML에만 데이터를 두지 않는다.

## 빠른 시작
```bash
cp .claude/skills/brand-strategy-deck/template.html .claude/projects/<YYYYMM_PROJECT>/deck.html
# report-data.json → 슬롯 치환 → 저장
```
