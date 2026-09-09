#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_icons.py — 벡터 도형 → 도트 맵(PIXELART) 생성기

손으로 맵 문자열을 찍으면 행 길이가 틀어지거나 팔레트에 없는 문자가 섞인다
(실제로 chevR 에서 겪었다). 도형으로 그리고 외곽선을 자동으로 두르면 그런 실수가 없다.

  · 안티앨리어싱 없이 그린다 (PIL 의 polygon/ellipse 는 기본이 non-AA)
  · 외곽선은 알파 팽창(dilate)으로 1px 자동 생성 — 침식(erode)은 절대 쓰지 않는다
  · 결과는 src/data/icons.js 에 PIXELART 확장으로 기록

사용: python3 tools/gen_icons.py
"""
import os, io, math
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'src', 'data', 'icons.js')

# 팔레트 — 문자 1개 = 색 1개. '.' 은 투명, 'o' 는 외곽선(자동)
PAL = {
    'o': '#141018',   # 외곽선
    # 검
    'b': '#e6edf7', 'B': '#b3c2d6', 'g': '#ffc21f', 'y': '#ffe79a', 'h': '#39414f',
    # 젬
    'c': '#6ff0ff', 'm': '#22c3ff', 'd': '#1a7bff', 'w': '#ffffff',
    # 타이머
    'f': '#f4fbff', 'r': '#a9e4f7', 'k': '#e01b46', 'G': '#ffd21f', 'S': '#ff9f12',
    # 해골 / 하트 / 모래시계 유리
    'n': '#f4f1e6', 'N': '#c9c2ae',
    'e': '#ff4d63', 'E': '#c22a44', 'p': '#ffd0da',
    'q': '#dff3ff',
    # 별 파셋
    'Y': '#ffe95c', 'Z': '#ffb724', 'v': '#fff7c8',
}


def new(n):
    im = Image.new('P', (n, n), 0)
    im.putpalette([0, 0, 0] * 256)
    return im, ImageDraw.Draw(im)


IDX = {}          # 문자 → 팔레트 인덱스
for i, ch in enumerate(PAL, start=1):
    IDX[ch] = i


def poly(d, pts, ch):
    d.polygon([(int(x), int(y)) for x, y in pts], fill=IDX[ch])


def ell(d, box, ch):
    d.ellipse(box, fill=IDX[ch])


def outline(im, n):
    """알파가 있는 픽셀의 바깥 이웃을 외곽선으로 채운다 (팽창 1px)."""
    px = im.load()
    add = []
    for y in range(n):
        for x in range(n):
            if px[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < n and 0 <= ny < n and px[nx, ny] and px[nx, ny] != IDX['o']:
                    add.append((x, y)); break
    for x, y in add:
        px[x, y] = IDX['o']


def emit(im, n):
    """이미지 → map 문자열 배열 + 실제로 쓰인 팔레트만"""
    px = im.load()
    inv = {v: k for k, v in IDX.items()}
    rows, used = [], set()
    for y in range(n):
        row = ''
        for x in range(n):
            v = px[x, y]
            if v == 0:
                row += '.'
            else:
                ch = inv[v]; used.add(ch); row += ch
        rows.append(row)
    # 위/아래 빈 행 트림 (좌우는 폭을 맞춰야 하므로 그대로)
    while rows and set(rows[0]) == {'.'}: rows.pop(0)
    while rows and set(rows[-1]) == {'.'}: rows.pop()
    return rows, used


def build_swords(n=23):
    im, d = new(n)
    c = n / 2.0
    # 두 자루를 각각 ±45도로. (tip → pommel) 방향 벡터
    for sgn in (+1, -1):
        ux, uy = sgn * 0.7071, 0.7071          # 칼끝(위) → 손잡이(아래)
        px_, py_ = -uy, ux                      # 수직(폭) 방향
        tipx, tipy = c - ux * 9.6, c - uy * 9.6

        def seg(a, b, w, ch):
            """칼 축 위 a~b 구간을 폭 w 로 칠한다"""
            x0, y0 = tipx + ux * a, tipy + uy * a
            x1, y1 = tipx + ux * b, tipy + uy * b
            poly(d, [(x0 + px_ * w, y0 + py_ * w), (x1 + px_ * w, y1 + py_ * w),
                     (x1 - px_ * w, y1 - py_ * w), (x0 - px_ * w, y0 - py_ * w)], ch)

        seg(0.0, 12.4, 1.6, 'b')        # 칼날
        seg(0.0, 12.4, 0.6, 'B')        #   날 중앙 음영
        seg(12.8, 14.2, 3.4, 'g')       # 가드(금) — 날과 확실히 분리되게 두껍고 넓게
        seg(12.8, 13.4, 3.4, 'y')       #   가드 상단 하이라이트
        seg(14.6, 18.0, 1.0, 'h')       # 그립 — 길게 빼서 검처럼 보이게
        seg(18.2, 19.8, 2.0, 'g')       # 폼멜(금)
    outline(im, n)
    return emit(im, n)


def build_timer(n=21):
    im, d = new(n)
    d.rectangle([8, 0, 12, 3], fill=IDX['G'])          # 위 크라운
    d.rectangle([15, 2, 18, 5], fill=IDX['G'])         # 우측 버튼
    ell(d, [1, 3, 19, 20], 'S')                        # 몸통 그림자
    ell(d, [1, 3, 19, 19], 'G')                        # 몸통
    ell(d, [4, 6, 16, 17], 'r')                        # 유리 림
    ell(d, [5, 7, 15, 16], 'f')                        # 문자판
    poly(d, [(10, 11), (14, 8), (11, 13)], 'k')        # 바늘
    outline(im, n)
    return emit(im, n)


def build_gem(n=19):
    im, d = new(n)
    poly(d, [(2, 7), (7, 2), (14, 3), (17, 8), (9, 18)], 'm')   # 본체
    poly(d, [(2, 7), (7, 2), (14, 3), (8, 8)], 'c')             # 좌상 밝은 면
    poly(d, [(14, 3), (17, 8), (8, 8)], 'c')                    # 우상 면
    poly(d, [(8, 8), (17, 8), (9, 18)], 'd')                    # 하단 어두운 면
    poly(d, [(2, 7), (8, 8), (9, 18)], 'm')                     # 좌하 면
    d.line([(5, 5), (9, 4)], fill=IDX['w'])                     # 하이라이트
    outline(im, n)
    return emit(im, n)


def build_skull(n=19):
    im, d = new(n)
    ell(d, [2, 2, 16, 14], 'n')                        # 두개골
    d.rectangle([6, 11, 12, 16], fill=IDX['n'])        # 턱
    d.rectangle([2, 9, 16, 12], fill=IDX['n'])         # 광대 — 두개골과 턱을 잇는다
    ell(d, [3, 6, 8, 11], 'o')                         # 왼눈
    ell(d, [10, 6, 15, 11], 'o')                       # 오른눈
    poly(d, [(9, 11), (7, 14), (11, 14)], 'o')         # 코
    for tx in (7, 9, 11):                              # 이빨
        d.line([(tx, 14), (tx, 16)], fill=IDX['o'])
    d.line([(5, 4), (7, 3)], fill=IDX['N'])            # 상단 음영
    outline(im, n)
    return emit(im, n)


def build_heart(n=19):
    im, d = new(n)
    ell(d, [1, 3, 10, 12], 'e')                        # 왼쪽 볼록
    ell(d, [8, 3, 17, 12], 'e')                        # 오른쪽 볼록
    poly(d, [(1, 8), (17, 8), (9, 18)], 'e')           # 아래 뾰족
    poly(d, [(9, 18), (17, 9), (17, 7)], 'E')          # 우하단 음영
    ell(d, [4, 5, 7, 8], 'p')                          # 하이라이트
    outline(im, n)
    return emit(im, n)


def build_hourglass(n=19):
    im, d = new(n)
    d.rectangle([3, 1, 15, 3], fill=IDX['G'])          # 위 프레임
    d.rectangle([3, 15, 15, 17], fill=IDX['G'])        # 아래 프레임
    poly(d, [(4, 4), (14, 4), (9, 9)], 'q')            # 위 유리
    poly(d, [(4, 14), (14, 14), (9, 9)], 'q')          # 아래 유리
    poly(d, [(5, 5), (13, 5), (9, 8)], 'G')            # 남은 모래
    poly(d, [(6, 13), (12, 13), (9, 11)], 'S')         # 떨어진 모래
    d.line([(9, 9), (9, 11)], fill=IDX['G'])           # 떨어지는 줄기
    outline(im, n)
    return emit(im, n)


def build_star(n=27):
    im, d = new(n)
    import math
    cx, cy = n / 2.0, n / 2.0 + 0.8
    R, r = 12.5, 5.4
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rad = R if i % 2 == 0 else r
        pts.append((cx + math.cos(a) * rad, cy + math.sin(a) * rad))
    poly(d, pts, 'G')                                   # 본체
    # 좌상 파셋(밝게) — 중심에서 왼쪽 위 꼭짓점들로
    poly(d, [pts[0], pts[9], pts[8], (cx, cy)], 'Y')
    poly(d, [pts[0], pts[1], (cx, cy)], 'Y')
    # 우하 파셋(어둡게)
    poly(d, [pts[3], pts[4], pts[5], (cx, cy)], 'Z')
    poly(d, [pts[5], pts[6], (cx, cy)], 'Z')
    ell(d, [int(cx - 5), int(cy - 8), int(cx - 2), int(cy - 5)], 'v')   # 하이라이트
    outline(im, n)
    return emit(im, n)


def main():
    icons = {
        'swords': build_swords(),
        'timer':  build_timer(),
        'gem':    build_gem(),
        'skull':  build_skull(),
        'heart':  build_heart(),
        'hourglass': build_hourglass(),
        'starb':  build_star(),
    }
    out = ['/* icons.js — gen_icons.py 자동 생성. 직접 수정하지 말 것.',
           '   도형에서 래스터라이즈 + 외곽선 자동 생성. 손으로 찍지 않는다. */']
    for key, (rows, used) in icons.items():
        pal = ', '.join("%s:'%s'" % (ch, PAL[ch]) for ch in PAL if ch in used)
        out.append('PIXELART.%s = {' % key)
        out.append('  pal: { %s },' % pal)
        out.append('  map: [')
        out.append(',\n'.join('    "%s"' % r for r in rows))
        out.append('  ]')
        out.append('};')
        print('  %-7s %dx%-3d  팔레트 %d색' % (key, len(rows[0]), len(rows), len(used)))
    with io.open(OUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out) + '\n')
    print('\n%s 생성' % OUT)


main()
