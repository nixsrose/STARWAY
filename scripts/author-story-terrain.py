import json,pathlib,math
p=pathlib.Path('dist/story-data.js');maps=json.loads(p.read_text().removeprefix('const STORY_COURSES=').strip().rstrip(';'))
# Whole-course layouts, with independently authored lengths, route knots and events.
plans=[
 dict(n=310,title='깊은 공백',knots=[(0,3),(310,3)],gaps=[(45,54),(104,116),(188,201),(254,264)],decks=[],tunnels=[],fuel=[28,153,282],sections=[(0,'좁아지는 출발 항로'),(37,'첫 장거리 도약'),(82,'작은 착지섬'),(150,'중간 정박지'),(179,'가장 긴 공백'),(241,'마지막 도약')]),
 dict(n=350,title='엇갈린 섬',knots=[(0,3),(29,1),(54,1),(70,4),(103,4),(119,6),(157,6),(174,2),(220,2),(239,0),(290,0),(326,3),(350,3)],gaps=[(54,66),(103,115),(157,171),(220,235),(285,295)],decks=[],tunnels=[],fuel=[41,143,270,330],sections=[(0,'왼쪽 섬 진입'),(46,'오른쪽 공중 횡단'),(94,'외곽 착지대'),(148,'대각선 장거리 횡단'),(209,'왼쪽 끝 섬'),(278,'귀환 도약')]),
 dict(n=390,title='공중 계단',knots=[(0,3),(65,3),(110,1),(180,1),(224,5),(290,5),(350,3),(390,3)],gaps=[(88,96),(188,199),(313,323)],decks=[(34,66),(134,163),(240,273)],tunnels=[],fuel=[18,116,215,355],sections=[(0,'첫 상단 발판'),(74,'발판 아래 공백'),(124,'왼쪽 고가 발판'),(178,'고가 항로 전환'),(230,'오른쪽 공중 계단'),(300,'마지막 독립섬')]),
 dict(n=365,title='연속 협곡',knots=[(0,3),(35,3),(82,0),(143,6),(190,1),(255,5),(310,0),(350,3),(365,3)],gaps=[],decks=[],tunnels=[],fuel=[27,177,327],sections=[(0,'협곡 입구'),(46,'왼쪽 장벽'),(108,'긴 횡단 통로'),(171,'안쪽 굴곡'),(235,'이중 장벽'),(298,'좁은 출구')]),
 dict(n=420,title='고가 산업항',knots=[(0,3),(120,3),(153,0),(246,0),(284,5),(372,5),(411,3),(420,3)],gaps=[],decks=[(45,120),(168,246),(300,372)],tunnels=[],fuel=[25,143,278,397],sections=[(0,'첫 고가 승강'),(120,'바닥 연결로'),(157,'외곽 고가 레일'),(247,'우측 항로 이동'),(290,'긴 상단 주행'),(373,'귀환 하강')]),
 dict(n=410,title='직선 터널 수로',knots=[(0,3),(28,1),(115,1),(153,5),(237,5),(278,3),(410,3)],gaps=[],decks=[],tunnels=[(35,110,1),(160,230,5),(285,380,3)],fuel=[21,137,261,395],sections=[(0,'왼쪽 관문'),(35,'첫 장거리 터널'),(111,'열린 수로 전환'),(160,'오른쪽 터널'),(231,'중앙 항로 합류'),(285,'최종 직선 관문')]),
 dict(n=440,title='세 번의 갈림길',knots=[(0,3),(36,3),(72,1),(130,1),(166,3),(208,5),(274,5),(310,3),(349,0),(395,0),(430,3),(440,3)],gaps=[],decks=[],tunnels=[],fuel=[25,180,324,428],sections=[(0,'분기 광장'),(47,'좌우 쌍레일'),(143,'첫 합류 광장'),(187,'두 번째 갈림길'),(292,'두 번째 합류'),(332,'세 번째 장거리 분기')]),
 dict(n=470,title='우회와 지름길',knots=[(0,3),(40,3),(83,0),(156,0),(211,6),(298,6),(350,1),(412,1),(459,3),(470,3)],gaps=[],decks=[],tunnels=[(106,149,0),(252,290,6)],fuel=[29,183,337,449],sections=[(0,'중앙 광장'),(48,'외곽 우회로'),(99,'좌측 터널 경로'),(162,'중앙을 가로지르는 합류'),(234,'우측 우회 터널'),(309,'마지막 지름길 분기')]),
 dict(n=490,title='은하의 마지막 길',knots=[(0,3),(42,3),(80,1),(128,1),(174,5),(240,5),(278,2),(356,2),(399,6),(440,6),(482,3),(490,3)],gaps=[(90,97),(420,426)],decks=[(187,233)],tunnels=[(291,353,2)],fuel=[26,143,266,381,474],sections=[(0,'최종 항로 진입'),(53,'분리 항로'),(82,'첫 공백'),(154,'상단 항로 접근'),(187,'고가 갑판'),(250,'관문 앞 분기'),(291,'최종 터널'),(365,'마지막 대각선 횡단'),(409,'귀환 도약')])]
