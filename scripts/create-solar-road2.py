import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paint=[];guide=[];ceilings=[];centers={};radii={};box=[];tint=[]
for r in range(N):
 t=[0,0,1,1,1,0,0];c=['ochre']*7;g=3;h=0;tc='peach'
 if r<40:
  if 16<=r<36:h=1.15;centers[str(r)]=[-.65,.65];radii[str(r)]=.72
 elif r<46:t=[0]*7
 elif r<70:t=[2,0,1,1,1,0,2]
 elif r<76:t=[0]*7
 elif r<96:t=[2,2,1,2,1,2,2];c=['peach']*7;g=3
 elif r<116:t=[1,0,1,1,1,0,1]
 elif r<144:
  t=[1,0,2,2,2,0,1];g=3
 elif r<172:
  t=[1]*7;g=3-min(2,max(0,r-144)*2/14)
  if r>=158:t=[1,1,0,0,0,1,1]
 elif r<178:t=[0]*7;g=1
 elif r<200:
  t=[1]*7;g=1+min(2,max(0,r-180)*2/12)
  if r>=190:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.8
 elif r<206:t=[0]*7
 elif r<240:
  c=['rose']*7;t=[0,1,1,0,1,1,0] if r<222 else [0,1,1,1,1,1,0];g=1.5+min(1.5,max(0,r-216)*1.5/12)
 elif r<246:t=[0]*7
 elif r<270:
  c=['rose']*7;t=[0,0,0,1,0,0,0]
  if 258<=r<266:t[0]=t[1]=t[5]=t[6]=2
 elif r<292:
  t=[0,1,1,0,1,1,0];c=['crimson']*4+['rose']*3;g=4.5
  if r<278:t=[0,1,1,1,1,1,0];g=3+(r-270)*1.5/8
 elif r<298:t=[0]*7;g=4.5
 elif r<322:
  t=[0,0,0,0,1,1,0];c=['crimson']*7;g=4.5
  if r>=306:h=1.15;centers[str(r)]=[1.5];radii[str(r)]=.9
 elif r<348:
  t=[0,1,1,0,1,1,0];c=['lavender']*4+['crimson']*3;g=4.5-min(3,(r-322)*3/12)
  if r<340:t=[0,1,1,1,1,1,0]
  if 336<=r<348:h=1.15;centers[str(r)]=[-1.5,1.5];radii[str(r)]=.9
 elif r<354:t=[0]*7;g=1.5
 elif r<376:
  t=[0,1,1,1,2,2,0];c=['lavender']*7;g=1.5+min(3,max(0,r-354)*3/18)
 elif r<382:t=[0]*7;g=4.5
 elif r<404:
  t=[1]*7;c=['crimson']*2+['rose']*3+['lavender']*2;g=4.5-min(1.5,(r-382)*1.5/14)
  if 388<=r<392:c=['ochre']*7
 elif r<410:t=[0]*7
 elif r<438:
  t=[1,0,1,1,1,0,1];c=['lavender']*7
  if 416<=r<426:t[1]=t[5]=2
  if 426<=r<436:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.8
 elif r<458:
  g=3+1.5*min(1,(r-438)/8) if r<450 else 4.5-(r-450)*1.5/8
  t=[1 if abs(l-g)<=1.3 else 0 for l in range(7)]
 elif r<464:t=[0]*7
 elif r<482:
  t=[1]*7;c=['peach']*7;h=1.15;centers[str(r)]=[-2.4,-1.2,0,1.2,2.4];radii[str(r)]=.64
  if 474<=r<478:c=['lime']*7
 elif r<488:t=[2]*7;c=['peach']*7
 else:
  if r>=492:h=1.15;centers[str(r)]=[-.65,.65];radii[str(r)]=.72
 tiles.append(t);paint.append(c);guide.append(g);ceilings.append(h);box.append('peach');tint.append(tc)
# Authored jump cues include raised decks as well as full gaps.
jumpRows=[38,68,94,114,170,198,238,290,346,374,402,456,480]
for r,l in [(10,3),(108,3),(182,2),(234,3),(320,5),(398,3),(448,4)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r in range(12,N-8,32):
 l=round(guide[r])
 if tiles[r][l]==1:coins.append([r,l])
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in [(0,40,'tunnel','노란 출발 길과 쌍터널'),(40,76,'gap','단절 발판과 양쪽 블록'),(76,96,'islands','베이지 높은 발판'),(96,144,'wall','중앙 블록과 노란 측면 레일'),(144,178,'crossroads','중앙 구멍과 왼쪽 우회'),(178,206,'tunnel','노란 합류와 세 갈래 터널'),(206,246,'split','분홍빛 분리 레일'),(246,270,'single','좁은 길과 양쪽 블록'),(270,298,'split','붉은 길로 오른쪽 전환'),(298,348,'tunnel','붉은 터널과 보라색 왼쪽 길'),(348,382,'islands','높은 발판으로 좌우 전환'),(382,410,'crossroads','세 색상 합류 발판'),(410,438,'tunnel','밝은 분리 레일과 블록'),(438,464,'diagonal','노란 지그재그 길'),(464,482,'tunnel','다섯 터널과 초록 띠'),(482,500,'tunnel','베이지 발판과 마지막 쌍터널')]]
courses[10]={'title':'Solar Junction · Road 2','tiles':tiles,'roadPaint':paint,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':box,'tunnelColors':tint,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':jumpRows,'startSpeed':18,'reference':'296077.mp4 / full 38.3s, sampled every0.5s','instruction':'저중력으로 단절된 발판과 높은 블록을 연결하세요. 노란 길의 구멍, 붉은·보라색 좌우 전환, 다섯 터널 뒤 마지막 쌍터널을 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
