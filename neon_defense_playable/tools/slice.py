#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
slice.py — 격자 시트 1장 → 개별 스프라이트 PNG 여러 장

  · 캐릭터/몬스터를 한 장의 격자 이미지로 받아 자동으로 잘라 쓴다.
  · 흰 배경을 자동 제거하고, 업스케일된 도트를 "원래 도트 해상도"로 되돌린다.
    (예: 960×960 3×3 시트 → 각 12×12 도트 원본으로 복원)
    → 파일이 작아지고, 게임에서 몇 배로 키워도 완벽하게 선명하다.

  설정: src/art/raw/art.json
  사용: python3 tools/slice.py
"""
import json, os, sys, io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW  = os.path.join(ROOT, 'src', 'art', 'raw')
OUT  = os.path.join(ROOT, 'src', 'art', 'sheets')
CFG  = os.path.join(RAW, 'art.json')


def kill_white(im, tol=26):
    """가장자리에서 번져 들어가며 배경(흰색 계열)을 투명으로."""
    im = im.convert('RGBA')
    w, h = im.size
    px = im.load()
    def isbg(p): return p[3] < 8 or (p[0] > 255-tol and p[1] > 255-tol and p[2] > 255-tol)
    seen = bytearray(w*h)
    st = []
    for x in range(w):
        for y in (0, h-1):
            if isbg(px[x, y]) and not seen[y*w+x]: seen[y*w+x] = 1; st.append((x, y))
    for y in range(h):
        for x in (0, w-1):
            if isbg(px[x, y]) and not seen[y*w+x]: seen[y*w+x] = 1; st.append((x, y))
    while st:
        x, y = st.pop()
        px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny*w+nx] and isbg(px[nx, ny]):
                seen[ny*w+nx] = 1; st.append((nx, ny))
    return im


def native_block(im, maxb=80):
    """업스케일된 도트의 원래 1픽셀 크기를 찾는다."""
    w, h = im.size
    px = im.load()
    best = 1
    for b in range(2, min(maxb, w, h) + 1):
        if w % b or h % b: continue
        ok = True
        for by in range(0, h, b):
            for bx in range(0, w, b):
                c = px[bx, by]
                if px[bx + b - 1, by] != c or px[bx, by + b - 1] != c or px[bx + b - 1, by + b - 1] != c:
                    ok = False; break
            if not ok: break
        if ok: best = b
    return best


def downscale(im, b):
    if b <= 1: return im
    w, h = im.size
    out = Image.new('RGBA', (w // b, h // b))
    src, dst = im.load(), out.load()
    for y in range(h // b):
        for x in range(w // b):
            dst[x, y] = src[x * b + b // 2, y * b + b // 2]
    return out


def trim(im):
    bb = im.getbbox()
    return im.crop(bb) if bb else im


def main():
    if not os.path.exists(CFG):
        print('설정 파일이 없습니다: %s' % CFG); sys.exit(1)
    with io.open(CFG, encoding='utf-8') as f: jobs = json.load(f)
    if not os.path.isdir(OUT): os.makedirs(OUT)

    total = 0
    for job in jobs:
        p = os.path.join(RAW, job['src'])
        if not os.path.exists(p):
            print('  건너뜀 (파일 없음): %s' % job['src']); continue
        im = Image.open(p)
        print('\n%s  %dx%d' % (job['src'], im.width, im.height))
        if job.get('killwhite', True): im = kill_white(im)
        cols, rows = job['cols'], job['rows']
        cw, chh = im.width // cols, im.height // rows
        names = job['names']
        for r in range(rows):
            for c in range(cols):
                nm = names[r][c] if r < len(names) and c < len(names[r]) else None
                if not nm or nm == '-': continue
                cell = im.crop((c*cw, r*chh, (c+1)*cw, (r+1)*chh))
                cell = trim(cell)
                if cell.width == 0: continue
                b = native_block(cell)
                cell = downscale(cell, b)
                cell = trim(cell)
                fp = os.path.join(OUT, nm + '.png')
                cell.save(fp, optimize=True)
                total += 1
                print('  %-14s %3dx%-3d  (원본 도트 1px = %dpx)  %5.1f KB'
                      % (nm, cell.width, cell.height, b, os.path.getsize(fp)/1024.0))
    print('\n%d장 생성 → src/art/sheets/' % total)
    print('다음: python3 tools/build.py')

main()
