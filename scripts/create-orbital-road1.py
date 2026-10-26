"""Frame-by-frame layout transcription of 296017.mp4. Units scaled to game physics."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
tiles=[];guide=[];ceilings=[];centers={};radii={};colors=[];paints=[];boxcolors=[];tunnelcolors=[]
for r in range(338):
 t=[0]*7;g=3;roof=0;paint='mint';rowpaint=['mint']*7;tc='lemon'
 if r<66:t[3]=1
 elif r<108:
  # The video has a solid GRAY central slab with a mint stripe, not three holes.
  t=[1,0,1,1,1,0,1];rowpaint=['gray']*7;rowpaint[3]='mint'
 elif r<133:
  t=[1,1,1,1,1,1,1];rowpaint=['gray','mint','gray','mint','gray','mint','gray']
  if r>=126:t=[0,1,0,1,0,1,0]
 elif r<139:t=[0]*7
 elif r<166:
  paint='lemon';t=[0,1,0,1,0,1,0];rowpaint=['lemon']*7
  if r<148 or r>=159:t=[0,1,1,1,1,1,0];rowpaint=['lemon','lemon','gray','lemon','gray','lemon','lemon']
 elif r<172:t=[0]*7;paint='magenta';rowpaint=['magenta']*7
 elif r<187:
  paint='magenta';rowpaint=['magenta']*7;t=[1,1,1,1,1,1,1]
 elif r<191:t=[0]*7;paint='magenta';rowpaint=['magenta']*7
 elif r<211:
  # Broad mint block top above the magenta approach.
  paint='magenta';rowpaint=['magenta']*7;t=[0,2,2,2,2,2,0]
 elif r<234:
  paint='mint';rowpaint=['mint']*7;t=[0,2,2,0,2,2,0];g=4
  if r<219:t[3]=2;g=3+min(1,(r-211)/7)
 elif r<240:
  paint='magenta';rowpaint=['magenta']*7;t=[0]*7;g=4-min(1,(r-234)/5)
 elif r<262:
  paint='magenta';rowpaint=['magenta']*7;t=[0,0,1,1,1,0,0]
 elif r<278:
  paint='ochre';rowpaint=['ochre']*7;t=[0,1,0,1,0,1,0]
  if r<268 or r>=272:t=[0,1,1,1,1,1,0]
  if r>=272:g=3+(r-272)/7
 elif r<286:
  paint='ochre';rowpaint=['ochre']*7;t=[0,1,1,1,1,1,0];g=3+min(2,(r-272)/7)
 elif r<300:
  paint='ochre';rowpaint=['ochre']*7;t=[0,1,0,0,0,1,0];g=5
  # Mint bridge with open arches at the two outside orange lanes.
  roof=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.6;tc='mint'
 elif r<317:
  paint='ochre';rowpaint=['ochre']*7;t=[0,1,1,1,1,1,0];g=5-min(2,2*(r-300)/14)
 else:
  paint='ochre';rowpaint=['ochre']*7;t[3]=1
  if r<331:roof=1.15;centers[str(r)]=[0];radii[str(r)]=.6
 tiles.append(t);guide.append(g);ceilings.append(roof);colors.append(paint);paints.append(rowpaint);boxcolors.append('mint');tunnelcolors.append(tc)
sections=[{'start':a,'end':b,'type':kind,'side':side} for a,b,kind,side in [
 (0,66,'funnel',3),(66,108,'wide',3),(108,133,'crossroads',3),(133,139,'gap',3),
 (139,166,'split',3),(166,172,'gap',3),(172,187,'wide',3),(187,191,'gap',3),
 (191,211,'wall',3),(211,234,'split',4),(234,240,'gap',3),(240,262,'wide',3),
 (262,286,'crossroads',5),(286,300,'tunnel',5),(300,317,'diagonal',3),(317,338,'tunnel',3)]]
coins=[[15,3],[47,3],[80,2],[112,5],[129,1],[155,3],[180,4],[246,2],[254,4],[264,1],[281,4],[306,2],[333,3]]
for r,l in [(120,3),(308,3)]:tiles[r][l]=3
courses[3]={'title':'Orbital Drift · Road 1','tiles':tiles,'coins':coins,'guide':guide,'ceilings':ceilings,
 'tunnelCenters':centers,'tunnelRadius':radii,'roadColors':colors,'roadPaint':paints,'boxColors':boxcolors,'tunnelColors':tunnelcolors,
 'bridges':[],'sections':sections,'startSpeed':18,'jumpRows':[131,164,185,232],'encounters':[s['type'] for s in sections],
 'reference':'296017.mp4 / 0.5-second layout transcription, revision 2',
 'instruction':'중앙 항로에서 민트 박스 위 오른쪽 레일로 이동하고, 주황 교량의 아치를 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
