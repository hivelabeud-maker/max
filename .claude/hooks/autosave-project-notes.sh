#!/usr/bin/env bash
# 프로젝트 노트 자동 저장 훅 (Stop 이벤트)
# 목적: 임시 컨테이너에서 세션이 끝나도 .claude/projects/ 노트가 소실되지 않게
#       매 턴 종료 시 자동 커밋 + 푸시한다.
# 범위: .claude/projects/ 만. 에이전트·스킬 등 나머지는 의도적 커밋으로 남긴다.
# 성격: 절대 턴을 막지 않는다 — 어떤 실패에도 exit 0.

root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$root" || exit 0

# 프로젝트 노트에 변경(추가·수정·삭제)이 없으면 조용히 종료
git status --porcelain -- .claude/projects/ 2>/dev/null | grep -q . || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
[ -z "$branch" ] || [ "$branch" = "HEAD" ] && exit 0   # 브랜치 없거나 detached면 스킵

git add -- .claude/projects/ 2>/dev/null || exit 0
# 스테이징 후에도 실제 커밋할 게 없으면 종료
git diff --cached --quiet -- .claude/projects/ 2>/dev/null && exit 0

git commit -q -m "자동 저장: 프로젝트 노트 ($(date '+%Y-%m-%d %H:%M'))" -- .claude/projects/ 2>/dev/null || exit 0

# 푸시 시도 → 거부되면 최신으로 rebase 후 1회 재시도 (동시 편집 대비)
git push -q origin "$branch" 2>/dev/null && exit 0
git fetch -q origin "$branch" 2>/dev/null || exit 0
if git rebase -q "origin/$branch" 2>/dev/null; then
  git push -q origin "$branch" 2>/dev/null || exit 0
else
  git rebase --abort 2>/dev/null || true
fi
exit 0
