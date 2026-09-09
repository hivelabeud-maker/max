/* ============================================================================
   neonmob.js — 네온 도형 몬스터.  ★ 교체 지점 2-B (2차 신규)

   1차는 슬라임 도트 시트 5장이었다. 2차는 어두운 우주라 도트 몹이 배경에
   묻히고, 넷마블 아트를 기다려야 착수도 못 한다. 그래서 몹을 전부
   "코드로 그린 네온 도형"으로 바꿨다 — 그림 파일 0장으로 완주한다.

   ■ 실루엣으로 위계를 만든다 (색만 다른 확대판 금지)
     꼭짓점 수 · 세로비 · 궤도 링 개수, 이 셋을 다르게 준다.
     멀리서 형태만 봐도 등급이 읽혀야 한다:
       ◆ 작은 마름모 → ▲ 길쭉한 화살촉 → ⬡ 뭉툭한 육각 → ▣◎ 링 하나 → ✳◎◎ 링 둘

   ■ 발광은 shadowBlur 로 만들지 않는다
     blur 는 프레임을 통째로 먹는다. 같은 도형을 굵기·알파만 바꿔 3겹으로
     겹쳐 그리면 같은 인상이 나오고 비용은 0에 가깝다.
     게다가 여기서 구운 캔버스는 몹 1종당 한 장뿐이다 — 매 프레임 그리는 게
     아니라 sprite.js 캐시에 올라간 그림을 블릿할 뿐이다.

   ■ 좌표계
     128×128 캔버스, 중심 (64,64). rx/ry 는 "몸통" 반경(디자인 px)이고
     발광은 그 밖으로 번진다. box 를 몸통으로 잡아야 hLogic 이 실제 보이는
     크기와 맞는다 — 발광까지 box 에 넣으면 몹이 설정보다 작아 보인다.
   ========================================================================== */
var NEONMOB = {
  /* n      : 정n각형 꼭짓점 수
     rot    : 초기 회전 (0 = 꼭짓점이 위)
     ar     : 세로/가로 비. 1 보다 크면 길쭉해진다 — 속도감의 근거
     lw     : 심(가장 얇고 밝은 선) 굵기
     col    : 네온 라인색
     core   : 코어 채움. 어두워야 별밭 위에서 도형이 면으로 읽힌다
     solid  : true 면 core 대신 col 로 꽉 채운다 (작은 몹 전용 — 아래 참조)
     gl     : 발광 알파 배율. 물량 몹은 낮춰야 화면이 안 탄다
     hot    : true 면 심 안쪽에 백열 실선을 한 겹 더 — 상위 등급 표시
     rings  : 궤도 링 [{r, lw, a}] — r 은 몸통 반경 대비 배율
     spikes : {n, len} 몸통에서 뻗는 침. len 은 몸통 반경 대비 배율

     ■ 왜 작은 몹은 채우고 큰 몹은 비우나 (2026-09-09 실측으로 정한 규칙)
       첫 시안은 5종 전부 "어두운 코어 + 밝은 외곽선"이었다. 동시 680마리
       구간에서 화면이 시안 벽이 되고 주인공이 통째로 묻혔다.
       속이 빈 도형은 같은 hLogic 이어도 채운 도형보다 크고 밝게 읽힌다 —
       외곽선이 배경과 최대 대비를 이루고 발광이 밖으로 번지기 때문이다.
       그래서 물량 몹(grunt·fast)은 작고 꽉 찬 보석으로, 특수 몹은 크고
       속이 빈 구조물로 갈랐다. 크기·색뿐 아니라 "채움 여부"가 위계를
       한 겹 더 만든다. 물량 몹을 비우는 쪽으로 되돌리지 말 것. */

  /* ◆ 물량. 작고 꽉 찬 시안 보석. 수백 마리가 겹쳐도 카펫으로 읽힌다 */
  n_gr : { n:4, rot:0,     ar:1.00, lw:1.5, col:'#8ef0ff', core:'#0b3d52',
           solid:true, gl:0.55 },

  /* ▲ 돌격. 세로로 길고 꼭짓점이 셋뿐 — 방향이 즉시 읽힌다.
       enemy.js 가 진행 방향으로 돌려서 그린다 */
  n_fa : { n:3, rot:0,     ar:1.52, lw:1.4, col:'#ff5fd6', core:'#5c1046',
           solid:true, gl:0.62 },

  /* ⬡ 중장. 여기서부터 속을 비운다. 굵은 선 + 어두운 코어 = 단단한 구조물 */
  n_ta : { n:6, rot:0.26,  ar:0.92, lw:3.4, col:'#b8d4ff', core:'#16305c', gl:1.0 },

  /* ▣◎ 중간 보스. 링 하나가 방어막을 뜻한다 — 크기가 아니라 구조로 구분 */
  n_ar : { n:4, rot:0.785, ar:1.00, lw:3.0, col:'#a77bff', core:'#2c1656', hot:true,
           gl:1.0, rings:[{ r:1.34, lw:2.2, a:0.72 }] },

  /* ✳◎◎ 엘리트. 침 + 이중 링. 화면에서 유일하게 복잡한 실루엣이라
       등장만으로 "얘가 대장"이 성립한다 */
  n_el : { n:8, rot:0,     ar:1.00, lw:2.8, col:'#ffffff', core:'#4d0b57', hot:true,
           gl:1.0, spikes:{ n:8, len:1.42 },
           rings:[{ r:1.30, lw:2.6, a:0.85, col:'#ff5fd6' },
                  { r:1.66, lw:1.6, a:0.45, col:'#ff5fd6' }] }
};

