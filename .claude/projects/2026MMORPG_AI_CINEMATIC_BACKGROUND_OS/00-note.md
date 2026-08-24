# 2026MMORPG AI Cinematic Background OS

- **클라이언트**: 확인 필요 (AION2 IP 기반, 실제 계약·발주 주체 미확인 — 추정으로 기재하지 않음)
- **업무 범위**: AION2 게임 시네마틱용 AI 배경 제작 체계(V2) 구축 + 실제 SB 기반 배경 제작
- **일정**: 2026-08 착수 ~ 상시 갱신
- **견적**: 해당 없음 (체계 구축 단계, 실제 제작 착수 시 별도 산정)
- **상태**: 스킬을 사용자 정의 6-Gate 스펙(SB분석→VisualBible→ShotMatrix→구조마스터제작[3안비교/잠금/SceneGap]→파생과부분수정→최종출력)으로 재정렬 완료. 실제 SB 이미지 기반 Gate 1 분석은 아직 착수 전.
- **변경 이력**: `CHANGELOG.md` (스킬 규칙·게이트 정의가 바뀔 때만 한 줄 추가)

## 요약 (매 세션 종료 시 갱신)

- **핵심 결정사항**
  - 사용자가 업로드한 V1 패키지(`AION2_Claude_Game_Cinematic_Workflow.zip`, 22개 파일)를 분석해, 방법론(재사용 가능)과 AION2 프로젝트 데이터(1회성)가 파일 안에서 섞여 있는 구조적 문제를 확인했다.
  - V2는 이 저장소의 기존 컨벤션(`skills/` = 방법론, `projects/` = 프로젝트 데이터, `library/` = 공용 규칙)에 맞춰 재구성했다. 스킬 본체는 `.claude/skills/game-cinematic-image-prompter/`, AION2 고유 데이터는 이 프로젝트 폴더에 분리했다.
  - 게이트 정의의 유일 정본은 `references/13-approval-gates.md`로 고정했다. SKILL.md와 Claude Project Instructions는 이 파일을 참조만 하고 재서술하지 않는다.
  - Master Concept Set(A/B/C), Master Lock, Scene Gap Analysis를 사용자 지시에 따라 각각 별도 파일(05/06/07)로 분리했다 — 세 개를 한 파일에 합치면 성격이 다른 결정(3안 비교 / 잠금 확정 / 공백 분석)이 섞인다.
  - Scene Gap Analysis는 사용자가 재정의한 6개 카테고리(내러티브 연결·공간 설명·캐릭터/날개/용 합성·클린 배경과 FX 분리·편집 안전·드론/원경/근경/좌우/상공 베리에이션)로 확정했다. V1의 4개 카테고리보다 세분화됐다.
  - 이 프로젝트를 `사내자산/영상모션`으로 잠정 등록했다 — 스킬 자체가 다른 게임/타이틀에도 재배포 가능한 자산이기 때문이다. 실제 재배포 계획 여부는 사용자 확인 후 `실행/영상모션`으로 재분류할 수 있다.
  - 원본 V1 파일은 업로드 임시 경로에만 있고 이 저장소에는 반영하지 않았다 — "원본 보존, V2는 별도 구조" 지시에 따른 것이다.
- **결정 근거**
  - 하우스 컨벤션(`.claude/library/project-note-rules.md`)이 이미 프로젝트 노트 이원화·산출물 버전 네이밍·자산 배포 규율을 갖추고 있어, 이를 재사용하지 않고 V1의 병렬 템플릿 체계를 그대로 옮기면 두 개의 프로젝트 관리 체계가 공존하게 된다.
  - AION 고유명사(천족/마족, 수호 여신상 등)를 방법론 파일에 남기면 다음 MMORPG 프로젝트가 이 스킬을 그대로 트리거했을 때 이전 프로젝트의 세계관이 새어 들어간다.
- **다음 액션**
  - 실제 SB 이미지·게임 레퍼런스 업로드 후 Gate 1(SB 분석)부터 시작
  - `_index.md` 분류 태그(`사내자산` vs `실행`) 최종 확인
  - Claude Project 병행 여부 확인 후 `PROJECT_INSTRUCTIONS.md`를 실제 Claude Project에 붙여넣기
  - Scene Gap Analysis를 Gate 4-c로 유지한 판단(사용자의 최신 6-Gate 스펙엔 명시 안 됐으나 최초 비삭제 원칙에 따라 유지)을 다음 세션에서 재확인

## 원본 로그 (append-only, 절대 덮어쓰지 않음)

