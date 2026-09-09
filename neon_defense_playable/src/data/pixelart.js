/* ============================================================================
   pixelart.js — 폴백 도트 아트 (에셋 0장으로 27초 완주하기 위한 레이어)
   실제 도트 시트가 들어오면 이 파일은 사용되지 않는다.  (사례분석 S5)
   문자 = 팔레트 키. '.' 은 투명.
   ========================================================================== */
var PIXELART = {

  player: {
    pal: { a:'#150d28', b:'#3a5bd9', c:'#6f9bff', d:'#ffd9a8', e:'#8ef0ff', f:'#ffd23f' },
    map: [
      "....aaaaaa....",
      "...abbbbbba...",
      "..abbccccbba..",
      "..abcddddcba..",
      "..abddddddba..",
      "..abdaddadba..",
      "..abddddddba..",
      "...abddddba...",
      "..aebbbbbbea..",
      ".aebbbbbbbbea.",
      ".aebbffffbbea.",
      "..abbccccbba..",
      "..abbbbbbbba..",
      "...abbbbbba...",
      "...ab....ba...",
      "...ad....da...",
      "..aaa....aaa..",
      ".............."
    ]
  },

  grunt: {
    pal: { a:'#0d2413', g:'#5fbf4a', w:'#ffffff', m:'#2a0f0f' },
    map: [
      "....aaaa....",
      "..aaggggaa..",
      ".agggggggga.",
      "agggggggggga",
      "aggwaggawgga",
      "agggggggggga",
      "aggggmmgggga",
      ".agggggggga.",
      "..agggggga..",
      "...agggga...",
      "..aa.aa.aa..",
      "............"
    ]
  },

  fast: {
    pal: { a:'#2b0713', R:'#ff5470', w:'#ffffff' },
    map: [
      "............",
      ".aa......aa.",
      "aRRa....aRRa",
      "aRRRa..aRRRa",
      "aRRRRaaRRRRa",
      ".aRRRRRRRRa.",
      "..aRwRRwRa..",
      "..aRRRRRRa..",
      "...aRRRRa...",
      "....aRRa....",
      ".....aa.....",
      "............"
    ]
  },

  tank: {
    pal: { a:'#14161f', S:'#8b93a8', w:'#ffe066' },
    map: [
      "...aaaaaa...",
      "..aSSSSSSa..",
      ".aSSSSSSSSa.",
      ".aSwSSSSwSa.",
      ".aSSSSSSSSa.",
      "aSSaSSSSaSSa",
      "aSSSSSSSSSSa",
      "aSSSSSSSSSSa",
      ".aSSSSSSSSa.",
      ".aSSaaaaSSa.",
      "..aaa..aaa..",
      "............"
    ]
  },

  elite: {
    pal: { a:'#1a0726', P:'#b45cff', w:'#ffe066', m:'#3d0f2b' },
    map: [
      ".a........a.",
      ".aa......aa.",
      "..aaPPPPaa..",
      ".aPPPPPPPPa.",
      "aPPPPPPPPPPa",
      "aPPwPPPPwPPa",
      "aPPPPPPPPPPa",
      ".aPPPmmPPPa.",
      ".aPPPPPPPPa.",
      "..aPPPPPPa..",
      "..aa.aa.aa..",
      "............"
    ]
  },

  boss: {
    pal: { a:'#0b0410', K:'#e8e4f0', R:'#ff2e4d' },
    map: [
      "......aaaaaaaa......",
      "....aaKKKKKKKKaa....",
      "...aKKKKKKKKKKKKa...",
      "..aKKKKKKKKKKKKKKa..",
      "..aKKKaaKKKKaaKKKa..",
      "..aKKaRRaKKaRRaKKa..",
      "..aKKaRRaKKaRRaKKa..",
      "..aKKKaaKKKKaaKKKa..",
      "..aKKKKKKKKKKKKKKa..",
      "...aKKKKKKKKKKKKa...",
      "...aKKaKKaaKKaKKa...",
      "....aaKKKKKKKKaa....",
      ".......aKKKKa.......",
      ".....aRRKKKKRRa.....",
      ".....aRRKKKKRRa.....",
      "......aRRKKRRa......",
      "......aaRRRRaa......",
      ".......aaaaaa......."
    ]
  },

  hand: {
    pal: { o:'#3d2214', s:'#f5cfa6', h:'#ffe9cf', b:'#5a3020', g:'#ffcf3f', y:'#b8860b' },
    map: [
      "....oo........",
      "...ohso.......",
      "...ohso.......",
      "...ohsoo......",
      "...ohssoo.....",
      "..oohsssso....",
      ".oshosssssoo..",
      ".oshosssssso..",
      ".oshssssssso..",
      "..obbbbbbbso..",
      "..obbbgbbbo...",
      "..obbgggbbo...",
      "...obbgbbo....",
      "...oggggggo...",
      "....oyyyyo....",
      ".....oooo....."
    ]
  },

  chevL: {
    pal: { o:'#3d2214', g:'#ffcf3f', h:'#fff3b0' },
    map: [
      "...og..og.",
      "..ogg.ogg.",
      ".ohg.ohg..",
      "ohg..ohg..",
      ".ohg..ohg.",
      "..ogg..ogg",
      "...og...og"
    ]
  },

  chevR: {
    pal: { o:'#3d2214', g:'#ffcf3f', h:'#fff3b0' },
    map: [
      ".go..go...",
      ".ggo.ggo..",
      "..gho.gho.",
      "..gho..gho",
      ".gho..gho.",
      "ggo..ggo..",
      "go...go..."
    ]
  },

  /* 골드 스타 — 결과 별점 · 캐릭터 주변 반짝임 공용.
     하이라이트(w)를 좌상단에, 그림자(r)를 우하단에 두어 도트 입체를 만든다. */
  star: {
    pal: { o:'#2e1b3c', y:'#ffd21f', w:'#fff6d0', r:'#ff8c1a' },
    map: [
      ".......ooo.......",
      "......oyywo......",
      "......oywwo......",
      ".....oyywwro.....",
      ".....oywwwro.....",
      "oooooywwyyyrooooo",
      "oywwwwwyyyyyyyyro",
      ".oywwwyyyyyyyyro.",
      "..oyywyyyyyyyro..",
      "...oywyyyyyyro...",
      "...oywyyyyyyro...",
      "..oywyyyyyyyyro..",
      "..oywyyyoyyyyro..",
      ".oywyyro.oyyyyro.",
      ".oywyro...oyyyro.",
      "oyyro.......oyro.",
      "ooo...........oo."
    ]
  },

  /* 작은 별 — 9x9. 큰 별(17x17)을 축소하면 뭉개지므로 작은 크기는 전용 맵을 쓴다.
     "필요한 크기마다 그 크기의 도트를 따로 만든다"가 도트 아트의 기본 규칙. */
  star_s: {
    pal: { o:'#2e1b3c', y:'#ffd21f', w:'#fff6d0' },
    map: [
      "....o....",
      "...owo...",
      "...owo...",
      "oooywyooo",
      "owwyyyyyo",
      ".oyyyyyo.",
      "..oyyyo..",
      ".oyo.oyo.",
      ".o.....o."
    ]
  },

  /* 블루 젬 — 결과 보상 표기 */
  gem: {
    pal: { o:'#1a1140', c:'#5ee9ff', b:'#2f7bff', d:'#1240d8', w:'#ffffff' },
    map: [
      "......oo......",
      ".....occo.....",
      "....owccco....",
      "...owccccco...",
      "..owccccccco..",
      ".occcccccccco.",
      "obbcccccccbbdo",
      "obbbcccccbbbdo",
      ".obbbcccbbbdo.",
      "..obbbcbbbdo..",
      "...obbbbbdo...",
      "....obbbdo....",
      ".....obdo.....",
      "......oo......"
    ]
  },

  coin: {
    pal: { a:'#7a4b00', y:'#ffd23f', w:'#fff3b0' },
    map: [
      "..aaaa..",
      ".ayyyya.",
      "ayywyyya",
      "ayywyyya",
      "ayywyyya",
      "ayywyyya",
      ".ayyyya.",
      "..aaaa.."
    ]
  }
};
