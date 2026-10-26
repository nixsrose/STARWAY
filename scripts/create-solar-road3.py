import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=480;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[0,0,1,1,1,0,0];g=3;h=0;box='sand';c=['ochre' if (l+r//4)%2 else 'amber' for l in range(7)]
 if r<40:
  t=[1 if abs(l-3)<= (1 if r<10 else 2) else 0 for l in range(7)]
 elif r<62:
  t=[0,0,0,1,0,0,0];c=['aqua']*7;h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 elif r<76:
  t=[1]*7;g=3+min(2,(r-62)*2/14)
 elif r<124:
  t=[0,1,0,0,0,1,0];g=5
  if 98<=r<104:t=[0]*7
  if r>=110:g=5-(r-110)*2/14;t=[0,1,1,1,1,1,0]
 elif r<160:
  t=[0,0,0,1,0,0,0]
  if (r//8)%2==0:t[4]=1
 elif r<184:
  t=[0,0,0,1,0,0,0];c=['aqua']*7;h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 elif r<188:t=[0]*7
 elif r<210:
  t=[2]*7;c=['sand']*7;g=3-min(1,(r-188)/8) if r<198 else 2+min(1,(r-202)/8) if r>=202 else 2
  if 198<=r<202:t[3]=0
 elif r<228:
  t=[0,0,1,1,1,0,0]
 elif r<250:
  t=[0,0,0,1,0,0,0];c=['aqua']*7;h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 elif r<290:
  t=[0,0,0,1,0,0,0]
  if (r//8)%2:t[2]=1
  else:t[4]=1
 elif r<310:
  t=[1]*7;g=3-min(1,(r-290)/18)
 elif r<410:
  t=[1,1,1,0,0,1,0];g=2; c=['aqua']*5+c[5:]
  # Open rectangles on the left, a parallel orange rail on the right.
  if r%28<12:t=[1,0,1,0,0,1,0];g=2
  if r%28>=12:g=2
  if 342<=r<348 or 378<=r<384:t=[0]*7
 elif r<432:
  t=[1]*7;g=2+min(1,(r-410)/18)
 elif r<438:t=[0]*7
 elif r<462:
  t=[1]*7
  if r>=452:t=[0,0,1,1,1,0,0]
 else:
  t=[0,0,0,1,0,0,0];c=['aqua']*7;h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxes.append(box);tints.append('aqua')
for r,l in [(24,3),(116,4),(152,3),(222,3),(276,3),(332,2),(402,2),(448,3)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r in range(12,N-10,32):
 l=round(guide[r])
 if tiles[r][l]==1:coins.append([r,l])
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in [(0,40,'checker','황금 격자 출발 발판'),(40,62,'tunnel','첫 청록 단일 터널'),(62,76,'crossroads','좌우 연결 발판'),(76,124,'split','단절된 두 갈래 황금 레일'),(124,160,'single','좁은 격자 길'),(160,184,'tunnel','청록 터널과 점프 준비'),(184,188,'gap','높은 베이지 발판 진입'),(188,210,'islands','중앙 구멍이 있는 높은 발판'),(210,250,'tunnel','좁은 길과 두 번째 청록 터널'),(250,290,'single','좌우 돌출 격자 길'),(290,310,'crossroads','왼쪽 청록 경로 진입'),(310,410,'crossroads','청록 사각 창과 오른쪽 황금 레일'),(410,432,'diagonal','중앙으로 합류'),(432,438,'gap','마지막 황금 발판 점프'),(438,462,'checker','넓은 황금 격자 발판'),(462,480,'tunnel','마지막 청록 단일 터널')]]
courses[11]={'title':'Solar Junction · Road 3','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':[96,182,340,376,430],'startSpeed':18,'reference':'296078.mp4 / full32.39s, every0.5s review','instruction':'황금 격자 길과 청록 터널을 따라가세요. 높은 발판의 구멍을 피하고 왼쪽 청록 사각 길에서 점프한 뒤 마지막 중앙 터널로 합류하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
