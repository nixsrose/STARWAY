import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=246;tiles=[];guide=[];paints=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[0,1,1,1,1,1,0];g=3;paint=['moonGray']*7;roof=0
 if r<38:
  t=[1]*7
  if 22<=r<34:
   t[0]=t[6]=2;roof=1.15;centers[str(r)]=[-3,3];radii[str(r)]=.6
 elif r<44:t=[0]*7
 elif r<70:
  g=3+min(2,2*(r-48)/12) if r>=48 else 3
  t=[0,1,1,1,1,1,0]
  if r>=64:t=[0,1,1,0,1,1,0]
 elif r<76:t=[0]*7;g=5
 elif r<104:
  g=5-min(4,4*(r-78)/18) if r>=78 else 5;t=[0,1,1,1,1,1,0]
  if r>=98:t=[0,1,1,0,0,0,0]
  if 86<=r<96:t[0]=2
 elif r<110:t=[0]*7;g=1
 elif r<138:
  g=1+min(4,4*(r-112)/18) if r>=112 else 1;t=[0,1,1,1,1,1,0]
  if r>=132:t=[0,0,0,0,1,1,0]
 elif r<144:t=[0]*7;g=5
 elif r<170:
  g=5-min(4,4*(r-146)/18) if r>=146 else 5;t=[0,1,1,1,1,1,0]
  if r>=164:t=[0,1,1,0,0,0,0]
  if 144<=r<150 or 158<=r<164:paint=['lime']*7
  if 150<=r<158:paint=['electricBlue']*7
 elif r<176:t=[0]*7;g=1
 elif r<202:
  g=1+min(2,2*(r-178)/12) if r>=178 else 1;t=[0,1,1,1,1,1,0]
  if r<182 or r>=194:paint=['lime']*7
 else:
  t=[0,1,1,1,1,1,0];paint=['moonGray']*7
  if 204<=r<216:roof=1.15;centers[str(r)]=[-1,0,1];radii[str(r)]=.48
  if 216<=r<224:t[5]=2
  if r>=224:roof=1.15;centers[str(r)]=[-1,0,1];radii[str(r)]=.48
 tiles.append(t);guide.append(g);paints.append(paint);ceilings.append(roof);boxes.append('white');tints.append('aqua')
for r,l in [(16,3),(120,3),(192,3)]:tiles[r][l]=3
coins=[(r,l) for r,l in [(8,3),(28,3),(51,3),(66,5),(80,5),(99,1),(114,1),(128,5),(149,5),(166,1),(184,2),(200,3),(220,2),(237,3)] if tiles[r][l]==1]
sections=[{'start':a,'end':b,'type':k,'side':s} for a,b,k,s in [(0,38,'tunnel',3),(38,44,'gap',3),(44,70,'split',5),(70,76,'gap',5),(76,104,'wall',1),(104,110,'gap',1),(110,138,'diagonal',5),(138,144,'gap',5),(144,170,'diagonal',1),(170,176,'gap',1),(176,202,'diagonal',3),(202,246,'tunnel',3)]]
courses[8]={'title':'Lunar Rift · Road 3','tiles':tiles,'guide':guide,'coins':coins,'roadPaint':paints,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'tunnelColors':tints,'boxColors':boxes,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'startSpeed':18,'reference':'296051.mp4 / 0.5 second frame sequence','instruction':'회색 분리 발판을 좌우로 이동하며 점프하고 초록·파랑 발판 뒤 청록색 터널을 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