/* 정n각형 경로 — 꼭짓점 하나가 위(-Y)를 향한다 */
function neonPoly(g, cx, cy, rx, ry, n, rot) {
  g.beginPath();
  for (var i = 0; i < n; i++) {
    var a = rot - Math.PI / 2 + i * 6.2831853 / n;
    var x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry;
    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.closePath();
}

/* 같은 경로를 굵기·알파만 바꿔 3겹으로 긋는다 = 발광.
   바깥부터 옅고 굵게 → 안쪽으로 밝고 얇게. 이 순서를 뒤집으면 뿌옇게만 된다. */
function neonGlowStroke(g, drawPath, col, lw, hot, gl) {
  gl = (gl === undefined) ? 1 : gl;
  var pass = [[lw * 4.4, 0.13], [lw * 2.2, 0.34], [lw, 1.0]];
  g.lineJoin = 'round'; g.lineCap = 'round';
  for (var i = 0; i < 3; i++) {
    g.globalAlpha = pass[i][1] * (i === 2 ? 1 : gl);   /* 심은 항상 또렷하게 */
    g.lineWidth = pass[i][0]; g.strokeStyle = col;
    drawPath(); g.stroke();
  }
  if (hot) {   /* 백열 심 — 상위 등급만. 전부 주면 색 구분이 사라진다 */
    g.globalAlpha = 0.9; g.lineWidth = lw * 0.42; g.strokeStyle = '#ffffff';
    drawPath(); g.stroke();
  }
  g.globalAlpha = 1;
}

/* 도형 1종을 캔버스 한 장으로 굽는다. sprite.js 가 캐시에 올린다. */
function bakeNeon(def) {
  var S = 128, C = S / 2, R = 40;            /* 몸통 반경 40 · 발광 여유 24 */
  var maxR = R;
  if (def.rings) for (var i = 0; i < def.rings.length; i++)
    maxR = Math.max(maxR, R * def.rings[i].r);
  if (def.spikes) maxR = Math.max(maxR, R * def.spikes.len);
  var k = (C - 12) / maxR;                   /* 가장 바깥 요소가 캔버스에 들어오게 */
  var rx = R * k, ry = R * k * (def.ar || 1);

  var cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  var g = cv.getContext('2d');
  var n = def.n, rot = def.rot || 0;

  /* 침 — 몸통 뒤에 깔아서 코어 채움이 뿌리를 덮게 한다 */
  if (def.spikes) {
    var sn = def.spikes.n, sl = def.spikes.len;
    neonGlowStroke(g, function () {
      g.beginPath();
      for (var j = 0; j < sn; j++) {
        var a = rot - Math.PI / 2 + (j + 0.5) * 6.2831853 / sn;
        g.moveTo(C + Math.cos(a) * rx * 0.55, C + Math.sin(a) * ry * 0.55);
        g.lineTo(C + Math.cos(a) * rx * sl,   C + Math.sin(a) * ry * sl);
      }
    }, def.col, def.lw * 0.7, false, def.gl);
  }

  /* 코어 채움 — 별밭 위에서 도형이 "면"으로 읽히게 하는 유일한 장치.
     solid 면 네온색으로 꽉 채워 작은 보석이 되고, 아니면 어두운 코어만 깔아
     외곽선이 주인공인 구조물이 된다 */
  if (def.solid) {
    g.globalAlpha = 0.30; g.fillStyle = def.col;    /* 채움 안쪽에 옅은 발광 */
    neonPoly(g, C, C, rx * 1.28, ry * 1.28, n, rot); g.fill();
    g.globalAlpha = 0.95; g.fillStyle = def.col;
    neonPoly(g, C, C, rx, ry, n, rot); g.fill();
    g.globalAlpha = 0.55; g.fillStyle = def.core;   /* 중앙을 살짝 눌러 입체를 만든다 */
    neonPoly(g, C, C, rx * 0.48, ry * 0.48, n, rot); g.fill();
  } else {
    g.globalAlpha = 0.70; g.fillStyle = def.core;   /* 별이 살짝 비쳐야 구멍이 아니라 구조물로 읽힌다 */
    neonPoly(g, C, C, rx, ry, n, rot); g.fill();
  }
  g.globalAlpha = 1;

  neonGlowStroke(g, function () { neonPoly(g, C, C, rx, ry, n, rot); },
                 def.col, def.lw, def.hot, def.gl);

  /* 궤도 링 — 몸통 밖. 방어막·계급장 역할 */
  if (def.rings) for (var m = 0; m < def.rings.length; m++) {
    var rg = def.rings[m];
    g.globalAlpha = rg.a; g.lineWidth = rg.lw; g.strokeStyle = rg.col || def.col;
    g.beginPath(); g.ellipse(C, C, rx * rg.r, ry * rg.r, 0, 0, 6.2831853); g.stroke();
    g.globalAlpha = rg.a * 0.22 * (def.gl === undefined ? 1 : def.gl); g.lineWidth = rg.lw * 3.4;
    g.beginPath(); g.ellipse(C, C, rx * rg.r, ry * rg.r, 0, 0, 6.2831853); g.stroke();
  }
  g.globalAlpha = 1;

  /* box = 몸통(+링) 범위. 발광은 제외한다 — 포함시키면 설정보다 작아 보인다 */
  var bx = rx, by = ry;
  if (def.rings) for (var q = 0; q < def.rings.length; q++) {
    bx = Math.max(bx, rx * def.rings[q].r); by = Math.max(by, ry * def.rings[q].r);
  }
  return { cv: cv, w: S, h: S, box: { x: C - bx, y: C - by, w: bx * 2, h: by * 2 },
           src: 'vec', smooth: true };
}