def interp(knots,r):
 for (a,x),(b,y) in zip(knots,knots[1:]):
  if a<=r<=b:return x+(y-x)*(r-a)/(b-a)
 return knots[-1][1]
for i,plan in enumerate(plans):
 m=maps[21+i];paint=m['roadPaint'][0][3];accent=['aqua','mint','electricBlue','slate','moonGray','indigo','gray','sand','ochre'][i];tint=m['tunnelColors'][0];n=plan['n'];m['title']=m['title'].split(' / ')[0]+' / '+plan['title'];m.update(tiles=[],roadPaint=[],boxPaint=[],boxColors=[],ceilings=[],tunnelColors=[],tunnelCenters={},tunnelRadius={},guide=[],coins=[],jumpRows=[],sections=[],bridges=[])
 for r in range(n):
  lane=interp(plan['knots'],r);center=round(lane);t=[0]*7;color=[accent]*7
  if i<3:
   width=1 if i==0 else 2
   if i==0 and (r<35 or 130<=r<163 or r>278):width=3
   if i==1 and any(b<=r<b+7 for a,b in plan['gaps']):width=3
   for l in range(7):
    if abs(l-center)<=(width-1)/2+.01:t[l]=1
   if width==2:t[min(6,center+1)]=1
   if any(a<=r<b for a,b in plan['gaps']):t=[0]*7
  elif i==3:
   t=[1 if abs(l-lane)<1.1 else (8 if abs(l-lane)>2 and r%23<12 else 2) for l in range(7)]
   if r<32 or r>340:t=[1]*7
  elif i==4:
   t=[1 if abs(l-lane)<1.1 else 0 for l in range(7)]
   # Independent parallel ground road is an optional safe detour around elevated decks.
   if 40<r<378:t[6 if center<3 else 0]=1
  elif i==5:
   t=[1 if abs(l-lane)<1.2 else 0 for l in range(7)]
   if not any(a-5<=r<b+5 for a,b,c in plan['tunnels']):
    for l in range(7):
     if abs(l-lane)>2.1 and r%27<8:t[l]=2
  elif i==6:
   other=6-lane;t=[1 if min(abs(l-lane),abs(l-other))<.85 else 0 for l in range(7)]
   if abs(lane-3)<.8 or r<40 or r>416:t=[1]*7
  elif i==7:
   t=[1 if abs(l-lane)<1 else 0 for l in range(7)]
   if 50<r<415:
    # Central shortcut is interrupted by explicit jump gaps; the outer route stays connected.
    t[3]=0 if any(a<=r<b for a,b in [(78,84),(122,127),(248,254),(371,377)]) else 1
   if 165<=r<207 or 315<=r<345:t=[1]*7
  else:
   width=2 if r<54 or 123<=r<155 or 240<=r<280 or r>446 else 1
   t=[1 if abs(l-lane)<width*.6 else 0 for l in range(7)]
   if 54<=r<82 or 360<=r<408:t=[1 if min(abs(l-lane),abs(l-(6-lane)))<.85 else 0 for l in range(7)]
   if any(a<=r<b for a,b in plan['gaps']):t=[0]*7
  for a,b in plan['decks']:
   if a<=r<b:
    for l in range(7):
     if t[l] and abs(l-lane)<1.1:t[l]=2
  if i in [3,7,8]:
   for l in range(7):
    if t[l] and abs(l-lane)>1.5 and ((i==3 and 110<=r<160) or (i==7 and 190<=r<202) or(i==8 and 366<=r<392)):color[l]='pink'
  h=0
  for a,b,c in plan['tunnels']:
   if a<=r<b:h=1.15;m['tunnelCenters'][str(r)]=[c-3];m['tunnelRadius'][str(r)]=.49
  for l in range(7):
   if color[l]!='pink':color[l]=paint if abs(l-lane)<.65 else accent
  if r in plan['fuel']:t[center]=3
  m['tiles'].append(t);m['roadPaint'].append(color);m['boxPaint'].append([accent if v in [2,8] else None for v in t]);m['boxColors'].append(accent);m['guide'].append(lane);m['ceilings'].append(h);m['tunnelColors'].append(tint)
 for a,b in plan['gaps']:m['jumpRows'].append(a-3)
 for a,b in plan['decks']:m['jumpRows'].append(a-4)
 for j,(r,label) in enumerate(plan['sections']):m['sections'].append(dict(start=r,end=plan['sections'][j+1][0] if j+1<len(plan['sections']) else n,type='custom',name=label,side=round(m['guide'][r])))
 for r in plan['fuel']:
  for rr in [r-7,r+9]:
   l=round(m['guide'][rr]);
   if m['tiles'][rr][l]==1:m['coins'].append([rr,l])
 m['finish']=dict(row=n-5,lane=3,type='road');m['encounters']=[label for _,label in plan['sections']]
 if i==8:m['gravity']=100
p.write_text('const STORY_COURSES='+json.dumps(maps,separators=(',',':'),ensure_ascii=False)+';\n')
