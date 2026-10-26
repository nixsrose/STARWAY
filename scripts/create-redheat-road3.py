"""7-column interpretation of visible geometry in 296016.mp4."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};colors=[];boxcolors=[]
for r in range(238):
 t=[0,0,0,1,0,0,0];g=3;roof=0;paint='yellow'
 if r<42:
  if 18<=r<37:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
 elif r<62:
  t=[0,2,2,1,2,2,0]
  if r>=52:t=[0,2,1,1,1,2,0];g=3-min(1,(r-52)/8)
 elif r<66:
  t=[0]*7;g=2
 elif r<102:
  paint='red';g=2;t=[0,0,2,0,2,0,0]
  if r%16<5:t[3]=1
 elif r<120:
  paint='red';g=2;t=[0,0,1,0,1,0,0]
  if r<107 or r>=114:t[3]=1
  if r>=112:t[3]=2
 elif r<124:
  paint='gray';g=2;t=[0]*7
 elif r<166:
  paint='gray';g=2;t=[0,0,1,0,0,1,0]
  # Continuous left route with two transverse connectors and a right white box.
  if 134<=r<143 or 154<=r<166:t=[0,0,1,1,1,2,0]
  if r>=160:g=2+(r-160)/6
 elif r<180:
  paint='gray';g=3+min(2,(r-166)/12);t=[0,0,1,1,1,1,0]
 elif r<184:
  paint='gray';g=5;t=[0,0,1,1,1,1,0]
 elif r<188:
  paint='gray';g=5;t=[0]*7
 elif r<204:
  paint='gray';g=5;t=[0,0,0,0,0,2,0]
 else:
  paint='gray';g=5;t=[0,0,0,0,0,1,0]
  if 210<=r<231:roof=1.15;centers[str(r)]=[2];radii[str(r)]=.6
 tiles.append(t);guide.append(g);ceilings.append(roof);colors.append(paint);boxcolors.append('white')
sections=[{'start':a,'end':b,'type':kind,'side':side} for a,b,kind,side in [
 (0,18,'funnel',3),(18,42,'tunnel',3),(42,62,'wall',3),(62,66,'gap',2),
 (66,102,'split',2),(102,120,'crossroads',2),(120,124,'gap',2),(124,166,'crossroads',2),
 (166,184,'diagonal',5),(184,188,'gap',5),(188,204,'wall',5),(204,231,'tunnel',5),(231,238,'finish',5)]]
coins=[[8,3],[47,3],[57,2],[106,4],[116,2],[130,5],[148,2],[169,3],[177,4],[207,5],[233,5]]
for r,l in [(110,2),(179,5)]:tiles[r][l]=3
courses[2]={'title':'Red Heat · Road 3','tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,
 'tunnelCenters':centers,'tunnelRadius':radii,'roadColors':colors,'boxColors':boxcolors,
 'sections':sections,'startSpeed':18,'jumpRows':[60,118,182],'encounters':[s['type'] for s in sections],
 'reference':'296016.mp4 / 00:00-00:14.634; sampled every 0.5 seconds',
 'instruction':'흰 박스 위 좌우 레일과 단절 교량을 넘어 오른쪽 터널로 진입하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
