const STORY_VISIBLE_COUNT=21,STORY_TOTAL_COUNT=30;
const stageProfiles=[
{name:'지구 궤도',style:'기본 항로',gravity:18,colors:['#13243a','#274c70','#365f83'],planet:['#a9d7e6','#346582'],instruction:'넓은 길에서 조종과 짧은 점프를 익히세요.'},
{name:'달의 이면',style:'저중력 발판',gravity:11,colors:['#171a35','#686a96','#8984ba'],planet:['#f3efff','#8584a1'],instruction:'낮은 중력 · 긴 체공으로 끊긴 발판을 연결하세요.'},
{name:'화성 협곡',style:'분기 도로',gravity:20,colors:['#321b22','#a04b3d','#d37753'],planet:['#ffb98d','#a74831'],instruction:'갈라지는 도로에서 좌우 경로를 선택하세요.'},
{name:'목성 폭풍',style:'고중력 통로',gravity:27,colors:['#222839','#53676a','#859283'],planet:['#ead2ac','#aa8163'],instruction:'높은 중력 · 점프는 짧게, 장애물은 조종으로 피하세요.'},
{name:'토성 고리',style:'연속 점프',gravity:15,colors:['#23273d','#9c7d3e','#d2b168'],planet:['#f5dea2','#b39863'],instruction:'끊긴 길과 좌우 전환을 이어서 통과하세요.'},
{name:'심우주 신호',style:'복합 코스',gravity:23,colors:['#20132f','#644479','#9c65ac'],planet:['#dca7ff','#624086'],instruction:'분기·통로·틈을 읽고 속도를 조절하세요.'}
];
let throttle=10,grounded=true;
function courseRank(){return mode==='story'?level+1:floor}
function stageProfile(){if(mode==='story'&&level>=21){const c=STORY_COURSES[level],chapter=Math.floor((level-21)/3),palettes=[['#061d2a','#217d91','#7bdfcf'],['#181823','#78563e','#c29c66'],['#100e25','#544477','#a38aca']];return {...stageProfiles[5],name:c.title.split(' · ')[0],style:'Road '+(level%3+1),gravity:c.gravity,colors:palettes[chapter],planet:[palettes[chapter][2],palettes[chapter][1]],instruction:c.instruction}};if(mode==='story'&&level===20)return {...stageProfiles[5],name:'Nebula Passage',gravity:18,style:'Road 3 · 분홍 터널과 체크 단절 발판',colors:['#100b12','#684657','#9e778b'],planet:['#f0abc3','#602642'],instruction:STORY_COURSES[20].instruction};if(mode==='story'&&level===19)return {...stageProfiles[5],name:'Nebula Passage',gravity:30,style:'Road 2 · 고중력 격자와 블록 통로',colors:['#100b12','#684657','#9e778b'],planet:['#f0abc3','#602642'],instruction:STORY_COURSES[19].instruction};if(mode==='story'&&level===18)return {...stageProfiles[5],name:'Nebula Passage',gravity:8,style:'Road 1 · 저중력 분기와 공중 전환',colors:['#100b12','#684657','#9e778b'],planet:['#f0abc3','#602642'],instruction:STORY_COURSES[18].instruction};if(mode==='story'&&level===17)return {...stageProfiles[5],name:'Asteroid Field',gravity:16,style:'Road 3 · 연속 발판과 청록 분기',colors:['#03050d','#343745','#696875'],planet:['#b6b5a1','#414052'],instruction:STORY_COURSES[17].instruction};if(mode==='story'&&level===16)return {...stageProfiles[5],name:'Asteroid Field',gravity:18,style:'Road 2 · 분리 레일과 분홍 상단 발판',colors:['#03050d','#343745','#696875'],planet:['#b6b5a1','#414052'],instruction:STORY_COURSES[16].instruction};if(mode==='story'&&level===15)return {...stageProfiles[5],name:'Asteroid Field',gravity:18,style:'Road 1 · 흰 블록과 색상 쌍레일',colors:['#03050d','#343745','#696875'],planet:['#b6b5a1','#414052'],instruction:STORY_COURSES[15].instruction};if(mode==='story'&&level===14)return {...stageProfiles[4],name:'Misty',gravity:18,style:'Road 3 · 초록 격자·중앙 발판·직선 터널',colors:['#080b17','#3a326c','#635aa8'],planet:['#53547d','#1d2037'],instruction:STORY_COURSES[14].instruction};if(mode==='story'&&level===13)return {...stageProfiles[4],name:'Misty',gravity:18,style:'Road 2 · 격자 도로와 연속 발판·직선 터널',colors:['#080b17','#3a326c','#635aa8'],planet:['#53547d','#1d2037'],instruction:STORY_COURSES[13].instruction};if(mode==='story'&&level===12)return {...stageProfiles[4],name:'Misty',gravity:18,style:'Road 1 · 보라 블록과 색상 발판',colors:['#080b17','#3a326c','#635aa8'],planet:['#53547d','#1d2037'],instruction:STORY_COURSES[12].instruction};if(mode==='story'&&level===11)return {...stageProfiles[3],name:'Solar Junction',gravity:18,style:'Road 3 · 황금 격자와 청록 터널',colors:['#201a2e','#b77d77','#d2aa95'],planet:['#d3aa95','#65566d'],instruction:STORY_COURSES[11].instruction};if(mode==='story'&&level===10)return {...stageProfiles[3],name:'Solar Junction',gravity:11,style:'Road 2 · 저중력 발판과 터널',colors:['#201a2e','#b77d77','#d2aa95'],planet:['#d3aa95','#65566d'],instruction:STORY_COURSES[10].instruction};if(mode==='story'&&level===9)return {...stageProfiles[3],name:'Solar Junction',gravity:18,style:'Road 1 · 지그재그와 색상 분리 레일',colors:['#201a2e','#b77d77','#d2aa95'],planet:['#d3aa95','#65566d'],instruction:STORY_COURSES[9].instruction};if(mode==='story'&&level===6)return {...stageProfiles[2],name:'Lunar Rift',gravity:16,colors:['#101a35','#625196','#554bbb'],planet:['#d9d4c7','#6d6b79'],style:'Road 1 · 보라 교차 발판',instruction:STORY_COURSES[6].instruction};if(mode==='story'&&level===5)return {...stageProfiles[1],name:'Orbital Drift',gravity:18,style:'Road 3 · 지그재그와 붉은 터널',instruction:STORY_COURSES[5].instruction};if(mode==='story'&&level===4)return {...stageProfiles[1],name:'Orbital Drift',gravity:18,style:'Road 2 · 청록 박스와 이중 터널',instruction:STORY_COURSES[4].instruction};if(mode==='story'&&level===3)return {...stageProfiles[1],name:'Orbital Drift',gravity:18,style:'Road 1 · 세 갈래와 공중 착지',instruction:STORY_COURSES[3].instruction};if(mode==='story'&&level===2)return {...redHeatProfile,style:'Road 3 · 박스 상단과 단절 교량',instruction:STORY_COURSES[2].instruction};if(mode==='story'&&level===1)return {...redHeatProfile,style:'Road 2 · 좌우 전환과 분리 레일',instruction:STORY_COURSES[1].instruction};if(mode==='story'&&level<3)return redHeatProfile;return stageProfiles[mode==='story'?Math.floor(level/3):Math.floor((floor-1)/3)%6]}
function gravityValue(){return (mode==='story'?stageProfile().gravity:18+Math.min(9,Math.floor(z/540)))}
function fuelDrain(v){return (.4+.011*v*v)}

