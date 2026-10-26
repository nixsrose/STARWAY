"""296142.mp4: Misty Road 2, timeline sampled every 2s and 16–31s every 1s."""
import json
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'dist/story-data.js'
courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
N=500;tiles=[];paints=[];guide=[];ceilings=[];centers={};radii={};boxes=[];tints=[]
for r in range(N):
 t=[1]*7;c=[['electricBlue','indigo','magenta','crimson'][(r//7+l//2)%4] for l in range(7)];g=3;h=0
 if r<32:t=[0,0,0,1,0,0,0];c=['electricBlue']*7
 elif r<104:g=3+min(2,max(0,r-88)*2/12)
 elif r<140:
  width=[1,3,1,3,1,3][min(5,(r-104)//6)];t=[0 if abs(l-3)<=width//2 else 1 for l in range(7)];c=['crimson']*7;g=5
 elif r<188:g=5-min(2,(r-140)*2/18)
 elif r<194:t=[0]*7;c=['electricBlue']*7
 elif r<208:t=[2]*7;c=['crimson']*7
 elif 228<=r<238 or 260<=r<270:t=[2]*7;c=['crimson']*7
 elif r<296:g=3-min(2,max(0,r-276)*2/16)
 elif r<328:
  c=['electricBlue']*7;g=1
  width=[1,2,3,4,3,2,1,2][(r-296)//4]
  for l in range(2,2+width):t[l]=2;c[l]='pink'
 elif r<370:
  c=['crimson' if l<(r-328)//5%7 else 'electricBlue' for l in range(7)];g=1+min(4,(r-328)*4/34)
 elif r<454:
  c=[['crimson','magenta','indigo'][(l+r//8)%3] for l in range(7)];g=5
  for a,b in [(370,390),(402,422),(434,454)]:
   if a<=r<b:h=1.15;centers[str(r)]=[-2,0,2];radii[str(r)]=.65
 elif r<476:
  c=['electricBlue']*7;g=5-min(2,(r-454)*2/16)
 else:t=[0,0,0,1,0,0,0];c=['electricBlue']*7
 tiles.append(t);paints.append(c);guide.append(g);ceilings.append(h);boxes.append('red');tints.append('red')
for r,l in [(25,3),(155,4),(245,3),(345,3),(465,3)]:
 if tiles[r][l]==1:tiles[r][l]=3
coins=[]
for r,l in [(14,3),(53,2),(88,4),(120,5),(164,3),(215,3),(248,3),(282,2),(313,1),(354,4),(383,5),(414,5),(445,5),(486,3)]:
 if tiles[r][l]==1:coins.append([r,l])
sections=[{'start':a,'end':b,'type':k,'name':name,'side':3} for a,b,k,name in [(0,32,'single','파란색 좁은 진입로'),(32,104,'checker','붉은색·파란색 격자 도로'),(104,140,'split','계단형 중앙 구멍과 오른쪽 우회'),(140,188,'checker','색상 격자 합류'),(188,208,'islands','끊긴 진입과 첫 높은 붉은 발판'),(208,238,'wall','두 번째 가로 발판 점프'),(238,270,'wall','세 번째 가로 발판 점프'),(270,296,'crossroads','왼쪽 경로로 전환'),(296,328,'wall','계단형 분홍 위험 블록 우회'),(328,370,'diagonal','색상 경계와 오른쪽 전환'),(370,390,'tunnel','첫 번째 세 갈래 직선 터널'),(390,402,'checker','터널 사이 연결로'),(402,422,'tunnel','두 번째 세 갈래 직선 터널'),(422,434,'checker','마지막 터널 접근'),(434,454,'tunnel','세 번째 세 갈래 직선 터널'),(454,476,'funnel','중앙으로 모이는 출구'),(476,500,'single','파란색 좁은 도착 항로')]]
courses[13]={'title':'Misty · Road 2','tiles':tiles,'roadPaint':paints,'guide':guide,'ceilings':ceilings,'tunnelCenters':centers,'tunnelRadius':radii,'boxColors':boxes,'tunnelColors':tints,'coins':coins,'bridges':[],'sections':sections,'encounters':[s['type'] for s in sections],'jumpRows':[185,222,254],'startSpeed':18,'gravity':18,'reference':'296142.mp4 · 44.326s; timeline 0–42s at2s +16–31s at1s','instruction':'중앙의 계단형 구멍을 오른쪽으로 우회하고 높은 붉은 발판을 연속 점프로 넘으세요. 분홍 위험 블록은 왼쪽으로 피한 뒤 세 번의 직선 터널과 좁은 출구를 통과하세요.'}
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
