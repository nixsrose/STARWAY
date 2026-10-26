import json,math,pathlib
p=pathlib.Path('dist/story-data.js');courses=json.loads(p.read_text().removeprefix('const STORY_COURSES=').strip().rstrip(';'));courses=courses[:21]
themes=[('Aurora Expanse','ice','electricBlue',50),('Iron Citadel','gold','slate',150),('Event Horizon','lavender','indigo',100)]
orders=[['split','islands','diagonal','gap','tunnel','checker','split','gap'],['wall','diagonal','tunnel','split','wall','checker','tunnel','diagonal'],['diagonal','gap','wall','tunnel','checker','split','gap','wall','tunnel','diagonal']]
for zone,(name,tint,paint,gravity) in enumerate(themes):
 for road in range(3):
  kinds=orders[zone][road:]+orders[zone][:road];n=48+len(kinds)*36
  m=dict(title=f'{name} · Road {road+1}',tiles=[],roadPaint=[],ceilings=[],tunnelCenters={},tunnelRadius={},boxColors=[],boxPaint=[],tunnelColors=[],guide=[],coins=[],bridges=[],sections=[],jumpRows=[],gravity=gravity,gravityUnit='coefficient',fuelDrainMultiplier=.75,startSpeed=18,instruction=['저중력에서 짧게 가속하고 분리 발판을 점프로 연결하세요.','고중력 구역입니다. 벽은 좌우로 우회하고 터널에서는 중앙을 유지하세요.','점프·회피·터널을 연속으로 통과하고 회복 구간에서 다음 경로를 준비하세요.'][zone])
  for r in range(n):
   j=(r-24)//36;k='wide' if r<24 or r>=n-24 else kinds[j];q=(r-24)%36
   # Each section begins and ends with an open transfer apron.
   lane=3;tiles=[0]*7;colors=[paint]*7;bp=[None]*7;centers=[]
   if k=='wide' or q<7 or q>=29:tiles=[1]*7
   elif k=='split':
    tiles=[1,1,0,0,0,1,1];lane=1 if (j+road)%2==0 else 5
   elif k=='diagonal':
    lane=round(1+4*(q-7)/21) if (j+road)%2==0 else round(5-4*(q-7)/21)
    tiles=[int(abs(l-lane)<=1) for l in range(7)]
   elif k=='islands':
    lane=1 if road%2==0 else 5;tiles=[int(abs(l-lane)<=1) for l in range(7)]
    if q in [17,18]:tiles=[0]*7
    if q==15:m['jumpRows'].append(r)
   elif k=='gap':
    tiles=[1]*7
    if 17<=q<20:tiles=[0]*7
    if q==15:m['jumpRows'].append(r)
   elif k=='tunnel':
    centers=[-2,0,2] if road==2 else [0];tiles=[1]*7;lane=3
   elif k=='wall':
    lane=1 if (j+road)%2==0 else 5;tiles=[1]*7
    for l in [2,3,4]:tiles[l]=2;bp[l]=paint
    if road>0:colors[3]='pink'
   elif k=='checker':
    lane=2 if (j+road)%2==0 else 4;tiles=[int(l==lane or (l+q//3)%2==0) for l in range(7)]
    for l in range(7):
     if abs(l-lane)>1 and tiles[l] and zone>0:colors[l]='pink'
   if k!='wide' and 9<=q<=26 and zone==2 and k in ['split','diagonal']:
    for l in range(7):
     if tiles[l] and abs(l-lane)>1:colors[l]='pink'
   if (k=='wide' and r in [12,n-12]) or (k!='wide' and q==3):tiles[3]=3
   m['tiles'].append(tiles);m['roadPaint'].append(colors);m['boxPaint'].append(bp);m['guide'].append(lane);m['ceilings'].append(1.15 if centers else 0);m['boxColors'].append(paint);m['tunnelColors'].append(tint)
   if centers:m['tunnelCenters'][str(r)]=centers;m['tunnelRadius'][str(r)]=.49
   if r%25==12 and tiles[lane]==1:m['coins'].append([r,lane])
  m['sections']=[dict(start=0,end=24,type='wide',name='출발 · 경로 확인',side=3)]+[dict(start=24+i*36,end=60+i*36,type=k,name={'split':'분리 레일 선택','islands':'저중력 점프 발판','diagonal':'대각선 전환','gap':'단절 교량 점프','tunnel':'직선 터널 통과','checker':'격자 회피','wall':'장벽 우회'}[k],side=3) for i,k in enumerate(kinds)]+[dict(start=n-24,end=n,type='wide',name='도착 항로',side=3)]
  m['encounters']=kinds;m['finish']=dict(row=n-8,lane=3,type='road');courses.append(m)
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'),ensure_ascii=False)+';\n')