let boostRemaining=0,slowRemaining=0,padRow=-1;
function ceilingAt(r){return mode==='story'?STORY_COURSES[level].ceilings?.[r]||0:0}
function sectionAt(r){return mode==='story'?STORY_COURSES[level].sections?.find(s=>r>=s.start&&r<s.end):null}

const sectionNames={single:'좁은 외길',redheat_entry:'Red Heat · 중앙 도로와 좌우 레일',redheat_split:'중앙 분리 항로',redheat_tunnel:'분홍색 터널과 단절 구간',redheat_narrow:'좁은 마지막 항로',redheat_finish:'도착 항로',redheat_raised:'점프해서 올라서는 분홍색 발판',redheat_holes:'구멍이 있는 주황색 연결 도로',redheat_last_tunnel:'마지막 짧은 터널',wide:'넓은 진입로',funnel:'수축하는 길',wall:'중앙 벽 우회',gap:'단절된 항로',diagonal:'대각선 연결로',fuel:'충전 휴식 구간',split:'좌우 분리 도로',boost:'가속 패드',slow:'감속 패드',checker:'교차 발판',tunnel:'낮은 터널',islands:'독립 발판',crossroads:'분기와 합류'};
function drawTunnelFrames(foreground=false){
if(mode!=='story')return;
for(let r=foreground?Math.floor(z):Math.min(rows.length-1,Math.floor(z)+70);r>=Math.max(0,foreground?Math.floor(z)-3:Math.floor(z));r--){let roof=ceilingAt(r);if(!roof)continue;let start=foreground?r:Math.max(r,z),end=foreground?Math.min(r+1,z):r+1;if(end<=start)continue;let rad=tunnelRadius(r);for(const center of tunnelCenters(r)){
for(let i=0;i<12;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12;
let xa=center+rad*Math.cos(a),xb=center+rad*Math.cos(b),ya=roof*Math.sin(a),yb=roof*Math.sin(b);
let shade=Math.round(80+Math.sin((a+b)/2)*60);
poly([proj(xa,start,ya),proj(xb,start,yb),proj(xb,end,yb),proj(xa,end,ya)],(mode==='story'&&level<3)?'rgb('+(shade+70)+','+Math.round(shade*.35)+','+Math.round(shade*.7)+')':'rgb('+shade+','+(shade+12)+','+(shade+22)+')','#6b8490');
}
if((!ceilingAt(r-1)||r%6===0)&&(!foreground||r<z)){for(let i=0;i<12;i++){let a=i*Math.PI/12,b=(i+1)*Math.PI/12;
poly([proj(center+rad*Math.cos(a),r,roof*Math.sin(a)),proj(center+rad*Math.cos(b),r,roof*Math.sin(b)),proj(center+(rad+.1)*Math.cos(b),r,roof*Math.sin(b)+.09),proj(center+(rad+.1)*Math.cos(a),r,roof*Math.sin(a)+.09)],(mode==='story'&&level<3)?'#ef5791':'#c0d1d5','#e5faff');
}}
}}}
function applyDifficultyRows(){}

