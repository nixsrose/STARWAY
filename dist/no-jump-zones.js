// No-jump zones are cell metadata; base paint, fuel pads and tunnels stay intact.
const noJumpLookups=new WeakMap();
function noJumpCell(map,row,lane){const zones=map?.noJumpZones;if(!zones)return false;let cells=noJumpLookups.get(zones);if(!cells){cells=new Set(zones.map(g=>g.row+':'+g.lane));noJumpLookups.set(zones,cells);}return cells.has(row+':'+lane);}
let runJumpDisabled=false;
function jumpAllowCell(map,row,lane){return (map?.jumpAllowZones||[]).some(g=>g.row===row&&g.lane===lane);}
function updateRunJumpZone(row=Math.floor(z),lane=Math.floor(x+3.5)){
 const map=activeRoadData();
 if(jumpAllowCell(map,row,lane))runJumpDisabled=false;else if(map.jumpAllowZones?.length&&noJumpCell(map,row,lane))runJumpDisabled=true;
}
function inNoJumpZone(){const map=activeRoadData(),r=Math.floor(z),l=Math.floor(x+3.5);return !jumpAllowCell(map,r,l)&&(noJumpCell(map,r,l)||!!map.jumpAllowZones?.length&&runJumpDisabled);}
const jumpZoneBuild=buildTrack;buildTrack=function(...args){runJumpDisabled=false;return jumpZoneBuild(...args);};
function clearZoneJumpBuffer(){jumpQueued=false;jumpBufferRemaining=0;}
const zoneJump=jump;jump=function(...args){if(state==='play')updateRunJumpZone();if(state==='play'&&inNoJumpZone()){clearZoneJumpBuffer();return;}return zoneJump(...args);};
const zoneStep=step;step=function(dt){if(dt>1/120+.000001){const n=Math.ceil(dt/(1/120));for(let i=0;i<n;i++)step(dt/n);return;}const oldZ=z,oldX=x,playing=state==='play';if(playing){updateRunJumpZone();if(inNoJumpZone())clearZoneJumpBuffer();}const out=zoneStep(dt);
 if(playing&&state==='play'){
  // Include cell boundaries along the swept path, including lateral entries.
  const cuts=[0,1];for(const [a,b] of [[oldZ,z],[oldX+3.5,x+3.5]])if(a!==b)for(let v=Math.floor(Math.min(a,b))+1;v<=Math.max(a,b);v++)cuts.push((v-a)/(b-a));
  cuts.sort((a,b)=>a-b);for(let i=0;i<cuts.length-1;i++){const q=(cuts[i]+cuts[i+1])/2;updateRunJumpZone(Math.floor(oldZ+(z-oldZ)*q),Math.floor(oldX+(x-oldX)*q+3.5));}updateRunJumpZone();
  if(inNoJumpZone())clearZoneJumpBuffer();
 }return out;};
