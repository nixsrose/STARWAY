"""7-3:296167.mp4,26.602s. 1s overview plus 12–24s at0.5s for gap sequence."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent;p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=432;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxpaint=[]
for r in range(N):
 t=[0,1,0,1,0,1,0];c=['gray']*7;g=3;h=0;bp=[None]*7
 if r<104:
  c[3]='ochre' if r//7%2==0 else 'gray'
  if r<16:t=[0,0,0,1,0,0,0]
  if 20<=r<26 or 56<=r<62:t=[0,1,1,1,1,1,0]
  if r>=64:c[1]=c[5]='ochre'
  if 68<=r<80 or 89<=r<100:h=1.15;centers[str(r)]=[-2,2] if r<89 else [-2,0,2];radii[str(r)]=.65
 elif r<132:t=[0,0,0,1,0,0,0]
 elif r<158:
  t=[0,0,1,1,1,0,0];c[2]=c[4]='aqua'
  if r>=146:t=[0,1,1,1,1,1,0];c[1]=c[5]='gray'
 elif r<172:
  t=[0,2,2,2,2,2,0];c=['lime']*7;bp=['rose']*7;bp[3]='lime'
 elif r<244:
  t=[0,1,0,1,0,1,0];c=['rose']*7
  if 194<=r<204 or 222<=r<232:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<250:
  t=[0,2,2,2,2,2,0];c=['pink']*7
 elif r<410:
  t=[1]*7;c=['lime' if (r//6+l)%2==0 else 'gray' for l in range(7)]
  if 268<=r<278:t[1]=t[5]=0
  if 300<=r<306:t[3]=0
  if 336<=r<342 or 374<=r<380:t=[0]*7
  if 350<=r<360:t[0]=t[1]=t[5]=t[6]=0
  if 392<=r<400:t[0]=t[1]=t[5]=t[6]=0
 else:
  t=[0,0,0,1,0,0,0];c=['lime']*7
  if r>=420:h=1.15;centers[str(r)]=[0];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxpaint.append(bp)
for r in [12,48,121,185,260,319,365,413]:
 if tiles[r][3]==1:tiles[r][3]=3
segments=[(0,64,'split','회색 외곽 레일과 주황 중앙 도로'),(64,104,'tunnel','주황 분기와 분홍 직선 터널'),(104,132,'single','회색 중앙 외길'),(132,158,'crossroads','청록 양옆 레일과 넓어지는 발판'),(158,172,'raised_window','초록 윗면의 높은 분홍 발판'),(172,244,'tunnel','분홍 세 갈래 레일과 연속 터널'),(244,250,'hazard','진홍 위험 블록 점프'),(250,294,'grid','초록·회색 체크 도로와 좌우 구멍'),(294,328,'islands','중앙 구멍 점프'),(328,366,'islands','가로 단절과 좁은 연결 발판'),(366,410,'islands','두 번째 단절 점프와 중앙 합류'),(410,432,'tunnel','초록 마지막 외길과 분홍 도착 터널')]
sections=[dict(start=a,end=b,type=k,name=n,side=3) for a,b,k,n in segments]
course=dict(title='Nebula Passage · Road 3',tiles=tiles,roadPaint=paints,guide=guide,ceilings=ceilings,tunnelCenters=centers,tunnelRadius=radii,boxColors=['rose']*N,boxPaint=boxpaint,tunnelColors=['rose']*N,coins=[[r,3] for r in range(14,N-5,37) if tiles[r][3]==1],bridges=[],sections=sections,encounters=[s['type'] for s in sections],jumpRows=[152,238,297,333,371],gravity=18,startSpeed=18,reference='296167.mp4 ·26.602s;1s overview,12–24s every0.5s;HUD500 verified',instruction='회색·주황 레일과 분홍 터널을 지나 높은 초록 발판에 착지하세요. 진홍 위험 블록은 밟지 말고 뛰어넘고, 초록·회색 체크 도로의 중앙 구멍과 가로 단절을 연속 점프로 이어 마지막 초록 외길로 진입하세요.')
if len(courses)>20:courses[20]=course
else:courses.append(course)
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
(root/'data/nebula-road3-reference.json').write_text(json.dumps(dict(video='296167.mp4',duration=26.602,sections=sections,gravity='원작 HUD500, 기존 대응 중력18',notes='7열432행. 분리 레일·터널·높은 발판·위험 블록·초록 회색 체크와 구멍 순서를 영상대로 재구성. 정확한 치수는 영상만으로 확정 불가하여 점프 도달거리 기준 조정. 후반 체크는 색상만 번갈아 바뀌며 실제 구멍만 tile0.'),ensure_ascii=False,indent=2)+'\n')
