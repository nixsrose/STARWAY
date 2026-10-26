// Fixed particle pool: distance-driven parallax, independent of frame rate and physics.
const flightStars=Array.from({length:120},(_,i)=>{
 const a=i*2.3999632297,r=.55+((i*37)%101)/101*4.5;
 return {x:Math.cos(a)*r,y:Math.sin(a)*r,depth:1+((i*53)%127)/127*8,layer:i%3};
});
let starFlightZ=null,starFlightRows=null;
function advanceFlightStars(){
 const moving=state==='play'&&!document.hidden&&!globalThis.flightLifecycleSuspended;
 const delta=moving&&starFlightRows===rows&&starFlightZ!==null?Math.max(0,z-starFlightZ):0;
 starFlightZ=z;starFlightRows=rows;
 // A new run, teleport or page-test spawn must never flash a long star trail.
 if(delta>4||!moving)return 0;
 for(const s of flightStars){s.depth-=delta*(.022+s.layer*.009);while(s.depth<1)s.depth+=8;}
 return delta;
}
function drawFlightStars(){
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced){starFlightZ=z;starFlightRows=rows;return;}
 const delta=advanceFlightStars();
 if(!['play','ready','pause','falling','exploding'].includes(state))return;
 const economy=globalThis.starwayPixelRatioCap===1,count=economy?48:flightStars.length;
 const cx=W*.5,cy=H*(W/H>1.5?.30:.43),velocity=delta>0?Math.min(1.6,Math.max(0,speed)/24):0;
 ctx.save();ctx.lineCap='round';ctx.strokeStyle='#c1e4ff';ctx.fillStyle='#d5ebff';
 for(let i=0;i<count;i++){
  const s=flightStars[i],dx=s.x*W*.78/s.depth,dy=s.y*H*.78/s.depth,px=cx+dx,py=cy+dy;
  if(px<-24||px>W+24||py<-24||py>H+24)continue;
  const radial=Math.hypot(dx/W,dy/H),near=(9-s.depth)/8;
  // Keep the flight corridor quiet; the road is rendered above this layer.
  const corridor=Math.abs(dx)<W*.18&&py>cy-H*.05;
  ctx.globalAlpha=(.16+near*.48)*(corridor?.22:1);
  const size=(.45+near*1.15)*(s.layer===2?1:.75);
  const tail=economy?0:Math.min(19,velocity*near*near*radial*26);
  if(tail>1){const length=Math.hypot(dx,dy)||1;ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(px-dx/length*tail,py-dy/length*tail);ctx.lineTo(px,py);ctx.stroke();}
  ctx.fillRect(px-size*.5,py-size*.5,size,size);
 }
 ctx.restore();
}
