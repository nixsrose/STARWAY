// Challenge targets use explicit keys, separate from the story index space.
function editorChallengeId(){const value=String($('editorTemplate').value||'');return CHALLENGES.find(d=>'challenge:'+d.id===value)?.id||null;}
function normalizeChallengeMap(raw,id){
 const map=challengeEditorNormalize(raw),used=new Set();map.challengeId=id;map.challengeRules=normalizeChallengeRules(raw.challengeRules,id);
 map.coins=Array.isArray(raw.coins)?raw.coins.filter(c=>Array.isArray(c)&&Number.isInteger(c[0])&&c[0]>=3&&c[0]<map.tiles.length&&Number.isInteger(c[1])&&c[1]>=0&&c[1]<7&&[1,3,4,5].includes(map.tiles[c[0]][c[1]])&&map.roadPaint[c[0]][c[1]]!=='pink'&&!used.has(c[0])&&used.add(c[0])).map(c=>c.slice(0,2)):[];
 map.guide=map.tiles.map((row,r)=>Number.isInteger(raw.guide?.[r])&&raw.guide[r]>=0&&raw.guide[r]<7?raw.guide[r]:row.findIndex(t=>t===1));
 map.jumpRows=map.tiles.flatMap((row,r)=>r>0&&row.every(t=>!t)&&map.tiles[r-1].some(Boolean)?[r]:[]);return map;
}
const challengeEditorNormalize=normalizeEditorMap;normalizeEditorMap=function(raw){return CHALLENGES.some(d=>d.id===raw?.challengeId)?normalizeChallengeMap(raw,raw.challengeId):challengeEditorNormalize(raw);};
function normalizeChallengeMaps(raw){const out={};for(const d of CHALLENGES)if(raw?.[d.id])try{out[d.id]=normalizeChallengeMap(raw[d.id],d.id)}catch{}return out;}
data.challengeMaps=normalizeChallengeMaps(data.challengeMaps);data.challengeMapBackups=normalizeChallengeMaps(data.challengeMapBackups);
const builtInChallengeCourse=challengeCourse;challengeCourse=function(d){return data.challengeMaps?.[d.id]?normalizeChallengeMap(data.challengeMaps[d.id],d.id):{...builtInChallengeCourse(d),challengeId:d.id};};
for(const d of CHALLENGES){const option=document.createElement('option');option.value='challenge:'+d.id;option.textContent='도전 · '+d.title;$('editorTemplate').appendChild(option);}
const challengeCoinOption=document.createElement('option');challengeCoinOption.value='challengeCoin';challengeCoinOption.textContent='코인 배치 / 제거';$('editorBrush').appendChild(challengeCoinOption);
function syncChallengeEditor(){const id=editorChallengeId();$('editorQuickSave').textContent=id?'도전 항로에 저장':'스토리에 저장';$('editorSave').textContent=id?'선택 도전에 저장·적용':'선택 스토리에 저장·적용';$('editorResetStory').textContent=id?'선택 도전 원본 복원':'선택 스토리 원본 복원';challengeCoinOption.disabled=false;challengeCoinOption.hidden=false;}
const challengeEditorRender=renderEditorGrid;renderEditorGrid=function(...args){const out=challengeEditorRender(...args);syncChallengeEditor();for(const cell of document.querySelectorAll('#editorGrid [data-editor-row]')){const r=Number(cell.getAttribute('data-editor-row')),l=Number(cell.getAttribute('data-editor-lane'));if(editorMap.coins?.some(c=>c[0]===r&&c[1]===l)){cell.textContent+=' ◈';cell.setAttribute('aria-label',cell.getAttribute('aria-label')+' · 코인');}}return out;};
const challengeTargetChange=$('editorTemplate').onchange;$('editorTemplate').onchange=(...args)=>{pendingEditorSave=null;$('editorSaveConfirm').classList.add('hidden');syncChallengeEditor();return challengeTargetChange?.(...args);};
const challengeLoad=$('editorLoadTemplate').onclick;$('editorLoadTemplate').onclick=()=>{const id=editorChallengeId();if(!id)return challengeLoad();editorSnapshot();editorMap=normalizeChallengeMap(challengeCourse(CHALLENGES.find(d=>d.id===id)),id);editorPage=0;editorUndoStack=[];renderEditorGrid();$('editorStatus').textContent='도전 항로를 불러왔습니다. 수정 후 도전 항로에 저장하세요. 코인 도구로 배치·제거할 수 있습니다.';};
function openChallengeEditor(id){if(!developerModeEnabled)return;showMenu('main');$('editorTemplate').value='challenge:'+id;$('editorLoadTemplate').onclick();developerStoryEditorReturn=true;openMapEditor();}
const challengeCoinPaint=paintEditorCell;paintEditorCell=function(r,l,batch=false){
 if($('editorBrush').value!=='challengeCoin'){const out=challengeCoinPaint(...arguments);if(editorMap.coins){editorMap.coins=editorMap.coins.filter(c=>[1,3,4,5].includes(editorMap.tiles[c[0]]?.[c[1]])&&editorMap.roadPaint[c[0]][c[1]]!=='pink');if(!batch)renderEditorGrid();}return out;}
 if(!batch)editorSnapshot();editorMap.coins=editorMap.coins||[];const found=editorMap.coins.some(c=>c[0]===r&&c[1]===l);
 if(!found){if(![1,3,4,5].includes(editorMap.tiles[r][l])||editorMap.roadPaint[r][l]==='pink'){if(!batch){renderEditorGrid();$('editorStatus').textContent='코인은 안전한 도로나 연료·속도 패드 위에 배치하세요.';}return;}}editorMap.coins=editorMap.coins.filter(c=>c[0]!==r);if(!found)editorMap.coins.push([r,l]);
 if(!batch){renderEditorGrid();$('editorStatus').textContent='코인 '+editorMap.coins.length+'개 · 같은 줄에는 코인 1개를 배치할 수 있습니다.';}
};
// Repair collectible placement when ordinary geometry edits remove coin supports.
function prepareChallengeMap(raw,id){
 const map=normalizeChallengeMap(raw,id);if(id!=='precision')return {map,adjusted:0};
 const finish=mapFinishZ(map),original=map.coins.length,target=map.challengeRules.goldCoins;
 map.coins=map.coins.filter(c=>c[0]<finish-.5).slice(0,target);
 const candidates=[];
 for(let r=4;r<Math.min(map.tiles.length-1,Math.floor(finish)-1);r++){
  if(map.coins.some(c=>c[0]===r))continue;
  const lanes=map.tiles[r].flatMap((tile,l)=>[1,3,4,5].includes(tile)&&map.roadPaint[r][l]!=='pink'?[l]:[]);if(!lanes.length)continue;
  const target=map.guide[r]>=0?map.guide[r]:3;lanes.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target));candidates.push([r,lanes[0]]);
 }
 while(map.coins.length<target&&candidates.length){
  const anchor=4+(map.coins.length+.5)*Math.max(1,finish-8)/target;
  candidates.sort((a,b)=>{const score=c=>map.coins.length?Math.min(...map.coins.map(p=>Math.abs(p[0]-c[0]))):Math.abs(c[0]-anchor)*-1;return score(b)-score(a)||a[0]-b[0];});map.coins.push(candidates.shift());
 }
 if(map.coins.length!==target)throw Error('정밀 비행에는 코인을 놓을 수 있는 안전한 도로가 서로 다른 '+target+'줄 이상 필요합니다.');
 map.coins.sort((a,b)=>a[0]-b[0]);return {map,adjusted:Math.abs(original-map.coins.length)};
}
function challengeSaveMessage(text,error=false){$('editorStatus').textContent=text;$('editorSaveMessage').textContent=text;$('editorSaveMessage').setAttribute('data-error',String(error));}
function commitChallengeMap(id,map,reset=false){
 try{const next=reset?normalizeChallengeMap(map,id):prepareChallengeMap(map,id).map;if(!reset){if(![1,3,4,5].includes(next.tiles[2][3])||next.roadPaint[2][3]==='pink')throw Error('출발 위치(3줄 중앙)는 안전한 도로여야 합니다.');}
 const maps={...(data.challengeMaps||{})},backups={...(data.challengeMapBackups||{})};backups[id]=data.challengeMaps?.[id]||normalizeChallengeMap(builtInChallengeCourse(CHALLENGES.find(d=>d.id===id)),id);
 if(reset)delete maps[id];else maps[id]=next;
 storageTransaction([['starway-v2',JSON.stringify({...data,challengeMaps:maps,challengeMapBackups:backups})],['starway-editor-v1',JSON.stringify(next)]]);data.challengeMaps=maps;data.challengeMapBackups=backups;storageOK=true;editorMap=normalizeChallengeMap(next,id);challengeSaveMessage('도전 · '+CHALLENGES.find(d=>d.id===id).title+(reset?' 원본 복원 완료.':' 저장·적용 완료.')+' 다음 도전부터 반영됩니다. 이전 맵도 보관했습니다.');renderEditorGrid();return true;
 }catch(error){challengeSaveMessage('저장하지 못했습니다. '+error.message,true);return false;}
}
function confirmChallengeMap(id,map,reset=false){
 // Keep the edited draft even when validation prevents application.
 let draftError=null;try{localStorage.setItem('starway-editor-v1',JSON.stringify({...map,challengeId:id}));}catch(error){draftError=error;}
 const prepared=reset?{map:normalizeChallengeMap(map,id),adjusted:0}:prepareChallengeMap(map,id),next=prepared.map;
 pendingEditorSave={challenge:id,map:next,reset};$('editorSaveSummary').textContent='대상: 도전 · '+CHALLENGES.find(d=>d.id===id).title+'\n새 맵: '+next.title+' ('+next.tiles.length+'줄 · 코인 '+next.coins.length+'개)'+(prepared.adjusted?'\n변경된 도로에 맞춰 코인을 '+next.challengeRules.goldCoins+'개로 재배치했습니다.':'')+'\n이전 맵은 자동 보관됩니다.';
 $('editorSaveMessage').textContent=draftError?'임시 저장을 하지 못했습니다. '+storageFailureMessage(draftError):'';$('editorSaveConfirm').classList.remove('hidden');
}
const challengeSaveClick=$('editorSave').onclick;$('editorSave').onclick=()=>{const id=editorChallengeId();if(!id)return challengeSaveClick();syncEditorName();try{confirmChallengeMap(id,editorMap)}catch(e){pendingEditorSave=null;challengeSaveMessage(e.message,true);$('editorSaveConfirm').classList.remove('hidden');$('editorSaveSummary').textContent='도전 항로를 적용하지 못했습니다. 편집 내용은 임시 보관했습니다.';}};
const challengeSaveAccept=$('editorSaveAccept').onclick;$('editorSaveAccept').onclick=()=>{const p=pendingEditorSave;if(!p?.challenge)return challengeSaveAccept();if(commitChallengeMap(p.challenge,p.map,p.reset)){pendingEditorSave=null;$('editorSaveConfirm').classList.add('hidden');closeEditorSheets();}};
const challengeResetClick=$('editorResetStory').onclick;$('editorResetStory').onclick=()=>{const id=editorChallengeId();if(!id)return challengeResetClick();confirmChallengeMap(id,builtInChallengeCourse(CHALLENGES.find(d=>d.id===id)),true);};
const challengeRestoreClick=$('editorRestorePrevious').onclick;$('editorRestorePrevious').onclick=()=>{const id=editorChallengeId();if(!id)return challengeRestoreClick();const map=data.challengeMapBackups?.[id];if(!map){$('editorStatus').textContent='이 도전 항로의 이전 맵이 없습니다.';return;}confirmChallengeMap(id,map);};
const challengeDirectSave=saveEditorToStory;saveEditorToStory=function(){const id=editorChallengeId();if(!id)return challengeDirectSave();syncEditorName();return commitChallengeMap(id,editorMap);};
const challengeMapBackup=validateBackup;validateBackup=function(raw){const out=challengeMapBackup(raw);out.game.challengeMaps=normalizeChallengeMaps(raw.game.challengeMaps);out.game.challengeMapBackups=normalizeChallengeMaps(raw.game.challengeMapBackups);return out;};

