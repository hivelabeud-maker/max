# MIGRATION — 브랜드 리서치·전략 HTML 출력 체계 구축 (2026.07.21)

기존 자산을 삭제·전면교체하지 않고 **재사용**하는 방향으로, RFP→전략→`deck.html` 자동 생성 체계를 구축했다.

## 배경
- 기존 `marketer`는 다른 에이전트를 실제로 호출하지 못하고(툴에 Task/Agent 없음) 사양을 흉내만 냈고, 발산까지 삼켜 관점 게이트를 우회했다.
- GRAIN·Boomi 골든 예시는 `.gitignore`(`.claude/projects/*`)로 팀 저장소에 없었다. GRAIN은 사용자 제공 URL에서 원본을 확보해 골든 예시로 채택했다.

## 변경 요약

| 구분 | 파일 | 내용 |
|---|---|---|
| **이전** | `.claude/skills/hivelab-proposal-style.md` → `.claude/skills/hivelab-proposal-style/SKILL.md` | `git mv`로 정식 폴더 구조화. 내용 보존. |
| **신규** | `.claude/skills/brand-strategy-deck/SKILL.md` | 리서치·전략 덱 생성 스킬 진입점 |
| **신규** | `.claude/skills/brand-strategy-deck/template.html` | GRAIN CSS·nav·JS 계승 빈 템플릿(22블록 토큰) |
| **신규** | `.claude/skills/brand-strategy-deck/REPORT_SCHEMA.md` | 22블록 구조 + `report-data.json` 골격 + 최소 통과 기준 |
| **신규** | `.claude/skills/brand-strategy-deck/COMPONENTS.md` | 13개 재사용 컴포넌트 마크업 카탈로그 |
| **신규** | `.claude/skills/brand-strategy-deck/references/grain-golden-example.html` | **실제 GRAIN 덱**(제공 URL에서 확보) — 완성 골든 예시 |
| **신규** | `.claude/skills/brand-strategy-deck/references/maxos-slide-example.html` | 기존 `mx-deck-design/template.html` 복사 — 슬라이드 포맷 참조(MAX OS 사례) |
| **수정** | `.claude/agents/marketer.md` | 리서치·전략 총괄 파이프라인(0~14)+최종 단계 스킬 호출로 개편. 원본 백업. |
| **수정** | `CLAUDE.md` | 브랜드 전략 운영 원칙 5줄 + 스킬/폴더 구조 갱신. 원본 백업. |
| **백업** | `.claude/_backup_20260721/` | `hivelab-proposal-style.md` · `marketer.md` · `CLAUDE.md` 변경 전 원본 |
| **검증** | `.claude/projects/202607_LUMEN/` | 샘플(가상) 프로젝트 — 5개 선행 파일 + `report-data.json` + `deck.html` |

## 골든 예시 분리 (요청 3)
`references/grain-golden-example.html`(원본 그대로, 참고용)와 `brand-strategy-deck/template.html`(GRAIN 고유 내용 제거, CSS·nav·JS·컴포넌트만)로 분리했다.

## 재사용한 기존 자산
- GRAIN 덱의 색 토큰·타이포·`.brand-card`/`.tier-badge`/`.cat-card`/포지셔닝 맵/`.concept-card`/`.strategy-slide` CSS를 그대로 계승.
- `mx-deck-design/template.html`을 슬라이드 포맷 보조 참조로 재사용.
- `hivelab-proposal-style`은 폴더 구조만 정식화(내용 보존).

## 새로 보강한 것
- `report-data.json` **데이터 정본** 개념(HTML에만 데이터 두지 않음).
- 22블록 스키마 + 13컴포넌트 카탈로그 + 최소 통과 기준(게이트).
- 경량 sticky 섹션 nav + IntersectionObserver 하이라이트(원본 GRAIN엔 없던 보강).
- 화이트스페이스 "기회+함정" 강제, 추천 전략 "자산×기회 연결" 강제.

## 되돌리기
```bash
cp .claude/_backup_20260721/marketer.md .claude/agents/marketer.md
cp .claude/_backup_20260721/CLAUDE.md CLAUDE.md
git mv .claude/skills/hivelab-proposal-style/SKILL.md .claude/skills/hivelab-proposal-style.md
```

## 남은 수동 판단
- **Boomi 골든 예시 미확보**: `references/boomi-golden-example.html`은 원본이 없어 생성하지 않음. Boomi 덱을 `references/`에 넣으면 GRAIN과 동일 방식으로 참조 가능. 현재는 GRAIN(스크롤형) + MAX OS(슬라이드형) 2종으로 충분히 커버.
- **폰트 CDN**: 샌드박스 프록시가 Pretendard CDN을 막아 시스템 폰트로 폴백됨(실사용 환경에선 정상 로드).
- 샘플 프로젝트(`202607_LUMEN`)는 `.gitignore` 대상이라 커밋되지 않음(검증용 로컬 아티팩트).
