#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — src/ 모듈을 하나의 HTML 로 굽는다.
  · index.html 의 <script src> 순서를 그대로 따른다 (순서가 곧 의존성)
  · art/sheets/*.png|webp 를 base64 로 인라인 (외부 요청 0)
  · 결과: dist/playable.html
사용:  python3 tools/build.py [--minify]
"""
import base64, os, re, sys, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, 'src')
DIST = os.path.join(ROOT, 'dist')
VIDEO = '--video' in os.sys.argv
DOT   = '--dot' in os.sys.argv
UIHD  = '--uihd' in os.sys.argv
# --release : 클라이언트 출고본을 dist/index.html 로 직접 굽는다.
#   예전엔 --minify 로 구운 뒤 손으로 index.html 로 rename 해야 했다. 그 단계가
#   문서 어디에도 없어서, README 대로 빌드하면 index.html 만 조용히 구버전으로
#   남는 구조였다(감사에서 적발). 파이프라인이 직접 만들도록 바꿨다.
# --net <meta|google|mraid|universal> : 광고망별 CTA 규격으로 굽는다.
#   광고망마다 요구 API 가 배타적이라(특히 Google 은 외부 스크립트 필수, Meta 는 금지)
#   한 파일로 전 광고망에 낼 수 없다. cta.js 의 CTA_MODE 를 여기서 재할당한다.
NET = 'universal'
for _i, _a in enumerate(os.sys.argv):
    if _a == '--net' and _i + 1 < len(os.sys.argv):
        NET = os.sys.argv[_i + 1]
if NET not in ('meta', 'google', 'mraid', 'universal'):
    print('--net 은 meta|google|mraid|universal 중 하나여야 합니다: %s' % NET); sys.exit(1)

RELEASE = '--release' in os.sys.argv
if RELEASE:
    UIHD = True                      # 출고본은 항상 UIHD 스킨
OUT  = os.path.join(DIST,
    ('index.html' if NET == 'universal' else 'index_%s.html' % NET) if RELEASE else (
    'playable_uihd_video.html' if (UIHD and VIDEO) else (
    'playable_dot_video.html' if (DOT and VIDEO) else (
    'playable_uihd.html' if UIHD else (
    'playable_dot.html' if DOT else ('playable_video.html' if VIDEO else 'playable.html'))))))

def read(p):
    with io.open(p, encoding='utf-8') as f: return f.read()

def main():
    html = read(os.path.join(SRC, 'index.html'))
    files = re.findall(r'<script src="([^"]+)"></script>', html)
    if not files:
        print('index.html 에서 <script src> 를 찾지 못했습니다.'); sys.exit(1)

    # 1) 시트 인라인
    sheets, total = [], 0
    sd = os.path.join(SRC, 'art', 'sheets')
    if os.path.isdir(sd):
        for fn in sorted(os.listdir(sd)):
            if fn.startswith('.'): continue          # .DS_Store, ._AppleDouble 제외
            ext = fn.rsplit('.', 1)[-1].lower()
            if ext not in ('png', 'webp', 'jpg', 'jpeg'): continue
            key = fn.rsplit('.', 1)[0]
            with open(os.path.join(sd, fn), 'rb') as f: raw = f.read()
            total += len(raw)
            mime = 'image/webp' if ext == 'webp' else ('image/png' if ext == 'png' else 'image/jpeg')
            sheets.append('  "%s": "data:%s;base64,%s"' % (key, mime, base64.b64encode(raw).decode()))
    sheet_js = 'var SHEET_DATA = {\n' + ',\n'.join(sheets) + '\n};\n' if sheets else 'var SHEET_DATA = {};\n'

    # 2) 모듈 concat
    parts = [sheet_js]
    for f in files:
        p = os.path.join(SRC, f)
        parts.append('\n/* ==== %s ==== */\n' % f + read(p))
    if VIDEO:   # 영상 추출 모듈은 광고 빌드에 넣지 않는다
        parts.append('\n/* ==== tools/recorder.js ==== */\n' + read(os.path.join(SRC, 'tools', 'recorder.js')))
    if DOT:   # 도트 UI 스킨 — theme 의 기본값을 재할당 (소스는 한 벌 유지)
        parts.append("\n/* ==== skin override ==== */\nUI_STYLE = 'dot';\n")
    if UIHD:  # UI 고도화 스킨 (다크 퍼플 프레임 + 스터드)
        parts.append("\n/* ==== skin override ==== */\nUI_STYLE = 'uihd';\n")
    body = '\n'.join(parts)

    # 광고망별 CTA — 해당 망 블록만 남기고 나머지는 **삭제**한다.
    # 런타임 분기로 두면 안 쓰는 코드가 파일에 남아, Meta 의 정적 검사
    # ("Uploaded File Contains Redirect to External Link") 에 걸릴 여지를 준다.
    # minify 가 주석을 지우기 전에 먼저 잘라야 한다.
    for _net in ('meta', 'google', 'mraid', 'universal'):
        _blk = re.compile(r'/\*<<NET:%s\*/[\s\S]*?/\*NET:%s>>\*/' % (_net, _net))
        if not _blk.search(body):
            print('  ! CTA 블록을 못 찾음: %s — cta.js 의 마커를 확인하세요' % _net); sys.exit(1)
        body = _blk.sub((lambda m: m.group(0)) if _net == NET else '', body)

    if '--minify' in sys.argv or RELEASE:   # 출고본은 항상 압축한다
        body = re.sub(r'/\*(?!<<BODY|BODY>>)[\s\S]*?\*/', '', body)
        body = re.sub(r'(^|\s)//[^\n]*', r'\1', body)
        body = re.sub(r'\n\s*\n+', '\n', body)

    # 출고본 맨 위에 "여기만 고치면 된다" 블록을 넣는다.
    # 고객사는 압축된 1MB 파일만 받으므로, 안에서 storeUrl 한 줄을 찾아 고치는 건
    # 현실적으로 불가능하다. 파일 첫 화면에 크게 박아두면 텍스트 편집기로 바로 바꾼다.
    m = re.search(r"storeUrl\s*:\s*['\"]([^'\"]+)['\"]", body)
    default_url = m.group(1) if m else ''
    cfg = ''
    if RELEASE:
        cfg = """
<!-- ══════════════════════════════════════════════════════════════════
     설치 버튼(CTA)을 눌렀을 때 열릴 주소입니다.
     배포 전에 아래 따옴표 안의 주소만 바꿔주세요. 다른 곳은 건드리지 않으셔도 됩니다.

       예) https://play.google.com/store/apps/details?id=com.example.game
       예) https://apps.apple.com/app/id0000000000

     ※ Meta(Facebook/Instagram) 전용으로만 집행하신다면 바꾸지 않으셔도 됩니다.
        Meta 는 광고 관리자에서 선택한 앱으로 자동 연결됩니다.
     ══════════════════════════════════════════════════════════════════ -->
<script>window.STORE_URL = "%s";</script>
""" % default_url

    # Google Ads / AdMob 만 exitapi.js 를 "외부에서" 불러오도록 요구한다.
    #   "include the script https://tpc.googlesyndication.com/pagead/gadgets/html5/api/exitapi.js
    #    and use ExitApi.exit() in your clickable buttons"
    # 이건 Meta·AppLovin 이 금지하는 바로 그 외부 요청이므로 google 빌드에만 넣는다.
    if NET == 'google':
        cfg += ('<script src="https://tpc.googlesyndication.com/pagead/gadgets/'
                'html5/api/exitapi.js"></script>\n')

    out = """<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover">
<title>%s</title>%s
<style>
html,body{margin:0;padding:0;width:100%%;height:100%%;overflow:hidden;background:#04020e;
touch-action:none;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;}
#wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;}
canvas{display:block;touch-action:none;image-rendering:pixelated;image-rendering:crisp-edges;}
</style>
</head>
<body>
<div id="wrap"><canvas id="cv"></canvas></div>
<script>
(function(){
"use strict";
/*<<BODY*/
%s
/*BODY>>*/
})();
</script>
</body>
</html>
""" % ('NEON DEFENSE UIHD' if UIHD else ('NEON DEFENSE DOT' if DOT else 'NEON DEFENSE'), cfg, body)

    if not os.path.isdir(DIST): os.makedirs(DIST)
    with io.open(OUT, 'w', encoding='utf-8') as f: f.write(out)
    kb = os.path.getsize(OUT) / 1024.0
    print('빌드 완료  %s' % OUT)
    print('  %s · 모듈 %d개 · 시트 %d장(원본 %.0fKB) · 결과 %.1f KB (Meta 2MB 대비 %.1f%%)'
          % ('영상용' if VIDEO else '광고 출고용', len(files), len(sheets), total / 1024.0, kb, kb / 2048.0 * 100))
    for pat, name in [(r'https?://', '외부 URL'), (r'\bfetch\s*\(', 'fetch'),
                      (r'XMLHttpRequest', 'XHR'), (r'localStorage', 'localStorage'),
                      (r'\beval\s*\(', 'eval'), (r'document\.write', 'document.write')]:
        hits = [m for m in re.findall(pat, out) ]
        if name == '외부 URL':
            hits = [h for h in re.findall(r'https?://[^\s"\')]+', out)
                    if 'w3.org' not in h and 'play.google.com/store' not in h and 'apps.apple.com' not in h]
        if hits: print('  ! 규격 경고 — %s %d건' % (name, len(hits)))
    print('  규격 검사 완료')

main()
