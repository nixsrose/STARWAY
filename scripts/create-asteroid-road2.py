"""6-2 reconstruction from 296148.mp4, inspected every second (0–35s)."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};bp=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];c=['ochre']*7;g=3;h=0;b=[None]*7
 if r<66:
  if 16<=r<42:t=[1]*7
  if 42<=r<48:t=[1,1,1,0,1,1,1]
  if 48<=r<60:t=[0,0,1,1,1,0,0]
  for l in range(7):c[l]='peach' if (r//6+l)%2 else 'ochre'
 elif r<88:
  t=[1,1,1,1,1,1,1];c=['gray']*7;g=3+min(2,(r-66)/8)
  if 74<=r<80:t[2]=t[3]=0
  if 80<=r<86:t[0]=t[1]=0
 elif r<152:
  t=[0,1,0,0,0,1,0];g=5;c=['gray']*7;c[5]='ochre'
  if (r-88)//9%3==1:c[1]='pink'
  if 114<=r<120:t[4]=1;c[4]='ochre'
  if 138<=r<144:t[4]=1;c[4]='ochre'
 elif r<174:
  t=[0,1,1,1,1,1,0];g=5-min(2,(r-152)/9)
 elif r<216:
  t=[0,2,2,1,2,2,0];c=['ochre']*7
  if r<182 or r>=210:t=[0,2,2,2,2,2,0]
 elif r<306:
  t=[0,0,0,1,0,0,0];c[3]='peach' if r//7%2 else 'ochre'
  if 238<=r<244:t[2]=1
  if 274<=r<280:t[4]=1
 elif r<330:
  t=[1]*7
  for l in range(7):c[l]='peach' if (r//6+l)%2 else 'ochre'
  if r<312:t[3]=0
  g=3+min(2,(r-312)/8) if r>=312 else 3
 elif r<372:
  t=[0,1,0,0,0,1,0];g=5
  c[1]=c[5]='lime' if r//8%2 else 'ochre'
  if 352<=r<362:h=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.65
 elif r<426:
  t=[0,2,2,2,2,2,0];g=5
  if r<396 or 406<=r<414:t[3]=0
 elif r<464:
  t=[0,1,0,1,0,1,0];g=5-min(2,(r-426)/10)
  c[1]=c[5]='lime' if r//8%2 else 'ochre';c[3]='peach'
  if r<450:t[4]=1
 else:
  if r<482:t=[0,1,1,1,1,1,0]
  c=['peach' if (r//6+l)%2 else 'ochre' for l in range(7)]
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);bp.append(b)
for r in [12,164,230,290,341,443,488]:
 l=round(guide[r])
 if tiles[r][l]==1:tiles[r][l]=3
segments=[(0,66,'crossroads','주황 체크 발판과 중앙 단절'),(66,88,'islands','회색 분리 발판과 오른쪽 전환'),(88,152,'split','붉은 위험 레일과 주황 우회로'),(152,174,'crossroads','중앙 외길로 합류'),(174,216,'raised_window','분홍 블록 상단과 중앙 홈'),(216,306,'single','긴 주황 외길과 작은 측면 발판'),(306,330,'crossroads','넓은 체크 발판과 쌍레일 분기'),(330,352,'split','초록 주황 교대 쌍레일'),(352,372,'tunnel','복숭아색 직선 쌍터널'),(372,426,'raised_window','중앙이 뚫린 분홍 상단 발판'),(426,464,'split','세 갈래 레일과 중앙 합류'),(464,500,'single','체크 십자 발판과 마지막 외길')]
sections=[dict(start=a,end=b,type=k,name=n,side=3) for a,b,k,n in segments]
courses[16]=dict(title='Asteroid Field · Road 2',tiles=tiles,roadPaint=paints,guide=guide,ceilings=ceilings,tunnelCenters=centers,tunnelRadius=radii,boxColors=['rose']*N,boxPaint=bp,tunnelColors=['peach']*N,coins=[[r,round(guide[r])] for r in range(10,N-4,37) if tiles[r][round(guide[r])]==1],bridges=[],sections=sections,encounters=[s['type'] for s in sections],jumpRows=[39,168,204,303,369],startSpeed=18,gravity=18,reference='296148.mp4 · 36.079s · inspected 0–35s every second',instruction='넓은 체크 발판을 지나 오른쪽 주황 레일을 선택하세요. 분홍 블록의 상단과 중앙 홈을 넘고 초록·주황 쌍레일, 직선 터널 뒤 상단 발판을 거쳐 중앙 외길로 합류하세요.')
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
(root/'data/asteroid-road2-reference.json').write_text(json.dumps(dict(video='296148.mp4',duration=36.079,inspection='0–35 seconds at 1-second intervals',sections=sections,notes='영상의 순서·색상·분기·홈·상단 발판을 7열 500행으로 재구성. 원본의 정확한 물리 치수는 영상만으로 확정할 수 없어 점프 가능한 비율로 조정.'),ensure_ascii=False,indent=2)+'\n')
