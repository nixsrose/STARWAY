// Multiple finish markers; paint stays independent.
Object.assign(uiWords,{'FINISH 도로':['FINISH road','FINISH 道路','FINISH 道路'],'FINISH 터널':['FINISH tunnel','FINISH トンネル','FINISH 隧道'],'FINISH 기본 위치로':['Reset FINISH position','FINISH位置をリセット','重置FINISH位置']});
for(const [value,label] of [['finishRoad','FINISH 도로'],['finishTunnel','FINISH 터널']]){const o=document.createElement('option');o.value=value;o.textContent=tr(label);$('editorBrush').appendChild(o)}
const finishReset=document.createElement('button');finishReset.id='editorFinishReset';finishReset.type='button';finishReset.textContent=tr('FINISH 기본 위치로');$('editorGoStart').parentNode?.appendChild(finishReset);
finishReset.onclick=()=>{editorSnapshot();delete editorMap.finish;delete editorMap.finishes;renderEditorGrid();$('editorStatus').textContent=tr('FINISH 기본 위치로')};
const finishPaintCell=paintEditorCell;
paintEditorCell=function(r,l,batch=false){
 const brush=$('editorBrush').value;
 if(brush==='finishRoad'||brush==='finishTunnel'){
  if(r<4){$('editorStatus').textContent='FINISH는 5번째 줄 이후에 배치하세요.';return}
  if(!batch)editorSnapshot();
  const type=brush==='finishTunnel'?'tunnel':'road',previousPaint=editorMap.roadPaint[r][l];
  // Use the normal placement path to keep geometry/paint handling consistent.
  $('editorBrush').value=type==='tunnel'?'tunnel':'1';finishPaintCell(r,l,true);$('editorBrush').value=brush;if(previousPaint&&previousPaint!=='pink')editorMap.roadPaint[r][l]=previousPaint;
  const markers=mapFinishes(editorMap).filter(f=>f.row!==r||f.lane!==l);editorMap.finish={row:r,lane:l,type};editorMap.finishes=[...markers,editorMap.finish];
  if(!batch){renderEditorGrid();$('editorStatus').textContent='FINISH · '+(r+1)+'줄 '+(l+1)+'칸 · 저장 후 적용됩니다.'}return;
 }
 finishPaintCell(r,l,batch);
 const markers=mapFinishes(editorMap).filter(f=>{try{normalizeFinish({...editorMap,finish:f});return true}catch{return false}});if(editorMap.finishes)editorMap.finishes=markers;editorMap.finish=markers[markers.length-1];if(!batch)renderEditorGrid();
};
const finishRenderEditor=renderEditorGrid;
renderEditorGrid=function(){finishRenderEditor();const markers=mapFinishes(editorMap);
 for(const cell of ($('editorGrid').children||[])){if(!cell.getAttribute)continue;const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(cell.getAttribute('data-editor-row')===null)continue;
 const f=markers.find(f=>r===f.row&&l===f.lane),marked=markers.length?!!f:r===editorMap.tiles.length-2&&editorMap.tiles[r]?.[l]!==0;
 if(marked){cell.classList.add('finish-cell');cell.textContent='FINISH'+(f?.type==='tunnel'?' ∩':'');cell.title='FINISH · '+(r+1)+'줄 '+(l+1)+'칸';}}
};
const finishFillPage=$('editorFillPage').onclick;$('editorFillPage').onclick=()=>{if($('editorBrush').value.startsWith('finish')){$('editorStatus').textContent='FINISH는 한 칸을 눌러 위치를 지정하세요.';return}finishFillPage()};
function finishMarkerFor(map){if(map.finish)return map.finish;const row=map.tiles.length-2,lanes=(map.tiles[row]||[]).map((v,i)=>v?i:-1).filter(i=>i>=0);return {row,lane:lanes.length?lanes[Math.floor(lanes.length/2)]:3,type:'road',automatic:true};}
function finishReducedMotion(){return typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches}
function finishGlint(){return finishReducedMotion()?1:.75+.25*Math.sin(performance.now()*.003)}
const finishPickup=drawRoadPickup;drawRoadPickup=function(r,l,t){finishPickup(r,l,t);if(mode!=='story'||!t)return;const map=activeRoadData(),f=finishPickupMarker(map,r,l);if(!f||r!==f.row||!f.automatic&&l!==f.lane)return;
 const a=l-roadOffset();ctx.save();ctx.globalAlpha=finishGlint();
 for(let i=0;i<6;i++)for(let j=0;j<2;j++)releaseGroundQuad(a+i/6+.006,a+(i+1)/6-.006,r+.36+j*.14,r+.49+j*.14,.019,(i+j)%2?'#fff2b4':'#a5751c');
 releaseGroundQuad(a+.02,a+.98,r+.32,r+.35,.021,'#ffdc72');releaseGroundQuad(a+.02,a+.98,r+.65,r+.68,.021,'#ffdc72');ctx.restore();
};
// Physical width is 1.428 lanes at every distance; never enlarge distant text.
function finishSignPresentation(scale){
 const size=scale*.34,readability=(size-1.5)/3,u=Math.max(0,Math.min(1,readability));
 return {size,alpha:u*u*(3-2*u),stroke:scale*.025,glow:size*.45};
}
function drawFinishHologram(marker){if(mode!=='story'||!['play','pause','win','dead','exploding','falling'].includes(state))return;
 const map=activeRoadData(),f=marker||finishMarkerFor(map),distance=f.row+.5-z;if(distance<-.6||distance>75)return;
 const center=f.lane-3,clock=finishReducedMotion()?0:performance.now()*.001,bob=Math.sin(clock*1.7)*.045,height=(f.type==='tunnel'?(map.ceilings[f.row]||1.15)+.65:1.65)+bob,p=proj(center,f.row+.5,height);
 const {size,alpha,stroke,glow}=finishSignPresentation(p[2]);if(!Number.isFinite(size)||alpha<=0)return;
 ctx.save();ctx.translate(p[0],p[1]);ctx.globalAlpha=alpha*(.8+.15*finishGlint());ctx.fillStyle='#14272bdd';ctx.strokeStyle='#ffdf83';ctx.lineWidth=stroke;ctx.shadowColor='#ffd76b';ctx.shadowBlur=glow*(finishReducedMotion()?.4:finishGlint());ctx.fillRect(-size*2.1,-size*.65,size*4.2,size*1.3);ctx.strokeRect(-size*2.1,-size*.65,size*4.2,size*1.3);ctx.font='bold '+size+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff1b3';ctx.fillText('FINISH',0,0);ctx.shadowBlur=0;
 ctx.globalAlpha=alpha*.18;ctx.strokeStyle='#ffe7a1';for(let n=-2;n<=2;n++){ctx.beginPath();ctx.moveTo(-size*2,n*size*.22);ctx.lineTo(size*2,n*size*.22);ctx.stroke()}
 ctx.restore();
 if(f.type==='tunnel'){const radius=tunnelRadius(f.row),h=map.ceilings[f.row]||1.15;const arc=[];for(let i=0;i<=24;i++){const a=Math.PI*i/24;arc.push([center+radius*Math.cos(a),f.row+.5,h*Math.sin(a)+.13])}ctx.save();ctx.globalAlpha=alpha;releaseWorldLine(arc.map(v=>proj(...v)),'#73501b',p[2]*.07);releaseWorldLine(arc.map(v=>proj(...v)),'#ffda77',p[2]*.035);ctx.restore();}
}
const finishMarkerDraw=draw;draw=function(){finishMarkerDraw();const markers=mapFinishes(activeRoadData());if(markers.length)for(const f of markers)drawFinishHologram(f);else drawFinishHologram()};

let finishRoadPass=null;
function finishPickupMarker(map,r,l){if(finishRoadPass?.map===map)return finishRoadPass.automatic||finishRoadPass.cells.get(r+':'+l);const markers=mapFinishes(map);return markers.length?markers.find(f=>f.row===r&&f.lane===l):finishMarkerFor(map);}
const finishRoadSurfaces=drawRoadSurfaces;drawRoadSurfaces=function(...args){const map=activeRoadData();if(mode!=='story'||!map?.tiles)return finishRoadSurfaces(...args);const markers=mapFinishes(map);finishRoadPass={map,cells:new Map(markers.map(f=>[f.row+':'+f.lane,f])),automatic:markers.length?null:finishMarkerFor(map)};try{return finishRoadSurfaces(...args)}finally{finishRoadPass=null}};
