// Landing feedback is local to the player's rendered pose; simulation stays untouched.
let shipLanding=null,shipTakeoff=null;
function landingMotionAllowed(){return !(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
function landingPoseAt(progress,strength=1){const u=Math.max(0,Math.min(1,progress));if(!landingMotionAllowed()||u>=1)return {sink:0,pitch:0,boost:0};const dip=u<.32?Math.sin(u/.32*Math.PI/2):Math.cos((u-.32)/.68*Math.PI/2),rebound=u>.45?Math.sin((u-.45)/.55*Math.PI)*.22:0;return {sink:(dip-rebound)*2.5*strength,pitch:Math.sin(u*Math.PI*2)*.035*strength,boost:Math.sin(Math.PI*u)*.18*strength}}
function liveLandingPose(){return shipLanding&&grounded&&['play','pause'].includes(state)?landingPoseAt(shipLanding.elapsed/shipLanding.duration,shipLanding.strength):{sink:0,pitch:0,boost:0}}
const landingBegin=beginRun;beginRun=function(...args){shipLanding=null;shipTakeoff=null;return landingBegin(...args)};
const landingJump=jump;jump=function(...args){const launch=state==='play'&&grounded,origin=launch?flightEffectAnchor():null,out=landingJump(...args);if(launch&&!grounded&&vy>0){shipTakeoff={...origin,elapsed:0,duration:.34,strength:1};}if(!grounded)shipLanding=null;return out};
const landingStep=step;step=function(dt){const playing=state==='play',airborne=!grounded,incoming=vy,out=landingStep(dt);if(!playing)return out;if(shipTakeoff){shipTakeoff.elapsed+=dt;if(shipTakeoff.elapsed>=shipTakeoff.duration||state!=='play')shipTakeoff=null;}if(shipLanding){shipLanding.elapsed+=dt;if(shipLanding.elapsed>=shipLanding.duration)shipLanding=null}if(airborne&&grounded&&incoming< -1&&state==='play'){shipLanding={elapsed:0,duration:data.skin===4?.42:.38,strength:Math.max(.35,Math.min(1.1,Math.abs(incoming)/7.8)),...flightEffectAnchor()}}if(!grounded||state!=='play')shipLanding=null;return out};
// Surface-bound arcs stop at road/block edges and follow the curved tunnel roof.
function flightEffectAnchor(){return {x,z,height:y,roof:!!tunnelGrounded,center:tunnelGrounded?tunnelCenters(Math.floor(z)).reduce((a,b)=>Math.abs(x-a)<Math.abs(x-b)?a:b):null}}
function flightEffectPoint(effect,xx,zz){
 const row=Math.floor(zz),lane=Math.floor(xx+roadOffset());let height=effect.height;
 if(effect.roof){if(!ceilingAt(row)||!tunnelCenters(row).includes(effect.center))return null;const dx=(xx-effect.center)/tunnelRadius(row);if(Math.abs(dx)>=1)return null;height=ceilingAt(row)*Math.sqrt(1-dx*dx)+.12;}
 else{const tile=rows[row]?.[lane],deck=typeof deckAt==='function'?deckAt(zz,xx):null;const onDeck=deck&&Math.abs(deck.height+deck.thickness-height)<.04;if(!onDeck&&(!tile||Math.abs(boxHeight(tile)-height)>.04))return null;}
 return proj(xx,zz,height+.02);
}
function drawFlightContact(effect,takeoff=false){
 if(!effect||!['play','pause'].includes(state)||!landingMotionAllowed())return;
 const u=effect.elapsed/effect.duration,alpha=(1-u)*.55*effect.strength,radius=.1+u*(takeoff?.3:.35+.13*effect.strength),segments=settings.graphics==='low'?12:20;
 const color=effect.roof?'184,226,255':takeoff?'132,240,232':'198,245,250';
 for(let i=0;i<segments;i++){const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments,p=flightEffectPoint(effect,effect.x+Math.cos(a)*radius,effect.z+Math.sin(a)*radius),q=flightEffectPoint(effect,effect.x+Math.cos(b)*radius,effect.z+Math.sin(b)*radius);if(p&&q)releaseWorldLine([p,q],'rgba('+color+','+alpha+')',takeoff?1.2:1+effect.strength*.6);}
 if(settings.graphics==='low'||takeoff)return;
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.4,r=.1+u*.23,p=flightEffectPoint(effect,effect.x+Math.cos(a)*r,effect.z+Math.sin(a)*r),q=flightEffectPoint(effect,effect.x+Math.cos(a)*(r+.08),effect.z+Math.sin(a)*(r+.08));if(p&&q)releaseWorldLine([p,q],'rgba('+color+','+alpha*.7+')',1);}
}
function drawShipLanding(){if(grounded)drawFlightContact(shipLanding);drawFlightContact(shipTakeoff,true)}
// Ship-relative bursts stay readable while the surface pulse recedes behind the pilot.
function drawShipImpulse(){
 if(!['play','pause'].includes(state)||!landingMotionAllowed())return;
 const effect=shipTakeoff|| (grounded?shipLanding:null);if(!effect)return;
 const takeoff=effect===shipTakeoff,u=Math.min(1,effect.elapsed/effect.duration),fade=(1-u)**1.4,p=proj(x,z,y+.15),size=flightShipSize(flightShipId(),p[2]),power=takeoff?1:Math.max(.55,effect.strength);
 ctx.save();try{
  if(globalThis.starwayTunnelClipReady)clipPlayerToTunnel();
  ctx.translate(p[0],p[1]);ctx.globalAlpha=fade*.9;ctx.globalCompositeOperation='lighter';
  const glow=ctx.createRadialGradient(0,size*.22,0,0,size*.22,size*(takeoff?1.1:1.35));
  glow.addColorStop(0,takeoff?'#e9ffff':'#fff8df');glow.addColorStop(.28,takeoff?'#63e8ffc0':'#ffe6a0b0');glow.addColorStop(1,'#70dfff00');
  ctx.fillStyle=glow;ctx.beginPath();ctx.ellipse(0,size*.22,size*(takeoff?1.1:1.35),size*.55,0,0,Math.PI*2);ctx.fill();
  if(takeoff){
   for(const side of [-1,1]){ctx.fillStyle='#55dcff';ctx.beginPath();ctx.moveTo(side*size*.2-size*.12,size*.12);ctx.lineTo(side*size*.2+size*.12,size*.12);ctx.lineTo(side*size*.2,size*(.48+.48*fade));ctx.closePath();ctx.fill();ctx.fillStyle='#efffff';ctx.beginPath();ctx.moveTo(side*size*.2-size*.055,size*.12);ctx.lineTo(side*size*.2+size*.055,size*.12);ctx.lineTo(side*size*.2,size*(.35+.3*fade));ctx.closePath();ctx.fill();}
  }else{
   ctx.strokeStyle=effect.roof?'#bcecff':'#fff0be';ctx.lineWidth=Math.max(1.5,size*.045)*power;
   ctx.beginPath();ctx.ellipse(0,size*.27,size*(.6+u*.9),size*(.16+u*.14),0,0,Math.PI*2);ctx.stroke();
   for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*size*.3,size*.24);ctx.lineTo(side*size*(.6+u*.55),size*(.2-u*.1));ctx.stroke();}
  }
 }finally{ctx.restore()}
}
const landingShipDraw=drawShipAndEffects;drawShipAndEffects=function(...args){drawShipLanding();drawShipImpulse();return landingShipDraw(...args)};
globalThis.starwayShipLandingReady=true;

const landingMenu=showMenu;showMenu=function(...args){shipLanding=null;shipTakeoff=null;return landingMenu(...args)};
