# 프롬프트 생성 가이드라인

## Step 2: Image & Video Prompt Generation

생성 프롬프트는 텍스트-투-이미지(Image Gen), 3D(3D Gen), 영상(Video Gen) 툴로 즉시 복사·붙여넣기할 것을 전제로 작성합니다.

---

## 형식

- **명사 위주의 영문 키워드**
- **쉼표(,)로 구분**
- **피사체 + 조명 + 렌더링 스타일 + 카메라 앵글 + 브랜드 코어 무드 포함**

---

## 이미지 프롬프트 (Image Prompt)

### 샘플 구조

```
[Image Prompt]
Subject: [주체 및 구성]
Lighting: [빛의 방향·질감]
Style: [렌더링 기법·미학]
Camera: [앵글·프레임]
Mood: [브랜드 정서·톤]
```

### 실제 예시 1 (로고/마크)
```
Minimalist geometric logo mark, gold and deep navy, 
soft studio lighting, 3D render, isometric view, 
premium, sophisticated, sharp shadows
```

### 실제 예시 2 (브랜드 키비주얼)
```
Entrepreneur in modern workspace, morning light through large windows,
warm and professional atmosphere, cinematic photography, 
35mm lens, shallow depth of field, confidence and innovation mood,
contemporary minimalist setting
```

### 실제 예시 3 (제품 목업)
```
Luxury packaging flat lay, soft diffused lighting,
cream and black color scheme, top-down angle,
elegant and minimal, high-end product photography,
marble surface background
```

---

## 영상/모션 프롬프트 (Video/Motion Prompt)

### 구성 요소

1. **장면별 컷 (Shot) 명시**
   - Shot 1: [초기 구성]
   - Shot 2: [전개]
   - Shot 3: [클라이맥스]
   - Shot 4: [마무리]

2. **전환 효과 (Transition)**
   - crossfade, dissolve, wipe, cut 등

3. **음향 (Audio)**
   - SFX (효과음): 어떤 종류?
   - BGM 톤: 템포, 감정, 장르?

### 실제 예시 (브랜드 히어로 영상 - 15초)

```
[Video Prompt]

Shot 1 (0-3초):
Wide establishing shot of modern workspace, 
entrepreneur at desk working, morning light, 
cinematic slow pan from left to right

Shot 2 (3-7초):
Close-up on hands: typing, sketching ideas on paper,
dynamic focus shifts between hand and screen,
warm studio lighting

Shot 3 (7-11초):
Medium shot: person looking up from work, 
confident expression, turning toward camera,
slight smile, eye contact

Shot 4 (11-15초):
Wide shot returning to workspace, 
satisfied atmosphere, text overlay appears,
slow zoom out

Transitions: Smooth crossfades between shots
Duration: 15 seconds total
BGM: Uplifting, contemporary instrumental, 
modern piano with subtle electronic elements, 
tempo 100-110 BPM, confident and inspiring mood
SFX: Subtle keyboard sounds, paper rustling (minimal)
```

---

## 프롬프트 작성 체크리스트

### 이미지 생성 시
- [ ] Subject: 주체가 명확한가?
- [ ] Lighting: 빛의 방향과 질감이 구체적인가?
- [ ] Style: 렌더링 기법이 명시되었는가? (photography, 3D render, illustration 등)
- [ ] Camera: 앵글이나 렌즈 정보가 있는가?
- [ ] Mood: 브랜드 톤이 반영되었는가?

### 영상 생성 시
- [ ] 각 Shot의 구성이 구체적인가?
- [ ] 전환 효과가 명시되었는가?
- [ ] BGM의 템포와 감정이 기술되었는가?
- [ ] 전체 길이(초)가 명확한가?
- [ ] SFX가 필요시 포함되었는가?

---

## 자주 쓰는 표현

### Lighting (조명)
- soft studio lighting (부드러운 스튜디오 조명)
- warm golden hour light (따뜻한 골든아워 조명)
- cool blue ambiance (차가운 파란 분위기)
- dramatic side lighting (극적인 측면 조명)
- diffused natural light (확산된 자연광)
- backlighting (역광)

### Style (스타일)
- cinematic photography (영화적 사진)
- 3D render (3D 렌더링)
- illustration (삽화)
- minimal design (미니멀 디자인)
- high-end product photography (고급 제품 사진)
- editorial style (에디토리얼 스타일)

### Camera (카메라)
- 35mm lens (35mm 렌즈)
- 50mm lens (50mm 렌즈)
- wide angle (광각)
- isometric view (등축각 뷰)
- top-down angle (하향식 앵글)
- shallow depth of field (얕은 심도)

### Mood (무드)
- premium, sophisticated (프리미엄, 세련됨)
- warm and professional (따뜻하고 전문적)
- contemporary and minimalist (현대적이고 미니멀)
- confident and inspiring (자신감 있고 영감적)
- elegant and luxurious (우아하고 럭셔리)
