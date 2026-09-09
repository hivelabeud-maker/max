#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prep_assets.py — 사용자 제공 원본(고해상)을 게임용 WebP 로 가공한다.
  · 투명 여백 트림 → 표시 크기의 4배(4K 영상 대비)로 리사이즈 → WebP
  · 결과는 src/art/sheets/ 에 떨어지고 build.py 가 base64 로 인라인한다.
사용: python3 tools/prep_assets.py
"""
import os, io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'src', 'art', 'sheets')
# 원본 아트 폴더 — 개인 경로를 하드코딩하지 말 것 (이 파일은 납품 패키지에 포함된다).
# 다른 데 있으면:  ART_SRC="~/Desktop" python3 tools/prep_assets.py
DESK = os.path.expanduser(os.environ.get('ART_SRC', os.path.join(ROOT, 'src', 'art', 'raw', '_원본')))

JOBS = [
  # (원본, 출력키, 목표(가로,세로) 중 하나만 지정해도 됨, 트림여부, 품질)
  { 'src': '11.png',        'key': 'player', 'h': 360,  'trim': True,  'q': 88 },
  { 'src': 'bg_cave.png',   'key': 'bg',     'w': 1080, 'trim': False, 'q': 74 },
  { 'src': 'bgbg.png',      'key': 'bg_end', 'w': 810,  'trim': False, 'q': 72 },
  { 'src': 'btn_install.png','key': 'cta',    'w': 1000, 'trim': True,  'q': 85 },
  { 'src': 'btn_replay.png', 'key': 'replay', 'w': 620,  'trim': True,  'q': 85 },
  { 'src': 'char_glow.png',  'key': 'char_glow', 'h': 760, 'trim': True, 'q': 86 },
]

# ── 몬스터 시트: 보스 + 2×5 잡몹을 자동으로 잘라낸다 ──
# ══════════════════════════════════════════════════════════════════════════
#  crisp_cutout — 밝은 배경 위 에셋의 "외곽 지저분함"을 근본 제거
#  원인: 배경색과 섞인 경계 1~2px(흰 배경 + 검은 테두리 = 회색)이 남아
#        어두운 게임 배경에 올리면 밝은 후광(halo)으로 보인다.
#  해결: ① 배경 플러드필 → ② 경계 알파를 배경색 거리로 추정
#        ③ 오염 제거 F = (P − (1−a)·B)/a  → ④ 알파 이진화(도트라 반투명 불필요)
# ══════════════════════════════════════════════════════════════════════════
def crisp_cutout(im, tol=34, norm=95.0, cut=0.42):
    im = im.convert('RGBA')
    W, H = im.size
    px = im.load()
    B = px[2, 2][:3]
    def dist(c):
        return max(abs(c[0]-B[0]), abs(c[1]-B[1]), abs(c[2]-B[2]))
    seen = bytearray(W*H); st = []
    def push(x, y):
        if not seen[y*W+x] and px[x, y][3] > 8 and dist(px[x, y]) <= tol:
            seen[y*W+x] = 1; st.append((x, y))
    for x in range(W): push(x, 0); push(x, H-1)
    for y in range(H): push(0, y); push(W-1, y)
    while st:
        x, y = st.pop(); px[x, y] = (0, 0, 0, 0)
        for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx, ny = x+dx, y+dy
            if 0 <= nx < W and 0 <= ny < H: push(nx, ny)
    edge = []
    for y in range(H):
        for x in range(W):
            if px[x, y][3] == 0: continue
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                nx, ny = x+dx, y+dy
                if 0 <= nx < W and 0 <= ny < H and px[nx, ny][3] == 0:
                    edge.append((x, y)); break
    for x, y in edge:
        c = px[x, y]
        a = min(1.0, dist(c) / norm)
        if a < cut:
            px[x, y] = (0, 0, 0, 0)
        else:
            r = int(max(0, min(255, (c[0] - (1-a)*B[0]) / a)))
            g = int(max(0, min(255, (c[1] - (1-a)*B[1]) / a)))
            b = int(max(0, min(255, (c[2] - (1-a)*B[2]) / a)))
            px[x, y] = (r, g, b, 255)
    return im


def trim_halo(im, amin=26):
    """투명 PNG 로 받은 에셋의 아주 옅은 후광 잔여를 잘라낸다."""
    im = im.convert('RGBA')
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            c = px[x, y]
            if 0 < c[3] < amin: px[x, y] = (0, 0, 0, 0)
    return im


def prep_monsters():
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'monsters.png')
    if not os.path.exists(p):
        print('  건너뜀 (없음): monsters.png'); return
    im = Image.open(p).convert('RGBA')
    W, H = im.size
    def save(key, crop, maxh):
        bb = crop.getbbox()
        if bb: crop = crop.crop(bb)
        if crop.height > maxh:
            k = maxh / crop.height
            crop = crop.resize((max(1, round(crop.width * k)), maxh), Image.LANCZOS)
        fp = os.path.join(OUT, key + '.webp')
        crop.save(fp, 'WEBP', quality=82, method=6)
        print('  %-8s %4dx%-4d  %5.1f KB' % (key, crop.width, crop.height, os.path.getsize(fp)/1024.0))
    save('boss', im.crop((0, 54, W, 631)), 400)
    names = [['m_cyan','m_pink','m_lime','m_orange','m_bug'],
             ['m_yellow','m_purple','m_white','m_green','m_blue']]
    bands = [(672, 889), (954, 1171)]
    cw = W / 5.0
    for r in range(2):
        y0, y1 = bands[r]
        for c in range(5):
            save(names[r][c], im.crop((int(c*cw), y0, int((c+1)*cw), y1)), 160)

# ── HUD 오버레이: 아이콘/프레임을 잘라내고 베이크된 숫자·아이콘을 지운다 ──
def prep_hud():
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'hud_overlay.png')
    if not os.path.exists(p):
        print('  건너뜀 (없음): hud_overlay.png'); return
    im = Image.open(p).convert('RGBA')
    px = im.load()
    def save(key, box, q=85, patch=None):
        crop = im.crop(box).copy()
        if patch:                                  # (x0,y0,x1,y1, sx,sy) — crop 좌표계
            cpx = crop.load()
            col = cpx[patch[4], patch[5]]
            for y in range(patch[1], patch[3]):
                for x in range(patch[0], patch[2]):
                    cpx[x, y] = col
        fp = os.path.join(OUT, key + '.webp')
        crop.save(fp, 'WEBP', quality=q, method=6)
        print('  %-9s %4dx%-4d  %5.1f KB' % (key, crop.width, crop.height, os.path.getsize(fp)/1024.0))
    save('ic_skull', (28, 40, 96, 107))            # 해골 아이콘 (숫자 "156" 제외)
    save('ic_coin',  (32, 102, 92, 167))           # 코인 아이콘 (숫자 제외)
    save('ic_heart', (235, 50, 293, 109))   # 오른쪽 초록 게이지 침범분 제외
    # HP 바 — 초록 채움을 어두운 홈 색으로 지우고 코드가 채운다
    bar = im.crop((290, 48, 809, 109)).copy()
    bpx = bar.load(); bw, bh = bar.size
    dark = (26, 22, 44, 255)
    for y in range(bh):
        for x in range(bw):
            r, g, b, a = bpx[x, y]
            if a > 60 and g > 88 and g > r * 1.18 and g > b * 1.10:
                bpx[x, y] = dark
    fp = os.path.join(OUT, 'hpframe.webp')
    bar.save(fp, 'WEBP', quality=85, method=6)
    print('  %-9s %4dx%-4d  %5.1f KB' % ('hpframe', bw, bh, os.path.getsize(fp)/1024.0))
    # 스킬 슬롯 프레임 — 중앙의 로켓/폭탄 아이콘을 내부색으로 지운다
    save('slot_l', (22, 1258, 189, 1439), patch=(38, 38, 132, 138, 20, 90))
    save('slot_u', (750, 1256, 921, 1439), patch=(40, 40, 134, 140, 20, 92))

# ── 보스 게이지: 회색 배경 제거 + 베이크된 빨강 채움을 비움 (코드가 채움) ──
def prep_bossbar():
    from PIL import ImageDraw
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'bossbar.png')
    if not os.path.exists(p):
        print('  건너뜀 (없음): bossbar.png'); return
    im = crisp_cutout(Image.open(p))          # ★ 외곽 후광 제거 + 알파 이진화
    W, H = im.size
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((470, 244, 2016, 464), radius=95, fill=(30, 20, 46, 255))
    im = im.crop((132, 144, 2043, 561))
    if im.width > 860:
        k = 860 / im.width
        im = im.resize((860, max(1, round(im.height*k))), Image.BOX)
    fp = os.path.join(OUT, 'bossbar.webp')
    im.save(fp, 'WEBP', quality=84, method=6)
    print('  %-9s %4dx%-4d  %5.1f KB   (채움 영역 비움)' % ('bossbar', im.width, im.height, os.path.getsize(fp)/1024.0))

# ── 스탯 패널 (분리 에셋): 트림 + 숫자 3곳 비움 ──
def prep_stats():
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'stats.png')
    if not os.path.exists(p):
        print('  건너뜀 (없음): stats.png'); return
    im = Image.open(p).convert('RGBA')
    W, H = im.size
    px = im.load()
    def patch(rx0, ry0, rx1, ry1, sx, sy):
        col = px[int(W*sx), int(H*sy)]
        for y in range(int(H*ry0), int(H*ry1)):
            for x in range(int(W*rx0), int(W*rx1)):
                px[x, y] = col
    # crop(25,551,891,479) 기준 실측 → 원본 비율로 환산
    def cpatch(cx0, cy0, cx1, cy1, ssx, ssy):
        patch((25 + cx0*891)/W, (551 + cy0*479)/H, (25 + cx1*891)/W, (551 + cy1*479)/H, ssx, ssy)
    cpatch(0.780, 0.095, 0.950, 0.255, 0.760, 0.400)   # 처치 256
    cpatch(0.575, 0.435, 0.765, 0.570, 0.760, 0.400)   # 코인 73  (아이콘 끝 0.5544)
    cpatch(0.838, 0.435, 0.968, 0.570, 0.760, 0.400)   # 보석 120 (아이콘 끝 0.8148)
    # 알파 30 이상만 콘텐츠로 보고 트림 (희미한 글로우 잔여 제외)
    mnx, mny, mxx, mxy = W, H, -1, -1
    for y in range(H):
        for x in range(W):
            if px[x, y][3] > 30:
                if x < mnx: mnx = x
                if x > mxx: mxx = x
                if y < mny: mny = y
                if y > mxy: mxy = y
    if mxx > 0: im = im.crop((max(0, mnx-4), mny, min(W, mxx+5), min(H, mxy+5)))
    # 상단 잔여(타이틀 그림자 라인) — 패널 본체(폭 800+)가 시작되기 전의 행 제거
    W2, H2 = im.size; p2 = im.load()
    for y in range(H2):
        n = sum(1 for x in range(0, W2, 2) if p2[x, y][3] > 30) * 2
        if n == 0: continue
        if n < 620:
            for x in range(W2): p2[x, y] = (0, 0, 0, 0)
        else:
            break
    bb2 = im.getbbox()
    if bb2: im = im.crop(bb2)
    fp = os.path.join(OUT, 'stats.webp')
    im.save(fp, 'WEBP', quality=88, method=6)
    print('  %-9s %4dx%-4d  %5.1f KB   (숫자 3곳 제거)'
          % ('stats', im.width, im.height, os.path.getsize(fp)/1024.0))

# ── 타이틀: 투명 결과 카드(result_win)에 구워진 "방어 성공!" 을 원본 픽셀로 추출 ──
def prep_title():
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'result_win.png')
    if not os.path.exists(p):
        print('  건너뜀 (없음): result_win.png'); return
    im = Image.open(p).convert('RGBA')
    W, H = im.size
    t = im.crop((100, 594, 841, 820))
    # 크롭에 딸려온 캐릭터 부츠 제거 — 텍스트 행은 넓고(700px+) 부츠 행은 좁다(150px 이하)
    tp = t.load()
    for y in range(t.height):
        n = sum(1 for x in range(t.width) if tp[x, y][3] > 30)
        if n == 0: continue
        if n < 430:
            for x in range(t.width):
                tp[x, y] = (0, 0, 0, 0)
        else:
            break                                   # 타이틀 본문 시작
    bb = t.getbbox()
    if bb: t = t.crop(bb)
    fp = os.path.join(OUT, 'title_win.webp')
    t.save(fp, 'WEBP', quality=88, method=6)
    print('  %-9s %4dx%-4d  %5.1f KB   (카드에서 추출)' % ('title_win', t.width, t.height, os.path.getsize(fp)/1024.0))

# ── 게이지 트로프: 어두운 라운드 바 (아래 깔개). 채움은 코드가 위에 올린다 ──
def prep_trough():
    from PIL import ImageDraw
    W, H = 720, 96
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = H // 2
    d.rounded_rectangle((0, 0, W - 1, H - 1), radius=r, fill=(12, 13, 18, 255))          # 검은 외곽
    d.rounded_rectangle((7, 7, W - 8, H - 8), radius=r - 7, fill=(37, 39, 48, 255))      # 홈
    d.rounded_rectangle((7, 7, W - 8, H // 2), radius=r - 7, fill=(45, 48, 59, 255))     # 위쪽 미광
    d.rounded_rectangle((7, H // 2, W - 8, H - 8), radius=r - 7, fill=(37, 39, 48, 255))
    fp = os.path.join(OUT, 'trough.webp')
    im.save(fp, 'WEBP', quality=90, method=6)
    print('  %-9s %4dx%-4d  %5.1f KB   (생성)' % ('trough', W, H, os.path.getsize(fp)/1024.0))

# ── 최종화면 아이콘: 스탯 원본에서 해골·보석·별묶음 추출 (동일 픽셀 세트) ──
def prep_icons():
    p = os.path.join(ROOT, 'src', 'art', 'raw', 'stats.png')
    if not os.path.exists(p): return
    src = Image.open(p).convert('RGBA')
    def unify_outline(im):
        """경계 픽셀을 단일 어두운 색으로 통일 — 아웃라인 색이 제각각이라 생기는
           '지저분한 외곽'의 근본 원인 제거. 도트 아트의 균일한 1px 아웃라인 재현."""
        W2, H2 = im.size; px2 = im.load()
        edge = []
        for y in range(H2):
            for x in range(W2):
                if px2[x, y][3] == 0: continue
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x+dx, y+dy
                    if nx < 0 or ny < 0 or nx >= W2 or ny >= H2 or px2[nx, ny][3] == 0:
                        edge.append((x, y)); break
        if not edge: return im
        dk = min(edge, key=lambda q: sum(px2[q[0], q[1]][:3]))
        c0 = px2[dk[0], dk[1]]
        col = (max(8, c0[0]//2), max(6, c0[1]//2), max(14, c0[2]//2), 255)
        for x, y in edge: px2[x, y] = col
        return im

    def drop_slivers(im):
        """연결요소 분석 — 얇은 선 조각(패널 구분선 잔재)만 버리고 아이콘은 남긴다."""
        W2, H2 = im.size; px2 = im.load()
        lab = [-1] * (W2 * H2); comps = []
        for sy in range(H2):
            for sx in range(W2):
                if px2[sx, sy][3] == 0 or lab[sy * W2 + sx] >= 0: continue
                cid = len(comps); st = [(sx, sy)]; lab[sy * W2 + sx] = cid
                mnx, mny, mxx, mxy, n = sx, sy, sx, sy, 0
                while st:
                    x, y = st.pop(); n += 1
                    if x < mnx: mnx = x
                    if x > mxx: mxx = x
                    if y < mny: mny = y
                    if y > mxy: mxy = y
                    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)):
                        nx, ny = x+dx, y+dy
                        if 0 <= nx < W2 and 0 <= ny < H2 and lab[ny*W2+nx] < 0 and px2[nx, ny][3] > 0:
                            lab[ny*W2+nx] = cid; st.append((nx, ny))
                comps.append({'n': n, 'w': mxx-mnx+1, 'h': mxy-mny+1})
        if not comps: return im
        big = max(c2['n'] for c2 in comps)
        kill = set()
        for ci, c2 in enumerate(comps):
            thin = (c2['h'] <= 7 or c2['w'] <= 7)        # 선 조각
            tiny = c2['n'] < big * 0.08                   # 부스러기
            if thin or tiny: kill.add(ci)
        if kill:
            for y in range(H2):
                for x in range(W2):
                    if lab[y*W2+x] in kill: px2[x, y] = (0, 0, 0, 0)
        return im

    def erode1(im):
        px = im.load(); W2, H2 = im.size
        kill = []
        for y in range(H2):
            for x in range(W2):
                if px[x, y][3] == 0: continue
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x+dx, y+dy
                    if nx < 0 or ny < 0 or nx >= W2 or ny >= H2 or px[nx, ny][3] == 0:
                        kill.append((x, y)); break
        for x, y in kill: px[x, y] = (0, 0, 0, 0)
        return im
    def cut(key, box, pad=10):
        im = unify_outline(drop_slivers(crisp_cutout(src.crop((box[0]-pad, box[1]-pad, box[2]+pad+1, box[3]+pad+1)).copy())))
        bb = im.getbbox()
        if bb: im = im.crop(bb)
        fp = os.path.join(OUT, key + '.webp')
        im.save(fp, 'WEBP', quality=90, method=6)
        print('  %-9s %4dx%-4d  %5.1f KB' % (key, im.width, im.height, os.path.getsize(fp)/1024.0))
    def cut0(key, box):
        # 크롭 모서리가 배경(칩 내부색)에 놓이도록 pad 없이 — 칩째 추출 방지
        im = crisp_cutout(src.crop(box).copy(), tol=30)
        q = im.load()
        for y in range(im.height):                 # 칩 라벤더 잔여 — b 채널이 최대인 밝은 픽셀
            for x in range(im.width):
                r, g, b, a2 = q[x, y]
                if a2 > 0 and b > 218 and b >= r and g > 182:
                    q[x, y] = (0, 0, 0, 0)
        im = unify_outline(drop_slivers(im))   # 선 조각 제거 + 아웃라인 균일화
        bb = im.getbbox()
        if bb: im = im.crop(bb)
        fp = os.path.join(OUT, key + '.webp')
        im.save(fp, 'WEBP', quality=90, method=6)
        print('  %-9s %4dx%-4d  %5.1f KB' % (key, im.width, im.height, os.path.getsize(fp)/1024.0))
    cut0('r_skull', (71, 590, 145, 672))   # 해골 본체(76,595~139,666) + 아웃라인 여유 5px
    cut('r_gem',   (688, 742, 760, 840))
    cut('r_stars', (532, 916, 862, 1002))
    cut('r_star1', (532, 916, 646, 1002))

def main():
    if not os.path.isdir(OUT): os.makedirs(OUT)
    total = 0
    for j in JOBS:
        p = os.path.join(ROOT, 'src', 'art', 'raw', j['src'])      # raw 우선, 없으면 데스크탑
        if not os.path.exists(p): p = os.path.join(DESK, j['src'])
        if not os.path.exists(p):
            print('  건너뜀 (없음): %s' % j['src']); continue
        im = trim_halo(Image.open(p))
        if j['key'] == 'player':
            # 원본에 구워진 발밑 청회색 그림자 제거 (하단 28% 대역, g·b가 r보다 높은 저채도)
            px2 = im.load()
            for y2 in range(int(im.height * 0.72), im.height):
                for x2 in range(im.width):
                    r2, g2, b2, a3 = px2[x2, y2]
                    if a3 > 0 and g2 > r2 + 12 and b2 > r2 + 8 and r2 < 140:
                        px2[x2, y2] = (0, 0, 0, 0)
        if j.get('trim'):
            bb = im.getbbox()
            if bb: im = im.crop(bb)
        if 'w' in j:
            k = j['w'] / im.width
        else:
            k = j['h'] / im.height
        if k < 1:
            im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.BOX)
        fp = os.path.join(OUT, j['key'] + '.webp')
        im.save(fp, 'WEBP', quality=j['q'], method=6)
        kb = os.path.getsize(fp) / 1024.0
        total += kb
        print('  %-8s %4dx%-4d  %6.1f KB   ← %s' % (j['key'], im.width, im.height, kb, j['src']))
    prep_monsters()
    prep_hud()
    prep_bossbar()
    prep_title()
    prep_icons()
    print('합계 %.0f KB' % total)

main()
