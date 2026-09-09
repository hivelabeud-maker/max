#!/bin/bash
# =============================================================================
# release.sh — 한 방에 전부 갱신한다.
#
#   1. 지금 상태를 releases/<날짜_시각>/ 에 통째로 백업 (되돌릴 지점)
#   2. 전 변주 재빌드 (UIHD 납품본 / 영상용 / 9:16 데모)
#   3. QA 자동 검증 — 실패하면 여기서 멈춘다 (망가진 걸 배포하지 않는다)
#   4. NEON_DEFENSE_FINAL 폴더 갱신 + zip 재생성
#   5. NEON_DEFENSE_영상추출 폴더 갱신
#   6. 클라이언트 납품 흔적 검사
#   7. git 이 있으면 자동 커밋
#
# 필요 도구: python3 node rsync zip unzip tar  (0단계에서 먼저 확인한다)
#
# 사용:  ./tools/release.sh            (프로젝트 폴더에서)
# 되돌리기:  ./tools/rollback.sh       (백업 목록이 뜬다)
# =============================================================================
set -euo pipefail

PROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CODE="$(dirname "$PROJ")"
# 납품 폴더 — 기본은 프로젝트 옆이다(맥 작업 폴더 구조 기준).
# 프로젝트가 다른 저장소 안에 들어가 있으면 그 저장소를 더럽히므로
# 환경변수로 덮어쓸 수 있게 했다:
#   NEON_FINAL_DIR=~/Desktop/납품 ./tools/release.sh
FINAL="${NEON_FINAL_DIR:-$CODE/NEON_DEFENSE_FINAL}"
VIDEO="${NEON_VIDEO_DIR:-$CODE/NEON_DEFENSE_영상추출}"
TS="$(date +%Y-%m-%d_%H%M)"
SNAP="$PROJ/releases/$TS"

cd "$PROJ"

# ── 0. 필요한 도구 확인 ──────────────────────────────────────────────────────
# 맥에는 전부 기본으로 있지만 리눅스 컨테이너·CI 에는 rsync·zip 이 없는 경우가
# 있다. 없이 들어가면 4단계 한복판에서 "command not found" 로 죽어서 원인이
# 안 보인다. 여기서 한 번에 알려준다.
MISS=""
for _t in python3 node rsync zip unzip tar; do
  command -v "$_t" >/dev/null 2>&1 || MISS="$MISS $_t"
done
if [ -n "$MISS" ]; then
  echo "✗ 필요한 도구가 없다:$MISS"
  echo "  맥:    brew install${MISS}"
  echo "  우분투: sudo apt-get install -y${MISS}"
  echo "  (빌드·QA 만 돌리려면: python3 tools/build.py --uihd && node tools/qa.js)"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
echo " NEON DEFENSE — 릴리스  $TS"
echo "════════════════════════════════════════════════════════════"

# ── 1. 백업 (되돌릴 지점) ────────────────────────────────────────────────────
echo
echo "▸ 1/7  현재 상태 백업"
mkdir -p "$SNAP"
tar --exclude='._*' --exclude='.DS_Store' -czf "$SNAP/source.tar.gz" src tools docs README.md 2>/dev/null
for f in playable_uihd.html playable_uihd_video.html playable_uihd_demo.html; do
  [ -f "dist/$f" ] && cp "dist/$f" "$SNAP/$f"
done
echo "   → releases/$TS/  (source.tar.gz + 그 시점 빌드)"

# ── 2. 재빌드 ────────────────────────────────────────────────────────────────
echo
echo "▸ 2/7  재빌드"
python3 tools/build.py --uihd         >/dev/null && echo "   ✓ dist/playable_uihd.html        (납품본)"
python3 tools/build.py --uihd --video >/dev/null && echo "   ✓ dist/playable_uihd_video.html  (영상 녹화용)"

# 9:16 고정 데모 — 납품본의 화면비 기본값만 뒤집는다 (게임 로직은 동일)
cp dist/playable_uihd.html dist/playable_uihd_demo.html
# sed -i 는 BSD(맥)와 GNU(리눅스·CI) 문법이 다르다. 맥 문법(-i '')만 쓰면
# 리눅스에서 스크립트가 통째로 죽는다 — 이식성 때문에 python 으로 치환한다
python3 - "dist/playable_uihd_demo.html" <<'PYEOF'
import io, sys
p = sys.argv[1]
s = io.open(p, encoding='utf-8').read()
old = "mode  : Q.video ? 'video' : 'ad',"
new = "mode  : Q.ad ? 'ad' : 'video',   /* 데모 시연용 — 기본 9:16 고정 */"
if old not in s:
    sys.exit("치환 대상 없음")
