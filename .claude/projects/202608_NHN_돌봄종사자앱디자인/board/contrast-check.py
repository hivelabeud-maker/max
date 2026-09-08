# -*- coding: utf-8 -*-
def lum(h):
    h=h.lstrip('#'); out=[]
    for i in (0,2,4):
        c=int(h[i:i+2],16)/255
        out.append(c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4)
    return 0.2126*out[0]+0.7152*out[1]+0.0722*out[2]
def cr(a,b):
    l1,l2=sorted([lum(a),lum(b)],reverse=True)
    return (l1+0.05)/(l2+0.05)
W='#FFFFFF'
print('=== 확정 4색 (흰 배경) ===')
for n,h,claim in [('핑크','#FF879F',2.28),('라벤더','#DDA5FF',1.93),('옐로','#FFCF1C',1.48),('웜베이지','#E8E0D5',1.31)]:
    v=cr(h,W); print(f'  {n:6s} {h}  {v:5.2f}:1   보고값 {claim}  {"일치" if abs(v-claim)<0.02 else "★불일치"}')
print('\n=== 웜 뉴트럴 스케일 (흰 배경) ===')
for n,h,claim in [('N00','#FFFFFF',1.00),('N05','#FDFBF7',1.03),('N10','#F4EDE2',1.16),('N20','#E8E0D5',1.31),
                  ('N30','#D6CBB8',1.60),('N40','#9C8A74',3.33),('N60','#6B5F55',6.19),('N70','#4A4038',10.09),('N80','#2B2521',15.11)]:
    v=cr(h,W); print(f'  {n} {h}  {v:6.2f}:1  보고값 {claim:6.2f}  {"OK" if abs(v-claim)<0.05 else "★불일치"}')
print('\n=== 베이지 면(#E8E0D5) 위 텍스트 ===')
for n,h,claim in [('N80','#2B2521',11.56),('N70','#4A4038',7.71),('N60','#6B5F55',4.73),('N40','#9C8A74',None)]:
    v=cr(h,'#E8E0D5'); c=f'보고값 {claim}' if claim else '미달 주장'
    print(f'  {n} {v:6.2f}:1  {c}')
print('\n=== 신호 3단계 ===')
sig=[('주의 딥앰버','#8F5A00',5.78,'#FFF4D1',5.26),('긴급 딥레드','#B3261E',6.54,'#FCE9E6',5.58),('완료 웜그린','#4C7A34',5.07,'#EDF3E6',None)]
for n,h,cw,tint,ct in sig:
    v=cr(h,W); t=cr(h,tint)
    print(f'  {n:12s} {h}  흰배경 {v:5.2f}:1 (보고 {cw})   tint {tint} 위 {t:5.2f}:1 (보고 {ct})')
print('\n=== 파생 딥컬러 ===')
for n,h,cw,tint,ct in [('딥핑크','#A83254',6.46,'#FFF0F3',5.85),('미드핑크','#E85C7C',3.36,None,None),('딥라벤더','#6B3FA0',7.38,None,None)]:
    v=cr(h,W); s=f'  {n:8s} {h}  흰배경 {v:5.2f}:1 (보고 {cw})'
    if tint: s+=f'   tint 위 {cr(h,tint):5.2f}:1 (보고 {ct})'
    print(s)
print('\n=== 면 위 텍스트 검증 (에이전트 주장) ===')
for label,fg,bg,claim in [('핑크면 위 N80','#2B2521','#FF879F',6.64),('핑크면 위 흰글씨','#FFFFFF','#FF879F',None),
                          ('옐로면 위 N80','#2B2521','#FFCF1C',10.22),('주의tint 위 흰글씨','#FFFFFF','#8F5A00',None)]:
    v=cr(fg,bg); print(f'  {label:20s} {v:6.2f}:1  {"보고 "+str(claim) if claim else ""}')
