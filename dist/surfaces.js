const ROAD_PAINT_COLORS={amber:'#e6a044',rose:'#bf8290',rust:'#99594e',crimson:'#ce873b',moonGray:'#65658c',lime:'#63de28',electricPurple:'#9c22ec',electricBlue:'#3434e8',white:'#dde0f2',indigo:'#5343ca',lavender:'#7864ab',peach:'#c79a90',sand:'#b5b396',pink:'#c52c49',slate:'#3e7888',violet:'#585176',aqua:'#45c6b8',mint:'#afd8c8',gray:'#666b6d',lemon:'#e4ee50',magenta:'#970776',ochre:'#ce873b'};
// Connected surfaces share exact edges; only exposed boundaries get thickness.
let visibleBoxMeshes=[];
function roadTint(row,lane,tile){
if(tile===3)return '#3cbfb0';
const paint=activeRoadData().roadPaint?.[row]?.[lane];if(paint)return ROAD_PAINT_COLORS[paint]||'#afd8c8';
if(activeRoadData().roadColors)return roadColorAt(row,lane);
const chapter=mode==='story'?Math.floor(level/3):Math.floor((floor-1)/3)%6;
const a=stageProfile().colors[1],b=stageProfile().colors[2];
if(chapter===0)return a;
if(chapter===1)return Math.floor(row/6)%2?a:b;
if(chapter===2)return (lane+Math.floor(row/5))%3===0?b:a;
if(chapter===3)return row%10<2?b:a;
if(chapter===4)return (Math.floor(row/4)+lane)%2?a:b;
return (Math.floor(row/5)+Math.floor(lane/2))%2?a:b;
}
function drawRoadSurfaces(){
const end=Math.min(rows.length-1,Math.floor(z)+75),start=Math.max(0,Math.floor(z)-3);
for(let r=end;r>=start;r--){const cells=rows[r]||[],tints=cells.map((tile,lane)=>tile?roadTint(r,lane,tile):null);let l=0;
while(l<cells.length){if(!cells[l]){l++;continue}let first=l;while(l<cells.length&&cells[l])l++;const last=l;
const a=first-roadOffset(),b=last-roadOffset();
// Continuous base beneath the decorative colors, no interior underside quads.
poly([proj(a,r,0),proj(a,r+1,0),proj(a,r+1,-.18),proj(a,r,-.18)],'#344753');
poly([proj(b,r,0),proj(b,r+1,0),proj(b,r+1,-.18),proj(b,r,-.18)],'#243440');
poly([proj(a,r),proj(b,r),proj(b,r+1),proj(a,r+1)],tints[first]);
// Batch adjoining coplanar tiles with identical paint into a single quad.
for(let k=first;k<last;){const begin=k,co=tints[k];k++;while(k<last&&tints[k]===co)k++;
poly([proj(begin-roadOffset(),r),proj(k-roadOffset(),r),proj(k-roadOffset(),r+1),proj(begin-roadOffset(),r+1)],co,co);}
for(let k=first;k<last;k++){
const xx=k-roadOffset();
if(!rows[r-1]?.[k])poly([proj(xx,r),proj(xx+1,r),proj(xx+1,r,-.18),proj(xx,r,-.18)],'#3d4b55');
drawRoadPickup(r,k,cells[k]);
}}
if(typeof editorTesting!=='undefined'&&editorTesting)drawEditorRoadGrid(r);
}
}
function drawRoadPickup(r,l,t){
const a=l-roadOffset(),b=a+1;
if(t===3)poly([proj(a+.2,r+.2,.01),proj(b-.2,r+.2,.01),proj(b-.2,r+.8,.01),proj(a+.2,r+.8,.01)],'#7ffff0');
if(t===4||t===5){const tint=t===4?'#55baff':'#ffbd68';poly([proj(a+.1,r+.2,.02),proj(b-.1,r+.2,.02),proj(b-.1,r+.8,.02),proj(a+.1,r+.8,.02)],tint);poly([proj(a+.3,r+.65,.04),proj(a+.5,r+.35,.04),proj(a+.7,r+.65,.04)],'#e8fbff')}

}
function boxColorForData(map,r,l){if(boxHeight(map.tiles?.[r]?.[l]||0)&&map.roadPaint?.[r]?.[l]==='pink')return 'hazard';return map.boxPaint?.[r]?.[l]||map.boxColors?.[r]||'ochre'}
function boxColorAt(r,l){if(boxHeight(rows[r]?.[l]||0)&&activeRoadData().roadPaint?.[r]?.[l]==='pink')return 'hazard';return boxColorForData(activeRoadData(),r,l)}
const boxFacePaletteCache=new Map();
function boxFaceColors(color){if(boxFacePaletteCache.has(color))return boxFacePaletteCache.get(color);const aliases={red:'ochre',blue:'electricBlue',orange:'ochre',green:'lime',cyan:'aqua',crimson:'ochre',pink:'ochre'};const base=color==='hazard'?ROAD_PAINT_COLORS.pink:ROAD_PAINT_COLORS[aliases[color]||color]||ROAD_PAINT_COLORS.ochre;const shade=k=>'#'+base.slice(1).match(/../g).map(v=>Math.round(parseInt(v,16)*k).toString(16).padStart(2,'0')).join('');const palette={top:base,cap:shade(.72),left:shade(.84),right:shade(.5)};boxFacePaletteCache.set(color,palette);return palette;}
function blockNearZ(){return z-4+WORLD_NEAR_DEPTH;}
function blockFirstRow(){return Math.max(0,Math.floor(blockNearZ()));}
function collectBoxMeshes(){
const min=blockFirstRow(),max=Math.min(rows.length-1,Math.floor(z)+75),used=new Set(),meshes=[];
for(let r=min;r<=max;r++)for(let l=0;l<(rows[r]?.length||0);l++){
const tile=rows[r][l];if(!boxHeight(tile)||used.has(r+':'+l))continue;
let right=l+1;while(rows[r]?.[right]===tile&&boxColorAt(r,right)===boxColorAt(r,l)&&!used.has(r+':'+right))right++;
let end=r+1;
while(end<=max&&Array.from({length:right-l},(_,j)=>j+l).every(k=>rows[end]?.[k]===tile&&boxColorAt(end,k)===boxColorAt(r,l)&&!used.has(end+':'+k)))end++;
for(let rr=r;rr<end;rr++)for(let k=l;k<right;k++)used.add(rr+':'+k);
meshes.push({start:r,end,left:l-roadOffset(),right:right-roadOffset(),height:boxHeight(tile),color:boxColorAt(r,l)});
}
return meshes.sort((a,b)=>b.end-a.end);
}
function drawBoxMesh(mesh,foreground=false){
if(foreground&&y>=mesh.height-.025)return;
const start=Math.max(mesh.start,blockNearZ()),end=foreground?Math.min(mesh.end,z):mesh.end;
if(end<=start)return;const a=mesh.left,b=mesh.right,h=mesh.height,p=boxFaceColors(mesh.color);
poly([proj(a,start,0),proj(b,start,0),proj(b,start,h),proj(a,start,h)],p.cap);
poly([proj(a,start,0),proj(a,end,0),proj(a,end,h),proj(a,start,h)],p.left);
poly([proj(b,start,0),proj(b,end,0),proj(b,end,h),proj(b,start,h)],p.right);
poly([proj(a,start,h),proj(b,start,h),proj(b,end,h),proj(a,end,h)],p.top,p.top);
}
function tunnelSignature(r){return JSON.stringify([ceilingAt(r),tunnelRadius(r),tunnelCenters(r),activeRoadData().tunnelColors?.[r],tunnelCenters(r).filter(c=>hazardTunnelAt(activeRoadData(),r,c))])}
function collectTunnelMeshes(){
const min=Math.max(0,Math.floor(z)-3),max=Math.min(rows.length-1,Math.floor(z)+70),out=[];
for(let r=min;r<=max;){if(!ceilingAt(r)){r++;continue}let start=r,sig=tunnelSignature(r);r++;while(r<=max&&ceilingAt(r)&&tunnelSignature(r)===sig)r++;
out.push({color:activeRoadData().tunnelColors?.[start],entrance:start===0||!ceilingAt(start-1)||tunnelSignature(start-1)!==sig,start,end:r,height:ceilingAt(start),radius:tunnelRadius(start),centers:tunnelCenters(start)});
}
return out.reverse();
}
function tunnelRoofAt(r,xx){if(!ceilingAt(r))return 0;const rad=tunnelRadius(r),local=Math.min(...tunnelCenters(r).map(c=>Math.abs(xx-c)));return local<=rad?ceilingAt(r)*Math.sqrt(Math.max(0,1-(local/rad)**2))+.12:0}
// Small bounded caches: inputs are material colors and fixed LOD arc sizes.
const tunnelMixCache=new Map(),tunnelArcCache=new Map();
function tunnelMaterialMix(a,b,t){const key=a+'|'+b+'|'+t;if(tunnelMixCache.has(key))return tunnelMixCache.get(key);const value='#'+a.slice(1).match(/../g).map((v,i)=>Math.round(parseInt(v,16)*(1-t)+parseInt(b.slice(1+i*2,3+i*2),16)*t).toString(16).padStart(2,'0')).join('');if(tunnelMixCache.size>=128)tunnelMixCache.delete(tunnelMixCache.keys().next().value);tunnelMixCache.set(key,value);return value;}
function tunnelArc(segments){if(tunnelArcCache.has(segments))return tunnelArcCache.get(segments);const arc=Array.from({length:segments},(_,i)=>{const a=i*Math.PI/segments,b=(i+1)*Math.PI/segments,angle=(a+b)/2;return {a,b,angle,cosA:Math.cos(a),sinA:Math.sin(a),cosB:Math.cos(b),sinB:Math.sin(b),cosMid:Math.cos((i+.5)*Math.PI/segments),sinMid:Math.sin((i+.5)*Math.PI/segments),sinLight:Math.sin(angle),cosLight:Math.cos(angle)}});if(tunnelArcCache.size>=8)tunnelArcCache.delete(tunnelArcCache.keys().next().value);tunnelArcCache.set(segments,arc);return arc;}

