# agent-pack 버전

- **현재 버전**: v8
- **갱신일**: 2026-08-11
- **적용 저장소**: `max` (이 저장소는 `.claude/`에 이미 반영 완료)

## v8에서 바뀐 것 (v7 → v8)

| 항목 | v7 | v8 |
|---|---|---|
| 마케터 흐름 | 5단계 순차 (RFP → 시장조사 → 와이드 → 디자인 리서치 → 발산) | **4챕터 자동 체이닝** (0 RFP → CH1 현황조사 → CH2 진단 → CH3 문제정의 → CH4 발산) |
| 챕터 경계 | 없음 | `--- CHn 완료. CHn+1로 넘어갑니다 ---` 출력 |
| 진단 단계 | 시장조사에 섞여 있음 | **CH2로 분리** — 포지셔닝 맵·화이트스페이스 전담 |
| 문제 정의 | 없음 | **CH3 신설** — 핵심 문제 한 문장으로 증류 |
| 산출 포맷 | 지정 없음 (매번 다름) | **`mx-research-dashboard-design` 고정** (좌측 탭 12뷰) |
| 포함 파일 | 7개 | 7개 + `skills/` 2종 + 루트용 `CLAUDE.md` |

## 설치했는지 확인하는 법

Claude Code로 저장소를 열고 `마케터 돌려 — 아무 카테고리` 라고 친 뒤:
- `--- CH1 완료 ---` 같은 챕터 경계 줄이 뜨면 **v8**
- 그냥 1·2·3단계로 진행되면 **v7 이하** → 아래 순서로 다시 설치

## 설치 순서

1. `CLAUDE.md` → 저장소 루트 `/CLAUDE.md`
2. `agents/*.md` → `.claude/agents/`
3. `library/prompts/wide-research.md` → `.claude/library/prompts/`
4. `skills/mx-deck-design/` → `.claude/skills/mx-deck-design/`
5. `skills/mx-research-dashboard-design/` → `.claude/skills/mx-research-dashboard-design/`

쓰는 법은 `../80_마케터_라우팅_가이드.md` 참조.
