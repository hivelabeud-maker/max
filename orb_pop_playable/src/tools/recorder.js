/* ============================================================================
   recorder.js — 영상 추출 전용 (광고 출고 빌드에는 포함되지 않는다)
     playable_video.html?record=1&scale=2   →  1080×1920 MP4 자동 다운로드

   핵심: canvas.captureStream(0) 수동 모드 + 렌더 루프에서 requestFrame().
   자동 모드(captureStream(fps))는 캔버스가 합성되지 않는 환경에서 빈 파일이
   나오는 사례가 있어, 매 프레임을 직접 밀어 넣는 방식으로 고정했다.
   ========================================================================== */
(function () {
  if (!Q.record) return;
  RENDER.mode = 'video'; RENDER.fixedStep = true;

  var started = false, rec = null, chunks = [], bytes = 0, EXT = 'webm';
  var track = null, pushed = 0, t0 = 0, autoMode = false;

  function hud(msg, col) {
    var d = document.getElementById('recmsg');
    if (!d) {
      d = document.createElement('div'); d.id = 'recmsg';
      d.style.cssText = 'position:fixed;left:10px;top:10px;z-index:9;padding:8px 14px;' +
        'border-radius:8px;font:700 13px -apple-system,system-ui,sans-serif;color:#fff;' +
        'white-space:pre;line-height:1.5;pointer-events:none';
      document.body.appendChild(d);
    }
    d.style.background = col || 'rgba(200,40,60,.92)';
    d.textContent = msg;
  }

  function pickMime() {
    var C = ['video/mp4;codecs=avc1.640034', 'video/mp4;codecs=avc1.42E01E', 'video/mp4',
             'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
    for (var i = 0; i < C.length; i++) {
      try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(C[i])) return C[i]; } catch (e) {}
    }
    return '';
  }

  function save() {
    if (!bytes) {
      hud('녹화 실패 — 0 바이트\n이 창은 캔버스 녹화를 지원하지 않습니다.\n일반 Chrome 창에서 다시 열어주세요.', 'rgba(180,40,50,.95)');
      return;
    }
    var blob = new Blob(chunks, { type: EXT === 'mp4' ? 'video/mp4' : 'video/webm' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'pixel_survivor_' + Stage.cv.width + 'x' + Stage.cv.height + '.' + EXT;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 3000);
    hud('완료 — ' + Stage.cv.width + '×' + Stage.cv.height + ' ' + EXT.toUpperCase() +
        '\n' + (blob.size / 1048576).toFixed(1) + ' MB  ·  프레임 ' + pushed +
        '\n다운로드가 안 보이면 브라우저 다운로드 허용을 확인하세요.', 'rgba(40,150,80,.95)');
  }

  function begin() {
    if (started || !Stage.cv || !Stage.cv.captureStream) return;
    started = true;
    Input.enabled = false;
    seed(20260901);

    var mime = pickMime();
    if (!mime) { hud('이 브라우저는 녹화를 지원하지 않습니다 (Chrome/Safari 권장)'); return; }
    EXT = mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm';

    var stream;
    try {
      stream = Stage.cv.captureStream(0);            /* 수동 프레임 모드 */
      track = stream.getVideoTracks()[0];
      if (!track || typeof track.requestFrame !== 'function') throw new Error('manual unsupported');
    } catch (e) {
      autoMode = true;
      stream = Stage.cv.captureStream(60);           /* 폴백: 자동 모드 */
      track = stream.getVideoTracks()[0];
    }

    try {
      rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 32000000 });
    } catch (e2) { hud('녹화 시작 실패: ' + e2.message); return; }

    rec.ondataavailable = function (e) {
      if (e.data && e.data.size) { chunks.push(e.data); bytes += e.data.size; }
    };
    rec.onerror = function (e) { hud('녹화 오류: ' + (e.error ? e.error.name : '알 수 없음')); };
    rec.onstop = save;

    rec.start(500);                                   /* 0.5초마다 조각 수집 */
    t0 = Date.now();
    hud('● REC  ' + Stage.cv.width + '×' + Stage.cv.height + ' ' + EXT.toUpperCase());

    /* 렌더 루프가 매 프레임 호출한다 (engine.js) */
    window.__recPush = function () {
      if (!rec || rec.state !== 'recording') return;
      if (!autoMode && track && track.requestFrame) { track.requestFrame(); }
      pushed++;
      if ((pushed & 15) === 0) {
        var sec = ((Date.now() - t0) / 1000).toFixed(1);
        hud('● REC  ' + Stage.cv.width + '×' + Stage.cv.height + ' ' + EXT.toUpperCase() +
            '\n' + sec + 's  ·  프레임 ' + pushed + '  ·  ' + (bytes / 1048576).toFixed(1) + ' MB');
      }
    };

    setTimeout(function () {
      window.__recPush = null;
      try { rec.requestData(); } catch (e) {}
      setTimeout(function () { try { rec.stop(); } catch (e) {} }, 120);
    }, (TIMELINE.total + 3.2) * 1000);
  }

  var iv = setInterval(function () {
    if (Stage.cv && Game.player) { clearInterval(iv); begin(); }
  }, 60);
})();