function roadOffset(){return mode==='story'?STORY_COURSES[level].tiles[0].length/2:2.5}
function roadCenterLane(){return roadOffset()-.5}
function boxHeight(t){return t===2?.85:t===8?2.2:0}
function tunnelRadius(r=Math.floor(z)){return mode==='story'?(STORY_COURSES[level].tunnelRadius?.[r]||1.5):1.5}
function redHeatActive(){return mode==='story'&&level===0}
const redHeatProfile={name:'Red Heat',style:'Road 1 · 참고 영상 항로',gravity:18,colors:['#250c16','#9696a7','#888c9c'],planet:['#ffde7b','#ee5f22'],instruction:'중앙 도로와 좌우 레일, 분리 항로와 터널을 통과하세요.'};
function drawOriginalRedHeatSun(targetCtx=ctx){const ctx=targetCtx;
ctx.save();if(typeof flightPolishActive==='function'&&flightPolishActive())ctx.globalAlpha=.78;const sx=W*.22,sy=H*.21,r=Math.min(W*.54,H*.31);
let glow=ctx.createRadialGradient(sx,sy,0,sx,sy,r*1.15);glow.addColorStop(0,'#ffe49a');glow.addColorStop(.45,'#ff9c2c');glow.addColorStop(.82,'#db3818');glow.addColorStop(1,'#df351000');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,r*1.15,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.clip();
for(let i=0;i<160;i++){const u=Math.sin(i*41.7)*.5+.5,v=Math.sin(i*83.1+2)*.5+.5;ctx.fillStyle=i%3===0?'#ffdf6833':'#9c270e44';ctx.beginPath();ctx.arc(sx+(u-.5)*r*2,sy+(v-.5)*r*2,r*(.015+(i%7)*.012),0,Math.PI*2);ctx.fill()}ctx.restore();
}

