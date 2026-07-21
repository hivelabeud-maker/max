#!/usr/bin/env bash
# UserPromptSubmit 훅 — 리서치/글 산출 자동 규칙 "조건부" 주입
# 매 프롬프트마다 실행되지만, 아래 키워드가 감지될 때만 규칙을 컨텍스트로 주입한다.
# (단순 질의·잡업에는 아무것도 붙이지 않아 조용함)

input=$(cat)
prompt=$(printf '%s' "$input" | jq -r '.prompt // ""')

ctx=""

# ── 리서치성 요청 감지 ──────────────────────────────
if printf '%s' "$prompt" | grep -qiE '리서치|와이드|동향|시장 ?조사|경쟁사|경쟁 ?구도|레퍼런스|벤치마크|트렌드|포지셔닝|화이트스페이스|조사해|분석해줘'; then
  ctx="[자동 규칙 · 리서치] 산출물로 바로 가지 말 것. marketer 파이프라인부터 순서대로 돈다 → 1) 시장조사(경쟁사 30개 기본, 동종+이종업계[인접·크로스오버] 함께, 각 사례 [동종]/[이종] 태그) → 2) 와이드 리서치(8속성·3그룹) → 3) 디자인 리서치(트렌드·레퍼런스) → 4) 발산. 사양: .claude/library/prompts/wide-research.md · .claude/agents/market-research.md · .claude/agents/marketer.md. '덱으로/제안서로' 출력 지정이 있어도 리서치 단계를 건너뛰지 않는다(리서치 → 그 결과로 덱)."
fi

# ── 글·덱·카피 산출 감지 ────────────────────────────
if printf '%s' "$prompt" | grep -qiE '덱|제안서|슬라이드|카피|캡션|뉴스레터|스레드|링크드인|원고|리포트|보고서|대본|글쓰|문구|본문 ?정리'; then
  [ -n "$ctx" ] && ctx="${ctx}"$'\n'
  ctx="${ctx}[자동 규칙 · 글 산출] 발행/제출 전 최종 필터로 dumbify(일반인 5초 이해: 전문용어 제거·한 문장 한 생각·구체 표현) + anti-ai-writing을 적용한다. 이미 대화체인 짧은 캡션엔 가볍게."
fi

if [ -n "$ctx" ]; then
  jq -cn --arg c "$ctx" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit", additionalContext:$c}}'
fi
exit 0