const challengeResize=$('editorResize').onclick;$('editorResize').onclick=()=>{const rules=editorMap.challengeRules?{...editorMap.challengeRules}:undefined;const id=editorChallengeId(),coins=(editorMap.coins||[]).map(c=>c.slice()),guide=editorMap.guide?.slice();const out=challengeResize();if(id){editorMap.challengeId=id;editorMap.challengeRules=rules||normalizeChallengeRules(null,id);editorMap.coins=coins.filter(c=>c[0]<editorMap.tiles.length&&[1,3,4,5].includes(editorMap.tiles[c[0]][c[1]]));if(guide)editorMap.guide=editorMap.tiles.map((_,r)=>guide[r]??3);renderEditorGrid();}return out;};
// The base editor loads before challenge definitions; recover its challenge draft now.
try{const draft=JSON.parse(localStorage.getItem('starway-editor-v1')||'null');if(CHALLENGES.some(d=>d.id===draft?.challengeId))editorMap=normalizeChallengeMap(draft,draft.challengeId);}catch{}
// Reopen a failed application draft from the challenge card without discarding it.
const reopenChallengeEditor=openChallengeEditor;openChallengeEditor=function(id){
 if(!developerModeEnabled)return;let draft=null;try{const raw=JSON.parse(localStorage.getItem('starway-editor-v1')||'null');if(raw?.challengeId===id){const candidate=normalizeChallengeMap(raw,id),applied=normalizeChallengeMap(challengeCourse(CHALLENGES.find(d=>d.id===id)),id);if(JSON.stringify(candidate)!==JSON.stringify(applied))draft=candidate;}}catch{}
 const out=reopenChallengeEditor(id);if(draft){editorMap=draft;renderEditorGrid();$('editorStatus').textContent='아직 적용되지 않은 편집본을 복원했습니다. 도전 항로에 저장 후 확인하세요.';}return out;
};