io.open(p, 'w', encoding='utf-8').write(s.replace(old, new, 1))
PYEOF
grep -q "Q.ad ? 'ad' : 'video'" dist/playable_uihd_demo.html \
  || { echo "   ✗ 데모 빌드 치환 실패 — build.py 의 RENDER.mode 줄이 바뀌었는지 확인"; exit 1; }
echo "   ✓ dist/playable_uihd_demo.html   (9:16 고정 시연용)"

# ── 3. QA — 실패하면 중단 ────────────────────────────────────────────────────
echo
echo "▸ 3/7  QA 검증"
if ! node tools/qa.js > "$SNAP/qa.log" 2>&1; then
  echo "   ✗ QA 실패 — 배포를 중단한다. 로그: releases/$TS/qa.log"
  tail -20 "$SNAP/qa.log"
  exit 1
fi
grep -q "전 항목 통과" "$SNAP/qa.log" || {
  echo "   ✗ '전 항목 통과' 가 안 나왔다. 로그: releases/$TS/qa.log"; tail -20 "$SNAP/qa.log"; exit 1; }
echo "   ✓ 전 항목 통과"
grep -E "최종 HP|총 처치|파일 크기" "$SNAP/qa.log" | sed 's/^/     /'

# ── 4. FINAL 폴더 (클라이언트 납품) ──────────────────────────────────────────
echo
echo "▸ 4/7  NEON_DEFENSE_FINAL 갱신"
# 납품에서 빼는 것 — 빌드에 안 쓰이고, 나가면 곤란한 것들:
#   art/octopus/  이전 IP 원본 29MB. 폴더명 자체가 고객사 프로젝트 코드네임이다.
#   */mood/       출처 불명 웹 레퍼런스 이미지(저작권 불명). 코드에서 참조 안 함.
#   __MACOSX/     압축 해제 잔여물
# 에셋 교체에 필요한 원본은 art/raw/ 에 다 있다.
RS_EX=(--exclude='._*' --exclude='.DS_Store' --exclude='__MACOSX/'
       --exclude='art/octopus/' --exclude='mood/')
# --delete-excluded 가 필요하다: 그냥 --delete 만 쓰면 rsync 는 제외 대상을
# "보호"해서, 예전에 한 번 복사돼 들어간 octopus/·mood/ 가 그대로 남는다.
rsync -a --delete --delete-excluded "${RS_EX[@]}" src/   "$FINAL/src/"
rsync -a --delete --delete-excluded "${RS_EX[@]}" tools/ "$FINAL/tools/"
( cd "$FINAL"
  python3 tools/build.py --release             >/dev/null  # dist/index.html        (범용·미리보기)
  python3 tools/build.py --release --net meta  >/dev/null  # dist/index_meta.html   Meta
  python3 tools/build.py --release --net google >/dev/null # dist/index_google.html Google Ads
  python3 tools/build.py --release --net mraid >/dev/null  # dist/index_mraid.html  AppLovin/Unity/ironSource
  python3 tools/build.py --uihd                >/dev/null ) # dist/playable_uihd.html (개발용)
# 망별 빌드 각각 QA — CTA API 가 섞이거나 빠지면 여기서 걸린다
for _v in index.html index_meta.html index_google.html index_mraid.html; do
  ( cd "$FINAL" && node tools/qa.js "$_v" >/dev/null 2>&1 ) \
    || { echo "   ✗ QA 실패: $_v"; exit 1; }
done
echo "   ✓ 망별 빌드 4종 QA 통과 (범용 · Meta · Google · MRAID)"
# Google Ads 는 ZIP 만 받는다 — 그리고 index.html 이 ZIP **루트**에 있어야 한다.
# (하위 폴더에 들어가면 반려. 그래서 임시 폴더에서 파일명을 index.html 로 바꿔 압축한다)
( cd "$FINAL/dist"
  rm -f playable_google.zip
  rm -rf _gz && mkdir -p _gz
  cp index_google.html _gz/index.html
  ( cd _gz && zip -q ../playable_google.zip index.html )
  rm -rf _gz )
