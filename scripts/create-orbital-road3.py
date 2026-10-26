import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};paints=[];boxes=[];tints=[]
for r in range(214):
 t=[0]*7;g=3;roof=0;paint=['sand']*7;tc='red'
 if r<44:
  g=3+min(1,r/16);t=[0,0,1,1,1,1,0]
  if 16<=r<24 or 36<=r<44:t[1]=1
 elif r<74:
  g=4;t=[0,1,1,0,1,1,0]
  if r<56:t[3]=1
  if 46<=r<70:roof=1.15;centers[str(r)]=[1];radii[str(r)]=.6
  t[0]=2
 elif r<94:
  t=[2,1,1,1,1,1,2];g=4-min(2,2*(r-74)/18)
 elif r<98:t=[0]*7;g=2
 elif r<118:
  t=[2,1,1,1,1,1,2];g=2
 elif r<140:
  t=[0,1,1,0,1,1,0];g=2
  if r<125 or r>=135:t[3]=1
  if 125<=r<135:t[0]=t[6]=1
 elif r<144:t=[0]*7;g=2
 elif r<156:
  t=[0,0,1,0,1,0,0];g=2;paint[2]='mint';paint[4]='pink'
 elif r<160:t=[0]*7;g=2
 elif r<184:
  t=[0,0,1,0,1,0,0];g=2
  if r>=170:t[1]=t[5]=2
  if r>=174:t[3]=1;g=2+min(1,(r-174)/9)
  if 170<=r<178:roof=1.15;centers[str(r)]=[-1,1];radii[str(r)]=.6;tc='gold'
 else:
  t=[0,2,2,1,2,2,0];g=3
  if 186<=r<204:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
  if r>=204:t=[0,0,0,1,0,0,0]
 tiles.append(t);guide.append(g);ceilings.append(roof);paints.append(paint);boxes.append('orange');tints.append(tc)
sections=[{'start':a,'end':b,'type':kind,'side':side} for a,b,kind,side in [(0,44,'diagonal',4),(44,74,'tunnel',4),(74,94,'wall',2),(94,98,'gap',2),(98,118,'wide',2),(118,140,'crossroads',2),(140,144,'gap',2),(144,156,'split',2),(156,160,'gap',2),(160,184,'tunnel',2),(184,214,'tunnel',3)]]
coins=[[8,3],[30,4],[58,2],[79,5],[106,1],[121,4],[138,2],[150,2],[164,2],[181,3],[208,3]]
for r,l in [(86,2),(132,2)]:tiles[r][l]=3
courses[5]={'title':'Orbital Drift · Road 3','tiles':tiles,'guide':guide,'coins':coins,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'roadPaint':paints,'boxColors':boxes,'tunnelColors':tints,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'startSpeed':18,'reference':'296019.mp4 / 0.5-second samples','instruction':'분홍 길은 접촉 시 폭발합니다. 민트 레일을 선택하거나 점프로 넘고 중앙 터널로 합류하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
