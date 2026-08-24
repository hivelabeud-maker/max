# 전체 워크플로우 다이어그램

프로젝트 고유명사 없이 게이트 흐름만 표시한다. 실제 프로젝트의 진행 상태는 해당 프로젝트 폴더의 `00-note.md` 요약 섹션에 기록한다.

```mermaid
flowchart TD
    G0["Gate 0<br/>프로젝트 준비<br/>브리프 확인"] --> G1

    subgraph PHASE01["PHASE 01 · UNDERSTAND"]
        G1["Gate 1<br/>SB 분석<br/>사건·의미·공간기능·전환<br/>(프롬프트 작성 금지)"] --> G2
        G2["Gate 2<br/>Visual Bible<br/>세계정의·조형계층·재질·팔레트·시간대<br/>(프롬프트 작성 금지)"] --> G3
        G3["Gate 3<br/>Shot Matrix<br/>렌즈·높이·축·움직임·합성여백"]
    end

    G3 --> G4

    subgraph PHASE02["PHASE 02 · MASTER CONCEPT SET"]
        G4["Gate 4<br/>마스터 시안 3안<br/>A 충실형 · B 확장형 · C 극대화형<br/>5축 평가표"]
    end

    G4 -->|하나 승인| G5A

    subgraph PHASE03["PHASE 03 · LOCK & FIND THE GAPS"]
        G5A["Gate 5A<br/>Master Lock<br/>중앙축·실루엣·건축·재질·시간대 잠금"] --> G5B
        G5B["Gate 5B<br/>Scene Gap Analysis<br/>6개 공백 카테고리<br/>필수/권장/선택"]
    end

    G5B --> G6

    subgraph PHASE04["PHASE 04 · DERIVE, FINISH, DELIVER"]
        G6["Gate 6<br/>파생 제작<br/>리프레임·부분수정·시간변형·클린플레이트<br/>(한 패스 한 작업)"] --> G7
        G7["Gate 7<br/>Finish<br/>업스케일·영상화 설정"] --> QC
        QC["Deliver<br/>QC & Archive<br/>버전명·원본/마스터/편집/업스케일 보관"]
    end

    G6 -.반려·재작업.-> REV["revision-protocol<br/>어느 Gate로 돌아갈지 판정"]
    REV -.-> G2
    REV -.-> G4
    REV -.-> G6
```

## 게이트별 정지 규칙

- Gate 1, 2는 이미지 프롬프트 작성 자체를 금지한다.
- Gate 4에서 처음으로 프롬프트를 쓰되, 캐릭터·FX 없는 무인 마스터 3안까지만이다.
- Gate 5A(Master Lock)는 반드시 Gate 4에서 하나의 안이 승인된 뒤에만 시작한다.
- Gate 5B(Scene Gap Analysis)는 Master Lock 이후에만 시작하고, 이 단계에서는 추가 씬의 목록과 우선순위만 승인받는다. 장문 프롬프트는 Gate 6에서 쓴다.
- Gate 6은 요청마다 한 가지 작업만 처리한다.
- 각 게이트는 사용자 승인이 있어야 다음으로 넘어간다. 화살표는 "승인 후 이동"을 뜻하지 자동 진행을 뜻하지 않는다.
