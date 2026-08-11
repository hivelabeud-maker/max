# design-reference-moodboard

Claude Code / Cowork용 스킬입니다. UI·웹사이트 디자인 작업을 준비할 때 Awwwards, CSS Design Awards, GDWEB 세 곳에서 실제 반응도(커뮤니티 평점·심사점수·WINNER 여부)가 검증된 레퍼런스를 리서치하고, 고정된 라이트 테마 HTML 무드보드(Tier 1/2/3 각 6개, 총 18개)로 정리해줍니다.

## 설치 방법

### Claude Code
이 폴더를 프로젝트의 `.claude/skills/design-reference-moodboard/` 경로 또는 사용자 전역 스킬 경로(`~/.claude/skills/`)에 복사하세요.

```bash
mkdir -p ~/.claude/skills
cp -r design-reference-moodboard ~/.claude/skills/
```

### Cowork
`SKILL.md`가 들어있는 이 폴더를 zip으로 압축해 확장자를 `.skill`로 바꾼 뒤, Cowork 채팅에 파일로 첨부하면 "Save skill" 버튼으로 설치할 수 있습니다.

## 사용 예시

- "OOO 기업 사이트를 만들려고 하는데 레퍼런스를 찾아줘"
- "이런 느낌의 사이트 벤치마킹 해줘"
- "3번 빼고 다시 찾아줘"

자세한 동작 규칙은 [`SKILL.md`](./SKILL.md)를 참고하세요.
