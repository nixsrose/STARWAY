"""296018.mp4 layout, sampled at 0.5s: cyan box corridor, raised fork, violet slab, twin tubes."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};colors=[];paints=[];boxcolors=[];tunnelcolors=[]
for r in range(432):
 t=[1]*7;g=3;roof=0;paint='slate';tc='ice'
 if r<80:
  # Staggered solid side blocks, alternating broad shoulders and narrow walls.
  if (r//14)%2==0:t=[2,2,1,1,1,2,2]
  else:t=[2,1,1,1,1,1,2]
 elif r<92:t=[2]*7
 elif r<104:t=[2,1,1,1,1,1,2]
 elif r<116:t=[2]*7
 elif r<128:t=[2,1,1,1,1,1,2]
 elif r<138:t=[2,1,2,2,2,1,2]
 elif r<166:
  t=[2,1,1,1,1,1,2];g=3+min(2,2*(r-140)/22) if r>=140 else 3
  if r>=156:t=[2,2,1,1,1,2,2]
 elif r<230:
  # Elevated cyan twin rails and the connecting transverse block.
  t=[0,2,2,0,2,2,0];g=5
  if 186<=r<195:t=[0,2,2,2,2,2,0]
 elif r<252:
  paint='violet';t=[0,1,1,1,1,1,0];g=5
  if 244<=r<252:t[2]=t[3]=2
 elif r<282:
  paint='violet';t=[0,1,1,0,1,1,0];g=5
  if r<260:t[3]=1
 elif r<308:
  paint='violet';t=[0,2,2,2,2,2,0];g=5-min(1,(r-290)/14) if r>=290 else 5
 elif r<350:
  paint='aqua';t=[2,1,1,1,1,1,2];g=4
  if r>=330:g=4+min(1,(r-330)/14)
  if 314<=r<328:
   roof=1.15;centers[str(r)]=[-1,1];radii[str(r)]=.6
  if 328<=r<336:t=[2,2,1,1,1,2,2]
 elif r<370:
  paint='aqua';t=[0,1,1,1,1,1,0];g=5
  if 350<=r<358:roof=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.6
 else:
  paint='aqua';t=[0,1,0,0,0,1,0];g=5
  if r<384:t[0]=t[6]=2
  if 398<=r<426:roof=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.6
 tiles.append(t);guide.append(g);ceilings.append(roof);colors.append(paint);paints.append([paint]*7);boxcolors.append('cyan');tunnelcolors.append(tc)
sections=[{'start':a,'end':b,'type':kind,'side':side} for a,b,kind,side in [
 (0,80,'wall',3),(80,138,'wall',3),(138,166,'diagonal',5),(166,230,'split',5),
 (230,252,'wide',5),(252,282,'split',5),(282,308,'wall',5),(308,350,'tunnel',3),
 (350,370,'crossroads',5),(370,398,'split',5),(398,432,'tunnel',5)]]
coins=[[9,3],[30,2],[52,4],[73,3],[99,1],[120,5],[145,4],[239,1],[258,4],[270,5],[331,3],[344,4],[365,1],[389,5],[429,1]]
for r,l in [(148,3),(341,3)]:tiles[r][l]=3
courses[4]={'title':'Orbital Drift · Road 2','tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,
 'tunnelCenters':centers,'tunnelRadius':radii,'roadColors':colors,'roadPaint':paints,'boxColors':boxcolors,'tunnelColors':tunnelcolors,'bridges':[],
 'sections':sections,'startSpeed':18,'jumpRows':[74,98,122,150,276],'encounters':[s['type'] for s in sections],
 'reference':'296018.mp4 / 00:00-00:25.425; sampled every 0.5s',
 'instruction':'청록 박스 위로 점프해 두 갈래 레일을 연결하고, 보라색 분기를 지나 푸른 터널로 진입하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
