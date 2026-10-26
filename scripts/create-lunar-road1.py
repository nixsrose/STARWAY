import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};paints=[];boxes=[];tints=[]
for r in range(236):
 t=[0,0,0,1,0,0,0];g=3;roof=0;paint=['indigo']*7;bc='violet'
 if r<62:
  if r%22<7:t=[0,1,1,1,1,1,0]
  if 18<=r<34:pass
  if 34<=r<48:pass
 elif r<66:t=[0]*7
 elif r<92:
  t=[0,2,0,2,0,2,0]
  if r<78:t=[0,2,2,2,2,2,0]
 else:
  paint=['peach']*7;bc='green';t=[0,1,0,1,0,1,0]
  if r<112:t=[0,1,1,1,1,1,0];g=3-min(1,(r-92)/12)
  if 112<=r<118:t=[0]*7;g=2
  if 118<=r<136:t=[0,1,1,1,1,1,0];g=2+min(2,2*(r-118)/16)
  if 136<=r<144:t=[0,1,0,0,1,1,0];g=4
  if 144<=r<150:t=[0]*7;g=4
  if 150<=r<170:t=[0,1,1,1,1,1,0];g=4-min(1,(r-150)/14);t[0]=t[6]=2
  if 150<=r<164:roof=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.6
  if 166<=r<170:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
  if 170<=r<176:t=[0]*7
  if 176<=r<202:t=[0,1,0,2,0,1,0];paint=['lavender']*7;bc='violet'
  if r>=202:t=[0,2,0,1,0,2,0];paint=['lavender']*7;bc='violet'
  if 210<=r<228:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
  if r>=228:t=[0,0,0,1,0,0,0]
 tiles.append(t);guide.append(g);ceilings.append(roof);paints.append(paint);boxes.append(bc);tints.append('green')
sections=[{'start':a,'end':b,'type':k,'side':s} for a,b,k,s in [(0,62,'crossroads',3),(62,66,'gap',3),(66,92,'wall',3),(92,112,'split',3),(112,118,'gap',3),(118,144,'diagonal',4),(144,150,'gap',4),(150,170,'tunnel',3),(170,176,'gap',3),(176,202,'wall',3),(202,236,'tunnel',3)]]
coins=[[7,3],[26,3],[44,3],[58,3],[98,5],[108,3],[124,2],[139,5],[151,4],[167,2],[185,1],[230,3]]
for r,l in [(54,3),(162,3)]:tiles[r][l]=3
courses[6]={'title':'Lunar Rift · Road 1','tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'roadPaint':paints,'boxColors':boxes,'tunnelColors':tints,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'startSpeed':18,'reference':'296049.mp4 / sampled every 0.5s','instruction':'보라 교차 발판과 분리 항로를 점프로 연결하고 초록 터널을 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
