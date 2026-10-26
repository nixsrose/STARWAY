"""Authored reconstruction from 296009.mp4; screen-space shapes, not original game source."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
length=374;tiles=[];guide=[];ceilings=[];centers={};radii={};colors=[];boxcolors=[];tunnelcolors=[]
for r in range(length):
 t=[0]*7;g=3;roof=0;paint='green';bc='white';tc='red'
 if r<70:
  # Alternating wide landings, a one-lane bridge, and left/right wall stations.
  if r<14:t=[0,1,1,1,1,1,2]
  elif r<30:t=[0,0,0,1,1,1,0];g=3+min(1,(r-14)/8)
  elif r<40:t=[0,0,0,0,1,0,0];g=4
  elif r<56:t=[2,1,1,1,1,1,0];g=4-min(2,(r-40)/10)
  else:t=[0,1,1,1,1,1,2];g=2+min(1,(r-56)/10)
 elif r<108:
  paint='cyan'
  if r<80:t=[0,1,1,1,1,1,2]
  elif r<92:t=[0,2,2,1,2,2,0]
  elif r<96:t=[0]*7
  else:t=[2,1,1,1,1,1,0]
 elif r<144:
  paint='cyan';bc='pink';t=[0,0,0,1,0,0,0]
  if r<119:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
  if 120<=r<136:t=[0,2,0,1,0,2,0]
 elif r<180:
  paint='red';t=[0,1,0,1,0,1,0]
  if (r-144)%18<6:t=[0,1,1,1,1,1,0]
 elif r<218:
  paint='yellow' if r<199 else 'blue'
  t=[0,1,1,1,1,1,0]
  if r%12<4:t=[1]*7
 elif r<246:
  paint='blue' if r<232 else 'gray';t=[0,1,0,1,0,1,0]
  if r>=236:t[0]=t[6]=2
 elif r<282:
  paint='pink';t=[0,1,0,1,0,1,0]
  # A broad landing lets the player choose a rail before the central rail ends.
  if r<255:t=[0,1,1,1,1,1,0];g=3+(r-246)/8
  else:g=4;t=[0,1,0,1,1,1,0]
  if r>=258:t=[0,1,0,0,1,1,0]
  if r>=270:t[0]=t[6]=2
 elif r<302:
  paint='yellow';t=[2,1,1,1,1,1,2];g=4-min(1,(r-282)/10)
 elif r<306:
  paint='yellow';t=[0]*7
 elif r<316:
  paint='yellow';t=[0,1,1,2,1,1,0]
 elif r<336:
  paint='yellow';t=[0,1,1,1,1,1,0]
  if r<328:t[0]=t[6]=2
 else:
  paint='yellow';t=[0,1,1,1,1,1,0]
  if r<361:roof=1.15;centers[str(r)]=[-2,-1,0,1,2];radii[str(r)]=.5
 tiles.append(t);guide.append(g);ceilings.append(roof);colors.append(paint);boxcolors.append(bc);tunnelcolors.append(tc)
sections=[{'start':a,'end':b,'type':kind,'side':side} for a,b,kind,side in [
 (0,70,'diagonal',3),(70,108,'crossroads',3),(108,144,'tunnel',3),(144,180,'crossroads',3),
 (180,218,'wide',3),(218,246,'split',3),(246,282,'split',4),(282,302,'wide',3),
 (302,316,'gap',3),(316,336,'wide',3),(336,361,'tunnel',3),(361,374,'finish',3)]]
coins=[[8,2],[45,4],[76,1],[101,4],[130,3],[166,1],[190,5],[213,2],[239,3],[268,5],[289,2],[324,4],[365,3]]
for r,l in [(173,3),(329,3)]:tiles[r][l]=3
courses[1]={'title':'Red Heat · Road 2','tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,
 'tunnelCenters':centers,'tunnelRadius':radii,'roadColors':colors,'boxColors':boxcolors,'tunnelColors':tunnelcolors,
 'sections':sections,'startSpeed':18,'jumpRows':[91,300],'encounters':[s['type'] for s in sections],
 'reference':'296009.mp4 / 00:00-00:21.923; 0.5-second frame samples',
 'instruction':'좌우 전환 도로와 세 갈래 레일, 흰 박스와 마지막 다중 터널을 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
