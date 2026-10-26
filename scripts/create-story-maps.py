import json,random,math
from pathlib import Path
root=Path(__file__).resolve().parent.parent
# Each course is a hand-authored sequence (section type, length, preferred side).
plans=[
 [('wide',24,2),('funnel',34,1),('wall',38,3),('tunnel',28,2),('gap',26,2),('diagonal',46,1),('fuel',22,2),('split',34,3),('boost',28,2)],
 [('split',36,1),('wall',30,1),('diagonal',40,3),('gap',28,2),('tunnel',42,2),('fuel',20,1),('checker',38,3),('boost',26,2)],
 [('funnel',36,3),('checker',42,1),('wall',34,3),('gap',24,2),('split',38,1),('diagonal',44,1),('fuel',22,3),('tunnel',40,2)],
 [('islands',44,1),('split',32,3),('diagonal',42,3),('islands',48,3),('fuel',22,2),('checker',36,1),('gap',32,2),('boost',28,2)],
 [('diagonal',46,1),('islands',50,1),('wall',32,3),('gap',34,2),('funnel',38,3),('fuel',24,1),('islands',46,3),('split',34,1)],
 [('islands',48,3),('checker',42,3),('diagonal',50,3),('split',38,1),('gap',36,2),('fuel',24,3),('islands',52,1),('wall',34,1)],
 [('split',42,1),('crossroads',48,3),('wall',38,1),('diagonal',48,3),('fuel',22,2),('checker',40,3),('split',36,3),('slow',24,2)],
 [('wall',36,3),('crossroads',50,1),('funnel',40,1),('split',44,3),('diagonal',48,1),('fuel',24,3),('crossroads',46,3),('gap',26,2)],
 [('diagonal',48,1),('wall',42,3),('split',46,1),('crossroads',54,3),('checker',42,1),('fuel',24,2),('crossroads',52,1),('boost',28,2)],
 [('tunnel',44,2),('wall',34,1),('slow',24,2),('funnel',42,3),('checker',38,1),('fuel',22,3),('tunnel',48,2),('wall',36,3)],
 [('funnel',42,1),('tunnel',52,2),('wall',38,3),('slow',28,2),('checker',44,3),('fuel',24,1),('tunnel',46,2),('gap',24,2)],
 [('wall',42,3),('checker',46,1),('tunnel',54,2),('funnel',44,3),('slow',26,2),('fuel',24,3),('wall',40,1),('tunnel',50,2)],
 [('boost',26,2),('gap',28,2),('diagonal',50,1),('islands',44,3),('fuel',24,1),('gap',30,2),('checker',46,1),('split',42,3)],
 [('islands',48,1),('diagonal',52,3),('boost',28,2),('gap',32,2),('split',44,1),('fuel',24,3),('checker',48,3),('gap',28,2)],
 [('checker',48,3),('gap',30,2),('islands',50,3),('diagonal',54,1),('fuel',24,1),('boost',28,2),('split',46,3),('gap',32,2)],
 [('crossroads',50,1),('tunnel',48,2),('wall',42,3),('gap',28,2),('diagonal',52,1),('fuel',24,3),('checker',46,3),('boost',28,2)],
 [('islands',48,3),('wall',44,1),('tunnel',52,2),('crossroads',54,3),('slow',26,2),('fuel',24,1),('gap',30,2),('diagonal',56,3)],
 [('funnel',48,1),('tunnel',56,2),('crossroads',58,3),('wall',46,1),('islands',52,3),('fuel',26,2),('checker',50,1),('boost',30,2),('gap',28,2)]
]
for plan in plans:
 if not any(kind in ('split','crossroads') for kind,_,_ in plan):
  for i,(kind,length,lane) in enumerate(plan):
   if kind=='checker':
    plan[i]=('crossroads',length,lane);break
