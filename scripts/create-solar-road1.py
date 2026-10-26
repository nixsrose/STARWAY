import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js'
courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=304;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[0]*7;paint=['peach']*7;g=3;roof=0;box='peach';tint='peach'
 if r<54:
  nodes=[(0,3),(8,3),(20,4.5),(32,1.5),(44,4.5),(53,3)]
  for (a,u),(b,v) in zip(nodes,nodes[1:]):
   if a<=r<=b:g=u+(v-u)*(r-a)/(b-a);break
  for l in range(7):
   if abs(l-g)<=1.25:t[l]=1
 elif r<58:pass
 elif r<82:
  t=[0,0,1,1,1,0,0];paint=['rust']*7
 elif r<86:pass
 elif r<106:
  t=[2,2,2,2,2,2,2] if r<96 else [1,1,1,1,1,1,1]
  if r>=96:t=[1,1,0,1,0,1,1]
 elif r<134:
  t=[2,1,2,1,2,1,2];roof=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.58
 elif r<138:pass
 elif r<162:
  t=[0,1,1,0,1,1,0];paint=['electricBlue']*7;g=4.5
 elif r<166:g=4.5
 elif r<190:
  t=[0,1,1,0,1,1,0];paint=['crimson']*4+['lime']*3;g=4.5
 elif r<194:g=4.5
 elif r<220:
  t=[2,1,2,0,2,1,2];paint=['lemon']*7;g=5
 elif r<224:g=5
 elif r<244:
  t=[0,1,1,0,1,1,0];paint=['crimson']*7;g=5
  if r>=230:t[4]=2
 elif r<248:g=5
 elif r<278:
  paint=['crimson']*7
  if r<260:t=[1,1,1,1,1,1,1];g=5-(r-248)*2/12
  else:t=[1,1,0,1,0,1,1];g=3
 else:
  t=[0,2,0,1,0,2,0];paint=['crimson']*7
  if r>=286:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.65;tint='gold'
 tiles.append(t);paints.append(paint);guide.append(g);ceilings.append(roof);boxes.append(box);tints.append(tint)
for r,l in [(48,3),(118,3),(180,5),(236,5)]:tiles[r][l]=3
coins=[(r,l) for r,l in [(7,3),(23,4),(40,3),(70,2),(99,3),(125,3),(150,5),(177,4),(208,5),(234,5),(255,4),(270,3),(298,3)] if tiles[r][l]==1]
sections=[{'start':a,'end':b,'type':k,'name':name,'side':side} for a,b,k,name,side in [(0,54,'diagonal','분홍빛 지그재그 길',3),(54,58,'gap','첫 발판 점프',3),(58,82,'islands','갈색 분리 발판',3),(82,86,'gap','베이지 발판 진입 점프',3),(86,106,'crossroads','세 갈래 연결 발판',3),(106,134,'tunnel','베이지 다중 터널',3),(134,138,'gap','보라 레일 진입 점프',5),(138,162,'split','보라색 분리 레일',5),(162,166,'gap','색상 레일 점프',5),(166,190,'split','빨강·초록 분리 레일',5),(190,194,'gap','노란 통로 진입 점프',5),(194,220,'wall','노란 장애물 통로',5),(220,224,'gap','붉은 레일 진입 점프',5),(224,244,'wall','오른쪽 블록 우회',5),(244,248,'gap','마지막 분기 진입 점프',5),(248,278,'crossroads','붉은 합류와 중앙 구멍',3),(278,304,'tunnel','좁은 중앙 길과 마지막 터널',3)]]
courses[9]={'title':'Solar Junction · Road 1','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'startSpeed':18,'reference':'296076.mp4 / 0–16 seconds, 0.5-second review','instruction':'지그재그 길에서 방향을 바꾸고 끊긴 색상 레일을 점프로 연결하세요. 노란 통로에서는 블록 사이를 지나 마지막 중앙 터널로 합류합니다.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
