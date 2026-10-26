let tunnelGrounded=false,tunnelRoofDeparture=null;
let deathTime=0,deathReason='',particles=[],impact=null,bank=0,fxPaused=false,cameraDrop=0;
const finishImmediately=finish;
function beginFailureSequence(reason){if(state!=='play')return;deathReason=reason;deathTime=0;fxPaused=false;for(const k in keys)keys[k]=false;
if((reason==='위험 타일 접촉'||reason==='위험 블록 접촉'||reason==='위험 터널 지붕 접촉'||reason==='장애물 충돌'||reason==='터널 천장 충돌'||reason==='터널 벽 충돌'||reason==='상단 구조 충돌')){state='exploding';impact=proj(x,z,.4+y);particles=Array.from({length:72},(_,i)=>{let a=Math.random()*Math.PI*2,v=50+Math.random()*230;return {x:impact[0],y:impact[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.45+Math.random()*.7,size:2+Math.random()*5,metal:i%4===0}});beep(65,.5,'sawtooth')}else{state='falling';vy=-1.5;beep(180,.45,'triangle')}
$('note').textContent=state==='falling'?'항로 이탈 · 추락 중':'기체 충돌';}
function completeFailureSequence(){finishImmediately(false,deathReason)}
finish=function(win,reason){if(win||reason==='test'||reason==='연료 소진'||reason==='시간 초과'){finishImmediately(win,reason);return}beginFailureSequence(reason);};
result=finish;
const previousBegin=beginRun;beginRun=function(){tunnelGrounded=false;tunnelRoofDeparture=null;particles=[];impact=null;deathTime=0;bank=0;cameraDrop=0;fxPaused=false;previousBegin()};start=beginRun;
const previousMenu=showMenu;showMenu=function(tab){particles=[];impact=null;tunnelRoofDeparture=null;cameraDrop=0;fxPaused=false;previousMenu(tab)};
const physicsStep=step;step=function(dt){if(state==='falling'||state==='exploding'){if(fxPaused)return;deathTime+=dt;if(state==='falling'){vy-=9*dt;y+=vy*dt;cameraDrop=0;z+=speed*dt}else for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;p.life-=dt}
if(deathTime>=(state==='falling'?1.5:1.05)){state='play';completeFailureSequence()}return}physicsStep(dt);let target=((keys.right||keys.ArrowRight?1:0)-(keys.left||keys.ArrowLeft?1:0))*.13;bank+=(target-bank)*dt*8;};
const gameplayPause=pause;pause=function(){if(state==='falling'||state==='exploding'){fxPaused=!fxPaused;return}gameplayPause()};$('pause').onclick=()=>pause();
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='falling'||state==='exploding'))fxPaused=true});
addEventListener('blur',()=>{if(state==='falling'||state==='exploding')fxPaused=true});
function shipFlightPose(){
// Shear the longitudinal axis to the projected road; keep the transverse wing axis horizontal.
const anchor=proj(x,z,.15),ahead=proj(x,z+1.5,.15);
const shear=(ahead[0]-anchor[0])/(ahead[1]-anchor[1]);
const heading=0;
const pitch=grounded||state==='ready'?0:Math.max(-.14,Math.min(.14,vy*.018));
return {heading,shear:Number.isFinite(shear)?Math.max(-1.25,Math.min(1.25,shear)):0,foreshortening:.54+pitch};
}
function flightThrust(){
 if(['dead','exploding','falling'].includes(state))return 0;
 if(state!=='play')return .08;
 const velocity=Math.max(0,Math.min(1,speed/24)),acceleration=Math.max(-1,Math.min(1,(throttle-speed)/6));
 return Math.max(.06,Math.min(1,.12+velocity*.65+acceleration*.22+(boostRemaining>0?.12:0)));
}
function flightShadowStyle(){
 const r=Math.floor(z),tile=rows[r]?.[Math.floor(x+roadOffset())]||0,roof=tunnelRoofAt(r,x),top=boxHeight(tile);
 const height=roof&&y>=roof-.04?roof:tile?top:null;
 if(height===null||y<height-.04)return null;
 const altitude=Math.max(0,y-height);return {height,alpha:.30/(1+altitude*.85),scale:.86/(1+altitude*.18)};
}
function drawShipAndEffects(){
if(state==='exploding'){drawExplosion();return}if(state==='dead')return;
let p=proj(x,z,.15+y),sz=flightShipSize(flightShipId(),p[2]),fall=state==='falling';
const shadow=flightShadowStyle();if(!fall&&shadow){ctx.save();ctx.globalAlpha=shadow.alpha;ctx.fillStyle='#020a15';ctx.beginPath();const ground=proj(x,z,shadow.height+.006);ctx.ellipse(ground[0],ground[1],sz*shadow.scale,sz*shadow.scale*.23,0,0,Math.PI*2);ctx.fill();ctx.restore()}
ctx.save();if(globalThis.starwayTunnelClipReady)clipPlayerToTunnel();ctx.translate(p[0],p[1]);const pose=shipFlightPose();pose.thrust=flightThrust();if(globalThis.starwayShipTricksReady)pose.jumpTrick=liveShipTrick();if(globalThis.starwayShipLandingReady){const landing=liveLandingPose();pose.landingSink=landing.sink;pose.landingPitch=landing.pitch;pose.thrust=Math.min(1,pose.thrust+landing.boost);}if(fall){ctx.globalAlpha=Math.max(.3,1-Math.max(0,deathTime-1.1)*1.5)}
renderFlightShip(ctx,flightShipId(),performance.now()/1000,sz,pose);ctx.restore();
}
// Each design uses the same outline and engine anchors in previews and flight.
const shipDesigns=[
 {code:'SC-01',role:'INTERCEPTOR',outline:[[50,2],[60,31],[61,48],[79,70],[80,83],[59,74],[56,91],[44,91],[41,74],[20,83],[21,70],[39,48],[40,31]],engines:[[39,83,5],[61,83,5]],canopy:[50,43,8,22],fins:[50],height:7},
 {code:'SW-02',role:'SOLAR SAIL',outline:[[50,15],[62,39],[96,33],[91,64],[72,83],[60,75],[56,91],[44,91],[40,75],[28,83],[9,64],[4,33],[38,39]],engines:[[26,71,6],[74,71,6]],canopy:[50,49,9,18],fins:[],height:5},
 {code:'NB-03',role:'TWIN HULL',outline:[[24,5],[36,16],[39,42],[61,42],[64,16],[76,5],[87,64],[78,87],[62,82],[58,69],[42,69],[38,82],[22,87],[13,64]],engines:[[27,81,7],[73,81,7]],canopy:[50,54,9,13],fins:[28,72],height:9},
 {code:'CR-04',role:'SPEARHEAD',outline:[[50,0],[58,35],[66,47],[88,59],[87,68],[66,64],[69,89],[57,83],[50,96],[43,83],[31,89],[34,64],[13,68],[12,59],[34,47],[42,35]],engines:[[36,82,4],[50,89,5],[64,82,4]],canopy:[50,43,6,22],fins:[50],height:6},
 {code:'EM-05',role:'HEAVY CRUISER',outline:[[39,13],[61,13],[66,31],[79,31],[88,43],[88,86],[67,86],[62,77],[38,77],[33,86],[12,86],[12,43],[21,31],[34,31]],engines:[[23,82,8],[77,82,8]],canopy:[50,39,11,16],fins:[23,77],height:12},
 {code:'EC-06',role:'STEALTH MANTA',outline:[[50,13],[62,32],[81,38],[99,67],[82,73],[64,67],[57,82],[50,72],[43,82],[36,67],[18,73],[1,67],[19,38],[38,32]],engines:[[34,66,7],[66,66,7]],canopy:[50,44,8,13],fins:[],height:5}
];
shipDesigns.push(
 {code:'AU-07',role:'DELTA GLIDER',outline:[[50,1],[62,32],[96,88],[71,83],[57,74],[50,91],[43,74],[29,83],[4,88],[38,32]],engines:[[30,80,6],[70,80,6]],canopy:[50,39,7,20],fins:[],height:6},
 {code:'HH-08',role:'HAMMERHEAD',outline:[[8,20],[37,16],[43,24],[57,24],[63,16],[92,20],[95,43],[65,48],[62,77],[74,88],[58,91],[50,80],[42,91],[26,88],[38,77],[35,48],[5,43]],engines:[[42,82,6],[58,82,6]],canopy:[50,40,10,12],fins:[50],height:10},
 {code:'TR-09',role:'TRIDENT',outline:[[13,8],[25,8],[32,41],[40,41],[44,1],[56,1],[60,41],[68,41],[75,8],[87,8],[91,77],[77,89],[64,75],[57,88],[43,88],[36,75],[23,89],[9,77]],engines:[[23,80,5],[50,82,6],[77,80,5]],canopy:[50,48,6,17],fins:[23,77],height:8},
 {code:'OR-10',role:'ORBITAL DISC',outline:[[50,9],[71,16],[88,32],[96,54],[88,73],[68,87],[59,84],[59,93],[41,93],[41,84],[32,87],[12,73],[4,54],[12,32],[29,16]],engines:[[50,87,11]],canopy:[50,43,12,14],fins:[],height:9},
 {code:'PH-11',role:'FORWARD WING',outline:[[50,9],[60,42],[72,40],[96,13],[92,55],[69,72],[73,89],[58,81],[50,92],[42,81],[27,89],[31,72],[8,55],[4,13],[28,40],[40,42]],engines:[[19,54,4],[35,80,5],[65,80,5],[81,54,4]],canopy:[50,44,7,18],fins:[50],height:6},
 {code:'NM-12',role:'ASYMMETRIC HAULER',outline:[[37,5],[51,22],[53,36],[68,28],[91,31],[95,78],[86,89],[65,84],[60,70],[49,70],[48,91],[25,91],[23,75],[7,70],[7,45],[26,40],[28,19]],engines:[[34,85,8],[78,81,7]],canopy:[37,39,8,19],fins:[34],height:11}
);

