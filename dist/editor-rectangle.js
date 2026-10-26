// Two-tap selection is independent of drag painting and may span editor pages.
let editorRectangle=null,editorRectangleMode=false,pendingRectangleGravity=null;
function rectangleBounds(){const s=editorRectangle;if(!s||s.map!==editorMap||!s.end)return null;return {first:Math.min(s.first.r,s.end.r),last:Math.max(s.first.r,s.end.r),left:Math.min(s.first.l,s.end.l),right:Math.max(s.first.l,s.end.l)};}
function rectangleContains(b,r,l){return b&&r>=b.first&&r<=b.last&&l>=b.left&&l<=b.right;}
function rectangleSummary(b){return (b.first+1)+'~'+(b.last+1)+'줄 · '+(b.left+1)+'~'+(b.right+1)+'칸 · '+((b.last-b.first+1)*(b.right-b.left+1))+'칸';}
function syncEditorRectangle(){
 if(editorRectangle?.map!==editorMap)editorRectangle=null;
 const b=rectangleBounds(),selected=!!editorRectangle;
 $('editorRangeSelect').textContent=editorRectangleMode?'범위 선택 ON':'범위 선택';$('editorRangeSelect').setAttribute('aria-pressed',String(editorRectangleMode));
 $('editorSelectionTools').classList.toggle('hidden',!editorRectangleMode&&!selected);$('editorSelectionApply').disabled=!b;
 $('editorSelectionInfo').textContent=b?rectangleSummary(b):selected?'끝 칸을 누르세요 · 페이지 이동 가능':'시작 칸 → 끝 칸 순서로 선택';
}
function selectEditorRectanglePoint(r,l){if(!Number.isInteger(r)||r<0||r>=editorMap.tiles.length||!Number.isInteger(l)||l<0||l>6)return;
 if(!editorRectangle||editorRectangle.map!==editorMap||editorRectangle.end)editorRectangle={map:editorMap,first:{r,l},end:null};else editorRectangle.end={r,l};
 renderEditorGrid();const b=rectangleBounds();if(b){const count=key=>(editorMap[key]||[]).filter(g=>rectangleContains(b,g.row,g.lane)).length,finishes=mapFinishes(editorMap).filter(f=>rectangleContains(b,f.row,f.lane)).length;$('editorStatus').textContent='선택됨 · 중력 '+count('gravityGates')+' · 점프 불가 '+count('noJumpZones')+' · 위험 터널 '+count('hazardTunnels')+' · FINISH '+finishes+' · 도구 선택 후 선택 적용';}else $('editorStatus').textContent='시작 칸 선택됨 · 끝 칸을 누르세요. 페이지를 넘겨도 선택이 유지됩니다.';
}
$('editorRangeSelect').onclick=()=>{finishEditorPaint();editorRectangleMode=!editorRectangleMode;if(editorRectangleMode){editorDragEnabled=false;syncEditorPaintMode();}syncEditorRectangle();$('editorStatus').textContent=editorRectangleMode?'시작 칸과 끝 칸을 눌러 사각형 범위를 선택하세요.':'일반 편집 모드 · 선택 범위는 유지됩니다.';};
$('editorSelectionClear').onclick=()=>{finishEditorPaint();editorRectangle=null;editorRectangleMode=false;renderEditorGrid();$('editorStatus').textContent='범위 선택 해제';};
$('editorGrid').addEventListener('pointerdown',event=>{if(!editorRectangleMode||event.isPrimary===false||event.pointerType==='mouse'&&event.button!==0)return;const cell=editorPaintTarget(event.target);if(!cell)return;event.preventDefault();event.stopImmediatePropagation();finishEditorPaint();selectEditorRectanglePoint(cell.r,cell.l);},true);
const rectangleDragToggle=$('editorDragToggle').onclick;$('editorDragToggle').onclick=()=>{editorRectangleMode=false;syncEditorRectangle();return rectangleDragToggle();};
function paintEditorColorOnly(r,l){const color=$('editorColor').value;if(!ROAD_PAINT_COLORS[color]||color==='pink')return false;if(!editorMap.tiles[r][l]||editorMap.roadPaint[r][l]==='pink')return false;editorMap.roadPaint[r][l]=color;if(boxHeight(editorMap.tiles[r][l]))editorMap.boxPaint[r][l]=color;return true;}
const colorOnlyOption=document.createElement('option');colorOnlyOption.value='colorOnly';colorOnlyOption.textContent='색상만 변경 · 도로/블록';$('editorBrush').appendChild(colorOnlyOption);
const rectanglePaint=paintEditorCell;paintEditorCell=function(r,l,batch=false){if(editorRectangleMode&&!batch){selectEditorRectanglePoint(r,l);return;}if($('editorBrush').value==='colorOnly'){if(!batch)editorSnapshot();const changed=paintEditorColorOnly(r,l);if(!batch){renderEditorGrid();$('editorStatus').textContent=changed?'타일 종류를 유지하고 색상만 변경했습니다.':'틈과 위험칸은 유지합니다. 위험성 변경은 위험 바닥·블록 도구를 사용하세요.';}return;}return rectanglePaint(r,l,batch);};
function applyEditorRectangle(options={}){
 finishEditorPaint();const b=rectangleBounds();if(!b){$('editorStatus').textContent='시작 칸과 끝 칸을 먼저 선택하세요.';return false;}
 const brush=options.brush||$('editorBrush').value,before=editorMap,oldBrush=$('editorBrush').value,undoLength=editorUndoStack.length;let applied=0,skipped=0;
 if(brush==='colorOnly'&&$('editorColor').value==='pink'){$('editorStatus').textContent='위험성 변경은 위험 바닥·블록 도구를 사용하세요.';return false;}
 try{
  editorMap=JSON.parse(JSON.stringify(before));$('editorBrush').value=brush;
  const safe=(r,l)=>[1,3,4,5].includes(editorMap.tiles[r][l])&&editorMap.roadPaint[r][l]!=='pink';
  if(brush==='gravityGate'){
   if(![50,100,150,200,300,500].includes(options.gravity))throw Error('중력 값을 선택하세요.');
   const gates=editorMap.gravityGates||[];
   if(options.gravityMode==='existing'){editorMap.gravityGates=gates.map(g=>{if(!rectangleContains(b,g.row,g.lane))return g;applied++;return {...g,gravity:options.gravity};});}
   else {const placed=[];for(let r=b.first;r<=b.last;r++)for(let l=b.left;l<=b.right;l++)if(r>=3&&safe(r,l)){placed.push({row:r,lane:l,gravity:options.gravity});applied++;}else skipped++;editorMap.gravityGates=[...gates.filter(g=>!rectangleContains(b,g.row,g.lane)),...placed];}
  }else for(let r=b.first;r<=b.last;r++)for(let l=b.left;l<=b.right;l++){
   if((brush==='noJumpZone'||brush==='jumpAllowZone'||brush==='challengeCoin')&&!safe(r,l)){skipped++;continue;}
   if((brush==='finishRoad'||brush==='finishTunnel')&&r<4){skipped++;continue;}
   if(brush==='colorOnly'){if(paintEditorColorOnly(r,l))applied++;else skipped++;}
   else {paintEditorCell(r,l,true);applied++;}
  }
  if(rectangleContains(b,2,3)&&(![1,3].includes(editorMap.tiles[2][3])||editorMap.roadPaint[2][3]==='pink'))throw Error('START가 막히므로 적용하지 않았습니다. 시작 칸을 제외하거나 안전한 도로로 배치하세요.');
  normalizeEditorMap(editorMap);
  const next=editorMap;editorMap=before;
  if(JSON.stringify(next)===JSON.stringify(before)){$('editorStatus').textContent='변경된 칸이 없습니다.'+(skipped?' 안전하지 않은 '+skipped+'칸은 제외했습니다.':'');return false;}
  editorSnapshot();editorMap=next;editorRectangle.map=next;renderEditorGrid();$('editorStatus').textContent=applied+'칸 적용'+(skipped?' · '+skipped+'칸 제외':'')+' · 되돌리기 한 번으로 전체 복원';return true;
 }catch(error){editorMap=before;while(editorUndoStack.length>undoLength)editorUndoStack.pop();$('editorStatus').textContent=error.message;return false;}
 finally{$('editorBrush').value=oldBrush;}
}
$('editorSelectionApply').onclick=()=>{const b=rectangleBounds();if(!b)return;if($('editorBrush').value!=='gravityGate')return applyEditorRectangle();const gates=(editorMap.gravityGates||[]).filter(g=>rectangleContains(b,g.row,g.lane));pendingRectangleGravity={map:editorMap,bounds:{...b}};$('editorRangeGravityInfo').textContent=rectangleSummary(b)+' · 기존 장치 '+gates.length+'개';$('editorRangeGravityMode').value=gates.length?'existing':'place';$('editorRangeGravityValue').value=String(gates[0]?.gravity||100);$('editorRangeGravityStatus').textContent='한 번의 되돌리기로 전체 변경을 복원할 수 있습니다.';$('editorRangeGravityDialog').classList.remove('hidden');};
$('editorRangeGravityCancel').onclick=()=>{pendingRectangleGravity=null;$('editorRangeGravityDialog').classList.add('hidden');};
$('editorRangeGravityApply').onclick=()=>{const pending=pendingRectangleGravity;if(!pending||pending.map!==editorMap||JSON.stringify(pending.bounds)!==JSON.stringify(rectangleBounds())){pendingRectangleGravity=null;$('editorRangeGravityDialog').classList.add('hidden');return;}const success=applyEditorRectangle({brush:'gravityGate',gravity:Number($('editorRangeGravityValue').value),gravityMode:$('editorRangeGravityMode').value});if(success){pendingRectangleGravity=null;$('editorRangeGravityDialog').classList.add('hidden');}else $('editorRangeGravityStatus').textContent=$('editorStatus').textContent;};
const rectangleGrid=renderEditorGrid;renderEditorGrid=function(...args){const out=rectangleGrid(...args);syncEditorRectangle();const s=editorRectangle,b=rectangleBounds();if(!s)return out;for(const cell of $('editorGrid').children||[]){if(!cell.getAttribute||cell.getAttribute('data-editor-row')===null)continue;const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(rectangleContains(b,r,l)||!s.end&&r===s.first.r&&l===s.first.l){cell.classList.add('editor-rectangle-cell');cell.setAttribute('aria-selected','true');}}return out;};
syncEditorRectangle();

const rectangleCheckIssue=goToEditorCheckIssue;goToEditorCheckIssue=function(...args){editorRectangle=null;editorRectangleMode=false;return rectangleCheckIssue(...args);};
