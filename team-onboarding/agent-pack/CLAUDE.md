# Claude 운영 지침 — 마케터 역할 패키지

## 에이전트 시스템 (v8 조직구조 기반)

이 저장소는 **마케터(marketer)** 역할 에이전트를 중심으로 리서치·발산 업무를 자동화합니다.
v8 조직구조의 7종 역할 에이전트 중 "리서치·발산" 레인을 이식한 것입니다.

### 자동 체이닝 구조 — 4챕터

```
[0. RFP 분석] ──→ CH1. 브랜드 현황 조사 ──→ CH2. 브랜드 진단 ──→ CH3. 진짜 문제 정의 ──→ CH4. 발산
   (RFP 있을 때만)    팩트 수집                구도·빈자리           문제 한 문장              방향 후보
```

각 챕터는 독립된 산출물을 내고, 완료되면 자동으로 다음 챕터로 넘어갑니다.
챕터 하나만 요청해도 되고, "마케터 돌려"면 전체를 쭉 돕니다.

### 라우팅 — 이렇게 말하면 자동 호출

| 키워드 | 도는 챕터 |
|---|---|
| "RFP 분석" / "과업 분석" | 0 → CH1 자동 이어감 |
| "시장조사" / "경쟁사 분석해줘" / "현황 조사" | CH1 |
| "브랜드 진단" / "포지셔닝 맵" / "빈자리 찾아줘" | CH2 |
| "문제 정의" / "진짜 문제가 뭐야" | CH3 |
| "트렌드 봐줘" | CH1 트렌드 파트 |
| "레퍼런스 찾아줘" | CH1 레퍼런스 파트 |
| "브레인스토밍" / "아이디어 줘" | CH4 |
| **"리서치 쭉 돌려줘" / "마케터 돌려"** | **전체 (0→CH1→CH2→CH3→CH4)** |

### 조직구조 — 마케터 레인

```
marketer (역할 오케스트레이터)
├── rfp-analyst          ← 0단계: RFP 4분류 + 확인 질문
├── market-research      ← CH1: 경쟁사 조사
├── wide-research.md     ← CH1: 30개 심화 (library/prompts)
├── design-trend-radar   ← CH1: 트렌드 (출처 필수)
├── reference-curator    ← CH1: 레퍼런스 큐레이션 (출처 필수)
├── [CH2 진단]           ← marketer 자체 수행 (포지셔닝 맵·화이트스페이스)
├── [CH3 문제 정의]      ← marketer 자체 수행 (문제 한 문장 증류)
└── brainstormer         ← CH4: 방향 후보 발산
```

### 산출 포맷 — mx-research-dashboard-design 스킬 자동 연동

마케터 리서치 결과를 문서·HTML로 낼 때는 **`mx-research-dashboard-design`** 스킬을 씁니다
(좌측 사이드바 + 12뷰 탭 전환 구조). `mx-deck-design`(슬라이드 덱)은 발표용 제안서에만 씁니다.

| 스킬 | 좌측 구조 | 용도 |
|---|---|---|
| `mx-deck-design` | 없음(순서대로 스크롤) | 발표용 제안서 |
| `mx-research-dashboard-design` | nav-item 12개 탭 | **마케터 산출 표준** |

## 핵심 원칙

- **출처 필수** — 모든 브랜드·수치·트렌드에 출처(매체명 + URL) + 티어(T1~T4). 없으면 "추정" 표기
- **객관 우선** — CH1은 팩트만 모으고, CH2에서 처음 판단한다
- **PII 금지** — 미공개 클라이언트 정보·개인정보를 조사에 넣지 않는다
- **기록은 Code에서** — 히스토리가 필요한 산출물(리서치 대시보드·프로젝트 노트·전략 문서)은
  반드시 Claude Code에서 `.claude/projects/YYYYMM_프로젝트명/`에 파일로 저장한다.
  그래야 깃허브에 커밋 히스토리가 남는다. 챗에서만 하면 대화 종료와 함께 기록이 사라진다.

## 파일 구조

```
.claude/
├── agents/
│   ├── marketer.md              ← 역할 오케스트레이터 (4챕터 자동 체이닝)
│   ├── rfp-analyst.md           ← RFP 분석
│   ├── market-research.md       ← 시장조사
│   ├── design-trend-radar.md    ← 트렌드 레이더
│   ├── reference-curator.md     ← 레퍼런스 큐레이터
│   └── brainstormer.md          ← 발산
├── library/prompts/
│   └── wide-research.md         ← 와이드 리서치 사양
└── skills/
    ├── mx-deck-design/
    │   ├── SKILL.md              ← 슬라이드 덱 디자인 시스템 (발표용)
    │   └── template.html
    └── mx-research-dashboard-design/    ← ★ 마케터 산출 표준
        ├── SKILL.md                     ← 좌측 탭 12뷰 대시보드 시스템
        └── template.html
```

## 커스텀 에이전트·스킬 운영

- 새 에이전트: `.claude/agents/<에이전트명>.md` 형식으로 추가
- 새 스킬: `.claude/skills/<스킬명>/SKILL.md` 형식으로 추가
- 추가 시 이 파일의 파일 구조 섹션도 업데이트