function shipPath(points){return new Path2D('M'+points.map(v=>v.join(' ')).join(' L')+' Z')}
function renderShip(g,id,t,thrust=.35){
 const skin=globalThis.starwayCosmeticsReady?cosmeticShipSkin(id):skins[id],d=shipDesigns[id]||shipDesigns[0],hull=shipPath(d.outline),accent=skin[3];
 const paint=(points,color,edge)=>{const p=shipPath(points);g.fillStyle=color;g.fill(p);if(edge){g.strokeStyle=edge;g.lineWidth=.65;g.stroke(p)}};
 const grad=(x1,y1,x2,y2,stops)=>{const v=g.createLinearGradient(x1,y1,x2,y2);stops.forEach(s=>v.addColorStop(s[0],s[1]));return v};
 g.save();g.translate(-50,-50);
 for(const [ex,ey,r] of d.engines){if(globalThis.starwayCosmeticsReady&&drawCustomFlame(g,ex,ey,r,t,Math.max(0,Math.min(1,thrust))))continue;const power=Math.max(0,Math.min(1,thrust)),len=5+power*48+Math.sin(t*38+ex)*(1+power*2);g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.45+power*.55;paint([[ex-r*.7,ey],[ex+r*.7,ey],[ex+r*.3,ey+len*.5],[ex,ey+len],[ex-r*.3,ey+len*.5]],grad(ex,ey,ex,ey+len,[[0,'#ffffff'],[.15,'#d8fbff'],[.4,accent],[1,accent+'00']]));paint([[ex-r*.25,ey],[ex+r*.25,ey],[ex,ey+len*.55]],'#efffffbb');g.restore()}
 g.save();g.translate(0,4);g.fillStyle='#06101c';g.fill(hull);g.strokeStyle='#060c15';g.lineWidth=2;g.stroke(hull);g.restore();
 g.fillStyle=grad(8,15,94,85,[[0,'#eef6fc'],[.18,skin[2]],[.42,'#526679'],[.52,'#b4c4cf'],[.64,skin[2]],[1,'#152637']]);g.fill(hull);g.strokeStyle='#9eb6c8';g.lineWidth=.8;g.stroke(hull);
 // Broad metal reflections and inset perimeter bevels keep small silhouettes readable.
 g.save();g.clip(hull);
 paint([[6,16],[43,5],[58,93],[15,85]],grad(8,0,60,0,[[0,'#e5f7ff00'],[.55,'#e8f7ff30'],[1,'#d8edff00']]));
 paint([[60,5],[96,30],[88,91],[57,90]],'#06132328');
 const inset=d.outline.map(([x,y])=>[50+(x-50)*.91,50+(y-50)*.91]);
 for(let i=0;i<d.outline.length;i++){
  const j=(i+1)%d.outline.length,a=d.outline[i],b=d.outline[j];
  paint([a,b,inset[j],inset[i]],(a[0]+b[0])<100?'#d9ebf166':'#07182888');
 }
 for(const side of [-1,1]){
  const mx=x=>50+side*x;
  if(id===0){paint([[mx(7),30],[mx(10),55],[mx(24),76],[mx(18),74]],accent);paint([[mx(9),50],[mx(11),61],[mx(22),76]],'#c9dce7')}
  if(id===1){paint([[mx(14),45],[mx(42),38],[mx(35),61],[mx(22),76]],'#7d361d');for(let k=0;k<4;k++)paint([[mx(16+k*5),44],[mx(20+k*5),43],[mx(25+k*3),62],[mx(21+k*3),66]],k%2?skin[2]:'#ffb13c','#ffd38c')}
  if(id===2){paint([[mx(23),10],[mx(30),47],[mx(29),73],[mx(19),77],[mx(17),44]],grad(mx(16),0,mx(30),0,[[0,'#f0dbff'],[.5,skin[2]],[1,'#36274f']]),'#d1beec');paint([[mx(23),18],[mx(25),44],[mx(23),67],[mx(21),45]],accent);paint([[mx(11),47],[mx(20),48],[mx(19),58],[mx(11),58]],'#24384e')}
  if(id===3){paint([[mx(9),44],[mx(34),60],[mx(17),58]],accent);paint([[mx(11),61],[mx(16),79],[mx(12),78]],'#ffc5bf')}
  if(id===4){paint([[mx(18),34],[mx(31),34],[mx(35),44],[mx(35),73],[mx(18),73]],'#203c45','#a2d7c7');for(let k=0;k<4;k++)paint([[mx(20),43+k*6],[mx(31),43+k*6],[mx(31),46+k*6],[mx(20),46+k*6]],k%2?accent:'#4b766d');paint([[mx(10),19],[mx(10),60],[mx(16),64],[mx(14),31]],skin[2])}
  if(id===5){paint([[mx(5),32],[mx(28),41],[mx(43),65],[mx(28),61]],'#17283d','#708da6');paint([[mx(14),43],[mx(36),62],[mx(21),55]],accent+'99');paint([[mx(9),61],[mx(16),67],[mx(7),74]],'#a9d6e0')}
  if(id===6){paint([[mx(8),35],[mx(37),79],[mx(17),68]],'#195668','#b9eaff');paint([[mx(13),51],[mx(30),76],[mx(21),70]],accent)}
  if(id===7){paint([[mx(10),25],[mx(38),24],[mx(40),38],[mx(13),43]],'#5d4230','#eed7a1');for(let k=0;k<4;k++)paint([[mx(15+k*5),27],[mx(18+k*5),27],[mx(18+k*5),37],[mx(15+k*5),38]],accent);paint([[mx(7),54],[mx(10),74],[mx(6),76]],skin[2])}
  if(id===8){paint([[mx(25),13],[mx(32),68],[mx(24),77],[mx(21),45]],'#254577','#bbd1ff');paint([[mx(26),18],[mx(28),56],[mx(26),65],[mx(24),26]],accent);paint([[mx(3),7],[mx(5),35],[mx(2),32]],'#dfe8ff')}
  if(id===9){for(let k=0;k<4;k++){const angle=(k*23+8)*Math.PI/180,ax=mx(Math.sin(angle)*35),ay=49-Math.cos(angle)*32;paint([[ax-3,ay],[ax+3,ay],[ax+3,ay+6],[ax-3,ay+6]],accent)}paint([[mx(16),36],[mx(37),47],[mx(32),68],[mx(16),72]],'#52627c','#a3b4da');paint([[mx(19),40],[mx(33),48],[mx(30),55],[mx(20),53]],'#a1b1da')}
  if(id===10){paint([[mx(14),45],[mx(42),20],[mx(37),51],[mx(19),66]],'#a73829','#ffd595');paint([[mx(20),46],[mx(37),28],[mx(32),50]],'#ffdc7c');paint([[mx(9),58],[mx(17),70],[mx(12),77]],accent)}
  if(id===11&&side===1){paint([[62,38],[85,38],[88,75],[66,75]],'#34433b','#b6c9a0');for(let k=0;k<3;k++)paint([[64,43+k*9],[85,43+k*9],[85,49+k*9],[64,49+k*9]],k%2?'#657b60':skin[2],'#263c36');paint([[13,48],[25,48],[25,65],[13,63]],'#445d57','#bed2ae')}

 }
 const seam=(points,color,width=.55)=>{g.beginPath();points.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.strokeStyle=color;g.lineWidth=width;g.stroke();};
 for(const side of [-1,1]){
  const mx=v=>50+side*v;
  seam([[mx(13),51],[mx(17),66],[mx(28),75]],'#071a2a99',.8);
  seam([[mx(14),51],[mx(18),65],[mx(29),74]],'#e2f1f544',.45);
  // Flush service plates, not extra protruding wings.
  paint([[mx(12),65],[mx(20),70],[mx(19),74],[mx(11),69]],'#10273a','#8faab844');
  for(let k=0;k<3;k++)seam([[mx(12+k*1.7),66+k*.7],[mx(16+k*1.7),69+k*.7]],'#92b2c27a',.7);
 }
 const [cx,cy,cw,ch]=d.canopy;
 paint([[cx,cy-ch-11],[cx+cw+4,cy-ch/2],[cx+cw+3,cy+ch],[cx-cw-3,cy+ch],[cx-cw-4,cy-ch/2]],grad(cx-cw,0,cx+cw,0,[[0,'#293e55'],[.45,'#e4f4fc'],[.6,skin[2]],[1,'#1b2e43']]),'#afc9d6');
 paint([[cx,cy-ch],[cx+cw,cy-ch*.35],[cx+cw*.7,cy+ch*.6],[cx-cw*.7,cy+ch*.6],[cx-cw,cy-ch*.35]],grad(cx,cy-ch,cx,cy+ch,[[0,'#d7ffff'],[.25,accent],[.65,'#143749'],[1,'#06101d']]),'#8dbcd0');
 paint([[cx-2,cy-ch+4],[cx-cw+2,cy],[cx-cw+3,cy+ch*.35],[cx,cy-ch+7]],'#ffffff55');
 for(let k=0;k<4;k++)paint([[45,cy+ch+2+k*2],[55,cy+ch+2+k*2],[55,cy+ch+3+k*2],[45,cy+ch+3+k*2]],'#0a1929');
 g.restore();
 for(const [ex,ey,r] of d.engines){paint([[ex-r,ey-14],[ex+r,ey-14],[ex+r,ey],[ex-r,ey]],grad(ex-r,0,ex+r,0,[[0,'#1d3148'],[.4,'#acc3d1'],[.7,'#4a6578'],[1,'#15263b']]),'#9bb4c3');paint([[ex-r+1,ey-4],[ex+r-1,ey-4],[ex+r-1,ey+1],[ex-r+1,ey+1]],'#081320');paint([[ex-r+2,ey-2],[ex+r-2,ey-2],[ex+r-2,ey],[ex-r+2,ey]],accent)}
 g.restore();
}
function drawExplosion(){if(!impact)return;ctx.save();let fade=Math.max(0,1-deathTime/1.05);if(deathTime<.18){ctx.globalAlpha=(.18-deathTime)*2;ctx.fillStyle='#ffecb1';ctx.fillRect(0,0,W,H)}ctx.globalAlpha=fade;let r=12+deathTime*160;let glow=ctx.createRadialGradient(impact[0],impact[1],0,impact[0],impact[1],Math.max(1,r));glow.addColorStop(0,'#fff4bf');glow.addColorStop(.25,'#ffb843');glow.addColorStop(.65,'#ef502a99');glow.addColorStop(1,'#ef502a00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(impact[0],impact[1],r,0,Math.PI*2);ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#ffd18b';ctx.beginPath();ctx.arc(impact[0],impact[1],20+deathTime*210,0,Math.PI*2);ctx.stroke();
for(const p of particles){if(p.life<=0)continue;ctx.globalAlpha=Math.min(1,p.life*2);ctx.fillStyle=p.metal?'#859ab4':p.life>.4?'#ffe9a0':'#f16a35';ctx.fillRect(p.x,p.y,p.size,p.size)}ctx.restore()}
const worldDraw=draw;draw=function(){ctx.save();if(state==='exploding'){let shake=Math.max(0,1-deathTime/.55)*7;ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake)}worldDraw();ctx.restore()};


