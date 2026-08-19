# -*- coding: utf-8 -*-
"""원본 HTML → 아티팩트 발행용 사본.
문서 골격(doctype/html/head/body) 태그만 벗기고 내용 순서는 그대로 둔다.
<noscript> 안의 스타일을 밖으로 끌어내면 no-JS 폴백이 상시 적용돼
모든 섹션이 펼쳐지므로, 절대 재배치하지 않는다."""
import re, sys

pairs = [('회의록-20260810-공유용.html', 'artifacts/meeting-0810-share.html'),
         ('회의록-20260810-내부용.html', 'artifacts/meeting-0810-internal.html'),
         ('사전리서치-킥오프.html',      'artifacts/kickoff-research.html')]

for src, dst in pairs:
    s = open(src, encoding='utf-8').read()
    s = re.sub(r'<!DOCTYPE html>\s*', '', s, flags=re.I)
    s = re.sub(r'</?html[^>]*>\s*', '', s, flags=re.I)
    s = re.sub(r'</?head[^>]*>\s*', '', s, flags=re.I)
    s = re.sub(r'</?body[^>]*>\s*', '', s, flags=re.I)
    s = re.sub(r'<meta[^>]*charset[^>]*>\s*', '', s, flags=re.I)
    s = re.sub(r'<meta[^>]*name="viewport"[^>]*>\s*', '', s, flags=re.I)
    open(dst, 'w', encoding='utf-8').write(s.strip() + '\n')
    ns = len(re.findall(r'<noscript>', s))
    print('built %-38s noscript 유지: %d' % (dst, ns))
