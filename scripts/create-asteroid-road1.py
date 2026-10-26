"""6-1:296146.mp4,28.544s; overview2s and0–24s every1s."""
import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=480;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[];boxpaint=[]
for r in range(N):
 t=[0,0,0,1,0,0,0];c=['lemon']*7;g=3;h=0;bp=[None]*7
 if r<20:pass
 elif r<28:t[3]=2
 elif r<54:
  t=[0,1,0,1,0,1,0];g=3+min(2,(r-28)*2/20)
  if r<50:t[4]=1
 elif r<74:
  t=[0,2,0,2,0,1,0];g=5
  if (r-54)//6%2:t[1]=1
  else:t[3]=1
 elif r<80:t=[0]*7;g=5
 elif r<98:
  t=[1,1,0,1,1,1,1];g=5-min(2,(r-80)*2/16)
 elif r<126:
  t=[0,1,0,1,0,1,0];h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65;c=['ochre']*7
 elif r<148:t=[2,1,2,1,2,1,2];c=['ochre']*7
 elif r<220:
  t=[1,0,1,0,1,0,1];c=['peach']*7;g=3+min(1,(r-148)/12)
  if r<162:t[3]=1
  if 160<=r<166:t[0]=t[2]=t[6]=2
  if 176<=r<181:t=[1]*7;c=['electricBlue']*7
  if 188<=r<196:t[2]=t[4]=2
  if 206<=r<212:t=[0]*7
 elif r<240:t=[1,0,1,0,1,0,1];c=['white']*7;g=4
 elif r<254:
  t=[0,1,0,1,1,1,0];c=['white']*7;c[1]=c[5]='lime';g=4+min(1,(r-240)/10)
 elif r<336:
  t=[2,1,0,0,0,1,2];c=['lime']*7;g=5
  if 276<=r<282 or 314<=r<320:t[1]=t[5]=0
  if 292<=r<298:t[3]=1
 elif r<390:
  t=[2,1,0,0,0,1,2];c=['lemon']*7;g=5
  if 350<=r<356:t[1]=t[5]=0
 elif r<426:
  t=[2,1,0,0,0,1,2];c=['electricBlue']*7;g=5
  if r<398:t[5]=2;bp[5]='electricBlue'
 elif r<450:t=[2,1,0,0,0,1,2];c=['lemon']*7;g=5
 else:
  t=[0,1,0,0,0,1,0];c=['lemon']*7;g=5
  if r>=456:h=1.15;centers[str(r)]=[-2,2];radii[str(r)]=.65
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxes.append('white');tints.append('green');boxpaint.append(bp)
for r,l in [(12,3),(91,4),(173,4),(231,4),(307,5),(374,5),(444,5)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r in range(9,478,29):
 l=round(guide[r])
 if tiles[r][l]==1:coins.append([r,l])
segments=[(0,28,'single','노란 외길과 첫 높은 발판'),(28,54,'split','세 갈래 노란 레일과 오른쪽 전환'),(54,80,'wall','흰 블록 사이 우회와 단절 점프'),(80,98,'crossroads','넓은 연결로와 중앙 합류'),(98,126,'tunnel','세 갈래 초록 직선 터널'),(126,148,'box_channel','흰 기둥 사이 중앙 통로'),(148,188,'split','주황 네 갈래 레일과 파란 연결판'),(188,220,'islands','흰 가로 블록과 끊긴 레일 점프'),(220,254,'crossroads','흰 레일에서 오른쪽 초록 레일로'),(254,336,'islands','흰 벽 사이 초록 쌍레일 연속 점프'),(336,390,'split','노란 쌍레일과 단절 구간'),(390,426,'raised_window','파란 높은 발판과 쌍레일'),(426,450,'split','노란 마지막 연결 레일'),(450,480,'tunnel','초록 쌍터널과 도착')]
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in segments]
courses[15]={'title':'Asteroid Field · Road 1','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'boxPaint':boxpaint,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':[14,72,182,204,274,312,348,384],'startSpeed':18,'gravity':18,'reference':'296146.mp4 ·28.544s; 2s overview,0–24s at1s','instruction':'노란 발판을 넘고 흰 블록 오른쪽으로 우회하세요. 초록 터널 뒤 여러 갈래 레일에서 경로를 선택하고 끊긴 초록·노란 레일을 점프로 이어 마지막 초록 쌍터널로 들어가세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
