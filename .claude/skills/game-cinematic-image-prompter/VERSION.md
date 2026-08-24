# game-cinematic-image-prompter — VERSION

**현재 판**: v2.1

**배포 대상**: `.claude/skills/game-cinematic-image-prompter/` 전체(SKILL.md + references/ + assets/project-template/)

**변경 이력**: `.claude/projects/2026MMORPG_AI_CINEMATIC_BACKGROUND_OS/CHANGELOG.md`

**v2.1 (2026-08-24)**: 게이트 체계를 8단계에서 사용자 작성 6단계(Gate 1~6, Gate 4는 3안비교/잠금/Scene Gap 3개 하위단계)로 재정렬. 각 Gate의 세부 항목을 12개 안팎 컬럼으로 정밀화하고, 매 응답 Gate 표시·프롬프트 끝 메타정보·고정 잠금 문장 등 운영 규칙을 추가.

**v2.0 (2026-08-24)**: V1(업로드 zip 패키지) 재구축. 방법론(이 폴더)과 프로젝트 데이터(`.claude/projects/`)를 분리하고, 게이트 정의를 `references/13-approval-gates.md` 단일 정본으로 고정. 원본 V1 핵심 원칙 10개(SB→Visual Bible→Shot Matrix 순서, 마스터 3안 비교, 승인 후 잠금, Scene Gap Analysis, 필수/권장/선택 분류, 레퍼런스 역할 분리, 한 번에 한 작업, 게이트 자동 진행 금지, 무인 배경 우선, 연속성 잠금)은 손실 없이 유지.

새 프로젝트에 이 스킬을 재배포할 때, 받는 쪽은 이 파일의 판번호로 자기가 몇 판을 받았는지 확인한다.