function tunnelRenderSegments(){return releaseMaterialsActive()?24:16;}
function tunnelFacetOrder(center,radius,height,segments=16){
 const cx=x*.28,cy=2.6+cameraDrop;
 const facets=tunnelArc(segments).map((v,i)=>{const mx=center+radius*v.cosMid,my=height*v.sinMid+.12;return {i,distance:(mx-cx)**2+(my-cy)**2,facing:(cx-mx)*v.cosMid/radius+(cy-my)*v.sinMid/height>0}});
 // Open-ended shells are two-sided: paint the visible interior before the exterior.
 return facets.sort((a,b)=>Number(a.facing)-Number(b.facing)||b.distance-a.distance);
}
// Keep full shells, entrances and hazard stripes for every lane. For parallel
// corridors, spend fine bevel/rib detail on the tunnel nearest the pilot.
function tunnelDetailCenter(mesh){
 const centers=tunnelCenters(mesh.start);if(centers.length<2)return null;
 return centers.reduce((a,b)=>Math.abs(x-b)<Math.abs(x-a)?b:a);
}
function drawTunnelFrames(foreground=false,range=null,meshes=null){
 if(foreground&&tunnelGrounded)return;
 for(const m of meshes||collectTunnelMeshes()){
  // Draw the complete near shell before the ship, including the roof behind it.
  // The foreground pass only restores occlusion for a ship beneath the shell.
  const start=Math.max(m.start,z-3.5,range?.start??-Infinity),end=Math.min(foreground?Math.min(m.end,z):m.end,range?.end??Infinity);if(end<=start)continue;
  const baseTint=m.color==='rose'?'#d990a0':m.color==='lavender'?'#b4a3c8':m.color==='peach'?'#d6ac95':m.color==='aqua'?'#24bba8':m.color==='blue'?'#4141db':m.color==='green'?'#36bb42':m.color==='red'?'#cf8743':m.color==='gold'?'#e9b437':m.color==='ice'?'#28c9e0':m.color==='mint'?'#a3caba':level<3?'#d84b79':level===3?'#d9c044':'#819aa8';
  const polished=releaseMaterialsActive(),detailEligible=polished&&start<z+18,detailCenter=tunnelDetailCenter(m),segments=start>z+32?8:start>z+14?12:tunnelRenderSegments(),arc=tunnelArc(segments);
  for(const center of [...m.centers].sort((a,b)=>Math.abs(b-x*.28)-Math.abs(a-x*.28))){
   const nearDetails=detailEligible&&(detailCenter===null||center===detailCenter);
   // Conservative screen bounds include the entire shell and entrance cap.
   const bounds=[];for(const depth of [start,end])for(const side of [center-m.radius,center+m.radius])for(const height of [0,m.height+.12])bounds.push(proj(side,depth,height));
   if(bounds.every(p=>p[0]<-4)||bounds.every(p=>p[0]>W+4)||bounds.every(p=>p[1]<-4)||bounds.every(p=>p[1]>H+4))continue;
   const hazard=hazardTunnelAt(activeRoadData(),m.start,center),tint=hazard?'#e24b66':baseTint;
   for(const {i,facing} of tunnelFacetOrder(center,m.radius,m.height,segments)){
    const v=arc[i],{a,b,angle}=v;
    const xa=center+m.radius*v.cosA,xb=center+m.radius*v.cosB;
    const inside=!facing,offset=inside?0:.12,ya=m.height*v.sinA+offset,yb=m.height*v.sinB+offset;
    const factor=inside?.40+.12*v.sinLight:polished?.48+.46*v.sinLight+.16*v.cosLight:.66+.30*v.sinLight+.10*v.cosLight;
    const material=inside?baseTint:tint,lit=releaseMaterialsActive()?releaseMaterialTone(material,factor):inside?releaseMaterialTone(material,.55):material;
    poly([proj(xa,start,ya),proj(xb,start,yb),proj(xb,end,yb),proj(xa,end,ya)],lit,lit);
    if(hazard&&!inside&&i>=segments*.28&&i<=segments*.72)for(let stripe=Math.ceil(start/2)*2;stripe<Math.min(end,z+45);stripe+=2){const edge=Math.min(end,stripe+.22);poly([proj(xa,stripe,ya+.008),proj(xb,stripe,yb+.008),proj(xb,edge,yb+.008),proj(xa,edge,ya+.008)],'#ffd181');}
    if(nearDetails){
     // Fine longitudinal seams and narrow brushed-metal support bands.
     if(i%6===0)releaseWorldLine([proj(xa,start,ya+.002),proj(xa,Math.min(end,z+35),ya+.002)],inside?'#a2d0d033':'#eaf9f04a',.65);
     const bands=[],darkEdges=[],lightEdges=[];
     for(let rib=Math.ceil(start/5)*5;rib<Math.min(end,z+35);rib+=5){
      const edge=Math.min(end,rib+.13);
      bands.push([proj(xa,rib,ya+.003),proj(xb,rib,yb+.003),proj(xb,edge,yb+.003),proj(xa,edge,ya+.003)]);
      darkEdges.push([proj(xa,rib,ya+.005),proj(xb,rib,yb+.005)]);
      lightEdges.push([proj(xa,edge,ya+.005),proj(xb,edge,yb+.005)]);
     }
     if(bands.length){
      const band=inside?tunnelMaterialMix(tint,'#102b3b',.67):tunnelMaterialMix(tint,'#b9cbd1',.43);
      ctx.save();ctx.beginPath();for(const points of bands){ctx.moveTo(points[0][0],points[0][1]);for(let j=1;j<4;j++)ctx.lineTo(points[j][0],points[j][1]);ctx.closePath();}ctx.fillStyle=band;ctx.fill();
      for(const [edges,color,width] of [[darkEdges,inside?'#0a203255':'#122a3c55',.65],[lightEdges,inside?'#9bdee077':'#f1ffff88',.8]]){ctx.beginPath();for(const [a,b] of edges){ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);}ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}ctx.restore();
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
    const v=arc[i],xa=center+m.radius*v.cosA,xb=center+m.radius*v.cosB,ya=m.height*v.sinA,yb=m.height*v.sinB;
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
function drawForegroundStructures(){drawSolidStructures(true);drawOverheadBridges(true)}

function drawOverheadBridges(foreground=false){
for(const m of activeRoadData().bridges||[]){if(m.end<z-3||m.start>z+75)continue;const start=Math.max(m.start,foreground?z-3:z),end=foreground?Math.min(m.end,z):m.end;if(end<=start)continue;const a=m.left,b=m.right,h=m.height,t=m.thickness;
poly([proj(a,start,h),proj(b,start,h),proj(b,start,h+t),proj(a,start,h+t)],'#8eafa3');
poly([proj(a,start,h+t),proj(b,start,h+t),proj(b,end,h+t),proj(a,end,h+t)],'#bddfce','#bddfce');
}}

function boxVisibleFaces(r,l){const h=boxHeight(rows[r]?.[l]||0);return {height:h,front:h>boxHeight(rows[r-1]?.[l]||0),back:h>boxHeight(rows[r+1]?.[l]||0),left:h>boxHeight(rows[r]?.[l-1]||0),right:h>boxHeight(rows[r]?.[l+1]||0)}}
// Connected side walls are one opaque face, rather than independently
// antialiased row strips that can reveal the road through their shared seams.
function connectedBoxSideStart(r,l,side,first,last){
 const height=boxHeight(rows[r]?.[l]||0),bottom=boxHeight(rows[r]?.[l+side]||0),color=boxColorAt(r,l);
 const same=q=>q>=first&&q<=last&&boxHeight(rows[q]?.[l]||0)===height&&boxHeight(rows[q]?.[l+side]||0)===bottom&&boxColorAt(q,l)===color;
 if(same(r+1))return null;let start=r;while(same(start-1))start--;return start;
}
function drawBoxSurfaces(foreground=false,range=null,laneOnly=null){
 const first=Math.max(blockFirstRow(),Math.floor(range?.start??0)),last=Math.min(rows.length-1,foreground?Math.floor(z):Math.floor(z)+75,Math.ceil(range?.end??Infinity)-1);
 for(let r=last;r>=first;r--){
  const start=Math.max(r,blockNearZ(),range?.start??-Infinity),end=Math.min(foreground?Math.min(r+1,z):r+1,range?.end??Infinity);if(end<=start)continue;
  const cells=[];
  for(let l=0;l<(rows[r]?.length||0);l++){if(laneOnly!==null&&l!==laneOnly)continue;const f=boxVisibleFaces(r,l);if(f.height&&(!foreground||y<f.height-.025))cells.push({l,f,h:f.height,a:l-roadOffset(),b:l-roadOffset()+1,p:boxFaceColors(boxColorAt(r,l))});}
  // Finish the entire coplanar top after exposed walls. A wall from another
  // cell must never cut a triangle into the same connected top surface.
  for(const h of [...new Set(cells.map(c=>c.h))].sort((a,b)=>a-b)){
   const layer=cells.filter(c=>c.h===h).sort((a,b)=>Math.abs((b.a+b.b)/2-x*.28)-Math.abs((a.a+a.b)/2-x*.28));
   for(const {l,f,a,b,p} of layer){
    if(f.left&&x*.28<a){const near=connectedBoxSideStart(r,l,-1,first,last);if(near!==null){const wallStart=Math.max(near,blockNearZ(),range?.start??-Infinity),bottom=boxHeight(rows[r]?.[l-1]||0);poly([proj(a,wallStart,bottom),proj(a,end,bottom),proj(a,end,h),proj(a,wallStart,h)],p.left,p.left);}}
    if(f.right&&x*.28>b){const near=connectedBoxSideStart(r,l,1,first,last);if(near!==null){const wallStart=Math.max(near,blockNearZ(),range?.start??-Infinity),bottom=boxHeight(rows[r]?.[l+1]||0);poly([proj(b,wallStart,bottom),proj(b,end,bottom),proj(b,end,h),proj(b,wallStart,h)],p.right,p.right);}}
    if(f.front&&start===r){const bottom=boxHeight(rows[r-1]?.[l]||0);poly([proj(a,start,bottom),proj(b,start,bottom),proj(b,start,h),proj(a,start,h)],p.cap,p.cap);}
   }
   const tops=layer.slice().sort((a,b)=>a.a-b.a);
   for(let i=0;i<tops.length;){const first=tops[i];let right=first.b;i++;while(i<tops.length&&tops[i].a===right&&tops[i].p.top===first.p.top){right=tops[i].b;i++;}
    poly([proj(first.a,start,h),proj(right,start,h),proj(right,end,h),proj(first.a,end,h)],first.p.top,first.p.top);
   }
   for(const {l,f} of layer)if(typeof drawReleaseBoxDetail==='function')drawReleaseBoxDetail(r,l,start,end,h,f);
  }
 }
}

// Exact finite ray/shell intersections avoid frame-dependent sampling gaps.
function rayBoxInterval(origin,delta,bounds,lo,hi){
 for(let axis=0;axis<3;axis++){const d=delta[axis],v=origin[axis],[a,b]=bounds[axis];if(Math.abs(d)<1e-10){if(v<a||v>b)return false;continue;}let t0=(a-v)/d,t1=(b-v)/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;}return hi>1e-7&&lo<1-1e-7;
}
function rayTunnelShell(cx,cy,dx,dy,center,radius,height,lo,hi){
 const hit=t=>t>=lo-1e-8&&t<=hi+1e-8&&t>1e-7&&t<1-1e-7;
 const within=t=>{const xx=cx+dx*t-center,yy=cy+dy*t;if(Math.abs(xx)>radius+1e-8)return false;const roof=height*Math.sqrt(Math.max(0,1-(xx/radius)**2));return yy>=roof-1e-8&&yy<=roof+.12+1e-8;};
 if((hit(lo)&&within(lo))||(hit(hi)&&within(hi)))return true;
 for(const offset of [0,.12]){const ax=(cx-center)/radius,ay=(cy-offset)/height,bx=dx/radius,by=dy/height,A=bx*bx+by*by,B=2*(ax*bx+ay*by),C=ax*ax+ay*ay-1,D=B*B-4*A*C;if(A<1e-12||D<0)continue;for(const t of [(-B-Math.sqrt(D))/(2*A),(-B+Math.sqrt(D))/(2*A)])if(hit(t)&&cy+dy*t>=offset-1e-8)return true;}return false;
}
function coinBlockedByBox(r,l,height){
 const origin=[x*.28,z-4,2.6+cameraDrop],target=[l-roadCenterLane(),r+.5,height],delta=target.map((v,i)=>v-origin[i]);if(delta[1]<=0)return false;
 for(let rr=Math.max(0,Math.floor(z)-3);rr<=r;rr++){
  const lo=Math.max(0,(Math.max(rr,z-3.5)-origin[1])/delta[1]),hi=Math.min(1,(rr+1-origin[1])/delta[1]);if(hi<=lo)continue;
  for(let lane=0;lane<(rows[rr]?.length||0);lane++){const h=boxHeight(rows[rr][lane]);if(h&&rayBoxInterval(origin,delta,[[lane-roadOffset(),lane-roadOffset()+1],[rr,rr+1],[0,h]],lo,hi))return true;}
  for(const deck of activeRoadData().bridges||[])if(rr>=deck.start&&rr<deck.end&&rayBoxInterval(origin,delta,[[deck.left,deck.right],[deck.start,deck.end],[deck.height,deck.height+deck.thickness]],lo,hi))return true;
  const h=ceilingAt(rr);if(h)for(const center of tunnelCenters(rr))if(rayTunnelShell(origin[0],origin[2],delta[0],delta[2],center,tunnelRadius(rr),h,lo,hi))return true;
 }return false;
}
// Split only at geometry changes, retaining long tunnel batches within a corridor.
let solidStructureFramePlan=null;
function buildSolidStructurePlan(min,max,meshes){
 let hasBoxes=false,previous='';const cuts=new Set([min,max]);
 for(let row=min;row<max;row++){const signature=(rows[row]||[]).map(t=>boxHeight(t)).join(',');if(signature!==previous){cuts.add(row);previous=signature;}if(rows[row]?.some(t=>boxHeight(t)>0))hasBoxes=true;}
 if(!hasBoxes||!meshes.length)return null;
 for(const m of meshes){cuts.add(Math.max(min,m.start));cuts.add(Math.min(max,m.end));}
 const bounds=[...cuts].sort((a,b)=>b-a),plan=[];
 for(let i=0;i<bounds.length-1;i++){const range={start:bounds[i+1],end:bounds[i]},tasks=[];
  for(let lane=0;lane<7;lane++){let present=false;for(let r=range.start;r<range.end;r++)if(boxHeight(rows[r]?.[lane]||0)>0){present=true;break;}if(present)tasks.push({kind:'box',lane,center:lane-roadOffset()+.5});}
  for(const m of meshes)if(m.start<range.end&&m.end>range.start)for(const center of m.centers)tasks.push({kind:'tunnel',center,mesh:{...m,centers:[center]}});
  tasks.sort((a,b)=>Math.abs(b.center-x*.28)-Math.abs(a.center-x*.28));plan.push({range,tasks});
 }return plan;
}
function drawSolidStructures(foreground=false){
 const min=blockFirstRow(),max=Math.min(rows.length,Math.floor(z)+76),meshes=collectTunnelMeshes();
 // Main and foreground passes use the same geometry and camera in this frame.
 // Never retain the plan across frames, edits, retries or viewport changes.
 let plan;if(renderInProgress){if(!solidStructureFramePlan)solidStructureFramePlan={value:buildSolidStructurePlan(min,max,meshes)};plan=solidStructureFramePlan.value;}else plan=buildSolidStructurePlan(min,max,meshes);
 if(!plan){drawBoxSurfaces(foreground);drawTunnelFrames(foreground,null,meshes);return;}
 for(const {range,tasks} of plan)for(const task of tasks)if(task.kind==='box')drawBoxSurfaces(foreground,range,task.lane);else drawTunnelFrames(foreground,range,[task.mesh]);
}

function drawWorldCoins(){
 for(const [r,coin] of [...coins].sort((a,b)=>b[0]-a[0])){
  const height=coin.height??.45;if(r<z-2||r>z+75||coinBlockedByBox(r,coin.lane,height))continue;
  const cp=proj(coin.lane-roadCenterLane(),r+.5,height),ry=Math.min(24,Math.max(3,cp[2]*.22));
  const detailed=releaseMaterialsActive(),turn=Math.cos(time*2.8+r*.57),rx=Math.max(2,ry*(detailed?.18+.55*Math.abs(turn):.72)),thickness=detailed?Math.max(1,ry*.12):0;
  ctx.save();ctx.lineWidth=Math.max(.65,Math.min(1.2,ry*.07));
  if(detailed){ctx.fillStyle='#95601b';ctx.beginPath();ctx.ellipse(cp[0]+thickness,cp[1],rx,ry,0,0,Math.PI*2);ctx.fill();}
  const gold=ctx.createLinearGradient(cp[0]-rx,cp[1]-ry,cp[0]+rx,cp[1]+ry);gold.addColorStop(0,'#fff4b2');gold.addColorStop(.32,'#f4cb58');gold.addColorStop(.62,'#d79729');gold.addColorStop(1,'#ffdf78');ctx.fillStyle=gold;ctx.strokeStyle='#ffe9a1';ctx.beginPath();ctx.ellipse(cp[0],cp[1],rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  if(detailed&&ry>5&&Math.abs(turn)>.35){
   ctx.strokeStyle='#9f691f';ctx.beginPath();ctx.ellipse(cp[0],cp[1],rx*.7,ry*.76,0,0,Math.PI*2);ctx.stroke();
   ctx.strokeStyle='#fff0aa';ctx.beginPath();ctx.moveTo(cp[0],cp[1]-ry*.38);ctx.lineTo(cp[0]+rx*.32,cp[1]);ctx.lineTo(cp[0],cp[1]+ry*.38);ctx.lineTo(cp[0]-rx*.32,cp[1]);ctx.closePath();ctx.stroke();
  }
  ctx.restore();
 }
 if(typeof drawPickupFeedback==='function')drawPickupFeedback();
}

function departingTunnelRoof(xx,zz){
 const row=Math.floor(zz),height=ceilingAt(row),radius=tunnelRadius(row);if(!height)return null;
 const center=tunnelCenters(row).find(c=>Math.abs(xx-c)<=radius);if(center===undefined)return null;
 const same=r=>r>=0&&r<rows.length&&ceilingAt(r)===height&&tunnelRadius(r)===radius&&tunnelCenters(r).includes(center);
 let start=row,end=row+1;while(same(start-1))start--;while(same(end))end++;
 return {center,radius,start,end};
}
// A descending pilot above the local curved roof may land while steering uphill.
// Compare with the old local roof, not the highest point beneath the whole hull.
function tunnelTopApproach(ax,ay,bx,by,center,height,radius){
 if(Math.abs(ax-center)>radius)return false;
 const local=Math.min(1,Math.abs(ax-center)/radius),oldRoof=height*Math.sqrt(Math.max(0,1-local*local))+.12;
 return by<=ay&&ay>=oldRoof-.03;
}
function diagonalTunnelLanding(ax,ay,bx,bz,by){
 const row=Math.floor(bz),height=ceilingAt(row),radius=tunnelRadius(row);if(!height)return false;
 return tunnelCenters(row).some(center=>Math.abs(bx-center)<=radius&&tunnelTopApproach(ax,ay,bx,by,center,height,radius));
}
function tunnelSweepCollision(ax,az,ay,bx,bz,by,departure=null){
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(bx-ax)/.045,Math.abs(bz-az)/.15,Math.abs(by-ay)/.045)));
 for(let i=1;i<=steps;i++){
  const t=i/steps,xx=ax+(bx-ax)*t,zz=az+(bz-az)*t,yy=ay+(by-ay)*t,r=Math.floor(zz),h=ceilingAt(r);
  if(!h)continue;const radius=tunnelRadius(r);
  for(const center of tunnelCenters(r)){
   // A ship leaving the outside of its supporting roof can fall beside that
   // shell. Other shells and any movement back into the wall stay solid.
   if(departure&&center===departure.center&&r>=departure.start&&r<departure.end&&Math.abs(bx-center)>=Math.abs(ax-center)-.000001)continue;
   // Test the entire hull interval against the curved shell, including contact
   // between sample points and the vertical edge of a tunnel entrance.
   const left=Math.max(-radius,xx-.28-center),right=Math.min(radius,xx+.28-center);
   if(left>right)continue;
   const near=left<=0&&right>=0?0:Math.min(Math.abs(left),Math.abs(right)),far=Math.max(Math.abs(left),Math.abs(right));
   const high=h*Math.sqrt(Math.max(0,1-(near/radius)**2)),low=h*Math.sqrt(Math.max(0,1-(far/radius)**2));
   if(ay>=high+.12-.03&&by<=ay||tunnelTopApproach(ax,ay,bx,by,center,h,radius))continue;
   if(yy<high+.12-.025&&yy+.35>low+.005){
    const contactHeight=Math.max(low,Math.min(high,yy+.175)),local=radius*Math.sqrt(Math.max(0,1-(contactHeight/h)**2));
    const side=Math.abs(xx-center)>.001?Math.sign(xx-center):(Math.abs(left)>Math.abs(right)?-1:1);
    return {x:xx,z:zz,y:Math.max(0,yy),reason:local>radius*.65?'터널 벽 충돌':'터널 천장 충돌',contact:{x:center+side*local,y:contactHeight,z:zz,center,radius,height:h}};
   }
  }
 }
 return null;
}
