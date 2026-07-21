# 자동화 구조 — 트리거 맵 (MAX실 OS v4)

> 각 에이전트가 "언제 도는가"를 정의한다. 3가지 발동 방식.
> 실제 스케줄 실행은 settings.json 훅 + 크론으로 연결(아래 '구현' 참조).

## 발동 방식 3종
- 🕐 **자동(스케줄)** — 정해진 시각에 자동 실행
- ⚡ **자동(이벤트)** — 특정 상황 발생 시 자동 (예: 외부 발송 직전, 시안 업로드)
- 👆 **수동(호출)** — 트리거 단어로 사용자가 부름

## 스케줄 자동 (🕐)
| 시점 | 동작 | 에이전트 |
|---|---|---|
| 분기 첫 주 | 글로벌 디자인 트렌드 | design-trend-radar → reference-curator |

## 이벤트 자동 (⚡)
| 트리거 상황 | 게이트 순서 |
|---|---|
| 외부 제안서·메일 발송 직전 | fact-checker → delivery-gate → tone-guardian |
| 시안 업로드 | design-critique → design-system-guardian → creative-director |
| 제안안 셀렉 직후 | review-panel(5관점) |
| 계약서 첨부 | legal-compliance |

## 수동 호출 (👆)
나머지 전략·생성·운영 에이전트는 트리거 단어로 호출(각 에이전트 description 참조).

## 리스크 티어 (검수 강도)
| 티어 | 대상 | 게이트 |
|---|---|---|
| Tier 0 | 내부 단순·조회 | 없음 |
| Tier 1 | 내부 산출·시안 초안 | design-critique → delivery-gate |
| Tier 2 | 외부 발신·제안·계약·브랜드 | fact-checker → review-panel → delivery-gate → tone-guardian |
- 애매하면 무조건 상향. 외부 수신자 = 자동 Tier 2.

## 절대 위임 금지 (항상 사용자 직접)
최종 견적가 · 마진율 · 계약 날인 · 단가 협상 · 채용/해고 · 외부 발송 최종 OK.

## 구현 (실제 자동화 연결)
- **스케줄**: Claude Code `settings.json` 훅 또는 세션 내 크론(`CronCreate`). ⚠️ 세션이 떠 있어야 발동.
  진짜 상시 자동화는 별도 러너(GitHub Actions cron 등) 필요 — 추후 연결.
- **이벤트**: 발송/업로드 시 해당 게이트를 메인 세션이 순서대로 호출.
- 이 맵이 기준선이며, 실제 훅·크론 등록 시 여기 표대로 건다.
