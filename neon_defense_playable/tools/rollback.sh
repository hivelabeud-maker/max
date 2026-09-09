#!/bin/bash
# =============================================================================
# rollback.sh — 예전 버전으로 되돌린다.
#
#   ./tools/rollback.sh                  → 되돌릴 수 있는 시점 목록을 보여준다
#   ./tools/rollback.sh 2026-09-04_1930  → 그 시점으로 소스를 되돌리고 재빌드
#
# 되돌리기 전에 "지금 상태"도 자동으로 백업하므로, 되돌린 게 마음에 안 들면
# 다시 최신으로 돌아올 수 있다.
# =============================================================================
set -euo pipefail

PROJ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REL="$PROJ/releases"
cd "$PROJ"

if [ ! -d "$REL" ] || [ -z "$(ls -A "$REL" 2>/dev/null)" ]; then
  echo "되돌릴 백업이 없습니다. ./tools/release.sh 를 한 번 실행하면 그때부터 쌓입니다."
  exit 1
fi

# ── 인자 없으면 목록만 ───────────────────────────────────────────────────────
if [ $# -eq 0 ]; then
  echo "되돌릴 수 있는 시점:"
  echo
  for d in $(ls -1 "$REL" | sort -r); do
    [ -d "$REL/$d" ] || continue
    size=$(du -sh "$REL/$d" 2>/dev/null | cut -f1)
    hp=$(grep -m1 "최종 HP" "$REL/$d/qa.log" 2>/dev/null | sed 's/  */ /g' || echo "")
    printf "  %-20s %6s   %s\n" "$d" "$size" "$hp"
  done
  echo
  echo "사용:  ./tools/rollback.sh <시점>"
  echo "예:    ./tools/rollback.sh $(ls -1 "$REL" | sort -r | head -1)"
  exit 0
fi

TARGET="$1"
SNAP="$REL/$TARGET"
[ -d "$SNAP" ] || { echo "그런 시점이 없습니다: $TARGET"; echo; exec "$0"; }
[ -f "$SNAP/source.tar.gz" ] || { echo "$TARGET 에 source.tar.gz 가 없습니다."; exit 1; }

echo "════════════════════════════════════════════════════════════"
echo " $TARGET 시점으로 되돌립니다"
echo "════════════════════════════════════════════════════════════"

# ── 지금 상태부터 백업 (되돌리기를 되돌릴 수 있게) ───────────────────────────
NOW="$REL/$(date +%Y-%m-%d_%H%M)_rollback직전"
mkdir -p "$NOW"
tar --exclude='._*' --exclude='.DS_Store' -czf "$NOW/source.tar.gz" src tools docs README.md 2>/dev/null
for f in playable_uihd.html playable_uihd_video.html playable_uihd_demo.html; do
  [ -f "dist/$f" ] && cp "dist/$f" "$NOW/$f"
done
echo "▸ 지금 상태를 먼저 백업했습니다 → releases/$(basename "$NOW")/"

# ── 복원 ─────────────────────────────────────────────────────────────────────
echo "▸ 소스 복원 중..."
tar -xzf "$SNAP/source.tar.gz" -C "$PROJ"
echo "   ✓ src/ tools/ docs/ README.md 복원"

echo "▸ 재빌드..."
python3 tools/build.py --uihd >/dev/null && echo "   ✓ dist/playable_uihd.html"

echo "▸ QA..."
if node tools/qa.js 2>&1 | grep -q "전 항목 통과"; then
  echo "   ✓ 전 항목 통과"
else
  echo "   ⚠ QA 통과 못 함 — 그 시점 자체가 문제였을 수 있습니다. 로그를 확인하세요."
fi

echo
echo "════════════════════════════════════════════════════════════"
echo " 완료. 이 상태를 정식 배포하려면:  ./tools/release.sh"
echo " 되돌린 걸 취소하려면:  ./tools/rollback.sh $(basename "$NOW")"
echo "════════════════════════════════════════════════════════════"
