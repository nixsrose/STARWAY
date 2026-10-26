"""7-1: 296165.mp4 (33.727s), frame-by-frame contact sheet at 1-second intervals."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxpaint=[];boxcolors=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];c=['ochre']*7;g=3;h=0;bp=[None]*7
 if r<32:pass
 elif r<56:
  t=[0,1,0,0,0,1,0];g=3+min(2,(r-32)/8)
 elif r<92:
  t=[0,0,0,1,0,0,0];c=['lime']*7;g=5-min(2,(r-56)/10)
  if r<76:t=[0,2,1,1,1,1,2];bp[1]=bp[6]='white'
 elif r<120:c[3]='pink'
 elif r<148:pass
 elif r<210:
  t=[0,1,0,0,0,1,0];c[1]='electricBlue';c[5]='white';g=3+min(2,(r-148)/8) if r<190 else 5-min(4,(r-190)*4/16)
  if 170<=r<178:t[5]=2;bp[5]='white'
  if 192<=r<202:t[5]=2;bp[5]='white'
 elif r<250:
  t=[0,1,0,0,0,1,0];g=1
 elif r<272:
  t=[0,2,0,0,0,1,0];c[1]='rose';bp[1]='white';g=1
 elif r<312:
  t=[0,1,0,0,0,1,0];c[1]='white';c[5]='lime';g=1
 elif r<340:
  t=[0,1,1,1,1,1,0];c=['gray']*7;g=1+min(4,(r-312)*4/24)
 elif r<364:
  t=[0,1,0,0,0,1,0];c[1]='peach';c[5]='electricBlue';g=5
  if r<354:h=1.15;centers[str(r)]=[-2];radii[str(r)]=.65
 elif r<392:
  t=[0,1,0,1,0,1,0];c=['peach']*7;g=5
  if 374<=r<382:t=[0]*7
 elif r<426:
  t=[0,1,0,0,0,1,0];c=['rose']*7;g=5
  if r<400:t[5]=2;bp[5]='white'
 elif r<460:
  t=[0,1,0,0,0,1,0];c=['rose']*7;g=5
  if 438<=r<448:t[1]=t[5]=0
  if 450<=r<456:t[2]=1
 else:
  t=[0,0,0,0,0,1,0];c=['rose']*7;g=5
  if r>=480:h=1.15;centers[str(r)]=[2];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxpaint.append(bp);boxcolors.append('white')
for r in [15,82,137,228,299,330,417,473]:
 l=round(guide[r])
 if tiles[r][l]==1 and paints[r][l]!='pink':tiles[r][l]=3
segments=[(0,32,'single','주황 진입 외길'),(32,56,'split','중앙 단절과 좌우 주황 분기'),(56,92,'box_channel','흰 벽 사이 초록 외길'),(92,120,'hazard','진홍 위험판을 넘는 저중력 점프'),(120,148,'single','복숭아 연결 외길'),(148,210,'split','파랑·흰색 쌍레일과 공중 좌우 전환'),(210,250,'split','주황 쌍레일과 왼쪽 착지'),(250,272,'raised_window','흰 블록 상단 착지'),(272,312,'split','흰색·초록색 분리 레일'),(312,340,'crossroads','회색 합류 발판과 오른쪽 전환'),(340,364,'tunnel','왼쪽 라벤더 터널과 오른쪽 파란 우회로'),(364,392,'islands','세 갈래 복숭아 레일과 단절 점프'),(392,426,'raised_window','흰 장애물과 분홍 쌍레일'),(426,460,'islands','분홍 단절 레일 점프'),(460,500,'tunnel','오른쪽 외길과 라벤더 도착 터널')]
sections=[dict(start=a,end=b,type=k,name=n,side=3) for a,b,k,n in segments]
course=dict(title='Nebula Passage · Road 1',tiles=tiles,roadPaint=paints,guide=guide,ceilings=ceilings,tunnelCenters=centers,tunnelRadius=radii,boxColors=boxcolors,boxPaint=boxpaint,tunnelColors=['lavender']*N,coins=[[r,round(guide[r])] for r in range(12,N-5,41) if tiles[r][round(guide[r])]==1 and paints[r][round(guide[r])]!='pink'],bridges=[],sections=sections,encounters=[s['type'] for s in sections],jumpRows=[29,89,145,187,247,371,435],gravity=8,startSpeed=18,reference='296165.mp4 ·33.727s; 0–33s inspected at1-second intervals',instruction='낮은 중력의 긴 체공을 이용해 갈라진 주황 레일과 진홍 위험판을 넘으세요. 흰 블록과 파랑·초록 분기를 지나 세 갈래 단절 발판에서 오른쪽 도착 터널로 연결하세요.')
if len(courses)>18:courses[18]=course
else:courses.append(course)
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
(root/'data/nebula-road1-reference.json').write_text(json.dumps(dict(video='296165.mp4',duration=33.727,sections=sections,gravity='영상 HUD100, 이전400/500보다 긴 체공. 현재 에디터 허용 범위의 최저중력8로 재구성.',notes='7열500행, 영상 순서·색상·분기·블록·직선터널을 유지하되 실제 점프 도달거리로 간격 조정. 미세한 대각선은 칸 좌표로 근사. 긴 분홍 레일은 rose, 진홍 위험판은 pink로 구분.'),ensure_ascii=False,indent=2)+'\n')
