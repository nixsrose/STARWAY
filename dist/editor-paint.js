let editorDragEnabled=false,editorPaintStroke=null;
function editorPaintPath(from,to,paint){
 let r=from.r,l=from.l;const dr=Math.abs(to.r-r),dl=Math.abs(to.l-l),sr=r<to.r?1:-1,sl=l<to.l?1:-1;let error=dl-dr;
 for(;;){paint(r,l);if(r===to.r&&l===to.l)break;const twice=error*2;if(twice>-dr){error-=dr;l+=sl}if(twice<dl){error+=dl;r+=sr}}
}
function editorStrokeCell(r,l){
 const stroke=editorPaintStroke;if(!stroke||editorMap!==stroke.map||editorPage!==stroke.page)return;
 const first=stroke.page*16,last=Math.min(editorMap.tiles.length,first+16);if(r<first||r>=last||l<0||l>=7)return;
 if(!stroke.started){editorSnapshot();stroke.started=true;}
 editorPaintPath(stroke.last||{r,l},{r,l},(row,lane)=>{const key=row+':'+lane;if(stroke.visited.has(key))return;stroke.visited.add(key);paintEditorCell(row,lane,true)});
 stroke.last={r,l};renderEditorGrid();$('editorStatus').textContent='드래그 배치 '+stroke.visited.size+'칸 · 되돌리기 한 번으로 복원할 수 있습니다.';
}
function editorPaintTarget(target){const cell=target?.closest?.('[data-editor-row]');if(!cell||!$('editorGrid').contains(cell))return null;return {r:Number(cell.getAttribute('data-editor-row')),l:Number(cell.getAttribute('data-editor-lane'))};}
function syncEditorPaintMode(){
 $('editorDragToggle').textContent='드래그 터치 '+(editorDragEnabled?'ON':'OFF');$('editorDragToggle').setAttribute('aria-pressed',String(editorDragEnabled));$('editorGrid').setAttribute('data-drag-mode',String(editorDragEnabled));$('editorGrid').setAttribute('data-scroll','false');
}
function finishEditorPaint(){const stroke=editorPaintStroke;editorPaintStroke=null;editorSuppressClickUntil=performance.now()+450;if(stroke)try{$('editorGrid').releasePointerCapture(stroke.pointer)}catch{}}
function beginEditorPaint(event){
 if(editorPaintStroke||event.isPrimary===false||event.pointerType==='mouse'&&event.button!==0)return;
 const cell=editorPaintTarget(event.target);if(!cell)return;event.preventDefault();editorSuppressClickUntil=Infinity;
 editorPaintStroke={pointer:event.pointerId,map:editorMap,page:editorPage,visited:new Set(),last:null,started:false,drag:editorDragEnabled,moved:false,startX:event.clientX,startY:event.clientY,cell};
 try{$('editorGrid').setPointerCapture(event.pointerId)}catch{}
 if(editorPaintStroke.drag)editorStrokeCell(cell.r,cell.l);
}
function moveEditorPaint(event){
 const stroke=editorPaintStroke;if(stroke?.pointer!==event.pointerId)return;event.preventDefault();
 if(editorMap!==stroke.map||editorPage!==stroke.page){finishEditorPaint();return}
 if(!stroke.drag){if(Math.hypot(event.clientX-stroke.startX,event.clientY-stroke.startY)>12)stroke.moved=true;return}
 const cell=editorPaintTarget(document.elementFromPoint(event.clientX,event.clientY));if(cell)editorStrokeCell(cell.r,cell.l);else stroke.last=null;
}
function endEditorPaint(event,cancel=false){
 const stroke=editorPaintStroke;if(stroke?.pointer!==event.pointerId)return;
 if(!cancel&&!stroke.drag&&!stroke.moved&&editorMap===stroke.map&&editorPage===stroke.page){editorStrokeCell(stroke.cell.r,stroke.cell.l);$('editorStatus').textContent='한 칸 배치 완료 · 연속 배치는 드래그 터치 ON';}
 finishEditorPaint();
}
$('editorGrid').addEventListener('pointerdown',beginEditorPaint);$('editorGrid').addEventListener('pointermove',moveEditorPaint);$('editorGrid').addEventListener('pointerup',event=>endEditorPaint(event));
for(const type of ['pointercancel','lostpointercapture'])$('editorGrid').addEventListener(type,event=>endEditorPaint(event,true));
document.addEventListener('pointerup',event=>endEditorPaint(event));document.addEventListener('pointercancel',event=>endEditorPaint(event,true));
addEventListener('blur',finishEditorPaint);document.addEventListener('visibilitychange',()=>{if(document.hidden)finishEditorPaint()});
$('editorDragToggle').onclick=()=>{finishEditorPaint();editorDragEnabled=!editorDragEnabled;syncEditorPaintMode();$('editorStatus').textContent=editorDragEnabled?'드래그 터치 ON · 손가락으로 훑으면 즉시 연속 배치됩니다.':'드래그 터치 OFF · 한 칸씩 눌러 배치하세요.'};
syncEditorPaintMode();
$('editorFillPage').onclick=()=>{
 finishEditorPaint();const first=editorPage*16,last=Math.min(editorMap.tiles.length,first+16);editorSnapshot();
 for(let r=first;r<last;r++)for(let l=0;l<7;l++)paintEditorCell(r,l,true);
 renderEditorGrid();$('editorStatus').textContent='현재 페이지 '+(first+1)+'~'+last+'줄 전체 배치 완료 · 다른 페이지는 유지됩니다. 되돌리기 한 번으로 복원할 수 있습니다.';
};

$('editorGrid').addEventListener('click',event=>{if(event.detail!==0){event.preventDefault();event.stopImmediatePropagation()}},true);
$('editorGrid').addEventListener('contextmenu',event=>event.preventDefault());
