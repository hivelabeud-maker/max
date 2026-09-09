#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prep_anim.py — 프레임 시퀀스(PNG 연번) → 가로 스트립 아틀라스 + 메타데이터

  · 모든 프레임을 "캔버스 중심" 기준으로 공통 캔버스에 정렬한다.
    (리타의 idle/run/attack 은 캔버스 크기가 제각각이지만 원점은 캔버스 중심이다 —
     검증 완료. 이 정렬을 쓰지 않으면 애니 전환 때 캐릭터가 튄다.)
  · 한 캐릭터의 모든 애니를 하나의 셀 크기로 통일 → 애니 간 정렬 100% 보장
  · 결과: src/art/sheets/<key>.webp (가로 스트립) + src/data/atlas.js

사용:
    python3 tools/prep_anim.py            # Desktop 원본 → sheets
    python3 tools/prep_anim.py --import   # 선별 프레임을 src/art/raw/seq/ 로 복사까지
"""
import os, sys, glob, json, shutil, io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'src', 'art', 'sheets')
RAW  = os.path.join(ROOT, 'src', 'art', 'raw')
SEQ  = os.path.join(RAW, 'seq')
# 원본 아트가 있는 폴더. 기본은 프로젝트 안(src/art/raw/_원본).
# 다른 데 있으면 실행할 때 지정한다:  ART_SRC="~/Desktop/에셋폴더" python3 tools/prep_anim.py
#   ※ 개인 경로·고객사명을 여기 하드코딩하지 말 것 — 이 파일은 납품 패키지에 포함된다.
DESK = os.path.expanduser(os.environ.get('ART_SRC', os.path.join(RAW, '_원본')))
DO_IMPORT = '--import' in sys.argv

# ── 발주 정의 ────────────────────────────────────────────────────────────────
# pick: (start, end, count) — 원본 프레임 구간에서 count 장을 균등 추출
CHARS = [
  {
    'id': 'rita', 'cellH': 221,   # 원본 콘텐츠 높이. 이보다 키우면 prep 이 업스케일한다
    'anims': [
      # 사격 사이클: attack 12~27 이 총구 화염 + 탄피 배출 구간 (루프 가능)
      { 'key': 'rita_fire', 'glob': '리타 애니 시퀀스/*attack/*.png', 'pick': (0, 12, 8)  },
      { 'key': 'rita_run',  'glob': '리타 애니 시퀀스/run/*.png',     'pick': (0, 20, 8) },
      { 'key': 'rita_idle', 'glob': '리타 애니 시퀀스/idle/*.png',    'pick': (0, 160, 8) },
    ]
  },
]

# ── 몬스터 ───────────────────────────────────────────────────────────────────
# 2차(NEON DEFENSE)는 몹을 그림이 아니라 코드로 그린다 (src/data/neonmob.js).
# 1차의 슬라임 5종 시트는 원본과 함께 제거했으므로 여기도 비운다.
# 나중에 실제 몹 아트가 들어오면 (키, 원본폴더, 셀높이) 를 추가하기만 하면
# sprite.js 가 시트를 우선으로 집는다 — neonmob 은 자동으로 폴백이 된다.
#   예: ('n_gr', 'mon_neon_diamond', 96),
MONS = []
MON_ANIMS = [('walk', 'walk', 8)]   # atk 스트립은 미사용이라 정리함 (2026-09-03)

# ── UI 아이콘 (선택) — src/art/raw/ui/<이름>.png 이 있으면 가공해 넣는다.
#    없으면 게임은 gen_icons.py 도트 아이콘으로 폴백한다. 투명 PNG 권장.
#    (이름, 목표 높이px) — 표시 크기의 2~3배로 구워 축소 렌더 → 항상 선명
UI_ICONS = [
  ('ic_kill',   128),   # 처치  (상단 카드 + 결과 행)
  ('ic_time',   128),   # 생존  (상단 카드 + 결과 행)
  ('ic_reward', 128),   # 보상  (결과 행)
  ('ic_hp',     128),   # HP 하트 (하단 게이지 왼쪽)
  ('title_clear', 500), # STAGE CLEAR 타이틀 (결과 화면 상단, 별 포함 버전)
  ('btn_cta',   ('w', 920)),  # 메인 버튼 — 3분할(좌캡/중앙늘림/우캡)로 그린다
]


def strip_white(im, tol=18):
    """흰 배경이 통째로 구워진 PNG 에서 배경만 플러드필로 제거한다.
       모서리가 불투명 흰색일 때만 발동 — 진짜 투명 PNG 는 건드리지 않는다."""
    px = im.load(); W, H = im.size
    c = px[2, 2]
    if c[3] < 250 or min(c[0], c[1], c[2]) < 235:
        return im
    B = c[:3]
    seen = bytearray(W * H); st = []
    def push(x, y):
        i = y * W + x
        if seen[i]: return
        p2 = px[x, y]
        if p2[3] > 8 and max(abs(p2[0]-B[0]), abs(p2[1]-B[1]), abs(p2[2]-B[2])) <= tol:
            seen[i] = 1; st.append((x, y))
    for x in range(W): push(x, 0); push(x, H-1)
    for y in range(H): push(0, y); push(W-1, y)
    while st:
        x, y = st.pop(); px[x, y] = (0, 0, 0, 0)
        if x > 0: push(x-1, y)
        if x < W-1: push(x+1, y)
        if y > 0: push(x, y-1)
        if y < H-1: push(x, y+1)
    return im

# ── 배경 ─────────────────────────────────────────────────────────────────────
# 2차는 배경도 코드로 그린다 (screens.js drawBG — 별 3층 + 성운 + 네온 격자).
# 1차의 던전 배경 원본은 제거했으므로 비워 둔다.
# ★ 나중에 배경 그림을 쓰려면 src/art/raw/bg.png 를 넣고 아래에 항목을 되살린다.
#   인게임과 결과 화면이 같은 이미지를 쓰므로 한 줄이면 두 화면이 함께 바뀐다.
#   ⚠️ 그림 배경을 넣는 순간 data/enemies.js 의 gates 가 다시 의미를 갖는다.
#      지금은 네 변 전면 개방(우주엔 벽이 없다)이라, 통로가 그려진 배경을
#      넣으면 벽에서 몹이 솟는다. 그 그림에 맞춰 다시 측정할 것.
BGS = []


def pick_frames(files, spec):
    a, b, n = spec
    b = min(b, len(files))
    seg = files[a:b]
    if not seg:
        seg = files
    if n >= len(seg):
        return seg
    return [seg[round(i * (len(seg) - 1) / (n - 1))] for i in range(n)]


def center_on(im, W, H):
    """캔버스 중심 정렬 — 원본 원점을 보존한다."""
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(im, ((W - im.width) // 2, (H - im.height) // 2))
    return c


def build_group(name, anims, cellH, out_meta):
    """anims = [(key, [파일...])] — 한 그룹은 셀 크기를 공유한다."""
    loaded = []
    for key, files in anims:
        ims = [Image.open(f).convert('RGBA') for f in files]
        if not ims:
            print('  건너뜀 (프레임 없음): %s' % key); continue
        loaded.append((key, ims))
    if not loaded:
        return

    CW = max(im.width for _, ims in loaded for im in ims)
    CH = max(im.height for _, ims in loaded for im in ims)

    # 공통 캔버스에 중심 정렬 → 그룹 전체의 합집합 bbox 를 구한다
    box = None
    cen = []
    for key, ims in loaded:
        cims = [center_on(im, CW, CH) for im in ims]
        cen.append((key, cims))
        for ci in cims:
            b = ci.getbbox()
            if not b: continue
            box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                         max(box[2], b[2]), max(box[3], b[3]))
    if box is None:
        return

    bw, bh = box[2] - box[0], box[3] - box[1]
    k = cellH / float(bh)
    fw, fh = max(1, round(bw * k)), cellH
    # 앵커 = 셀 안에서의 원본 캔버스 중심 위치 (0~1 비율)
    ax = (CW / 2.0 - box[0]) / bw
    ay = (CH / 2.0 - box[1]) / bh

    for key, cims in cen:
        n = len(cims)
        strip = Image.new('RGBA', (fw * n, fh), (0, 0, 0, 0))
        for i, ci in enumerate(cims):
            fr = ci.crop(box).resize((fw, fh), Image.LANCZOS)
            strip.alpha_composite(fr, (i * fw, 0))
        fp = os.path.join(OUT, key + '.webp')
        strip.save(fp, 'WEBP', quality=84, method=6)   # 출고 최적화 (2026-09-03)
        out_meta[key] = { 'n': n, 'fw': fw, 'fh': fh,
                          'ax': round(ax, 4), 'ay': round(ay, 4) }
        print('  %-12s %2d프레임  셀 %dx%-3d  %6.1f KB'
              % (key, n, fw, fh, os.path.getsize(fp) / 1024.0))


def import_copy(files, sub):
    if not DO_IMPORT: return files
    d = os.path.join(SEQ, sub)
    if not os.path.isdir(d): os.makedirs(d)
    out = []
    for f in files:
        dst = os.path.join(d, os.path.basename(f))
        if not os.path.exists(dst): shutil.copy2(f, dst)
        out.append(dst)
    return out


def src_files(pattern, sub, pick):
    """Desktop 원본 우선, 없으면 이미 임포트된 raw/seq/ 사용."""
    fs = sorted(glob.glob(os.path.join(DESK, pattern)))
    if fs:
        return import_copy(pick_frames(fs, pick), sub)
    fs = sorted(glob.glob(os.path.join(SEQ, sub, '*.png')))
    return fs


def main():
    if not os.path.isdir(OUT): os.makedirs(OUT)
    meta = {}

    print('■ 캐릭터')
    for ch in CHARS:
        anims = []
        for a in ch['anims']:
            anims.append((a['key'], src_files(a['glob'], a['key'], a['pick'])))
        build_group(ch['id'], anims, ch['cellH'], meta)

    print('■ 몬스터')
    for key, folder, cellH in MONS:
        anims = []
        for suf, sub, n in MON_ANIMS:
            g = '몬스터 애니 시퀀스/%s/%s/*.png' % (folder, sub)
            anims.append((key + '_' + suf, src_files(g, key + '_' + suf, (0, 99, n))))
        build_group(key, anims, cellH, meta)

    print('■ UI 아이콘')
    for key, th in UI_ICONS:
        p = os.path.join(RAW, 'ui', key + '.png')
        if not os.path.exists(p):
            print('  건너뜀 (없음): %s — 도트 폴백 사용' % key); continue
        im = strip_white(Image.open(p).convert('RGBA'))
        bb = im.getbbox()
        if bb: im = im.crop(bb)
        if isinstance(th, tuple):          # ('w', px) — 가로 기준
            tw2 = th[1]
            if im.width > tw2:
                im = im.resize((tw2, max(1, round(im.height * tw2 / im.width))), Image.LANCZOS)
        elif im.height > th:
            im = im.resize((max(1, round(im.width * th / im.height)), th), Image.LANCZOS)
        fp = os.path.join(OUT, key + '.webp')
        im.save(fp, 'WEBP', quality=90, method=6)
        print('  %-10s %dx%-4d  %6.1f KB' % (key, im.width, im.height,
                                             os.path.getsize(fp) / 1024.0))

    print('■ 배경')
    for key, rel, w, q in BGS:
        # 경로 우선순위: src/art/raw/<key>.png  →  Desktop 원본
        # (사용자가 새 배경을 raw 에 넣으면 그게 이긴다)
        p = os.path.join(RAW, key + '.png')
        if not os.path.exists(p):
            p = os.path.join(DESK, rel)
        if not os.path.exists(p):
            print('  건너뜀 (없음): %s' % key); continue
        im = Image.open(p).convert('RGB')
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        fp = os.path.join(OUT, key + '.webp')
        im.save(fp, 'WEBP', quality=q, method=6)
        print('  %-12s %dx%-4d  %6.1f KB' % (key, im.width, im.height,
                                             os.path.getsize(fp) / 1024.0))

    js = ('/* atlas.js — prep_anim.py 자동 생성. 직접 수정하지 말 것. */\n'
          'var ATLAS = ' + json.dumps(meta, indent=2, sort_keys=True) + ';\n')
    with io.open(os.path.join(ROOT, 'src', 'data', 'atlas.js'), 'w', encoding='utf-8') as f:
        f.write(js)
    total = sum(os.path.getsize(os.path.join(OUT, f))
                for f in os.listdir(OUT) if f.endswith('.webp'))
    print('\natlas.js 갱신 · 시트 합계 %.0f KB' % (total / 1024.0))


main()
