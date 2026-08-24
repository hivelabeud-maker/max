# CHANGELOG — game-cinematic-image-prompter (AION2 배경 제작 체계)

최신이 맨 위. 표 형식: `날짜 | 버전 | 무엇이 바뀌었나 | 왜 | 영향 파일 | 팀 공지 필요 여부`

| 날짜 | 버전 | 무엇이 바뀌었나 | 왜 | 영향 파일 | 팀 공지 필요 여부 |
|---|---|---|---|---|---|
| 2026-08-24 | skill v2.1 | 게이트 체계를 8단계(Gate 0~7)에서 사용자가 직접 작성한 6단계(Gate 1~6, Gate 4는 3안비교/잠금/SceneGap 3개 하위단계)로 재정렬. SB분석 12항목, Shot Matrix 12항목+제작순서≠편집순서, 프롬프트 끝 메타정보 6종, 고정 잠금문장, 매응답 Gate표시 규칙, Magnific/Higgsfield 정밀설정, 관찰가능 품질조건 9종 반영 | 사용자가 실제 운용하며 다듬은 더 정밀한 스펙을 제시. 기존 체계와 게이트 번호가 달라 그대로 두면 문서와 실제 대화가 어긋남 | `.claude/skills/game-cinematic-image-prompter/` 전체, `.claude/library/claude-project-export/PROJECT_INSTRUCTIONS.md` | 아니오 (아직 실사용 전, 팀 배포 전 단계) |
| 2026-08-24 | skill v2.0 | V1(업로드 zip 22파일)을 방법론/프로젝트 데이터/Claude Project export 3분리 구조로 재구축. Master Concept Set·Master Lock·Scene Gap Analysis를 별도 파일로 분리, Scene Gap을 6개 카테고리로 재정의, 세션 재개·부분승인 프로토콜 신규 추가 | AION 고유명사가 방법론 파일에 섞여 있어 재사용 시 오염 위험, 게이트 원칙이 6곳에 중복돼 드리프트 발생(실증: CLAUDE_HANDOFF의 8원칙과 신규 10원칙 불일치) | `.claude/skills/game-cinematic-image-prompter/` 전체, `.claude/library/claude-project-export/PROJECT_INSTRUCTIONS.md` | 아니오 (아직 실사용 전, 팀 배포 전 단계) |

## 향후 버전을 올릴 때

- 게이트 순서·정의가 바뀌면: `references/13-approval-gates.md`를 고치고 여기 한 줄 추가, `PROJECT_INSTRUCTIONS.md` 재컴파일.
- 오타·문구 다듬기는 커밋으로 충분하며 여기 추가하지 않는다.
- 다른 게임/타이틀 프로젝트에 이 스킬을 재배포하면 그 시점을 여기에 기록한다.
