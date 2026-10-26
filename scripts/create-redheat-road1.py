import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};colors=[];paints=[];boxcolors=[];length=220
for r in range(length):
 t=[1,0,1,1,1,0,1];g=3;ceiling=0;paint='gray'
 if r<66:
  # Three side-block stations, cross connectors and interruptions in the outer rails.
  if 0<=r<6 or 25<=r<32 or 49<=r<56:t[0]=t[6]=2
  if 6<=r<10 or 32<=r<36 or 56<=r<60:t[1]=t[5]=1
  if 36<=r<42:t[0]=t[6]=0
 elif r<105:
  t=[1,0,1,0,1,0,1];g=2
  if r<72:g=3-(r-66+1)/6;t=[1,0,1,1,1,0,1]
  if 76<=r<100:
   t[0]=t[6]=2;t[1]=t[5]=1;paint='brownSides'
 elif r<133:
  t=[0,0,1,0,1,0,0];g=2
  if 108<=r<120:
   ceiling=1.15;centers[str(r)]=[-1,1];radii[str(r)]=.6
  if 120<=r<129:
   t=[0,0,1,1,1,0,0];g=2+(r-120+1)/9
  if 129<=r<133:t=[0]*7;g=3
 elif r<149:
  # Raised pink bridge is an actual box-top platform: jump onto it, do not hit its front.
  t=[0,0,0,2,0,0,0];paint='pink'
 elif r<187:
  # Orange H-shaped platforms with rectangular holes beside the central route.
  t=[0,1,0,1,0,1,0];paint='orange'
  if (r-149)%18<5:t=[0,1,1,1,1,1,0]
 elif r<204:
  t=[0,0,0,1,0,0,0];paint='orange'
  if 190<=r<200:
   ceiling=1.15;centers[str(r)]=[0];radii[str(r)]=.6
 else:t=[0,0,0,1,0,0,0];paint='orange'
 tiles.append(t);guide.append(g);ceilings.append(ceiling);colors.append(paint);paints.append([('sand' if paint=='brownSides' and l in [0,1,5,6] else 'gray') if paint in ['gray','brownSides'] else 'lavender' if paint=='pink' else 'ochre' for l in range(7)]);boxcolors.append('lavender' if 133<=r<149 else 'rose')
sections=[{'start':a,'end':b,'type':kind,'side':3} for a,b,kind in [
 (0,66,'redheat_entry'),(66,105,'redheat_split'),(105,129,'redheat_tunnel'),
 (129,149,'redheat_raised'),(149,187,'redheat_holes'),(187,204,'redheat_last_tunnel'),(204,220,'redheat_finish')]]
coins=[[12,2],[34,4],[61,3],[76,2],[100,4],[122,2],[156,1],[174,5],[208,3]]
for r,l in [(62,3),(181,3)]:tiles[r][l]=3
courses[0]={'title':'Red Heat · Road 1','tiles':tiles,'coins':coins,'guide':guide,
 'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'roadColors':colors,'roadPaint':paints,'boxColors':boxcolors,'tunnelColors':['rose']*length,'sections':sections,'gravity':18,'revision':'redheat-road1-296006-v3',
 'startSpeed':18,'jumpRows':[127],'encounters':[s['type'] for s in sections],
 'reference':'296006.mp4 / 00:00-00:12.5, sampled every 0.5 seconds; rebuilt from reattached original 2026-10-15'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