function chapterSceneryPilot(){return mode==='story'&&level<6;}
function drawRedHeatSun(targetCtx=ctx){
 if(!chapterSceneryPilot())return drawOriginalRedHeatSun(targetCtx);
 const g=targetCtx;g.save();const sx=W*.16,sy=H*.16,r=Math.min(W*.53,H*.34);
 const halo=g.createRadialGradient(sx,sy,r*.65,sx,sy,r*1.30);halo.addColorStop(0,'#e65b1b99');halo.addColorStop(.65,'#ce391322');halo.addColorStop(1,'#c82b1000');g.fillStyle=halo;g.beginPath();g.arc(sx,sy,r*1.30,0,Math.PI*2);g.fill();
 g.save();g.beginPath();g.arc(sx,sy,r,0,Math.PI*2);g.clip();
 const surface=g.createRadialGradient(sx-r*.25,sy-r*.27,0,sx+r*.15,sy+r*.12,r*1.13);surface.addColorStop(0,'#ffe3a0');surface.addColorStop(.33,'#ffbe58');surface.addColorStop(.68,'#ed752b');surface.addColorStop(.88,'#b43e1d');surface.addColorStop(1,'#61231d');g.fillStyle=surface;g.fillRect(0,0,W,H);
 for(let i=0;i<105;i++){const a=i*2.39996,rr=r*Math.sqrt((i+.5)/105),xx=sx+Math.cos(a)*rr,yy=sy+Math.sin(a)*rr;g.fillStyle=i%3?'#9b361b16':'#fff0a81f';g.beginPath();g.ellipse(xx,yy,r*(.014+i%4*.007),r*(.007+i%3*.004),a,0,Math.PI*2);g.fill();}
 for(let i=0;i<12;i++){const xx=sx+Math.sin(i*4.19)*r*.74,yy=sy+Math.cos(i*2.71)*r*.74,len=r*(.06+i%3*.025);g.strokeStyle=i%2?'#ffe6a722':'#9f2f2322';g.lineWidth=r*.004;g.beginPath();g.moveTo(xx,yy);g.quadraticCurveTo(xx+len*.3,yy-len*.38,xx+len,yy-len*.2);g.stroke();}
 g.restore();g.strokeStyle='#ffd28b66';g.lineWidth=1;g.beginPath();g.arc(sx,sy,r,Math.PI*.9,Math.PI*1.8);g.stroke();g.restore();
}
function drawDepthStars(){
 const pilot=chapterSceneryPilot(),motion=false;
 for(let i=0;i<stars.length;i++){
  const s=stars[i],layer=i%3,xx=s.x*W+(motion?Math.sin(i*3.1)*x*(layer+1)*.6:0),yy=(s.y*H*.65+z*(pilot?(motion?[.012,.035,.085][layer]:0):0))%(H*.65);
  const forward=pilot&&Math.abs(xx-W*.5)<W*.17&&yy>H*.28,alpha=(pilot?.18+s.s/5:.3+s.s/3)*(pilot?(forward?.30:.70):1),size=pilot?s.s*(layer===2?.85:.55):s.s;
  ctx.fillStyle='rgba(183,219,255,'+alpha+')';ctx.fillRect(xx,yy,Math.max(.4,size),Math.max(.4,size));
 }
}

