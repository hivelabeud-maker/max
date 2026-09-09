# NEON DEFENSE — 페이크 플레이어블 광고 (넷마블 2차)

프로젝트 옥토퍼스 **리타**를 그대로 쓰되, **어두운 우주 + 네온 탄막** 무드로 만드는 2차 버전.
1차(`pixel_survivor_playable`, 보라 던전 + 픽셀아트)를 복제해 만들었고 **코어 루프는 동일**하다.

> **새 세션은 [docs/00_인수인계.md](docs/00_인수인계.md) 부터 읽을 것.**
> 작업 계획·재사용 판정·주의사항이 전부 거기 있다.

## 지금 상태

**0단계(프로젝트 준비)까지만 완료.** 게임 코드는 아직 1차 그대로다 — 톤 전환·HUD 재작성 전.

| 완료 | 내용 |
|---|---|
| ✅ | 1차 프로젝트 복제 (210MB → 28MB) |
| ✅ | 이전 IP 에셋 제거 — 슬라임 시퀀스 · 던전 배경 · `art/octopus` 29MB |
| ✅ | 리타 시퀀스 3벌 유지 (`src/art/raw/seq/rita_*`) |
| ✅ | `tools/release.sh` 납품 경로를 새 폴더로 교체 |
| ⬜ | 1~7단계 (인수인계 문서 참조) |

### ⚠️ release.sh 경로 주의
복제 직후 `release.sh` 가 **1차 납품 폴더(`PIXEL_SURVIVOR_UIHD_FINAL`)를 가리키고 있었다.**
그대로 돌렸으면 이미 고객사에 나간 패키지를 덮어썼다. 지금은 아래로 교체돼 있다:

```
FINAL="$CODE/NEON_DEFENSE_FINAL"
VIDEO="$CODE/NEON_DEFENSE_영상추출"
```

## 명령

```bash
python3 tools/prep_anim.py      # 리타 시퀀스 → 아틀라스 (MONS/BGS 정리 필요)
python3 tools/build.py --uihd   # → dist/playable_uihd.html
node tools/qa.js                # 13종 기기 · 완주 · 광고규격 · CTA발동
./tools/release.sh              # 백업 → 재빌드 → QA → 망별빌드 → 흔적검사 → 커밋
./tools/rollback.sh             # 되돌리기
```

## 1차 프로젝트와의 관계

엔진(`src/core/`)과 도구(`tools/`)는 1차와 **같은 코드**다. 1차에서 고친 버그·규격 대응이
전부 들어있다 (광고망별 CTA 분리 · 가로 대응 · 디바이스 픽셀 스냅 · HP 연출 등).
**엔진 수정이 필요하면 1차에도 반영할지 판단할 것** — 지금은 두 벌로 갈라져 있다.