function syncNoJumpZone(){const blocked=['ready','play','pause'].includes(state)&&inNoJumpZone(),button=$('jump');button.setAttribute('data-jump-blocked',String(blocked));button.setAttribute('aria-disabled',String(blocked));button.setAttribute('aria-label',tr(blocked?'점프 불가 존 · 점프 차단':'점프'));$('noJumpZoneCue').textContent=tr('점프 불가 존');$('noJumpZoneCue').classList.toggle('hidden',!blocked);}
const zoneCockpit=syncCockpit;syncCockpit=function(...args){const out=zoneCockpit(...args);syncNoJumpZone();return out;};
for(const [value,text]of [['noJumpZone','점프 불가 존'],['jumpAllowZone','점프 불가 해제 존']]){const o=document.createElement('option');o.value=value;o.textContent=text;$('editorBrush').appendChild(o);}
const zonePaint=paintEditorCell;paintEditorCell=function(r,l,batch=false){const brush=$('editorBrush').value;
 if(brush==='noJumpZone'||brush==='jumpAllowZone'||brush==='noJumpRemove'){
  if(brush!=='noJumpRemove'&&(![1,3,4,5].includes(editorMap.tiles[r][l])||editorMap.roadPaint[r][l]==='pink')){if(!batch)$('editorStatus').textContent='점프 불가 존은 안전한 도로·터널·패드 위에 지정하세요.';return;}
  if(!batch)editorSnapshot();const zones=(editorMap.noJumpZones||[]).filter(g=>g.row!==r||g.lane!==l);if(brush==='noJumpZone')zones.push({row:r,lane:l});editorMap.noJumpZones=zones;const allows=(editorMap.jumpAllowZones||[]).filter(g=>g.row!==r||g.lane!==l);if(brush==='jumpAllowZone')allows.push({row:r,lane:l});editorMap.jumpAllowZones=allows;
  if(!batch){renderEditorGrid();$('editorStatus').textContent=brush==='noJumpZone'?'점프 불가 존 지정 · 해제 존을 함께 배치하면 해제 존까지 차단됩니다.':brush==='jumpAllowZone'?'점프 불가 해제 존 지정 · 통과하면 다시 점프할 수 있습니다.':'점프 존 제거 · 도로는 유지됩니다.';}return;
 }
 const out=zonePaint(r,l,batch);if(editorMap.noJumpZones)editorMap.noJumpZones=editorMap.noJumpZones.filter(g=>[1,3,4,5].includes(editorMap.tiles[g.row]?.[g.lane])&&editorMap.roadPaint[g.row][g.lane]!=='pink');if(editorMap.jumpAllowZones)editorMap.jumpAllowZones=editorMap.jumpAllowZones.filter(g=>[1,3,4,5].includes(editorMap.tiles[g.row]?.[g.lane])&&editorMap.roadPaint[g.row][g.lane]!=='pink');if(!batch)renderEditorGrid();return out;
};
const zoneGrid=renderEditorGrid;renderEditorGrid=function(...args){const out=zoneGrid(...args);for(const cell of $('editorGrid').children||[]){if(!cell.getAttribute||cell.getAttribute('data-editor-row')===null)continue;const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(jumpAllowCell(editorMap,r,l)){cell.classList.add('jump-allow-cell');cell.textContent+=' J✓';cell.setAttribute('aria-label',(cell.getAttribute('aria-label')||'')+' · 점프 불가 해제 존');}if(noJumpCell(editorMap,r,l)){cell.classList.add('no-jump-cell');cell.textContent+=' ⊘J';cell.title+=' · 점프 불가 존';cell.setAttribute('aria-label',(cell.getAttribute('aria-label')||'')+' · 점프 불가');}}return out;};
const zoneResize=$('editorResize').onclick;$('editorResize').onclick=()=>{const before=editorMap,zones=editorMap.noJumpZones,allows=editorMap.jumpAllowZones;const out=zoneResize();if(editorMap!==before){if(zones)editorMap.noJumpZones=zones.filter(g=>g.row<editorMap.tiles.length);if(allows)editorMap.jumpAllowZones=allows.filter(g=>g.row<editorMap.tiles.length);renderEditorGrid();}return out;};
const zonePickup=drawRoadPickup;drawRoadPickup=function(r,l,t){zonePickup(r,l,t);if(!t||!noJumpCell(activeRoadData(),r,l))return;const a=l-roadOffset();ctx.save();
 // Border stripes retain the underlying road color and other device markings.
 for(let i=0;i<4;i++){const rz=r+i*.25;releaseGroundQuad(a+.015,a+.08,rz+.02,rz+.17,.035,'#ffba7b');releaseGroundQuad(a+.92,a+.985,rz+.02,rz+.17,.035,'#ffba7b');}
 if(!noJumpCell(activeRoadData(),r-1,l)){releaseGroundQuad(a+.10,a+.90,r+.04,r+.12,.036,'#ffc38d');const p=proj(l-3,r+.45,.36);if(p[2]>9&&r-z<35){ctx.fillStyle='#ffdcad';ctx.textAlign='center';ctx.font='bold '+Math.min(22,p[2]*.19)+'px sans-serif';ctx.fillText('NO JUMP',p[0],p[1]);}}
 ctx.restore();};

const allowPickup=drawRoadPickup;drawRoadPickup=function(r,l,t){allowPickup(r,l,t);if(!t||!jumpAllowCell(activeRoadData(),r,l))return;const a=l-roadOffset();ctx.save();releaseGroundQuad(a+.05,a+.95,r+.12,r+.88,.037,'#236c5d');releaseGroundQuad(a+.08,a+.92,r+.44,r+.56,.04,'#9affd7');const p=proj(l-3,r+.5,.36);if(p[2]>9&&r-z<35){ctx.fillStyle='#b8ffe0';ctx.textAlign='center';ctx.font='bold '+Math.min(22,p[2]*.19)+'px sans-serif';ctx.fillText('JUMP ON',p[0],p[1]);}ctx.restore();};