// Height stays in screen space rather than being flattened with the road-plane texture.
function flightShipPoint(px,py,height,size,pose){const q=size/50;return [(px-50+(py-50)*pose.foreshortening*pose.shear)*q,((py-50)*pose.foreshortening-height)*q]}
function renderFlightShip(g,id,t,size,pose){
const skin=globalThis.starwayCosmeticsReady?cosmeticShipSkin(id):skins[id],q=size/50;
const P=(x,y,h)=>flightShipPoint(x,y,h,size,pose);
const face=(points,color,edge)=>{g.beginPath();points.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=color;g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=.6*q;g.stroke()}};
const design=shipDesigns[id]||shipDesigns[0],outline=design.outline;
// Solid hull skirts: top and bottom are separate vertices, including the rear fascia.
for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];face([P(a[0],a[1],0),P(b[0],b[1],0),P(b[0],b[1],7),P(a[0],a[1],7)],(a[0]+b[0])<100?'#344b63':'#142435','#8095a7')}
g.save();g.translate(0,-7*q);g.transform(q,0,q*pose.foreshortening*pose.shear,q*pose.foreshortening,0,0);renderShip(g,id,t,pose.thrust??.35);g.restore();
// Raised canopy with distinct front, side, and roof facets.
const [cx,cy,cw,ch]=design.canopy;
const base=[[cx,cy-ch-2],[cx+cw,cy-ch*.3],[cx+cw*.8,cy+ch*.6],[cx,cy+ch*.78],[cx-cw*.8,cy+ch*.6],[cx-cw,cy-ch*.3]];
const roof=[[cx,cy-ch*.82],[cx+cw*.55,cy-ch*.25],[cx+cw*.5,cy+ch*.32],[cx,cy+ch*.46],[cx-cw*.5,cy+ch*.32],[cx-cw*.55,cy-ch*.25]],heights=[13,17,14,11,14,17];
for(let i=0;i<base.length;i++){const j=(i+1)%base.length;face([P(...base[i],7),P(...base[j],7),P(...roof[j],heights[j]),P(...roof[i],heights[i])],['#355b72','#122a3f','#102337','#203f53','#6b94a9','#88aaba'][i],'#8caaba');}
const glass=g.createLinearGradient(...P(...roof[0],13),...P(...roof[3],11));glass.addColorStop(0,'#b6dfed');glass.addColorStop(.16,'#50899f');glass.addColorStop(.22,'#162d42');glass.addColorStop(.58,'#0b2032');glass.addColorStop(.82,'#173c50');glass.addColorStop(1,'#06111f');face(roof.map((v,i)=>P(...v,heights[i])),glass,'#a1c3d1');
face([P(cx,cy-ch*.77,13.3),P(cx-cw*.38,cy-ch*.2,17.3),P(cx-cw*.36,cy+ch*.19,14.5),P(cx-cw*.22,cy-ch*.2,17.3)],'#d7f8ff88');
// Design-specific stabilizers preserve each silhouette in perspective.
for(const fx of design.fins){face([P(fx-1,65,7),P(fx-1,78,7),P(fx-1,73,22),P(fx-1,65,17)],skin[2],'#b4cfdd');face([P(fx-1,73,22),P(fx+1,73,22),P(fx+1,78,7),P(fx-1,78,7)],'#192c42','#7f9eb0')}
// Rear engine nozzles stand proud of the wing edge.
for(const [ex,ey,r] of design.engines){
 const c=P(ex,ey,8),rx=r*q,ry=r*.70*q;
 const ellipse=(xx,yy,color)=>{g.fillStyle=color;g.beginPath();g.ellipse(c[0],c[1],xx,yy,0,0,Math.PI*2);g.fill();};
 const rim=g.createLinearGradient(c[0]-rx,c[1]-ry,c[0]+rx,c[1]+ry);rim.addColorStop(0,'#e5f4f9');rim.addColorStop(.27,'#748d9c');rim.addColorStop(.52,'#20374a');rim.addColorStop(.8,'#96adba');rim.addColorStop(1,'#102336');ellipse(rx*1.12,ry*1.12,rim);ellipse(rx*.83,ry*.83,'#030d18');
 const core=g.createRadialGradient(c[0]-rx*.12,c[1]-ry*.1,0,c[0],c[1],Math.max(.1,rx*.72));core.addColorStop(0,'#f0feff');core.addColorStop(.25,skin[3]);core.addColorStop(.66,skin[3]+'bb');core.addColorStop(1,'#071526');ellipse(rx*.65,ry*.65,core);
 g.strokeStyle='#c7e4ed77';g.lineWidth=.45*q;g.beginPath();g.ellipse(c[0],c[1],rx*1.03,ry*1.03,0,Math.PI,Math.PI*1.8);g.stroke();
}
}
