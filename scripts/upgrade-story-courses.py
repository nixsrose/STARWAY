import json,math
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'dist/story-data.js';courses=json.loads(p.read_text().split('=',1)[1].rstrip(';\n'))
mapping=[0,2,3,4,6]
titles=[
['Red Heat · Road 1','붉은 항로 · 교차 레일','붉은 항로 · 박스 회랑'],
['달의 이면 · 부유 발판','달의 이면 · 대각선 도약','달의 이면 · 분리 착지'],
['화성 협곡 · 두 갈래 항로','화성 협곡 · 교차 교량','화성 협곡 · 연속 합류'],
['목성 폭풍 · 터널 진입','목성 폭풍 · 이중 터널','목성 폭풍 · 박스와 터널'],
['토성 고리 · 끊긴 레일','토성 고리 · 가속과 도약','토성 고리 · 교대 발판'],
['심우주 · 복합 진입','심우주 · 분기와 터널','심우주 · 최종 항로']]
def map_guide(v):
 lo=math.floor(v);hi=math.ceil(v)
 return mapping[lo]+(mapping[hi]-mapping[lo])*(v-lo)
for index,c in enumerate(courses):
 c['title']=titles[index//3][index%3]
 if index==0:continue
 if c.get('presentationVersion')==2:continue
 old=c['tiles'];c['tiles']=[]
 for r,row in enumerate(old):
  out=[0]*7
  for l,t in enumerate(row):out[mapping[l]]=t
  # Solid cross bridges punctuate separated parallel lanes.
  if all(t in (1,3,4,5) for t in row) and r%28 in (0,1,2):
   out[1]=out[5]=1
  c['tiles'].append(out)
 c['guide']=[map_guide(v) for v in c['guide']]
 c['coins']=[[r,mapping[l]] for r,l in c['coins']]
 c['tunnelCenters']={}
 c['tunnelRadius']={}
 for si,sec in enumerate(c['sections']):
  sec['side']=mapping[sec['side']]
  if sec['type']=='tunnel' and index%3==1:
   lane=2 if si%2==0 else 4
   start,end=sec['start'],sec['end']
   previous=c['guide'][start-1] if start else 3
   for r in range(start,min(start+9,end)):
    c['guide'][r]=previous+(lane-previous)*(r-start+1)/9
    c['tiles'][r]=[1 if abs(l-c['guide'][r])<=1.15 else 0 for l in range(7)]
   for r in range(start+9,end-9):
    c['tiles'][r]=[0,0,1,0,1,0,0];c['guide'][r]=lane
    c['tunnelCenters'][str(r)]=[-1,1];c['tunnelRadius'][str(r)]=.6
   for r in range(end-9,end):
    c['guide'][r]=lane+(3-lane)*(r-(end-9)+1)/9
    c['tiles'][r]=[1 if abs(l-c['guide'][r])<=1.15 else 0 for l in range(7)]
  # Break up long parallel routes with gaps in one side rail, preserving the designed main route.
  if sec['type']=='split':
   for r in range(sec['start']+13,sec['end']-10):
    if r%11<2:
     side=0 if sec['side']>=3 else 6
     c['tiles'][r][side]=0
 # Re-seat pickups only when a newly connected/tunnel approach changed their floor.
 for coin in c['coins']:
  r,l=coin
  if c['tiles'][r][l]!=1:
   choices=[k for k,t in enumerate(c['tiles'][r]) if t==1]
   if not choices:raise ValueError('Coin without floor')
   coin[1]=min(choices,key=lambda k:abs(k-l))
 c['presentationVersion']=2
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'))+';\n')
print('Upgraded 17 story courses to seven-column authored roads and stage presentations.')