unzip -l "$FINAL/dist/playable_google.zip" | grep -q ' index.html$' \
  || { echo "   ✗ playable_google.zip 루트에 index.html 이 없다"; exit 1; }
echo "   ✓ dist/playable_google.zip  (Google 전용 — ZIP 루트에 index.html 확인)"
echo "   ✓ src/ tools/ 동기화 + dist/ 재빌드"
echo "     index.html        $(du -h "$FINAL/dist/index.html" | cut -f1)  (압축 출고본)"
echo "     playable_uihd.html $(du -h "$FINAL/dist/playable_uihd.html" | cut -f1)  (개발용)"

( cd "$CODE"
  rm -f NEON_DEFENSE_FINAL.zip
  zip -rq NEON_DEFENSE_FINAL.zip NEON_DEFENSE_FINAL \
    -x '*/._*' '*/.DS_Store' '*/__MACOSX/*' '*/.git/*' )
echo "   ✓ NEON_DEFENSE_FINAL.zip  $(du -h "$CODE/NEON_DEFENSE_FINAL.zip" | cut -f1)"

# ── 5. 영상추출 폴더 ─────────────────────────────────────────────────────────
echo
echo "▸ 5/7  NEON_DEFENSE_영상추출 갱신"
if [ -d "$VIDEO" ]; then
  cp dist/playable_uihd_video.html "$VIDEO/playable_video.html"
  mkdir -p "$VIDEO/source"
  cp src/tools/recorder.js "$VIDEO/source/recorder.js"
  cp tools/build.py        "$VIDEO/source/build.py"
  echo "   ✓ playable_video.html + source/ 갱신"
else
  echo "   - 폴더 없음, 건너뜀"
fi

# ── 6. 납품 흔적 검사 ────────────────────────────────────────────────────────
echo
echo "▸ 6/7  납품 흔적 검사"
# 검사어 목록은 이 스크립트 안에 문자열로 들어있다. 스스로를 검사하면 전부 걸리므로
# release.sh 자신은 대상에서 뺀다 (FINAL 에 복사돼 들어가기 때문에 실제로 걸렸었다).
LEAK=0
for pat in claude anthropic "/Users/" scratchpad "__hurtTry" "__minD" "window.__G"; do
  hits=$(grep -ril "$pat" "$FINAL" 2>/dev/null | grep -v '/\._' | grep -v 'tools/release\.sh$' || true)
  if [ -n "$hits" ]; then
    echo "   ✗ '$pat'"
    echo "$hits" | sed "s|$FINAL/|       |"
    LEAK=1
  fi
done
if [ "$LEAK" = "0" ]; then
  echo "   ✓ 흔적 0건"
else
  echo
  echo "   ⚠ 위 파일에서 외부에 나가면 안 되는 문자열이 발견됐다."
  echo "     개인 경로·고객사명·디버그 코드가 남아있는지 확인하고 고칠 것."
fi

# ── 7. git 커밋 (있을 때만) ──────────────────────────────────────────────────
echo
echo "▸ 7/7  git"
if [ -d "$PROJ/.git" ]; then
  # 이 드라이브는 exFAT — macOS 가 확장속성을 못 넣어서 ._ 사이드카 파일을
  # .git 안에까지 뿌린다. 그대로 두면 repack 이 깨진다("non-monotonic index").
  find "$PROJ/.git" -name '._*' -delete 2>/dev/null || true
  git -C "$PROJ" add -A
  if git -C "$PROJ" diff --cached --quiet; then
    echo "   - 변경 없음"
  else
    git -C "$PROJ" commit -q -m "release $TS"
    echo "   ✓ 커밋 완료 — release $TS"
  fi
else
  echo "   - git 저장소 아님 (되돌리기는 releases/ 백업으로)"
fi

echo
echo "════════════════════════════════════════════════════════════"
echo " 완료.  되돌리려면:  ./tools/rollback.sh"
echo
echo " ※ 아티팩트(claude.ai 링크)는 자동 갱신되지 않는다."
echo "   dist/playable_uihd_demo.html 을 올려달라고 요청할 것."
echo "════════════════════════════════════════════════════════════"
