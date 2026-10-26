import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=390;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[0,1,1,1,1,1,0];g=3;h=0;c=['indigo']*7
 if r<42:t=[2,2,1,1,1,2,2]
 elif r<64:
  t=[1]*7;c=['electricBlue']*7;g=3+min(2,(r-42)*2/12)
  if 54<=r<64:t[2]=t[3]=t[4]=2
 elif r<70:t=[0]*7;g=5
 elif r<106:
  g=5-min(2,(r-70)*2/16);c=[['electricBlue','indigo','magenta','crimson'][min(3,(r-70)//9)]]*7
 elif r<112:t=[0]*7
 elif r<150:
  c=[['crimson','magenta','indigo','electricBlue'][min(3,(r-112)//10)]]*7
  if r>=138:t=[1]*7;g=3+min(2,(r-138)*2/12)
 elif r<180:
  c=['crimson']*7;g=5;t=[1,1,0,0,0,1,1]
 elif r<186:t=[0]*7;g=5
 elif r<220:
  t=[2]*7;c=['lavender']*7;g=5 if r<196 else 5-min(4,(r-196)*4/24)
  if 200<=r<208:t[3]=0
 elif r<226:t=[0]*7;g=1
 elif r<246:
  t=[1]*7;g=1+min(2,(r-226)*2/14);c=[['electricBlue','indigo','magenta'][min(2,(r-226)//7)]]*7
 elif r<252:t=[0]*7
 elif r<262:c=['magenta']*7
 elif r<280:t=[0,0,0,1,0,0,0];c=['lime']*7
 elif r<286:t=[0]*7;g=3+(r-280)/3
 elif r<310:
  t=[2,2,2,1,2,2,2];c=['lavender']*7;c[3]='crimson';g=5
 elif r<340:
  t=[0,2,2,1,2,2,0];c=['lavender']*7;c[3]='crimson';g=5-min(2,(r-310)*2/16)
 elif r<346:t=[0]*7
 elif r<370:t=[0,0,0,1,0,0,0];c=['indigo']*7
 else:
  t=[0,2,1,1,1,2,0];c=['indigo']*7
  if r>=376:h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxes.append('violet');tints.append('blue')
for r,l in [(24,3),(90,3),(132,3),(234,2),(270,3),(330,3)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r,l in [(12,3),(47,4),(80,4),(101,3),(126,3),(146,5),(162,5),(232,2),(260,3),(272,3),(324,3),(356,3),(380,3)]:
 if tiles[r][l]==1:coins.append([r,l])
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in [(0,42,'box_channel','보라색 블록 통로'),(42,64,'wall','파란 바닥과 중앙 블록 우회'),(64,70,'gap','첫 색상 발판 점프'),(70,106,'islands','파랑에서 붉은색으로 변하는 발판'),(106,112,'gap','분리된 붉은 발판 점프'),(112,150,'crossroads','색상 변화와 오른쪽 전환'),(150,180,'split','중앙이 끊긴 붉은 레일'),(180,186,'gap','높은 보라 발판 진입'),(186,220,'raised_window','중앙 구멍을 건너는 높은 발판'),(220,226,'gap','높은 발판에서 색상 발판으로'),(226,252,'islands','파랑·보라 연속 점프'),(252,280,'single','초록색 좁은 연결 길'),(280,286,'gap','오른쪽 보라 블록 상단 착지'),(286,310,'wall','붉은 중앙길과 보라 상단'),(310,340,'box_channel','붉은 중앙 통로로 합류'),(340,346,'gap','마지막 연결 길 점프'),(346,370,'single','좁은 보라 연결 길'),(370,390,'tunnel','보라 블록과 마지막 직선 터널')]]
courses[12]={'title':'Misty · Road 1','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':[62,104,178,198,218,244,278,338],'startSpeed':18,'gravity':18,'reference':'296115.mp4 / full26.34s every0.5s; gameplay approx2–23s','instruction':'보라 블록 사이를 지나 색상 발판을 점프로 연결하세요. 붉은 분리 레일에서 높은 발판으로 올라가 중앙 구멍을 넘고, 초록색 좁은 길 뒤 오른쪽 블록에 착지하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
