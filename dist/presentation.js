// Shared flight presentation. Geometry, simulation and palette semantics are unchanged.
function flightPolishActive(){return mode==='story'&&(level===0||level===4)&&releaseMaterialsActive();}
function releaseMaterialsActive(){return globalThis.starwayPixelRatioCap!==1;}
const releaseToneCache=new Map();
function releaseMaterialTone(hex,k){const key=hex+'|'+k;if(releaseToneCache.has(key))return releaseToneCache.get(key);const value= '#'+hex.slice(1).match(/../g).map(v=>Math.max(0,Math.min(255,Math.round(parseInt(v,16)*k))).toString(16).padStart(2,'0')).join('');if(releaseToneCache.size>2048)releaseToneCache.clear();releaseToneCache.set(key,value);return value;}
function releaseWorldLine(points,color,width=1){ctx.save();ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();ctx.restore();}
function releaseGroundQuad(a,b,r0,r1,height,color){poly([proj(a,r0,height),proj(b,r0,height),proj(b,r1,height),proj(a,r1,height)],color);}
const materialPickup=drawRoadPickup;
drawRoadPickup=function(r,l,t){
 if(releaseMaterialsActive()&&r<z+32){
  const a=l-roadOffset(),hazard=activeRoadData().roadPaint?.[r]?.[l]==='pink';
  // Fine panel joints are light marks, never black gaps or separated floor tiles.
  if(!hazard&&t===1&&r%8===0)releaseGroundQuad(a+.04,a+.96,r+.02,r+.055,.004,'#e4f2ff13');
  if(!rows[r]?.[l-1]){releaseGroundQuad(a+.025,a+.052,r,r+1,.005,hazard?'#ffb4a580':'#a8d8e355');if(r%6===0)releaseGroundQuad(a+.035,a+.10,r+.25,r+.5,.006,'#d6f8fc');}
  if(!rows[r]?.[l+1]){releaseGroundQuad(a+.948,a+.975,r,r+1,.005,hazard?'#ffb4a580':'#a8d8e355');if(r%6===0)releaseGroundQuad(a+.90,a+.965,r+.25,r+.5,.006,'#d6f8fc');}
  if(hazard){
   for(const offset of [.08,.57])poly([proj(a+.08,r+offset,.008),proj(a+.2,r+offset,.008),proj(a+.65,r+offset+.34,.008),proj(a+.53,r+offset+.34,.008)],'#ffb8ac55');
   if(r%4===0)poly([proj(a+.5,r+.2,.009),proj(a+.25,r+.72,.009),proj(a+.75,r+.72,.009)],'#ffded344');
  }
 }
 if(releaseMaterialsActive()&&t===1&&r<z+28&&activeRoadData().roadPaint?.[r]?.[l]!=='pink'){
  const a=l-roadOffset();
  // Inset hairline joints remain on a continuous, fully traversable deck.
  if(r%6===0){releaseGroundQuad(a+.10,a+.90,r+.12,r+.14,.006,'#07142320');releaseGroundQuad(a+.10,a+.90,r+.15,r+.17,.007,'#ebf8ff18');}
  if(!rows[r]?.[l-1])releaseGroundQuad(a+.06,a+.12,r,r+1,.007,'#071a2b35');
  if(!rows[r]?.[l+1])releaseGroundQuad(a+.88,a+.94,r,r+1,.007,'#071a2b35');
 }
 materialPickup(r,l,t);
 if(releaseMaterialsActive()&&t===3&&r<z+38){
  const a=l-roadOffset();releaseGroundQuad(a+.25,a+.75,r+.18,r+.82,.014,'#0b635d');
  for(let i=0;i<3;i++)releaseGroundQuad(a+.30,a+.70,r+.25+i*.17,r+.35+i*.17,.016,'#b9fff2');
  releaseGroundQuad(a+.41,a+.59,r+.82,r+.88,.016,'#dffff7');
  // Recessed battery frame and a pale mint charge symbol.
  releaseGroundQuad(a+.20,a+.23,r+.14,r+.86,.017,'#b9fff277');releaseGroundQuad(a+.77,a+.80,r+.14,r+.86,.017,'#b9fff277');
  poly([proj(a+.52,r+.25,.019),proj(a+.38,r+.52,.019),proj(a+.49,r+.52,.019),proj(a+.43,r+.75,.019),proj(a+.65,r+.43,.019),proj(a+.53,r+.43,.019)],'#effff5');
 }
};
function drawReleaseBoxDetail(r,l,start,end,h,f){
 if(!releaseMaterialsActive()||r>z+30)return;const a=l-roadOffset(),b=a+1,hazard=boxColorAt(r,l)==='hazard';
 if(f.left)releaseGroundQuad(a+.015,a+.04,start,end,h+.003,'#f4f8ff66');
 if(f.right)releaseGroundQuad(b-.04,b-.015,start,end,h+.003,'#202f4666');
 if(f.front&&start===r){
  releaseGroundQuad(a+.025,b-.025,start,start+.07,h+.004,'#f7efff55');
  poly([proj(a+.03,start,.08),proj(b-.03,start,.08),proj(b-.03,start,.15),proj(a+.03,start,.15)],'#18263d44');
  if(hazard){for(let i=0;i<3;i++){const q=a+.12+i*.27;poly([proj(q,start,.22),proj(q+.12,start,.22),proj(q+.25,start,h-.12),proj(q+.13,start,h-.12)],'#ffd0b977');}}
 }
 if(releaseMaterialsActive()&&!hazard){
  if(f.front&&start===r){
   // Recessed fascia and edge bevel; no new top surfaces or collision geometry.
   const y0=Math.max(.03,h*.18),y1=Math.max(.05,h*.25);
   poly([proj(a+.10,start,y0),proj(b-.10,start,y0),proj(b-.10,start,y1),proj(a+.10,start,y1)],'#07162555');
  }
  if(r%5===0)releaseGroundQuad(a+.12,b-.12,r+.48,r+.50,h+.006,'#08172820');
 }
 if(hazard){
  // The same diagonal warning motif identifies both lethal floors and block tops.
  for(const offset of [.08,.57])poly([proj(a+.08,r+offset,h+.008),proj(a+.2,r+offset,h+.008),proj(a+.65,r+offset+.34,h+.008),proj(a+.53,r+offset+.34,h+.008)],'#ffb8ac55');
 }
 if(hazard&&r%3===0){poly([proj(a+.5,r+.2,h+.005),proj(a+.27,r+.72,h+.005),proj(a+.73,r+.72,h+.005)],'#ffd2bf88');}
}
function drawReleaseTunnelRim(xa,xb,ya,yb,r){if(!releaseMaterialsActive()||r>z+38)return;releaseWorldLine([proj(xa,r,ya),proj(xb,r,yb)],'#fbe4f0aa',1.2);}
let releaseLanding=0,releaseLandingHeight=0,releaseLandingX=0,releaseLandingZ=0;
const presentationBegin=beginRun;beginRun=function(...args){releaseLanding=0;return presentationBegin(...args)};start=beginRun;
const presentationStep=step;step=function(dt){
 const playing=state==='play',wasGrounded=grounded,fallSpeed=vy;
 presentationStep(dt);
 if(playing){releaseLanding=Math.max(0,releaseLanding-dt);if(!wasGrounded&&grounded&&fallSpeed< -1&&state==='play'){releaseLanding=.28;releaseLandingHeight=y;releaseLandingX=x;releaseLandingZ=z;}}
};
const presentationShip=drawShipAndEffects;drawShipAndEffects=function(){
 presentationShip();
};
const presentationDraw=draw;draw=function(){presentationDraw();if(!releaseMaterialsActive())return;
 // Speed cues live at the canopy edge, outside the player's forward route.
 if(state==='play'&&speed>14&&settings.graphics==='high'){
  ctx.save();ctx.strokeStyle='#a1dcf333';ctx.lineWidth=1;for(let i=0;i<8;i++){const side=i%2?-1:1,u=(i*.173+time*speed*.04)%1,xx=W*(side<0?.025:.975)+side*u*W*.015,yy=H*(.52+u*.46);ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+side*3,yy+8+speed*.45);ctx.stroke()}ctx.restore();
 }
};
