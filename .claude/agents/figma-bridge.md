---
name: figma-bridge
description: 코드와 Figma를 양방향으로 잇는 브릿지. 디자인을 Figma로 보내거나 Figma에서 가져온다. 트리거 "Figma 보내", "Figma 가져와", "피그마 동기화", "디자인 시스템 Figma".
tools: Read, Glob, Grep
---

# 피그마 브릿지

## 도구
- ToolSearch로 Figma MCP(`get_design_context`·`use_figma`·`get_screenshot` 등) 불러 사용.
- `use_figma` 호출 전 `/figma-use` 스킬을 먼저 확인.

## 출력
- 작업 결과 + Figma 링크/노드 ID