courses=[]
for index,plan in enumerate(plans):
 chapter=index//3;rng=random.Random(33551+index)
 tiles=[[1]*5 for _ in range(18)];guide=[2]*18;ceilings=[0]*18;sections=[];coins=[];fuel_rows=[]
 for kind,length,lane in plan:
  start=len(tiles);sections.append({'start':start,'end':start+length,'type':kind,'side':lane})
  active=length-18
  for j in range(length):
   q=j-9;on=0<=q<active;t=[1]*5;ceiling=0;route=lane
   if kind=='diagonal':route=(lane+(4-2*lane)*max(0,min(1,q/max(1,active-1))))
   elif kind=='crossroads':route=lane
   if on:
    if kind=='funnel':
     width=3 if q<active*.25 or q>active*.75 else 1
     t=[1 if abs(k-lane)<=width//2 else 0 for k in range(5)]
    elif kind=='wall':t=[1,1,8,1,1]
    elif kind=='split':t=[1,1,0,1,1]
    elif kind=='diagonal':
     lo=math.floor(route);hi=math.ceil(route);t=[1 if k in (lo,hi) else 0 for k in range(5)]
    elif kind=='crossroads':t=[1,1,0,1,1] if not active*.35<q<active*.65 else [1]*5
    elif kind=='checker':
     t=[1 if k==lane else (0 if (q//4+k)%2 else 2) for k in range(5)]
    elif kind=='tunnel':
     t=[0,1,1,1,0];ceiling=1.15
    elif kind in ('gap','islands'):
     width=4 if chapter==1 else 2
     if kind=='islands':t=[1 if abs(k-lane)<=.6 else 0 for k in range(5)]
     if active//2<=q<active//2+width:t=[0]*5
    elif kind=='boost' and q<3:t[lane]=4
    elif kind=='slow' and q<3:t[lane]=5
    elif kind=='wide' and active*.4<q<active*.6:t[0]=t[4]=2
   if kind=='fuel' and j==length//2:t[lane]=3;fuel_rows.append(start+j)
   tiles.append(t);guide.append(route);ceilings.append(ceiling)
  # One possible fuel cell in a rest zone after every second encounter.
  if kind!='fuel' and len(sections)%2==0:
   fr=start+length-5;fl=round(guide[fr]);tiles[fr][fl]=3;fuel_rows.append(fr)
  for j in (5,length-6):
   row=start+j;candidates=[k for k,t in enumerate(tiles[row]) if t==1]
   if candidates:coins.append([row,rng.choice(candidates)])
 tiles.extend([[1]*5 for _ in range(16)]);guide.extend([2]*16);ceilings.extend([0]*16)

 # Connect encounters into a continuous winding road instead of resetting to a full-width straight.
 previous=2
 for sec in sections:
  start,end=sec['start'],sec['end'];kind=sec['type']
  incoming=guide[min(end-1,start+9)]
  for r in range(start,min(start+9,end)):
   mix=(r-start+1)/9;guide[r]=previous+(incoming-previous)*mix
  previous=guide[end-1]
  for r in range(start,end):
   if ceilings[r] or all(t==0 for t in tiles[r]):continue
   full=all(t in (1,3,4,5) for t in tiles[r])
   if not full or kind in ('fuel','split','crossroads'):continue
   width=1.1 if index<3 else .85
   center=guide[r]
   for l in range(5):
    if abs(l-center)>width and tiles[r][l] not in (3,4,5):tiles[r][l]=0
 # Ending connects to the last path before opening into the finish platform.
 endstart=len(tiles)-16
 for r in range(endstart,endstart+8):
  guide[r]=previous+(2-previous)*(r-endstart+1)/8
  tiles[r]=[1 if abs(l-guide[r])<=1.1 else 0 for l in range(5)]
 # Balanced pickups with no center bias, while preserving fixed coordinates.
 bag=[]
 for c in coins:
  if not bag:bag=list(range(5));rng.shuffle(bag)
  options=[lane for lane in bag if tiles[c[0]][lane]==1]
  if not options:options=[k for k,t in enumerate(tiles[c[0]]) if t==1]
  lane=rng.choice(options);c[1]=lane
  if lane in bag:bag.remove(lane)
 courses.append({'tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,'sections':sections,'encounters':[v[0] for v in plan]})
(root/'dist/story-data.js').write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
print('18 bespoke courses, lengths:',[len(c['tiles']) for c in courses])

import subprocess,sys
subprocess.run([sys.executable,str(root/'scripts/create-redheat-road1.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/upgrade-story-courses.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-redheat-road2.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-redheat-road3.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-orbital-road1.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-orbital-road2.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-orbital-road3.py')],check=True)

subprocess.run([sys.executable,str(root/'scripts/create-lunar-road1.py')],check=True)
