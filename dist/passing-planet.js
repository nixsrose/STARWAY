// One cached planet texture, projected from travelled distance rather than wall time.
let passingPlanetCache=null;
function passingPlanetPose(distance,width,height,variant=0,reduced=false){
 const phase=reduced?.18:((Math.max(0,distance)/190+.18)%1),depth=6.6-phase*6;
 const side=variant%2?-1:1,unit=Math.min(width,height);
 return {x:width*.5+side*width*.84/depth,y:height*.36-height*.60/depth,radius:unit*.38/depth,alpha:Math.min(1,phase/.10,(1-phase)/.08),phase};
}
function passingPlanetTexture(palette,variant){
 const key=palette.join('|')+'|'+variant;
 if(passingPlanetCache?.key===key)return passingPlanetCache.canvas;
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const g=canvas.getContext('2d');
 const r=117,cx=128,cy=128;
 g.save();g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.clip();
 const base=g.createRadialGradient(85,77,5,cx,cy,r*1.12);base.addColorStop(0,palette[0]);base.addColorStop(.48,palette[1]);base.addColorStop(1,'#050c19');g.fillStyle=base;g.fillRect(0,0,256,256);
 // Broad cloud bands or scattered craters give each chapter a distinct silhouette.
 for(let i=0;i<16;i++){
  g.fillStyle=i%2?'#e1f4ff12':'#02091620';g.beginPath();
  if(variant%3===1){const yy=30+i*13;g.ellipse(128,yy,133,3+i%3*2,-.16,0,Math.PI*2);}
  else {const a=i*2.39996,rr=20+(i*31)%88;g.ellipse(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,5+i%4*4,3+i%3*3,a,0,Math.PI*2);}
  g.fill();
 }
 const shade=g.createLinearGradient(25,40,230,180);shade.addColorStop(0,'#03091700');shade.addColorStop(.48,'#03091708');shade.addColorStop(1,'#020611dd');g.fillStyle=shade;g.fillRect(0,0,256,256);g.restore();
 g.strokeStyle=palette[0]+'66';g.lineWidth=1.4;g.beginPath();g.arc(cx,cy,r,-Math.PI*.98,-Math.PI*.24);g.stroke();
 passingPlanetCache={key,canvas};return canvas;
}
function drawPassingPlanet(){
 if(!['play','ready','pause','falling','exploding'].includes(state))return;
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 const variant=mode==='story'?Math.floor(level/3):Math.floor((floor-1)/3)%6;
 const pose=passingPlanetPose(z-2,W,H,variant,reduced),radius=pose.radius;
 if(pose.alpha<=0||pose.x+radius<0||pose.x-radius>W||pose.y+radius<0)return;
 const texture=passingPlanetTexture(stageProfile().planet,variant);
 ctx.save();ctx.globalAlpha=pose.alpha*.90;
 // The padded sprite includes a thin atmospheric rim. World geometry draws next.
 const size=radius*256/117;ctx.drawImage(texture,pose.x-size/2,pose.y-size/2,size,size);ctx.restore();
}
