// Structural checks only: intentional jumps and roof routes are never declared impossible.
function inspectEditorMap(map){
 const issues=[],add=(severity,code,message,row=null,lane=null,endRow=row)=>issues.push({severity,code,message,row,lane,endRow});
 const tiles=map?.tiles,n=tiles?.length||0,cell=(r,l)=>tiles?.[r]?.[l],pink=(r,l)=>map.roadPaint?.[r]?.[l]==='pink',safe=(r,l)=>[1,3,4,5].includes(cell(r,l))&&!pink(r,l),centers=r=>map.tunnelCenters?.[r]||[0];
 if(!Array.isArray(tiles)||n<16||n>500){add('error','size','맵 길이는 16~500줄이어야 합니다.',null,null);return issues;}
 for(let r=0;r<n;r++)if(!Array.isArray(tiles[r])||tiles[r].length!==7||tiles[r].some(v=>![0,1,2,3,4,5,8].includes(v)))add('error','grid','각 줄은 올바른 타일 7칸으로 구성해야 합니다.',r);
 if(issues.length)return issues;
 if(![1,3].includes(cell(2,3))||pink(2,3))add('error','start','START 위치에 안전한 도로나 연료칸이 필요합니다.',2,3);
 if(map.finishes!==undefined&&(!Array.isArray(map.finishes)||map.finishes.length>500))add('error','finish-list','FINISH는 최대 500개인 목록으로 지정하세요.');
 const finishes=mapFinishes(map);
 if(finishes.length){const seen=new Set();for(const f of finishes){try{normalizeFinish({...map,finish:f});}catch(e){add('error','finish',e.message,Number.isInteger(f?.row)?f.row:null,Number.isInteger(f?.lane)?f.lane:null);}if(f){const key=f.row+':'+f.lane;if(seen.has(key))add('warning','finish-duplicate','같은 칸에 FINISH가 중복되어 있습니다.',f.row,f.lane);seen.add(key);}}}
 else if(!tiles[n-2].some((_,l)=>safe(n-2,l)))add('warning','auto-finish','자동 결승 줄에 안전한 도로가 없습니다. 의도한 점프 완주인지 확인하거나 FINISH를 배치하세요.',n-2);
 const markerRules=[['speedPads','속도 패드'],['gravityGates','중력 장치'],['noJumpZones','점프 불가 존'],['jumpAllowZones','점프 불가 해제 존'],['hazardTunnels','위험 터널']];
 for(const [key,name]of markerRules){const list=map[key];if(list===undefined)continue;if(!Array.isArray(list)){add('error',key,name+' 데이터가 올바른 목록 형식이 아닙니다.');continue;}if(list.length>3500||(key==='gravityGates'&&list.length>500))add('error',key+'-limit',name+' 배치 개수가 허용 범위를 넘었습니다.');const seen=new Set();for(const g of list){try{normalizeMapExtras(map,{[key]:[g]});}catch(e){add('error',key,e.message,Number.isInteger(g?.row)?g.row:null,Number.isInteger(g?.lane)?g.lane:null);}if(g){const k=g.row+':'+g.lane;if(seen.has(k))add('warning',key+'-duplicate',name+'가 같은 칸에 중복되어 있습니다.',g.row,g.lane);seen.add(k);}}}
 if(map.medalTargets!==undefined)try{normalizeMapExtras(map,{medalTargets:map.medalTargets});}catch(e){add('error','medals',e.message);}
 if(map.challengeId)try{normalizeChallengeRules(map.challengeRules,map.challengeId);}catch(e){add('error','challenge-rules',e.message);}
 if(map.gravity!==undefined&&map.gravityUnit==='coefficient'&&![50,100,150,200,300,500].includes(map.gravity))add('error','gravity','기본 중력은 50·100·150·200·300·500 중 선택하세요.');
 if(map.fuelDrainMultiplier!==undefined&&(!Number.isFinite(map.fuelDrainMultiplier)||map.fuelDrainMultiplier<.25||map.fuelDrainMultiplier>3||!Number.isInteger(map.fuelDrainMultiplier*4)))add('error','fuel-drain','연료 소모 배율은 0.25~3.00 사이 0.25 단위로 설정하세요.');
 const validFinishRows=finishes.filter(f=>Number.isInteger(f?.row)&&f.row>=4&&f.row<n).map(f=>f.row),limit=validFinishRows.length?Math.max(...validFinishRows):n-2;
 for(let r=0;r<n;r++){
  const cs=centers(r),height=map.ceilings?.[r]||0;
  if(height&&(!Array.isArray(cs)||!cs.length||cs.some(c=>!Number.isFinite(c)||Math.abs(c)>3))){add('error','tunnel-geometry','터널 높이와 중심 칸 배치가 일치하지 않습니다.',r);continue;}
  if(height&&(!Number.isFinite(height)||height<.4||height>3))add('error','tunnel-height','터널 높이를 확인하세요. 허용 범위는 0.4~3입니다.',r);
  if(height&&map.tunnelRadius?.[r]!==undefined&&(!Number.isFinite(map.tunnelRadius[r])||map.tunnelRadius[r]<.4||map.tunnelRadius[r]>1.5))add('error','tunnel-radius','터널 폭이 올바르지 않습니다.',r);
  if(r>limit||!height||!Array.isArray(cs))continue;
  if(r>0&&map.ceilings?.[r-1]&&Array.isArray(centers(r-1))&&!cs.some(c=>centers(r-1).includes(c)))add('warning','tunnel-shift','연속 터널의 중심 칸이 바뀝니다. 일자 연결 또는 별도 이동 경로를 확인하세요.',r);
 }
 // Group full-width voids, rather than reporting every empty cell as a failure.
 for(let r=3;r<=limit;r++){
  const unsupported=row=>tiles[row].every(t=>t===0)&&!map.ceilings?.[row]&&!(Array.isArray(map.bridges)?map.bridges:[]).some(b=>row>=b.start&&row<b.end);
  if(!unsupported(r))continue;const first=r;while(r+1<=limit&&unsupported(r+1))r++;
  add('warning','gap','바닥이 없는 구간입니다. 의도한 점프 거리와 착지 지점을 시험 주행으로 확인하세요.',first,null,r);
  const before=first-1,lanes=tiles[before].flatMap((_,l)=>safe(before,l)?[l]:[]),blocked=new Set((Array.isArray(map.noJumpZones)?map.noJumpZones:[]).filter(g=>g&&g.row===before).map(g=>g.lane));
  if(lanes.length&&lanes.every(l=>blocked.has(l)))add('warning','no-jump-gap','빈 구간 직전의 안전한 칸이 모두 점프 불가 존입니다. 더 앞에서 점프하거나 우회할 수 있는지 확인하세요.',before);
 }
 for(let r=3;r<limit;r++)if(!map.ceilings?.[r]&&map.ceilings?.[r-1]&&map.ceilings?.[r+1]&&Array.isArray(centers(r-1))&&Array.isArray(centers(r+1))&&centers(r-1).some(c=>centers(r+1).includes(c)))add('warning','tunnel-gap','터널 중간에 한 줄이 비어 있습니다. 의도한 단절인지 확인하세요.',r);
 return issues.sort((a,b)=>(a.severity==='error'?0:1)-(b.severity==='error'?0:1)||(a.row??-1)-(b.row??-1));
}
let editorCheckIssues=[],editorCheckFocus=null;
function editorCheckLocation(issue){if(issue.row===null)return '맵 설정';const first=issue.row+1,last=(issue.endRow??issue.row)+1;return (first===last?first+'줄':first+'~'+last+'줄')+(issue.lane!==null?' · '+(issue.lane+1)+'칸':'');}
function goToEditorCheckIssue(issue){finishEditorPaint();closeEditorSheets();if(!Number.isInteger(issue.row)||issue.row<0||issue.row>=editorMap.tiles.length){$('editorSettingsOpen').onclick();$('editorStatus').textContent=issue.message;return;}editorPage=Math.floor(issue.row/16);editorCheckFocus={map:editorMap,row:issue.row,endRow:issue.endRow??issue.row,lane:Number.isInteger(issue.lane)&&issue.lane>=0&&issue.lane<7?issue.lane:null};renderEditorGrid();$('editorStatus').textContent=editorCheckLocation(issue)+' · '+issue.message;}
function runEditorMapCheck(){
 finishEditorPaint();syncEditorName();const draft=JSON.parse(JSON.stringify(editorMap)),id=editorChallengeId();
 if(id){draft.challengeId=id;const rules={};for(const key of Object.keys(normalizeChallengeRules(null,id)))rules[key]=Number($(challengeRuleInputs[key]).value);draft.challengeRules=rules;}
 else draft.medalTargets={gold:Number($('editorMedalGold').value),silver:Number($('editorMedalSilver').value)};
 editorCheckIssues=inspectEditorMap(draft);closeEditorSheets();$('editorCheckPanel').classList.remove('hidden');const errors=editorCheckIssues.filter(i=>i.severity==='error').length,warnings=editorCheckIssues.length-errors;
 $('editorCheckSummary').textContent='검사 완료 · 오류 '+errors+'개 · 주의 '+warnings+'개'+(editorCheckIssues.length?'':' · 배치 오류 없음');const list=$('editorCheckResults');list.innerHTML='';
 if(!editorCheckIssues.length){const p=document.createElement('p');p.className='editor-check-empty';p.textContent='시작점·FINISH·터널·장치·목표 설정에서 배치 오류를 찾지 못했습니다. 시험 주행으로 실제 통과 여부를 확인하세요.';list.appendChild(p);}
 for(const issue of editorCheckIssues.slice(0,200)){const button=document.createElement('button');button.type='button';button.className='editor-check-issue';button.setAttribute('data-severity',issue.severity);const title=document.createElement('strong');title.textContent=(issue.severity==='error'?'오류':'주의')+' · '+editorCheckLocation(issue)+' ›';const detail=document.createElement('span');detail.textContent=issue.message;button.appendChild(title);button.appendChild(detail);button.onclick=()=>goToEditorCheckIssue(issue);list.appendChild(button);}
 if(editorCheckIssues.length>200){const p=document.createElement('p');p.textContent='첫 200개를 표시했습니다. 수정 후 다시 검사하세요.';list.appendChild(p);}
 return editorCheckIssues;
}
const checkCloseSheets=closeEditorSheets;closeEditorSheets=function(){checkCloseSheets();$('editorCheckPanel').classList.add('hidden');};
$('editorCheckOpen').onclick=runEditorMapCheck;$('editorCheckAgain').onclick=runEditorMapCheck;$('editorCheckClose').onclick=()=>closeEditorSheets();
const checkGrid=renderEditorGrid;renderEditorGrid=function(...args){const out=checkGrid(...args),focus=editorCheckFocus;if(!focus||focus.map!==editorMap)return out;for(const cell of $('editorGrid').children||[]){if(!cell.getAttribute||cell.getAttribute('data-editor-row')===null)continue;const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(r>=focus.row&&r<=focus.endRow&&(focus.lane===null||focus.lane===l))cell.classList.add('editor-check-focus');}return out;};
