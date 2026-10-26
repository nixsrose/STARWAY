"""Misty Road 3: video296145.mp4, 37.827s; 2s overview and1s detail samples."""
import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[1]*7;c=['lime' if (r//6+l)%2 else 'sand' for l in range(7)];g=3;h=0
 if r<24:t=[0,0,0,1,0,0,0];c=['sand']*7
 elif r<52:
  width=min(3,1+(r-24)//8);t=[1 if abs(l-3)<=width else 0 for l in range(7)]
 elif r<66:pass
 elif r<128:
  t=[0,1,0,1,0,1,0];c=['ochre']*7
  if r<118:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<138:t=[2]*7;c=['ochre']*7
 elif r<170:pass
 elif r<190:
  width=2 if (r-170)%10<4 else 0;t=[1 if abs(l-3)<=width else 0 for l in range(7)]
 elif r<222:
  t=[0,1,0,0,0,1,0];c=['sand']*7
  if 198<=r<206 or 214<=r<222:t[3]=2
  h=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.65
 elif r<260:g=3
 elif r<308:
  t=[1,0,0,0,0,0,1];c=['rose']*7
  if r<270 or 276<=r<292 or r>=298:
   t[3]=1;c[3]='electricBlue'
   if r%12<5:t[2]=t[4]=1;c[2]=c[4]='electricBlue'
 elif r<338:pass
 elif r<354:
  g=3-min(2,(r-338)*2/12);lane=round(g);t=[1 if abs(l-lane)<=1 else 0 for l in range(7)]
 elif r<360:t=[0]*7;g=1
 elif r<392:
  g=1+min(4,(r-360)*4/28);lane=round(g);t=[1 if abs(l-lane)<=1 else 0 for l in range(7)]
 elif r<438:
  g=5 if r<410 else 5-min(4,(r-410)*4/18)
  if 398<=r<410 or 430<=r<438:
   t[3]=0
   if 402<=r<406 or 432<=r<436:t[2]=t[4]=0
 elif r<466:
  g=1+min(2,(r-438)*2/16) if r<454 else 3-min(2,(r-454)*2/10)
  lane=round(g);t=[1 if abs(l-lane)<=1 else 0 for l in range(7)]
 else:
  g=1;t=[1,1,1,0,0,0,0];c=['sand']*7
  if r>=480:h=1.15;centers[str(r)]=[-2];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxes.append('ochre');tints.append('gold')
for r,l in [(19,3),(151,3),(244,3),(320,3),(455,3)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r in range(12,490,31):
 l=round(guide[r])
 if tiles[r][l]==1:coins.append([r,l])
segments=[(0,24,'single','좁은 모래색 진입로'),(24,66,'funnel','계단식으로 넓어지는 초록 격자'),(66,118,'tunnel','세 갈래 긴 직선 터널'),(118,138,'wall','터널 출구와 높은 연결 블록'),(138,170,'checker','초록 격자 합류'),(170,190,'single','십자 발판과 중앙 진입'),(190,222,'islands','양쪽 터널 사이 연속 중앙 발판 점프'),(222,260,'checker','초록 격자 도로'),(260,308,'islands','파란 연결 발판 연속 점프'),(308,338,'checker','초록 격자 착지 구간'),(338,354,'funnel','왼쪽으로 좁아지는 길'),(354,360,'gap','좁은 길 사이 점프'),(360,392,'diagonal','왼쪽에서 오른쪽으로 꺾이는 좁은 길'),(392,438,'split','십자형 구멍 좌우 우회'),(438,466,'diagonal','계단식 지그재그 출구'),(466,480,'single','왼쪽 좁은 도착 항로'),(480,500,'tunnel','마지막 짧은 직선 터널')]
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in segments]
courses[14]={'title':'Misty · Road 3','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':[122,188,204,268,290,352],'startSpeed':18,'gravity':18,'reference':'296145.mp4 ·37.827s; overview2s, detail5–16s/20–35s at1s','instruction':'긴 직선 터널 뒤 높은 연결 블록을 넘고 중앙 발판과 파란 발판을 연속 점프로 연결하세요. 초록 지그재그 길과 십자 구멍을 우회한 뒤 왼쪽의 마지막 터널로 들어가세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
