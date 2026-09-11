#!/usr/bin/env bash
# 프로젝트 노트 자동 저장 훅 (Stop 이벤트)
# 목적: 임시 컨테이너에서 세션이 끝나도 .claude/projects/ 노트가 소실되지 않게
#       매 턴 종료 시 자동 커밋 + 푸시한다.
# 범위: .claude/projects/ 만. 에이전트·스킬 등 나머지는 의도적 커밋으로 남긴다.
# 성격: 절대 턴을 막지 않는다 — 어떤 실패에도 exit 0.
#
# 팀 전환(2026-09) 보강:
#   main에 브랜치 보호가 걸리면 직접 푸시가 거부된다. 그때 커밋만 로컬에 남고
#   임시 컨테이너가 회수되면 노트가 사라진다. 거부되면 구제 브랜치로 밀어 보존한다.

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

# 1차: 현재 브랜치로 푸시
git push -q origin "$branch" 2>/dev/null && exit 0

# 2차: 거부 사유가 "뒤처짐"이면 rebase 후 1회 재시도 (동시 편집 대비)
if git fetch -q origin "$branch" 2>/dev/null && git rebase -q "origin/$branch" 2>/dev/null; then
  git push -q origin "$branch" 2>/dev/null && exit 0
else
  git rebase --abort 2>/dev/null || true
fi

# 3차: 여기까지 왔으면 브랜치 보호·권한 거부일 가능성이 크다.
#      커밋을 잃지 않도록 구제 브랜치로 보존한다. 나중에 PR로 올리면 된다.
who="$(git config user.email 2>/dev/null | cut -d@ -f1 | tr -cd 'a-zA-Z0-9._-')"
[ -z "$who" ] && who="unknown"
rescue="notes/${who}-$(date '+%Y%m%d-%H%M%S')"
git push -q origin "HEAD:refs/heads/${rescue}" 2>/dev/null || true
exit 0
