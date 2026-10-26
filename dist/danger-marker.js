// One hologram per rectangular lethal patch; shared by story, endless and editor tests.
function dangerPatches(){
 const map=activeRoadData(),out=[],scanned=new Map(),min=Math.max(0,Math.floor(z)-2),max=Math.min(rows.length-1,Math.floor(z)+75);
 const lethal=(r,l)=>!!rows[r]?.[l]&&map.roadPaint?.[r]?.[l]==='pink';
 const span=(r,l)=>{let a=l,b=l;while(a>0&&lethal(r,a-1))a--;while(b+1<rows[r].length&&lethal(r,b+1))b++;return [a,b]};
 for(let r=min;r<=max;r++)for(let l=0;l<(rows[r]?.length||0);l++){
  if(!lethal(r,l))continue;const [left,right]=span(r,l);l=right;const spanKey=left+':'+right;
  if((scanned.get(spanKey)??-1)>=r)continue;
  const matches=q=>{if(q<0||q>=rows.length||!lethal(q,left))return false;const bounds=span(q,left);return bounds[0]===left&&bounds[1]===right;};
  let start=r,end=r;while(matches(start-1))start--;while(matches(end+1))end++;scanned.set(spanKey,end);
  let height=0;for(let q=start;q<=end;q++)for(let lane=left;lane<=right;lane++)height=Math.max(height,boxHeight(rows[q][lane]));
  out.push({center:(left+right)/2-3,depth:(start+end+1)/2,height});
 }
 return out;
}
// Rectangular hazard geometry is static within the same visible story row range.
let storyDangerCache=null;
const scanDangerPatches=dangerPatches;dangerPatches=function(){
 if(mode!=='story'||editorTesting)return scanDangerPatches();const row=Math.floor(z),map=activeRoadData();
 if(!storyDangerCache||storyDangerCache.rows!==rows||storyDangerCache.map!==map||storyDangerCache.row!==row)storyDangerCache={rows,map,row,value:scanDangerPatches()};return storyDangerCache.value;
};
function drawDangerHolograms(){
 if(!['play','pause','dead','exploding','falling'].includes(state))return;
 for(const patch of dangerPatches()){
  const distance=patch.depth-z;if(distance<-.6||distance>75)continue;
  const clock=finishReducedMotion()?0:performance.now()*.001,p=proj(patch.center,patch.depth,patch.height+1.65+Math.sin(clock*1.7)*.045);
  const {size,alpha,stroke,glow}=finishSignPresentation(p[2]);if(!Number.isFinite(size)||alpha<=0)continue;
  ctx.save();ctx.translate(p[0],p[1]);ctx.globalAlpha=alpha*.92;ctx.fillStyle='#30121ddd';ctx.strokeStyle='#ff6c68';ctx.lineWidth=stroke;ctx.shadowColor='#ff4949';ctx.shadowBlur=glow*(finishReducedMotion()?.4:finishGlint());
  ctx.fillRect(-size*2.1,-size*.65,size*4.2,size*1.3);ctx.strokeRect(-size*2.1,-size*.65,size*4.2,size*1.3);
  ctx.font='bold '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffe3d5';ctx.fillText('DANGER',0,0);ctx.shadowBlur=0;
  ctx.globalAlpha=alpha*.18;for(let n=-2;n<=2;n++){ctx.beginPath();ctx.moveTo(-size*2,n*size*.22);ctx.lineTo(size*2,n*size*.22);ctx.stroke()}ctx.restore();
 }
}
const dangerMarkerDraw=draw;draw=function(){dangerMarkerDraw();drawDangerHolograms()};