function tunnelCenters(r=Math.floor(z)){return mode==='story'?(STORY_COURSES[level].tunnelCenters?.[r]||[0]):[0]}
function tunnelLocalX(){return x-tunnelCenters().reduce((a,b)=>Math.abs(x-a)<Math.abs(x-b)?a:b)}

function drawStageScenery(targetCtx=ctx){const ctx=targetCtx;
if(mode==='story'&&level>=18&&level<=20){ctx.save();const nx=W*.5,ny=H*.29;for(let i=0;i<110;i++){const a=i*2.39996,rr=(.08+(i%31)/36)*Math.min(W,H)*.7,xx=nx+Math.cos(a)*rr,yy=ny+Math.sin(a)*rr*.7;const glow=ctx.createRadialGradient(xx,yy,0,xx,yy,8+(i%7)*5);glow.addColorStop(0,i%3?'#d16d9a35':'#80b7dc55');glow.addColorStop(1,'#230d2200');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(xx,yy,8+(i%7)*5,0,Math.PI*2);ctx.fill()}ctx.restore();return;}

if(mode==='story'&&level>=15&&level<=17){ctx.save();for(let i=0;i<85;i++){const u=(Math.sin(i*78.31)*.5+.5),v=(Math.sin(i*41.13+2)*.5+.5),xx=u*W,yy=((v+z*.00008)%1)*H,sz=3+(i%9)*1.7;if(Math.abs(xx-W*.5)<W*.12&&yy>H*.3)continue;ctx.beginPath();for(let j=0;j<7;j++){const a=j*Math.PI*2/7,rr=sz*(.7+.3*Math.sin(i*7+j*3));const px=xx+Math.cos(a)*rr,py=yy+Math.sin(a)*rr;j?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fillStyle=i%3===0?'#595952':i%3===1?'#353749':'#242435';ctx.fill();ctx.beginPath();ctx.moveTo(xx-sz*.5,yy);ctx.lineTo(xx,yy-sz*.6);ctx.lineTo(xx+sz*.45,yy+sz*.1);ctx.closePath();ctx.fillStyle='#aaa99b33';ctx.fill()}ctx.restore();return;}

if(mode==='story'&&(level>=12&&level<=14)){ctx.save();ctx.translate(W*.5,H*.35);for(let i=0;i<24;i++){ctx.rotate(.21);ctx.strokeStyle='rgba(109,121,157,.10)';ctx.lineWidth=Math.max(3,W*.014);ctx.beginPath();ctx.ellipse(i*1.2,0,W*(.1+i*.026),H*(.06+i*.018),.12,0,Math.PI*2);ctx.stroke()}ctx.restore();return;}

if(mode==='story'&&level===6){drawLunarRiftScenery(ctx);return}
if(mode==='story'&&(level>=3&&level<=5)){drawOrbitalHorizon(ctx);return}
if(mode==='story'&&level<3){drawRedHeatSun(ctx);return}ctx.save();const chapter=mode==='story'?Math.floor(level/3):Math.floor((floor-1)/3)%6;
const sx=W*.2,sy=H*.22,r=Math.min(W*.44,H*.27),profile=stageProfile();
let orb=ctx.createRadialGradient(sx-r*.3,sy-r*.4,r*.05,sx,sy,r);orb.addColorStop(0,profile.planet[0]);orb.addColorStop(.5,profile.planet[1]);orb.addColorStop(1,'#081322');ctx.fillStyle=orb;ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.fill();
ctx.save();ctx.beginPath();ctx.arc(sx,sy,r,0,Math.PI*2);ctx.clip();
if(chapter===1){for(let i=0;i<45;i++){ctx.fillStyle='#111b2933';ctx.beginPath();ctx.arc(sx+Math.sin(i*37)*r,sy+Math.cos(i*49)*r,r*(.025+i%4*.025),0,Math.PI*2);ctx.fill()}}
if(chapter===3){for(let i=0;i<11;i++){ctx.fillStyle=i%2?'#e5be8833':'#56392444';ctx.fillRect(sx-r,sy-r+i*r*.2,r*2,r*.085)}}
ctx.restore();
if(chapter===4){ctx.strokeStyle='#dec88a99';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(sx,sy,r*1.5,r*.33,-.3,0,Math.PI*2);ctx.stroke()}
if(chapter===2||chapter===5){for(let i=0;i<24;i++){ctx.fillStyle=chapter===2?'#9c746666':'#ba84da33';ctx.beginPath();let px=(Math.sin(i*57)+1)*W*.5,py=(Math.cos(i*21)+1)*H*.24,sz=3+i%5*3;ctx.moveTo(px-sz,py);ctx.lineTo(px,py-sz);ctx.lineTo(px+sz,py+sz*.4);ctx.lineTo(px+sz*.2,py+sz);ctx.closePath();ctx.fill()}}
ctx.restore();
}

function drawForegroundStructures(){
drawTunnelFrames(true);
for(let r=Math.floor(z);r>=Math.max(0,Math.floor(z)-3);r--){
if(r>=z)continue;
for(let l=0;l<(rows[r]?.length||0);l++){
const t=rows[r][l],h=boxHeight(t);if(!h||y>=h-.025)continue;
const a=l-roadOffset()+.06,b=a+.88,back=Math.min(r+.8,z);
if(back<=r)continue;
poly([proj(a,r,0),proj(b,r,0),proj(b,r,h),proj(a,r,h)],'#b63350','#ff8395');
poly([proj(a,r,h),proj(b,r,h),proj(b,back,h),proj(a,back,h)],'#f06574','#ffb6bd');
poly([proj(b,r,0),proj(b,back,0),proj(b,back,h),proj(b,r,h)],'#75243e');
}
}
}

function roadColorAt(r,l){
const style=activeRoadData().roadColors?.[r]||'gray';
const palette={mint:'#afd8c8',lemon:'#e4ee50',magenta:'#970776',ochre:'#ce873b',green:'#7bc878',cyan:'#087f91',red:'#b52e36',yellow:'#efb539',blue:'#4f48cf'};if(palette[style])return palette[style];
if(style==='orange')return '#bd775c';
if(style==='pink')return '#e33e79';
if(style==='brownSides'&&(l===1||l===2||l===4||l===5))return '#938270';
return '#9999ac';
}

function cockpitDockHeight(){let base=innerHeight<=500?156:innerWidth<600?244:200;if(typeof getComputedStyle==='function'){const css=getComputedStyle(document.documentElement);base=(parseFloat(css.getPropertyValue('--dock'))||base)+(parseFloat(css.getPropertyValue('--safe'))||0)}return base}

function drawOriginalOrbitalHorizon(targetCtx=ctx){const ctx=targetCtx;
ctx.save();const cx=W*.8,cy=H*1.65,r=H*1.04;
const glow=ctx.createRadialGradient(cx,cy,r*.94,cx,cy,r*1.1);glow.addColorStop(0,'#dca348');glow.addColorStop(.9,'#317bab55');glow.addColorStop(1,'#317bab00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,r*1.1,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.clip();const land=ctx.createLinearGradient(0,H*.6,0,H);land.addColorStop(0,'#b6bc75');land.addColorStop(.5,'#a87536');land.addColorStop(1,'#684328');ctx.fillStyle=land;ctx.fillRect(0,0,W,H);
for(let i=0;i<70;i++){ctx.fillStyle=i%2?'#dec18a44':'#60463244';ctx.beginPath();ctx.ellipse(W*(Math.sin(i*37)*.5+.5),H*(.68+.27*(Math.sin(i*13)*.5+.5)),W*.07,H*.011,.2*Math.sin(i*7),0,Math.PI*2);ctx.fill()}ctx.restore();
ctx.save();const x=W*.30,y=H*.18,sz=Math.min(W*.12,H*.13),orb=ctx.createRadialGradient(x-sz*.3,y-sz*.3,0,x,y,sz);orb.addColorStop(0,'#557e97');orb.addColorStop(.65,'#173145');orb.addColorStop(1,'#030914');ctx.fillStyle=orb;ctx.beginPath();ctx.arc(x,y,sz,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawOrbitalHorizon(targetCtx=ctx){
 if(!chapterSceneryPilot())return drawOriginalOrbitalHorizon(targetCtx);
 const g=targetCtx;g.save();const cx=W*.99,cy=H*1.54,r=H*.94;
 const air=g.createRadialGradient(cx,cy,r*.97,cx,cy,r*1.09);air.addColorStop(0,'#4d98b555');air.addColorStop(.45,'#3b7d9c30');air.addColorStop(1,'#23577900');g.fillStyle=air;g.beginPath();g.arc(cx,cy,r*1.09,0,Math.PI*2);g.fill();
 g.save();g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.clip();const planet=g.createLinearGradient(0,H*.58,W,H*1.1);planet.addColorStop(0,'#638e9c');planet.addColorStop(.3,'#315b72');planet.addColorStop(.7,'#142c48');planet.addColorStop(1,'#091728');g.fillStyle=planet;g.fillRect(0,0,W,H);
 for(let i=0;i<25;i++){g.strokeStyle=i%3?'#c1d8da13':'#07192e2b';g.lineWidth=H*(.003+i%4*.002);g.beginPath();g.ellipse(cx-W*.25,H*(.67+i*.017),W*(.23+i%5*.06),H*.025,-.15,Math.PI,Math.PI*1.93);g.stroke();}g.restore();
 g.strokeStyle='#a6dfed55';g.lineWidth=1;g.beginPath();g.arc(cx,cy,r,Math.PI*1.1,Math.PI*1.55);g.stroke();
 const px=W*.22,py=H*.16,pr=Math.min(W*.11,H*.13);const moon=g.createRadialGradient(px-pr*.35,py-pr*.35,0,px+pr*.2,py+pr*.1,pr*1.05);moon.addColorStop(0,'#a6b6c1');moon.addColorStop(.4,'#627f93');moon.addColorStop(.75,'#213c54');moon.addColorStop(1,'#050e1b');g.fillStyle=moon;g.beginPath();g.arc(px,py,pr,0,Math.PI*2);g.fill();
 g.strokeStyle='#bdedfa44';g.lineWidth=.8;g.beginPath();g.ellipse(px,py,pr*1.65,pr*.31,-.35,0,Math.PI*2);g.stroke();g.restore();
}

function lethalRoadAt(r,l){return mode==='story'&&STORY_COURSES[level].roadPaint?.[r]?.[l]==='pink'}

function drawLunarRiftScenery(targetCtx=ctx){const ctx=targetCtx;ctx.save();const cx=W*1.02,cy=H*.12,r=Math.min(W*.57,H*.53),g=ctx.createRadialGradient(cx-r*.4,cy-r*.3,0,cx,cy,r);g.addColorStop(0,'#ccc4b5');g.addColorStop(.55,'#777584');g.addColorStop(1,'#222c43');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.clip();for(let i=0;i<48;i++){ctx.fillStyle=i%2?'#141e3644':'#e5cfa333';ctx.beginPath();ctx.arc(cx+Math.sin(i*37)*r,cy+Math.cos(i*23)*r,r*(.02+i%5*.018),0,Math.PI*2);ctx.fill()}ctx.restore();ctx.save();const sx=W*.16,sy=H*.14,sz=Math.min(W*.075,H*.09);let glow=ctx.createRadialGradient(sx,sy,sz*.5,sx,sy,sz*1.7);glow.addColorStop(0,'#b6c6f399');glow.addColorStop(1,'#7da5ff00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sx,sy,sz*1.7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8f8078';ctx.beginPath();ctx.arc(sx,sy,sz,0,Math.PI*2);ctx.fill();ctx.restore()}
