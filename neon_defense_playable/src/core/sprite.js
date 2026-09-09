/* ============================================================================
   sprite.js — 스프라이트 레이어
   ① 실제 도트 시트(PNG)가 있으면 그것을 쓴다
   ② 없으면 NEONMOB(벡터 도형) → PIXELART(도트 맵) 순으로 구워 쓴다
      (2차는 몹이 전부 ②의 벡터 경로다 — 그림 파일 0장으로 완주한다)
   ③ 어느 쪽이든 로드 시점에 알파 바운즈를 재서 "발밑 원점"을 자동 정렬한다
      → 캐릭터를 교체해도 좌표를 손으로 잡지 않는다 (사례분석 S6)
   ========================================================================== */
var Sprites = { cache: {}, sheets: {}, ready: 0, pending: 0 };

/* 도트 맵 → 캔버스. 1셀 = 1px 로 굽고, 화면에서는 정수 배율로 확대한다. */
function bakePixel(def) {
  var m = def.map, h = m.length, w = m[0].length;
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  var g = c.getContext('2d');
  for (var y = 0; y < h; y++) {
    var row = m[y];
    for (var x = 0; x < w; x++) {
      var ch = row.charAt(x);
      if (ch === '.' || ch === ' ') continue;
      var col = def.pal[ch]; if (!col) continue;
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

/* 알파 바운딩 박스 + 발밑 원점 자동 측정 */
function measureAlpha(canvasOrImg, w, h) {
  var S = Math.min(96, Math.max(w, h));
  var c = document.createElement('canvas'); c.width = S; c.height = S;
  var g = c.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingEnabled = false;
  g.drawImage(canvasOrImg, 0, 0, S, S);
  var d;
  try { d = g.getImageData(0, 0, S, S).data; } catch (e) { return { x:0, y:0, w:w, h:h }; }
  var x0 = S, y0 = S, x1 = -1, y1 = -1;
  for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
    if (d[(y * S + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < x0) return { x:0, y:0, w:w, h:h };
  return { x: x0 / S * w, y: y0 / S * h, w: (x1 - x0 + 1) / S * w, h: (y1 - y0 + 1) / S * h };
}

/* 키로 스프라이트를 얻는다. 없으면 PIXELART 폴백을 굽는다. */
function getSprite(key) {
  var s = Sprites.cache[key];
  if (s) return s;
  /* 벡터 도형(네온 몹) — box 를 설계값으로 직접 주므로 알파 측정이 필요 없다 */
  if (typeof NEONMOB !== 'undefined' && NEONMOB[key]) {
    s = bakeNeon(NEONMOB[key]);
    Sprites.cache[key] = s;
    return s;
  }
  var def = PIXELART[key];
  if (!def) return null;
  var cv = bakePixel(def);
  var box = measureAlpha(cv, cv.width, cv.height);
  s = { cv: cv, w: cv.width, h: cv.height, box: box, src: 'proc', smooth: false };
  Sprites.cache[key] = s;
  return s;
}

/* 실제 시트 투입 지점 — build 가 base64 를 넣어주면 이쪽이 우선한다.
   시트(고해상 원본)는 다운스케일이 전제라 smooth 렌더가 기본이다. */
function loadSheet(key, dataUri, cb) {
  Sprites.pending++;
  var im = new Image();
  im.onload = function () {
    var box = measureAlpha(im, im.width, im.height);
    Sprites.cache[key] = { cv: im, w: im.width, h: im.height, box: box, src: 'sheet', smooth: true };
    Sprites.pending--; if (cb) cb(true);
  };
  im.onerror = function () { Sprites.pending--; if (cb) cb(false); };   /* 실패해도 폴백으로 계속 */
  im.src = dataUri;
}

/* 실루엣 캐시 — 림 라이트 / 히트 플래시용.
   캔버스 합성(source-atop)은 화면 전체에 걸리므로 반드시 오프스크린에서 굽는다. */
function getSilhouette(key, col) {
  var id = key + '|' + col, s = Sprites.cache[id];
  if (s) return s;
  var base = getSprite(key); if (!base) return null;
  var c = document.createElement('canvas'); c.width = base.w; c.height = base.h;
  var g = c.getContext('2d'); g.imageSmoothingEnabled = !!base.smooth;
  g.drawImage(base.cv, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = col; g.fillRect(0, 0, base.w, base.h);
  s = { cv: c, w: base.w, h: base.h, box: base.box, src: 'sil', smooth: base.smooth };
  Sprites.cache[id] = s;
  return s;
}

/* 발밑 기준으로 그린다.
   x, footY = 논리좌표.  k = 배율.  opt: {flip, alpha, tint, squash, tilt} */
function drawSprite(key, x, footY, k, opt) {
  opt = opt || {};
  var s = opt.sil ? getSilhouette(key, opt.sil) : getSprite(key);
  if (!s) return;
  var c = Stage.ctx;
  var b = s.box;
  var w = s.w * k, h = s.h * k;
  var ox = (b.x + b.w / 2) * k;          /* 내용 중심 x */
  var oy = (b.y + b.h) * k;              /* 내용 하단 y = 발밑 */
  c.save();
  c.translate(x, footY);
  /* spin — 내용 중심을 축으로 돌린다. tilt(발밑 축)와 달리 떠 있는 도형용이다.
     발밑 앵커는 그대로 유지되므로 깊이 정렬(gy)이 흔들리지 않는다 */
  if (opt.spin) { c.translate(0, -(b.h / 2) * k); c.rotate(opt.spin); c.translate(0, (b.h / 2) * k); }
  if (opt.tilt) c.rotate(opt.tilt);
  if (opt.squash) c.scale(1 / opt.squash, opt.squash);
  if (opt.flip) c.scale(-1, 1);
  if (opt.alpha !== undefined) c.globalAlpha = opt.alpha;
  c.imageSmoothingEnabled = !!s.smooth;   /* 시트·벡터는 부드럽게, 도트는 계단 그대로 */
  if (s.smooth) c.imageSmoothingQuality = 'high';
  c.drawImage(s.cv, -ox, -oy, w, h);
  if (opt.tint) {                        /* 히트 플래시 — 실루엣을 덧그린다 */
    var t = getSilhouette(key, opt.tint);
    if (t) {
      c.globalAlpha = (opt.tintA === undefined ? 1 : opt.tintA) * (opt.alpha === undefined ? 1 : opt.alpha);
      c.drawImage(t.cv, -ox, -oy, w, h);
    }
  }
  c.restore();
}

/* UI 조각 — (cx, cy) 중심에 높이 h 로 그린다. 시트 전용 */
function uiIcon(key, cx, cy, h, alpha) {
  var s = getSprite(key); if (!s || s.src !== 'sheet') return false;
  var k = h / s.box.h;
  var c = Stage.ctx;
  c.save();
  if (alpha !== undefined) c.globalAlpha = alpha;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(s.cv, cx - (s.box.x + s.box.w / 2) * k, cy - (s.box.y + s.box.h / 2) * k, s.w * k, s.h * k);
  c.restore();
  return true;
}
/* UI 조각 — 사각형에 딱 맞게 */
function uiImage(key, x, y, w, h, alpha) {
  var s = getSprite(key); if (!s || s.src !== 'sheet') return false;
  var c = Stage.ctx;
  c.save();
  if (alpha !== undefined) c.globalAlpha = alpha;
  c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
  c.drawImage(s.cv, x, y, w, h);
  c.restore();
  return true;
}

/* 스프라이트 표시 높이(논리 px) → 배율.
   도트(프로시저럴)는 정수 배율로 반올림해 계단을 보존하고,
   고해상 시트는 소수 배율로 정확히 맞춘다. */
function fitScale(key, targetH) {
  var s = getSprite(key); if (!s) return 1;
  var k = targetH / (s.box.h || s.h);
  if (s.smooth) return k;              /* 시트·벡터는 소수 배율로 정확히 맞춘다 */
  return Math.max(1, Math.round(k));
}
