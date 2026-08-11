# GAME CREATIVE INTELLIGENCE (GCI) — 고도화 버전

**최종 갱신** 2026.08 · 14개 타이틀

## 이게 뭔가

기존 `factbook.md` 12종을 **Creative Decision Tool** 관점으로 재구성한 단일 HTML DB.
게임을 모르는 디자이너가 3분 안에 "무엇을 만들면 되는지"까지 도달하는 것이 목표다.

## 파일 구조

```
_gci/
├── netmarble-gci.html     ← 발행용 완성본 (이 파일을 Artifact로 발행)
└── src/
    ├── gci-shell.html     CSS + 레이아웃 골격
    ├── gci-data.js        타이틀 01~03 (나혼렙 · 레이븐2 · 뱀피르)
    ├── gci-data-2.js      타이틀 04~06 (RF · SOL · 세나 리버스)
    ├── gci-data-3.js      타이틀 07~09 (몬길 · 스톤에이지 · KOF AFK)
    ├── gci-data-4.js      타이틀 10~14 (7DS GC · Origin · 왕좌 · 샹그릴라 · 옥토퍼스)
    └── gci-render.js      렌더 함수 + 라우터 + 검색/필터
```

## 빌드

```bash
cd netmarble-game-factbook/_gci/src
{ cat gci-shell.html; echo '<script>'; \
  cat gci-data.js gci-data-2.js gci-data-3.js gci-data-4.js gci-render.js; \
  echo '</script>'; } > ../netmarble-gci.html
```

데이터만 고칠 때는 `src/gci-data*.js`를 수정하고 위 명령을 다시 실행한다.
CSS·레이아웃은 `gci-shell.html`, 섹션 구조는 `gci-render.js`.

## 데이터 스키마

| 필드 | 값 |
|---|---|
| `ipClass` | OWN · LEGACY · ACQUIRED · LICENSED · LICENSED_EXP · EXT_PUB |
| `status` | LIVE · UNRELEASED |
| `maturity` | HIGH · MEDIUM · LOW (RESEARCH MATURITY) |
| `asset` | CHARACTER · WORLD · SYSTEM · COMPETITION · POWER · UNKNOWN |
| `coreFantasy` | `{code, flow[], desc}` — 게임이 파는 욕망 구조 |
| `iconic5` | `[요소, 타입, 설명, 별점]` × 5 |
| `heat` | 캐릭터별 FANDOM/VISUAL/UA/SNS + **basis(근거)** |
| `vdna` | `[Element, Meaning, Emotion, Marketing Use]` |
| `fanLang` | `{t, risk, origin, when, why, now, use, src}` |
| `landmine` | `{t, lv, d, why, src}` — lv: CRITICAL/HIGH/MEDIUM/LOW |
| `origIP` | 라이선스 IP만. `{memory, game, gap, sens, rights}` |
| `sources` | `[자료명, SOURCE LEVEL]` |

## 작성 원칙

1. **추측하지 않는다.** 근거 없는 칸은 `NOT ENOUGH PUBLIC DATA`로 남긴다.
2. **CHARACTER HEAT 별점에는 `basis`가 반드시 붙는다.** 근거를 못 대면 별점을 주지 않는다.
3. **출처를 4단계로 구분한다.** OFFICIAL / MEDIA / COMMUNITY SIGNAL / UNVERIFIED
4. **커뮤니티 의견을 팬덤 전체 의견처럼 쓰지 않는다.**
5. **권리 확인이 안 된 IP 요소는 `RIGHTS CHECK REQUIRED`로 표기한다.**

## 현재 데이터 현황

```
타이틀      14종 (서비스 12 · 미출시 2)
IP 분류     LICENSED 4 · LEGACY 4 · LICENSED_EXP 2 · EXT_PUB 2 · OWN 1 · ACQUIRED 1
MATURITY    HIGH 6 · MEDIUM 6 · LOW 2
ASSET       CHARACTER 4 · WORLD 3 · SYSTEM 3 · POWER 1 · COMPETITION 1 · UNKNOWN 2
```

## 미완 항목 (다음 조사 대상)

전 타이틀 공통으로 비어 있다.

- **ICONIC LINES** — 나혼렙 "일어나라" 외 미조사. 브리프상 출처가 확인된 대사만 기재 가능
- **MARKETING HISTORY** — 과거 UA·브랜드 필름·캠페인 사례. 왕좌의 게임(EXP팩 무료 전환)과 7DS GC(777 캠페인)만 부분 확인

타이틀별 미확인 사항은 각 게임 상세 하단 **DATA GAP** 섹션 참조.

지목된 심층 조사 대상 4건:
1. KOF ALLSTAR 서비스 종료 → KOF AFK 팬덤 감정 연결 (LANDMINE에 UNVERIFIED로 자리만 확보)
2. RF 온라인 구작 팬의 종족·광산전·SF 세계관 인식 (IP GAP 공백)
3. 샹그릴라 프론티어 — Core Fantasy가 원작 구조 기반 **추정** 상태
4. 프로젝트 옥토퍼스 — 개발 코드명 단계로 Core Fantasy 미정의

## 기존 문서와의 관계

`_gci/`는 기존 `01~12_*/factbook.md`를 **대체하지 않는다.**
- `factbook.md` — 타이틀별 상세 서술. 근거와 맥락이 길게 들어간다
- `_gci/` — 빠른 판단용 DB. 훑고 결정하는 용도

원문 검증이 필요하면 각 타이틀 `sources.md`로 간다.
