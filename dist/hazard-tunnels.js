Object.assign(uiWords,{'위험 터널 지붕 접촉':['Hazard tunnel roof contact','危険トンネルの屋根に接触','接触危险隧道顶部']});
for(const [value,text]of [['hazardTunnel','위험 터널 · 지붕 접촉 시 폭발'],['hazardTunnelRemove','위험 터널 해제 · 일반 터널로']]){const o=document.createElement('option');o.value=value;o.textContent=text;$('editorBrush').appendChild(o);}
const hazardTunnelPaint=paintEditorCell;paintEditorCell=function(r,l,batch=false){const brush=$('editorBrush').value;
 if(brush==='hazardTunnel'||brush==='hazardTunnelRemove'){
  if(!batch)editorSnapshot();
  if(brush==='hazardTunnel'){
   const previous=editorMap.roadPaint[r][l];$('editorBrush').value='tunnel';hazardTunnelPaint(r,l,true);$('editorBrush').value=brush;
   // Hazard belongs to the roof, never the tunnel floor.
   if(previous&&previous!=='pink')editorMap.roadPaint[r][l]=previous;else editorMap.roadPaint[r][l]='gray';
  }
  const markers=(editorMap.hazardTunnels||[]).filter(g=>g.row!==r||g.lane!==l);if(brush==='hazardTunnel')markers.push({row:r,lane:l});editorMap.hazardTunnels=markers;
  if(!batch){renderEditorGrid();$('editorStatus').textContent=brush==='hazardTunnel'?'위험 터널 배치 · 내부 통과 가능 / 지붕 접촉 시 폭발':'일반 터널로 변경 · 도로와 터널은 유지됩니다.';}return;
 }
 const out=hazardTunnelPaint(r,l,batch);
 if(editorMap.hazardTunnels)editorMap.hazardTunnels=editorMap.hazardTunnels.filter(g=>editorMap.ceilings[g.row]&&(editorMap.tunnelCenters[g.row]||[]).includes(g.lane-3)&&!(brush==='tunnel'&&g.row===r&&g.lane===l));
 if(!batch)renderEditorGrid();return out;
};
const hazardTunnelGrid=renderEditorGrid;renderEditorGrid=function(...args){const out=hazardTunnelGrid(...args);for(const cell of $('editorGrid').children||[]){if(!cell.getAttribute||cell.getAttribute('data-editor-row')===null)continue;const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(hazardTunnelAt(editorMap,r,l-3)){cell.classList.add('hazard-tunnel-cell');cell.textContent+=' ∩!';cell.title+=' · 위험 터널: 내부 안전 / 지붕 위험';cell.setAttribute('aria-label',(cell.getAttribute('aria-label')||'')+' · 위험 터널, 지붕 접촉 시 폭발');}}return out;};
const hazardTunnelResize=$('editorResize').onclick;$('editorResize').onclick=()=>{const before=editorMap,markers=editorMap.hazardTunnels;const out=hazardTunnelResize();if(editorMap!==before&&markers){editorMap.hazardTunnels=markers.filter(g=>g.row<editorMap.tiles.length);renderEditorGrid();}return out;};
