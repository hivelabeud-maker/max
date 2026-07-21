---
name: brand-strategy-deck
description: 브랜드 리서치·전략 결과를 GRAIN 골든 예시와 동일한 시각 문법의 deck.html로 생성하는 스킬. 프로젝트 요약·브랜드 팩트북·경쟁사 카드·카테고리 군집·XY 포지셔닝 맵·화이트스페이스·이종업계 리서치·전략 대안·추천 전략·출처를 정해진 22블록 구조로 조판한다. marketer 에이전트가 리서치·전략을 Markdown/JSON으로 끝낸 뒤 최종 단계에서 호출한다. 트리거 "리서치 덱 만들어줘", "전략 덱 HTML", "브랜드 전략 리포트", "deck.html 생성", "포지셔닝 맵 HTML로".
---

# Brand Strategy Deck — 리서치·전략 HTML 생성 스킬

브랜드 리서치·전략 결과를 **매 프로젝트 같은 구조·같은 디자인**의 `deck.html`로 출력한다.
디자인을 프로젝트마다 새로 짜지 않는다 — GRAIN 골든 예시의 시각 문법을 그대로 계승한다.

## 언제 쓰나
- `marketer` 파이프라인이 리서치·전략을 끝내고 **HTML 리서치 덱**으로 조립할 때 (최종 단계)
- 기존 `report-data.json`을 고쳐 덱을 **재생성**할 때

## 참조 파일 (반드시 먼저 읽기)
| 파일 | 용도 |
|---|---|
| `REPORT_SCHEMA.md` | 22개 콘텐츠 블록 순서·필수 요소·`report-data.json` 골격 |
| `COMPONENTS.md` | 재사용 컴포넌트 마크업(텍스트만 교체) |
| `template.html` | GRAIN CSS·nav·JS 포함 빈 템플릿 |
| `references/grain-golden-example.html` | **골든 예시** — 정보 밀도·카드·포지셔닝맵·전략 전개 완성 사례 |
| `references/maxos-slide-example.html` | 슬라이드(16:9) 포맷이 필요할 때만 참조 |

## 생성 절차

1. **입력 확인** — 프로젝트 폴더에 다음이 있어야 시작한다. 없으면 `marketer`에게 되돌린다.
   `project-discovery.md` · `brand-factbook.md` · `market-research.json` · `strategy.md`
2. **데이터 정본 작성** — 위 자료를 `REPORT_SCHEMA.md`의 골격에 맞춰 **`report-data.json` 하나로 통합**한다.
   데이터는 여기 먼저 존재해야 한다 (HTML에만 데이터를 두지 않는다).
3. **최소 통과 기준 점검** (`REPORT_SCHEMA.md` 하단) — 팩트북·경쟁카드·3카테고리·출처·XY근거·화이트스페이스(기회+함정)·자산×기회 연결이 모두 있는가. 빠지면 채운 뒤 진행.
4. **조판** — `template.html`을 복사해 `{{...}}` 토큰을 `report-data.json` 값으로 치환한다.
   컴포넌트 마크업은 `COMPONENTS.md`에서 가져오고, 밀도·톤은 골든 예시에 맞춘다.
5. **출처 처리** — 모든 경쟁/이종 카드에 출처 링크 또는 "미확인" 라벨. T1~T4 등급 배지 부여. 22번 블록에 전체 출처 목록.
6. **저장** — 프로젝트 폴더에 `deck.html`. `report-data.json`도 함께 남긴다(정본).

## 절대 규칙
- **디자인 재발명 금지.** 색·타이포·카드 라디우스(10~16px)·등급 배지는 GRAIN 규격 고정.
- **출처 없는 수치·단정 금지.** 없으면 "추정"/"미확인" 명시 + T3/T4 등급.
- **화이트스페이스는 기회와 함정을 함께** 쓴다(수요 없는 빈자리는 함정).
- **추천 전략은 브랜드 자산과 시장 기회를 연결**하는 논리를 반드시 포함.
- 데이터는 `report-data.json`이 정본. HTML은 그로부터 생성.

## 빠른 시작
```bash
cp .claude/skills/brand-strategy-deck/template.html .claude/projects/<YYYYMM_프로젝트>/deck.html
# report-data.json 작성 → {{토큰}} 치환 → 저장
```

## 흔한 실수
- 카드 라디우스·색을 임의 변경 → GRAIN 규격 고정.
- 화이트스페이스에 기회만 쓰고 함정 누락 → 둘 다 필수.
- 경쟁 카드 출처 누락 → 링크 또는 "미확인" 라벨 필수.
- 데이터를 HTML에만 하드코딩 → `report-data.json` 정본 먼저.
- 추천 전략이 자산·기회 연결 없이 무드보드만 → 연결 논리 필수.
