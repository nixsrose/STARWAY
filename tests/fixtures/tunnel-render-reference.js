// Pre-optimization reference for exact render parity. Retain only in tests.
function tunnelMaterialMix(a,b,t){return '#'+a.slice(1).match(/../g).map((v,i)=>Math.round(parseInt(v,16)*(1-t)+parseInt(b.slice(1+i*2,3+i*2),16)*t).toString(16).padStart(2,'0')).join('');}
function tunnelFacetOrder(center,radius,height,segments=16){
 const cx=x*.28,cy=2.6+cameraDrop;
 const facets=Array.from({length:segments},(_,i)=>{const angle=(i+.5)*Math.PI/segments,mx=center+radius*Math.cos(angle),my=height*Math.sin(angle)+.12;return {i,distance:(mx-cx)**2+(my-cy)**2,facing:(cx-mx)*Math.cos(angle)/radius+(cy-my)*Math.sin(angle)/height>0}});
 // Open-ended shells are two-sided: paint the visible interior before the exterior.
 return facets.sort((a,b)=>Number(a.facing)-Number(b.facing)||b.distance-a.distance);
}
function drawTunnelFrames(foreground=false){
 if(foreground&&tunnelGrounded)return;
 for(const m of collectTunnelMeshes()){
  // Draw the complete near shell before the ship, including the roof behind it.
  // The foreground pass only restores occlusion for a ship beneath the shell.
  const start=Math.max(m.start,z-3.5),end=foreground?Math.min(m.end,z):m.end;if(end<=start)continue;
  const baseTint=m.color==='rose'?'#d990a0':m.color==='lavender'?'#b4a3c8':m.color==='peach'?'#d6ac95':m.color==='aqua'?'#24bba8':m.color==='blue'?'#4141db':m.color==='green'?'#36bb42':m.color==='red'?'#cf8743':m.color==='gold'?'#e9b437':m.color==='ice'?'#28c9e0':m.color==='mint'?'#a3caba':level<3?'#d84b79':level===3?'#d9c044':'#819aa8';
  const polished=releaseMaterialsActive(),nearDetails=polished&&start<z+18,segments=start>z+32?8:start>z+14?12:tunnelRenderSegments();
  for(const center of [...m.centers].sort((a,b)=>Math.abs(b-x*.28)-Math.abs(a-x*.28))){
   // Conservative screen bounds include the entire shell and entrance cap.
   const bounds=[];for(const depth of [start,end])for(const side of [center-m.radius,center+m.radius])for(const height of [0,m.height+.12])bounds.push(proj(side,depth,height));
   if(bounds.every(p=>p[0]<-4)||bounds.every(p=>p[0]>W+4)||bounds.every(p=>p[1]<-4)||bounds.every(p=>p[1]>H+4))continue;
   const hazard=hazardTunnelAt(activeRoadData(),m.start,center),tint=hazard?'#e24b66':baseTint;
   for(const {i,facing} of tunnelFacetOrder(center,m.radius,m.height,segments)){
    const a=i*Math.PI/segments,b=(i+1)*Math.PI/segments,angle=(a+b)/2;
    const xa=center+m.radius*Math.cos(a),xb=center+m.radius*Math.cos(b);
    const inside=!facing,offset=inside?0:.12,ya=m.height*Math.sin(a)+offset,yb=m.height*Math.sin(b)+offset;
    const factor=inside?.40+.12*Math.sin(angle):polished?.48+.46*Math.sin(angle)+.16*Math.cos(angle):.66+.30*Math.sin(angle)+.10*Math.cos(angle);
    const material=inside?baseTint:tint,lit=releaseMaterialsActive()?releaseMaterialTone(material,factor):inside?releaseMaterialTone(material,.55):material;
    poly([proj(xa,start,ya),proj(xb,start,yb),proj(xb,end,yb),proj(xa,end,ya)],lit,lit);
    if(hazard&&!inside&&i>=segments*.28&&i<=segments*.72)for(let stripe=Math.ceil(start/2)*2;stripe<Math.min(end,z+45);stripe+=2){const edge=Math.min(end,stripe+.22);poly([proj(xa,stripe,ya+.008),proj(xb,stripe,yb+.008),proj(xb,edge,yb+.008),proj(xa,edge,ya+.008)],'#ffd181');}
    if(nearDetails){
     // Fine longitudinal seams and narrow brushed-metal support bands.
     if(i%6===0)releaseWorldLine([proj(xa,start,ya+.002),proj(xa,Math.min(end,z+35),ya+.002)],inside?'#a2d0d033':'#eaf9f04a',.65);
     for(let rib=Math.ceil(start/5)*5;rib<Math.min(end,z+35);rib+=5){
      const edge=Math.min(end,rib+.13),band=inside?tunnelMaterialMix(tint,'#102b3b',.67):tunnelMaterialMix(tint,'#b9cbd1',.43);
      poly([proj(xa,rib,ya+.003),proj(xb,rib,yb+.003),proj(xb,edge,yb+.003),proj(xa,edge,ya+.003)],band);
      releaseWorldLine([proj(xa,rib,ya+.005),proj(xb,rib,yb+.005)],inside?'#0a203255':'#122a3c55',.65);
      releaseWorldLine([proj(xa,edge,ya+.005),proj(xb,edge,yb+.005)],inside?'#9bdee077':'#f1ffff88',.8);
     }
     if(inside&&(i===1||i===segments-2)){
      const insetA=a+(b-a)*.45,insetB=a+(b-a)*.57;
      const point=(angle,depth)=>proj(center+m.radius*Math.cos(angle),depth,m.height*Math.sin(angle)+.003);
      poly([point(insetA,start),point(insetB,start),point(insetB,Math.min(end,z+28)),point(insetA,Math.min(end,z+28))],'#a2eee8');
     }
    }
   }
   // Complete entrance arch is a separate end cap, never culled with shell faces.
   if(m.entrance&&start===m.start)for(let i=0;i<segments;i++){
    const a=i*Math.PI/segments,b=(i+1)*Math.PI/segments,xa=center+m.radius*Math.cos(a),xb=center+m.radius*Math.cos(b),ya=m.height*Math.sin(a),yb=m.height*Math.sin(b);
    const edge=polished?tunnelMaterialMix(tint,'#8198a5',.58):'#607c89';
    const face=[proj(xa,start,ya),proj(xb,start,yb),proj(xb,start,yb+.12),proj(xa,start,ya+.12)];
    let bevel=edge;if(nearDetails){bevel=ctx.createLinearGradient(...face[0].slice(0,2),...face[3].slice(0,2));bevel.addColorStop(0,tunnelMaterialMix(edge,'#102536',.50));bevel.addColorStop(.3,edge);bevel.addColorStop(.76,tunnelMaterialMix(edge,'#eaf7f5',.58));bevel.addColorStop(1,edge);}
    poly(face,bevel);
    if(typeof drawReleaseTunnelRim==='function')drawReleaseTunnelRim(xa,xb,ya+.12,yb+.12,start);
    if(nearDetails){
     releaseWorldLine([proj(xa,start,ya+.012),proj(xb,start,yb+.012)],'#0a213c99',.85);
     if(i===3||i===segments-4)poly([proj(xa,start,ya+.045),proj(xb,start,yb+.045),proj(xb,start,yb+.078),proj(xa,start,ya+.078)],'#c2fff0');
    }
   }
  }
 }
}
