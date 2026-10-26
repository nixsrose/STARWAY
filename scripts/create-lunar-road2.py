import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js'
courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=340;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];g=3;paint=['electricPurple']*7;bc='blue';roof=0
 # 0–3 s: purple crossbars with two rectangular windows, then needle road.
 if r<54:
  if r%18<6:t=[1]*7
  elif r<36:t=[1,0,0,1,0,0,1]
 elif r<60:t=[0]*7
 elif r<102:
  t=[0,1,0,1,0,1,0];paint=['lavender']*7
  if 66<=r<78:paint[1]=paint[5]='electricBlue'
  if 82<=r<88 or 96<=r<102:t=[1]*7;paint=['white']*7
 elif r<132:
  paint=['lavender']*7;t=[1,0,0,1,0,0,1]
  if r%18<6 or r>=114:t=[1]*7
  g=3+min(2,(r-114)/8) if r>=114 else 3
 elif r<172:
  t=[0,1,1,0,1,1,0];paint=['electricPurple']*7;g=5
  if r<140:t=[1]*7
  if r>=152:t[0]=t[6]=2
  if 156<=r<166:t[3]=1;paint[3]='pink'
 elif r<206:
  t=[0,1,1,1,1,1,0];paint=['gray']*7;g=5-min(2,(r-194)/10) if r>=194 else 5
  if r<180:paint[3]='pink';t[0]=t[6]=2
  if 188<=r<194:paint[3]='pink'
  if r>=194:t[0]=t[6]=2
 elif r<212:t=[0]*7
 elif r<240:
  t=[0,2,2,2,2,2,0];paint=['electricBlue']*7
  if r>=226:t=[0,2,0,0,0,2,0];g=5
  else:g=3+min(2,(r-212)/8)
 elif r<270:
  t=[0,1,0,0,0,1,0];paint=['white']*7;g=5
  if r<248:t[0]=t[6]=2
  if 258<=r<264:t[0]=t[6]=2
 elif r<288:
  t=[0,1,1,0,1,1,0];paint=['electricPurple']*7;g=5
  if r>=278:t=[1]*7;g=5-min(2,(r-278)/8)
 elif r<294:t=[0]*7
 else:
  t=[0,1,0,1,0,1,0];paint=['electricBlue']*7
  if r<304:t=[0,1,1,1,1,1,0]
  if 312<=r<326:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
  if r>=326:t=[0,0,0,1,0,0,0];paint=['gray']*7
 tiles.append(t);paints.append(paint);guide.append(max(1,min(5,g)));ceilings.append(roof);boxes.append(bc);tints.append('blue')
for r,l in [(48,3),(146,5),(302,3)]:tiles[r][l]=3
sections=[{'start':a,'end':b,'type':k,'side':s} for a,b,k,s in [(0,54,'crossroads',3),(54,60,'gap',3),(60,102,'split',3),(102,132,'crossroads',5),(132,172,'split',5),(172,206,'wall',3),(206,212,'gap',3),(212,240,'wall',5),(240,270,'split',5),(270,288,'diagonal',3),(288,294,'gap',3),(294,340,'tunnel',3)]]
coins=[[12,3],[37,3],[72,1],[94,3],[110,3],[145,5],[167,5],[184,5],[200,3],[220,3],[234,5],[253,1],[272,5],[284,3],[305,3],[333,3]]
coins=[(r,l) for r,l in coins if tiles[r][l]==1 and paints[r][l]!='pink']
courses[7]={'title':'Lunar Rift · Road 2','tiles':tiles,'roadPaint':paints,'guide':guide,'coins':coins,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'startSpeed':18,'reference':'296050.mp4 / 0.5 second frame sequence','instruction':'보라 교차로에서 오른쪽 분기로 이동하고 붉은 위험 바닥을 피해 파란 발판과 중앙 터널로 연결하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
