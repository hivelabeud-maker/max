# ORB POP — 페이크 플레이어블 (넷마블 2차 · 레퍼런스 2 케이스)

넷마블 브리프의 **두 번째 레퍼런스(Pop Orb)** 방향. 순검정 배경에 원색 공을
터뜨려 연쇄 분열시키는 게임이고, 하단 중앙에 조이스틱이 있다.

> **새 세션은 [docs/00_기획서.md](docs/00_기획서.md) 부터 읽을 것.**
> 레퍼런스 실측·확정사항·작업계획이 전부 거기 있다.

## 1안(`neon_defense_playable`)과의 관계

같은 브리프의 다른 방향이다. A/B 로 돌릴 수 있게 **별도 프로젝트**로 만들었다.

| | 1안 NEON DEFENSE | 2안 ORB POP (이 프로젝트) |
|---|---|---|
| 레퍼런스 | 레퍼런스 1 (우주 네온 디펜스) | 레퍼런스 2 (Pop Orb) |
| 코어 루프 | 몰려오는 적을 막는다 | 떠다니는 공을 터뜨려 쪼갠다 |
| 조작 | 드래그로 **이동** | 드래그·조이스틱으로 **조준** |
| 톤 | 어두운 우주 + 시안/마젠타 | 순검정 + 원색 |
| 하단 | 대형 CTA | 조이스틱 + 그 위 CTA |
| 실패 조건 | HP | 없음 (목표 점수·시간) |

엔진(`src/core/`)과 도구(`tools/`)는 1안에서 물려받았다.

## 지금 상태

**1~7단계 완료.** 21.5초 완주 · QA 전 항목 통과.

| 항목 | 값 |
|---|---|
| 최종 점수 | 112,094 (목표 18,000) |
| 터뜨린 오브 | 275개 |
| 최고 콤보 | ×253 |
| 동시 최대 오브 | 181개 |
| escalation | Tempo Up! 4.5초 · HYPER FRENZY 7.4초 · DOMINATION 9.9초 |
| 파일 크기 | 830KB (Meta 2MB 대비 40%) |

### 그림 파일은 리타 시퀀스뿐이다
배경(순검정)과 오브(원색 원)를 전부 코드로 그린다. 넷마블 아트 대기 없이 진행된다.

### ⚠️ 고객사 확정 전에 반드시 바꿔야 하는 문구
레퍼런스에서 그대로 가져오면 안 되는 타 사 콘텐츠다. `src/data/theme.js` 상단 3줄:

| 키 | 현재값 | 원본(쓰면 안 됨) |
|---|---|---|
| `appTitle` | `ORB POP` | `Pop Orb` |
| `rankName` | `RITA_01` | `Elite_Miner` |
| `unlockText` | `신규 오브 해금!` | `ICE FREEZE BALLS!` |

## 명령

```bash
python3 tools/prep_anim.py      # 리타 시퀀스 + UI 아이콘 → 아틀라스
python3 tools/build.py --uihd   # → dist/playable_uihd.html
node tools/qa.js                # 13종 기기 · 완주 · 광고규격 · CTA발동
./tools/release.sh              # 백업 → 재빌드 → QA → 망별빌드 → 흔적검사
```

### 눈으로 확인하기

| URL | 무엇을 보나 |
|---|---|
| `?t=5` | 평온 — **탄 줄기가 곡선 점선으로 보이는지** (레퍼런스 핵심 그림) |
| `?t=12` | HYPER FRENZY + DOMINATION — 문구 3개가 각자 자리에 있는지 |
| `?t=18` | 밀도 최대 — 오브가 CTA·조이스틱을 안 가리는지 |
| `?t=23` | 결과 화면 |

## 1안과 다르게 손댄 곳

- `core/stage.js` — `roundRect` 를 여기로 옮겼다(1안은 `game/skill.js` 전역). `pf.y` 86 → 52(앱바)
- `tools/qa.js` — 전폭 딤 금지 규칙에 **상단 앱바 예외**를 명시적으로 추가.
  ① 상단침범 기준을 `HUD.APPBAR` 로. 지표를 오브/점수/콤보 기준으로 교체
- 신규 `game/orb.js` · `game/combo.js` · `game/stick.js` · `data/orbs.js`
- 삭제 `game/enemy.js` · `game/damage.js` · `data/enemies.js` · `data/neonmob.js`
