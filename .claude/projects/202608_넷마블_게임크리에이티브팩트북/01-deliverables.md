# 산출물 목록

**최종 갱신** 2026.08

---

## 저장소 경로

```
netmarble-game-factbook/
├── 00_overview/
│   ├── title-validation.md        14개 타이틀 검증표 (공식명·서비스 상태·공식 채널)
│   ├── title-comparison.md        12개 비교 매트릭스 + 혼동 방지 4쌍 + 톤 지도
│   ├── creative-clusters.md       크리에이티브 클러스터 4분류
│   └── ai-asset-strategy.md       AI 자산화 3계층 체계
├── 01~12_*/                       타이틀별 factbook.md + sources.md (24개 문서)
└── _gci/                          고도화 버전 — Creative Intelligence DB
    ├── README.md                  빌드 방법·스키마·작성 원칙
    ├── netmarble-gci.html         발행용 완성본
    └── src/                       데이터·렌더 소스
```

## 타이틀별 폴더 번호

| 번호 | 폴더 | 타이틀 |
|---|---|---|
| 01 | `01_solo-leveling-arise` | 나 혼자만 레벨업: 어라이즈 |
| 02 | `02_7ds-grand-cross` | 일곱 개의 대죄: GRAND CROSS |
| 03 | `03_7ds-origin` | 일곱 개의 대죄: Origin |
| 04 | `04_raven2` | 레이븐2 |
| 05 | `05_seven-knights-rebirth` | 세븐나이츠 리버스 |
| 06 | `06_mongil-stardive` | 몬길: STAR DIVE |
| 07 | `07_stoneage-idle` | 스톤에이지 키우기 |
| 08 | `08_vampir` | 뱀피르 |
| 09 | `09_rf-online-next` | RF 온라인 넥스트 |
| 10 | `10_sol-enchant` | SOL: enchant |
| 11 | `11_got-kingsroad` | 왕좌의 게임: 킹스로드 |
| 12 | `12_kof-afk` | KOF AFK |

> `_gci/`의 번호 체계는 이와 다르다. GCI는 IP 유형별 그룹핑에 맞춰 재정렬했고 미출시 2종(샹그릴라·옥토퍼스)이 추가돼 14종이다.

---

## 발행된 아티팩트

| 버전 | URL | 내용 |
|---|---|---|
| 초판 (12종) | `claude.ai/code/artifact/39c3d84a-91ba-4e45-ab41-e2dab3a6c833` | 게임별 탭 · 14개 섹션 |
| **고도화 (14종)** | `claude.ai/code/artifact/2e6a1aef-a791-4a5d-bd15-7910a196dd75` | Core Fantasy · Character Heat · Fan Language · Landmine · 검색/필터 |

갱신 시 같은 file_path로 재발행하면 URL이 유지된다.

---

## 사용한 스킬

- `intel-deck-design` — 이 프로젝트에서 만든 스킬. 뷰 전환형 리서치 대시보드
- `anti-ai-writing` · `dumbify` — CLAUDE.md 글쓰기 기준으로 상시 적용

---

## 다음 조사 대상

### 전 타이틀 공통 공백
1. **ICONIC LINES** — 나혼렙 "일어나라" 외 미조사
2. **MARKETING HISTORY** — 과거 UA·캠페인 사례

### 지목된 심층 조사 4건
1. KOF ALLSTAR 서비스 종료 → KOF AFK 팬덤 감정 연결
2. RF 온라인 구작 팬의 종족·광산전·SF 세계관 인식
3. 샹그릴라 프론티어 — Core Fantasy가 추정 상태
4. 프로젝트 옥토퍼스 — 개발 코드명 단계

### 확보 필요한 내부 자료 (우선순위)
| 순위 | 자료 | 없으면 막히는 것 |
|---|---|---|
| 1 | 라이선스 IP 5사 가이드 (HBO·웹소설사·만화사·SNK·고단샤) | 라이선스 IP 5종 캐릭터 크리에이티브 전체 |
| 2 | 타이틀별 시그니처 오브젝트 공식 아트 | AI 자산화 3계층 전체 |
| 3 | 타이틀별 정확한 컬러값 | 팔레트 고정 |
| 4 | 인게임 영상 사용 권한 | 인게임형 소재 |
| 5 | 국가별 심의 기준 (종교·유혈·사행성) | 뱀피르·SOL·글로벌 캠페인 |
