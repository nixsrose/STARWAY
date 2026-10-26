import json,pathlib,math
p=pathlib.Path('dist/story-data.js');old=json.loads(p.read_text().removeprefix('const STORY_COURSES=').strip().rstrip(';'));courses=old[:21]
# Nine independent compositions: kind, length, entry lane, exit lane, width, gap.
recipes=[
('장거리 도약',50,[('gap',52,3,3,2,8),('rail',36,3,1,1,0),('gap',56,1,1,1,7),('rail',42,1,5,2,0),('gap',58,5,5,1,9),('teeth',40,5,3,1,0)]),
('공중 횡단',50,[('rail',48,3,0,1,0),('gap',55,0,2,2,6),('rail',40,2,6,1,0),('gap',55,6,4,1,7),('rail',48,4,0,1,0),('gap',58,0,3,1,8)]),
('착지 시험장',50,[('raised',46,3,3,1,0),('gap',50,3,3,1,5),('raised',48,3,1,1,0),('gap',54,1,1,1,7),('rail',44,1,5,1,0),('raised',50,5,3,1,0),('gap',50,3,3,1,6)]),
('장갑 미로',150,[('walls',54,3,0,1,0),('teeth',48,0,5,1,0),('walls',58,5,1,1,0),('fork',48,1,1,1,0),('walls',60,1,6,1,0),('teeth',52,6,3,1,0)]),
('상단 항로',150,[('raised',46,3,3,1,0),('rail',40,3,0,1,0),('raised',48,0,0,1,0),('gap',42,0,0,1,3),('raised',50,0,4,1,0),('rail',46,4,6,1,0),('raised',50,6,3,1,0)]),
('터널 관문',150,[('tunnel',48,3,3,1,0),('walls',46,3,0,1,0),('tunnel',45,0,0,1,0),('teeth',48,0,6,1,0),('tunnel',48,6,6,1,0),('gap',42,6,6,1,3),('tunnel',46,6,6,1,0)]),
('양분된 항로',100,[('fork',52,3,1,1,0),('gap',48,1,1,1,5),('teeth',46,1,6,1,0),('fork',54,6,5,1,0),('raised',48,5,5,1,0),('fork',54,5,0,1,0),('rail',44,0,3,1,0)]),
('감속의 경계',150,[('rail',52,3,0,1,0),('tunnel',45,0,0,1,0),('teeth',50,0,6,1,0),('gap',44,6,6,1,4),('walls',54,6,1,1,0),('raised',48,1,1,1,0),('rail',50,1,3,1,0)]),
('최종 귀환',100,[('teeth',44,3,0,1,0),('gap',46,0,0,1,5),('raised',45,0,2,1,0),('tunnel',40,2,2,1,0),('fork',46,2,5,1,0),('gap',48,5,3,1,5),('walls',48,3,6,1,0),('tunnel',42,6,6,1,0),('rail',44,6,3,1,0)])]
names=['도약','공중 전환','상단 착지','장벽 회피','위험 가장자리','직선 관문','분기 선택']
for index,(subtitle,gravity,segments) in enumerate(recipes):
 zone=index//3;theme=['Aurora Expanse','Iron Citadel','Event Horizon'][zone];palette=[('white','aqua','ice','#092b37'),('lavender','mint','lavender','#241a3d'),('sand','electricBlue','peach','#251d2e'),('ochre','slate','gold','#231b12'),('mint','moonGray','mint','#102624'),('white','indigo','blue','#121a33'),('lime','gray','green','#152017'),('electricPurple','sand','rose','#22132d'),('white','ochre','red','#280f17')][index];paint,accent,tint,bg=palette
 m=dict(title=f'{theme} · Road {index%3+1} / {subtitle}',tiles=[],roadPaint=[],boxPaint=[],boxColors=[],ceilings=[],tunnelColors=[],tunnelCenters={},tunnelRadius={},guide=[],coins=[],bridges=[],sections=[],jumpRows=[],startSpeed=18,gravity=gravity,gravityUnit='coefficient',fuelDrainMultiplier=1,instruction=[ '큰 단절 세 곳을 넘는 항로입니다. 착지 뒤 좁은 레일에서는 속도를 낮추세요.', '점프 중 좌우 이동이 필요합니다. 출발 전에 반대편 발판 방향을 확인하세요.', '발판과 블록 상단을 번갈아 밟습니다. 낮은 중력의 긴 체공을 고려하세요.', '기둥 장벽 사이를 횡단합니다. 진홍색 바닥을 피하며 안전한 색의 길을 따라가세요.', '높은 중력의 상단 항로입니다. 블록에 접근하기 전에 일찍 점프하세요.', '네 개의 직선 터널을 잇습니다. 터널 사이에서 차선을 바꾸고 내부에서는 점프하지 마세요.', '분기와 합류가 이어집니다. 다음 발판까지 연결되는 경로를 먼저 고르세요.', '회피 뒤 짧은 점프와 블록 진입이 이어집니다. 속도 18 이하에서 진입 타이밍을 익히세요.', '도약·상단 착지·터널·분기를 연속으로 통과하는 최종 항로입니다. 회복 구간에서 다음 경로를 확인하세요.' ][index])
 m['background']=dict(kind=['orbit','deep','star'][index%3],color=bg,dim=.18,image='')
 def row(tiles,lane,colors=None,height=0):
  r=len(m['tiles']);m['tiles'].append(tiles);m['roadPaint'].append(colors or [paint if abs(l-lane)<.65 else accent for l in range(7)]);m['guide'].append(lane);m['boxPaint'].append([accent if t in [2,8] else None for t in tiles]);m['boxColors'].append(paint);m['ceilings'].append(0);m['tunnelColors'].append(tint)
  if r%29==14 and tiles[round(lane)]==1:m['coins'].append([r,round(lane)])
 def path(lane,width,tile=1):
  left=max(0,min(7-width,int(round(lane))-(width-1)//2));return [tile if left<=l<left+width else 0 for l in range(7)]
 for r in range(20):row([1,1,1,3 if r==12 else 1,1,1,1],3)
 prev=3
 for si,(kind,length,a,b,width,gap) in enumerate(segments):
  # Twelve-row connectors permit a deliberate full-width transfer at moderate speed.
  start=len(m['tiles'])
  for q in range(8):
   lane=prev+(a-prev)*(q+1)/8;tiles=[1 if abs(l-lane)<1.45 else 0 for l in range(7)];row(tiles,lane)
  length=max(36,round(length*.72));body=len(m['tiles']);gapstart=17
  if kind in ['gap','raised']:m['jumpRows'].append(body+(gapstart-3 if kind=='gap' else 6))
  for q in range(length):
   if kind=='gap':lane=a+(b-a)*max(0,min(1,(q-gapstart)/max(1,gap)));tiles=path(round(lane),width);tiles=[0]*7 if gapstart<=q<gapstart+gap else tiles
   else:lane=a+(b-a)*q/max(1,length-1);tiles=path(round(lane),width)
   colors=[paint if abs(l-lane)<.65 else accent for l in range(7)]
   if kind in ['walls','teeth']:
    for l in range(7):
     if abs(l-lane)>1.15:tiles[l]=2 if kind=='walls' else 1;colors[l]='pink' if kind=='teeth' or si%2 else paint
   if kind=='raised' and 10<=q<length-6:tiles=path(round(lane),width,2)
   if kind=='fork':
    other=6-round(lane)
    if abs(other-lane)>2:tiles[other]=1;colors[other]='ochre'
   if kind=='tunnel' and 6<=q<length-6:
    lane=a;tiles=path(a,1);r=len(m['tiles']);m['tunnelCenters'][str(r)]=[a-3];m['tunnelRadius'][str(r)]=.49
   if kind=='gap' and gapstart+gap<=q<gapstart+gap+5:tiles=path(round(lane),3)
   # Course-specific silhouettes; preserve the pilot's verified central route.
   for l in range(7):
    distant=abs(l-lane)>1.5
    if not distant:continue
    if index==0 and kind=='gap' and not gapstart<=q<gapstart+gap and q<12:tiles[l]=1
    elif index==1 and kind in ['rail','gap'] and not(kind=='gap' and gapstart<=q<gapstart+gap):
     if l==6-round(lane) and q%12<9:tiles[l]=1;colors[l]=accent
    elif index==2 and kind=='raised' and q%10<5:tiles[l]=2;colors[l]=accent
    elif index==3 and kind=='walls':
     if q%11>=4:tiles[l]=0
     elif abs(l-lane)>2.2:tiles[l]=8;colors[l]=accent
    elif index==4 and kind=='raised' and 10<=q<length-6:tiles[l]=2 if q%14<10 else 0;colors[l]=accent
    elif index==5 and kind=='tunnel':tiles[l]=1 if q%14<7 else 0;colors[l]=accent
    elif index==6 and kind=='fork':
     if q<8 or q>=length-8:tiles[l]=1;colors[l]=accent
     elif l in [0,1,5,6]:tiles[l]=1;colors[l]=paint if l<3 else accent
    elif index==7 and kind=='teeth':
     if (l+q//5)%2:tiles[l]=0
    elif index==8 and kind in ['walls','rail','tunnel'] and abs(l-lane)>2.1:
     tiles[l]=8 if q%16<3 else (1 if q%16>10 else 0);colors[l]=accent
   row(tiles,lane,colors)
   if kind=='tunnel' and 6<=q<length-6:m['ceilings'][-1]=1.15
  prev=b
  # Fuel is earned after each challenge, off the immediate obstacle boundary.
  for q in range(6):
   t=path(round(prev),3);t[round(prev)]=3 if q==4 else 1;row(t,prev)
  m['sections'].append(dict(start=start,end=len(m['tiles']),type=kind,name={'gap':'도약 · 반대편 착지대 확인','rail':'정밀 조종 · 좁은 연결 레일','raised':'블록 상단 · 진입 전 점프','walls':'장벽 통로 · 좌우 회피','teeth':'위험 가장자리 · 안전 색상 유지','tunnel':'직선 터널 · 중앙 유지','fork':'분기 · 다음 합류점 확인'}[kind],side=round(a)))
 for q in range(14):
  lane=prev+(3-prev)*(q+1)/14;row([1]*7,lane)
 for q in range(12):row([1]*7,3)
 n=len(m['tiles']);assert n<=500
 m['finish']=dict(row=n-5,lane=3,type='road');m['encounters']=[s[0] for s in segments];courses.append(m)
p.write_text('const STORY_COURSES='+json.dumps(courses,separators=(',',':'),ensure_ascii=False)+';\n')
