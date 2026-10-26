"""7-2:296166.mp4,45.659s; inspected every second, opening HUD checked full resolution."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxpaint=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];c=['gray']*7;g=3;h=0;bp=[None]*7
 if r<66:
  if 6<=r<17 or 24<=r<35 or 42<=r<53:h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 elif r<112:
  t=[0,1,0,1,0,1,0];c=['ochre']*7;c[1]=c[5]='rose'
  if r<82 or r>=100:t=[0,1,1,1,1,1,0]
  g=3-min(2,(r-66)/7)
  if 84<=r<98:h=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.65
 elif r<136:
  t=[0,1,0,1,0,1,0];c=['ochre']*7
  if r<124:t[3]=2;bp[3]='peach'
  if r<120:t[2]=t[4]=1
  g=1
 elif r<160:
  t=[0,1,1,1,1,1,0];c=['lime' if (r//5+l)%2 else 'ochre' for l in range(7)];g=1+min(3,(r-136)*3/18)
 elif r<192:
  t=[1]*7;c=['rust']*7;g=4
  if r//7%2:t[1]=t[3]=t[5]=0
 elif r<232:
  t=[1]*7;c=['rust']*7;g=4
  for l in [0,2,6]:c[l]='lime' if r//6%2 else 'pink'
 elif r<252:
  t=[1]*7;c=['rust']*7;g=4
  if r<244:t[1]=t[3]=t[5]=0
 elif r<360:
  t=[1]*7;c=['rust']*7;g=4
  # Pillar lanes and transverse walls alternate, with a two-lane opening.
  phase=(r-252)//27;offset=(r-252)%27
  if offset<13:
   for l in [0,2,6]:t[l]=2;bp[l]='peach'
  if phase%2==0:
   g=4 if offset<13 else 4-min(3,(offset-13)*3/12)
   if 3<=offset<10:t[1]=t[3]=2;bp[1]=bp[3]='peach'
  else:
   g=1 if offset<13 else 1+min(3,(offset-13)*3/12)
   if 3<=offset<10:t[3]=t[4]=t[5]=2;bp[3]=bp[4]=bp[5]='peach'
 elif r<390:
  t=[1]*7;c=['rust']*7;g=1
  if 378<=r<388:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<424:
  t=[1]*7;c=['rust']*7;g=1
  for l in [0,3,5,6]:
   if (r//6+l)%3==0:c[l]='pink'
 elif r<446:
  t=[1]*7;c=['rust']*7;g=1
  if 428<=r<440:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<470:
  t=[1]*7;c=['gray']*7;g=1+min(2,(r-446)*2/18)
  for l in range(7):
   if l in [0,6]:c[l]='lime'
   elif l in [2,4]:c[l]='ochre'
 else:
  t=[0,0,0,1,0,0,0];c=['peach']*7
  if r>=484:h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxpaint.append(bp)
for r in [19,61,103,145,183,223,247,353,384,418,458,479]:
 l=round(guide[r])
 if tiles[r][l]==1 and paints[r][l]!='pink':tiles[r][l]=3
segments=[(0,66,'tunnel','회색 외길의 연속 복숭아 터널'),(66,112,'split','분홍·주황 분기와 좌우 직선 터널'),(112,136,'wall','중앙 블록 왼쪽 우회'),(136,160,'crossroads','초록·주황 연결 발판'),(160,192,'grid','갈색 구멍 격자'),(192,232,'hazard','초록·진홍 색상 바닥'),(232,252,'grid','두 번째 구멍 격자'),(252,360,'box_channel','복숭아 기둥과 교대 횡단벽 통로'),(360,390,'tunnel','세 갈래 복숭아 터널'),(390,424,'hazard','갈색 도로의 진홍 위험칸'),(424,446,'tunnel','두 번째 세 갈래 터널'),(446,470,'crossroads','회색·초록·주황 합류'),(470,500,'tunnel','복숭아 외길과 도착 터널')]
sections=[dict(start=a,end=b,type=k,name=n,side=3) for a,b,k,n in segments]
course=dict(title='Nebula Passage · Road 2',tiles=tiles,roadPaint=paints,guide=guide,ceilings=ceilings,tunnelCenters=centers,tunnelRadius=radii,boxColors=['peach']*N,boxPaint=boxpaint,tunnelColors=['peach']*N,coins=[[r,round(guide[r])] for r in range(20,N-5,43) if tiles[r][round(guide[r])]==1 and paints[r][round(guide[r])]!='pink'],bridges=[],sections=sections,encounters=[s['type'] for s in sections],jumpRows=[],gravity=30,startSpeed=18,reference='296166.mp4 ·45.659s ·0–45s at1-second intervals; HUD1700 verified',instruction='높은 중력에서 점프보다 경로 선택에 집중하세요. 연속 터널과 왼쪽 우회로를 지나 구멍 격자, 복숭아 블록 통로와 진홍 위험칸을 피해 마지막 중앙 터널로 진입하세요.')
if len(courses)>19:courses[19]=course
else:courses.append(course)
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
(root/'data/nebula-road2-reference.json').write_text(json.dumps(dict(video='296166.mp4',duration=45.659,sections=sections,gravity='원작 HUD1700. 현재 중력 범위8–30의 고중력30 적용.',notes='영상 순서와 색상·구멍·기둥·횡단벽·직선터널을 7열500행에 재구성. 정확한 치수는 추정이며 통로 폭은 기체 충돌폭 기준 조정. 터널 주변 추가 박스는 이전 합의대로 없음.'),ensure_ascii=False,indent=2)+'\n')