### 2026-08-24
- 사용자가 V1 패키지(zip, 22개 파일: 온보딩 5종·SKILL.md·references 11종·project-template 8종·워크플로우 SVG)를 업로드. 전체 파일을 읽고 역할·중복을 분석.
- 분석 결과를 제출: 파일별 역할과 중복(온보딩 5종에 게이트 원칙이 5~6곳 반복, references 11종 중 다수가 방법론과 AION2 데이터 혼재), V2 폴더 구조 제안(skills/projects/library 3분리), 유지/통합/신규 파일 목록, V1의 부족한 로직 7가지(버전 네이밍 없음·부분승인 경로 없음·세션 재개 규칙 없음 등), 변형 항목과 이유, Claude Project vs Claude Code 구조 차이, 향후 템플릿 구조, 예상 문제와 방지 규칙 6가지.
- 확인 질문 5개 제시(오케스트레이터 에이전트 신설 여부, 00-note.md 하우스 컨벤션 편입 여부, `_index.md` 분류 태그, Claude Project 병행 여부, Higgsfield 직접 연동 범위) — 사용자는 구조 승인만 명시하고 개별 질문에는 직접 답하지 않음.
- 사용자가 V2 구조를 승인하고, 포함 항목 15개(Claude Project Instructions, SKILL.md, SB 분석 기준, 레퍼런스 역할 분류, Visual Bible 규칙, Shot Matrix, Master Concept Set 3안 규칙, Master Lock, Scene Gap Analysis, 프롬프트 공식, 부분수정·연속성잠금 규칙, 시간대 규칙, 도구 라우팅, QC 체크리스트, 템플릿 3종)을 지정하며 실제 파일 구축을 요청.
- 요청 도중 "방법론이 섞이지 않도록"이라는 추가 지시로 인터럽트 — Master Concept Set/Master Lock/Scene Gap Analysis를 별도 파일로 분리하고, 템플릿과 방법론의 번호 체계를 일치시켜 카테고리 경계를 명확히 하는 방향으로 반영.
- 미답변 질문(오케스트레이터 에이전트, Higgsfield 직접 연동)은 사용자의 최종 요청 목록에 포함되지 않아 이번 빌드 범위에서 제외 — 스킬 단독 수동 트리거로 구축.
- `.claude/skills/game-cinematic-image-prompter/`(SKILL.md + references 17종 + project-template 11종), `.claude/library/claude-project-export/PROJECT_INSTRUCTIONS.md` 구축.
- 이후 별개 요청으로 `easy-learning-writing` 스킬 신설(`.claude/skills/easy-learning-writing/`, CLAUDE.md 글쓰기 기준 섹션에 반영) — dumbify를 상속하고 시작점·정보순서·명사형금지·이유붙이기·Learning Structure·원본보호만 추가하는 상위 레이어로 설계.
- 사용자가 훨씬 정밀한 6단계 승인 게이트 스펙을 직접 작성해 제시(각 Gate별 12개 안팎 세부 항목, 예상 AI 생성 오류 컬럼, 이미지제작순서≠영상편집순서 구분, 매 응답 Gate 표시 규칙, 프롬프트 끝 메타정보 6종, 고정 잠금 문장, Magnific/Higgsfield 정밀 설정, 관찰가능 품질조건 9종 포함). 기존 Gate 0~7(8단계) 체계를 사용자의 6단계 체계(Gate1 SB분석/Gate2 VisualBible/Gate3 ShotMatrix/Gate4 구조마스터제작/Gate5 파생과부분수정/Gate6 최종출력)로 재정렬.
- Gate 4 안에 3안비교(4-a)·Structure Master 잠금(4-b)·Scene Gap Analysis(4-c) 세 하위 단계를 유지하되 파일은 분리한 채로 게이트 번호만 통합 — "방법론이 섞이지 않게" 원칙과 사용자의 새 6단계 번호 체계를 동시에 만족시키는 절충.
- 확인 질문 2개 제시(3안 비교 유지 여부, Scene Gap Analysis 누락 여부) 중 3안 비교는 "그대로 유지"로 답변 받음. Scene Gap Analysis는 질문하지 않고 최초 비삭제 원칙에 따라 유지하는 판단을 내리고 다음 액션에 재확인 항목으로 남김.
- references 01·03·04·08·09·11·12·13, project-template 01·04·05·06·07·10, 00-workflow-diagram.md, PROJECT_INSTRUCTIONS.md 전체 재작성. 게이트 번호 전수 검사(Gate 5A/5B/7/0 잔존 문자열 grep)로 교차 참조 정합성 확인.
