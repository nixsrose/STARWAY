"""296147.mp4: every second, plus 0.5-second inspection of opening platforms."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxpaint=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];c=['peach']*7;g=3;h=0;bp=[None]*7
 if r<50:c[3]='rust' if r//8%2 else 'peach'
 elif r<80:
  t=[1]*7
  if 54<=r<62:t[1]=t[5]=0
  if 68<=r<74:t[2]=0
 elif r<86:t=[0]*7
 elif r<100:t=[1]*7
 elif r<106:t=[0]*7
 elif r<122:
  t=[2]*7;bp=['violet']*7
 elif r<150:
  t=[1]*7;c=['slate']*7
  if 126<=r<134:t[1]=t[3]=t[5]=0
 elif r<170:
  t=[1]*7;c=['slate']*7
  if r>=154:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<190:
  t=[1]*7;c=['slate']*7
  for l in range(7):
   if l==(r-170)//4%7:c[l]='pink'
 elif r<222:
  t=[0,0,1,1,1,0,0];c=['slate']*7;g=3-min(2,(r-204)/8) if r>=204 else 3
  if r>=204:t=[0,1,1,1,1,1,0]
 elif r<288:
  t=[0,1,0,0,0,1,0];c=['slate']*7;g=1
  if 236<=r<244:c[1]='lime'
  if 252<=r<260:c[5]='pink'
  if 228<=r<234 or 268<=r<274:t[2]=1
 elif r<322:
  t=[0,1,1,1,1,1,0];c=['rose']*7;g=1+min(2,(r-288)/12)
  if r>=312:t=[0,0,0,1,0,0,0]
 elif r<346:
  t=[2,1,1,1,1,1,2];c=['gray']*7;bp[0]=bp[6]='lavender'
  if r<332:c[3]='rose'
  g=3+min(2,(r-322)/9)
 elif r<394:
  t=[0,1,0,0,0,1,0];c=['lavender']*7;g=5
  if 354<=r<360 or 378<=r<384:t=[0]*7
 elif r<430:
  t=[0,1,1,1,1,1,0];c=['lavender']*7;g=5-min(2,(r-394)/12)
 elif r<480:c[3]='rust' if r//8%2 else 'peach'
 else:
  c=['peach']*7;h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxpaint.append(bp)
for r in [20,94,143,200,239,303,340,411,463]:
 l=round(guide[r])
 if tiles[r][l]==1:tiles[r][l]=3
segments=[(0,50,'single','茶色と桃色の外道'),(50,80,'grid','穴のある桃色格子'),(80,122,'islands','連続ジャンプと紫の高台'),(122,150,'grid','青緑の穴あき格子'),(150,170,'tunnel','緑の直線三連トンネル'),(170,190,'hazard','青緑の道路と赤い危険床'),(190,222,'crossroads','中央から左への分岐'),(222,288,'split','左右の細道と緑の床'),(288,322,'single','桃色の合流と中央外道'),(322,346,'box_channel','紫壁の間と右への分岐'),(346,394,'islands','紫の二本橋と連続ジャンプ'),(394,430,'crossroads','紫の合流足場'),(430,480,'single','桃色と茶色の最後の外道'),(480,500,'tunnel','緑の到着トンネル')]
names=['갈색·복숭아색 외길','구멍 난 복숭아 격자','연속 점프와 보라 발판','청록색 구멍 격자','초록 직선 세 터널','청록 도로와 진홍 위험칸','중앙에서 왼쪽 분기','좌우 외길과 초록 발판','분홍 합류와 중앙 외길','보라 벽 사이 오른쪽 분기','보라 쌍레일 연속 점프','보라 합류 발판','복숭아·갈색 마지막 외길','초록 도착 터널']
sections=[dict(start=a,end=b,type=k,name=names[i],side=3) for i,(a,b,k,_) in enumerate(segments)]
courses[17]=dict(title='Asteroid Field · Road 3',tiles=tiles,roadPaint=paints,guide=guide,ceilings=ceilings,tunnelCenters=centers,tunnelRadius=radii,boxColors=['lavender']*N,boxPaint=boxpaint,tunnelColors=['green']*N,coins=[[r,round(guide[r])] for r in range(15,N-5,39) if tiles[r][round(guide[r])]==1 and paints[r][round(guide[r])]!='pink'],bridges=[],sections=sections,encounters=[s['type'] for s in sections],jumpRows=[77,97,121,179,351,375],gravity=16,startSpeed=18,reference='296147.mp4 · 1-second overview; 3–11s inspected every0.5s',instruction='복숭아 격자의 구멍과 연속 발판을 점프로 넘으세요. 초록 터널 뒤 진홍 위험칸을 피하고 왼쪽 레일, 분홍 합류로, 오른쪽 보라 쌍레일을 지나 중앙 도착 터널로 들어가세요.')
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
(root/'data/asteroid-road3-reference.json').write_text(json.dumps(dict(video='296147.mp4',sections=sections,gravityObservation='Original HUD 400 vs previous500; engine gravity16',notes='7열 500행으로 영상의 순서·분기·구멍·색상을 재구성. 정확한 치수는 영상으로 확정할 수 없어 점프 도달거리 기준 조정.'),ensure_ascii=False,indent=2)+'\n')
