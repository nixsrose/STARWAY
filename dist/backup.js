// Explicit, versioned backups. No identity tokens or server creator data are exported.
const BACKUP_KEYS=['starway-v2','starway-editor-v1','starway-story-maps-v1'];
let pendingBackup=null,pendingEditorSave=null;
function backupCapture(){return {format:'starway-backup',version:1,createdAt:new Date().toISOString(),game:{...data,settings:{...settings}},editor:JSON.parse(JSON.stringify(editorMap)),storyMaps:JSON.parse(JSON.stringify(editorStoryOverrides))}}
function validateBackup(raw){
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v),integer=(v,max)=>Number.isSafeInteger(v)&&v>=0&&v<=max;
 if(!object(raw)||raw.format!=='starway-backup'||raw.version!==1||!object(raw.game)||!object(raw.storyMaps))throw Error('STARWAY 전체 백업 파일이 아닙니다.');
 const g=raw.game;if(!integer(g.coins,1e12)||!integer(g.best,1e12)||!integer(g.unlocked,29)||!Array.isArray(g.owned)||!g.owned.length||g.owned.some(i=>!integer(i,skins.length-1))||!g.owned.includes(0)||!g.owned.includes(g.skin)||!Array.isArray(g.cleared)||g.cleared.some(i=>!integer(i,29))||!object(g.storyTimes))throw Error('진행도 또는 스킨 데이터가 올바르지 않습니다.');
 const storyTimes={};for(const [key,r] of Object.entries(g.storyTimes)){if(!/^\d+$/.test(key)||!integer(Number(key),29)||!object(r)||!Number.isFinite(r.best)||r.best<=0)throw Error('기록 데이터가 올바르지 않습니다.');storyTimes[key]={best:r.best};}
 const s=g.settings??settingsDefaults;if(!object(s)||!['low','medium','high'].includes(s.graphics)||!['ko','en','ja','zh'].includes(s.language)||!['buttons','joystick'].includes(s.controls)||typeof s.sound!=='boolean'||s.bgm!==undefined&&typeof s.bgm!=='boolean')throw Error('설정 데이터가 올바르지 않습니다.');
 const orders={};if(g.orders!==undefined){if(!object(g.orders)||Object.keys(g.orders).length>5000)throw Error('구매 내역이 올바르지 않습니다.');for(const [k,v] of Object.entries(g.orders)){if(['__proto__','constructor','prototype'].includes(k)||typeof v!=='string'||k.length>300||v.length>100)throw Error('구매 내역이 올바르지 않습니다.');orders[k]=v;}}
 const maps={};for(const [key,m] of Object.entries(raw.storyMaps)){if(!/^\d+$/.test(key)||!integer(Number(key),29))throw Error('맵 저장 대상이 올바르지 않습니다.');maps[key]=normalizeEditorMap(m);}
 return {format:'starway-backup',version:1,createdAt:raw.createdAt,game:{coins:g.coins,best:g.distanceOriginVersion===1?g.best:Math.max(0,g.best-2),distanceOriginVersion:1,unlocked:g.unlocked,owned:[...new Set(g.owned)],skin:g.skin,cleared:[...new Set(g.cleared)],storyTimes,orders,settings:{...s,bgm:s.bgm!==false}},editor:normalizeEditorMap(raw.editor),storyMaps:maps};
}
function storageFailureMessage(error){
 const name=String(error?.name||'Error');
 if(name==='QuotaExceededError'||error?.code===22||error?.code===1014)return '브라우저의 이 게임 저장 한도를 초과했습니다. 편집 맵을 JSON으로 내보내 보관해 주세요.';
 if(name==='SecurityError'||name==='NotAllowedError')return '브라우저가 이 게임의 데이터 저장을 차단했습니다. 사이트 저장 권한과 비공개 모드를 확인해 주세요.';
 return '브라우저 저장 오류('+name+')가 발생했습니다. 편집 맵을 JSON으로 내보내 보관해 주세요.';
}
function storageTransaction(entries){
 const before=new Map(entries.map(([key])=>[key,localStorage.getItem(key)])),changed=[];
 try{for(const [key,value]of entries){localStorage.setItem(key,value);changed.push(key);}}
 catch(error){let rollback=true;for(const key of changed.reverse())try{const value=before.get(key);if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{rollback=false;}
  throw Error(storageFailureMessage(error)+(rollback?' 기존 저장 데이터는 유지됩니다.':' 일부 데이터를 되돌리지 못했습니다. 복원 백업으로 복구해 주세요.'));
 }
}
function backupDownload(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function backupMessage(text){$('backupStatus').textContent=text}
function prepareBackupRestore(value){pendingBackup=validateBackup(value);const g=pendingBackup.game;$('backupSummary').textContent='현재 데이터를 교체합니다. 코인 '+g.coins+' · 클리어 '+g.cleared.length+'/30 · 스킨 '+g.owned.length+'종 · 수정한 스토리 맵 '+Object.keys(pendingBackup.storyMaps).length+'개. 복원 전 현재 상태를 자동 보관합니다.';$('backupConfirm').classList.remove('hidden');}
function applyBackupRestore(){
 if(!pendingBackup)return false;
 try{
  if(editorTesting)throw Error('시험 주행을 종료한 뒤 복원하세요.');
  const next=pendingBackup,previous=backupCapture();
  // Keep known purchase receipts when moving between older and newer snapshots.
  next.game.orders={...(data.orders||{}),...next.game.orders};
  localStorage.setItem('starway-restore-backup-v1',JSON.stringify(previous));
  storageTransaction([['starway-v2',JSON.stringify(next.game)],['starway-editor-v1',JSON.stringify(next.editor)],['starway-story-maps-v1',JSON.stringify(next.storyMaps)]]);
  data=next.game;editorMap=next.editor;editorStoryOverrides=next.storyMaps;for(let i=0;i<30;i++)STORY_COURSES[i]=editorStoryOverrides[i]||editorBuiltInCourses[i];Object.assign(settings,data.settings);editorPage=0;editorUndoStack=[];level=Math.min(level,data.unlocked);storageOK=true;pendingBackup=null;applySettings();showMenu('options');$('backupConfirm').classList.add('hidden');backupMessage('복원했습니다. 잘못 가져왔다면 이전 복원 되돌리기를 누르세요.');return true;
 }catch(error){backupMessage('복원하지 못했습니다. '+error.message);return false;}
}
$('backupExport').onclick=()=>{try{backupDownload(backupCapture(),'STARWAY-backup-'+new Date().toISOString().slice(0,10)+'.json');backupMessage('백업 다운로드를 요청했습니다. 기기의 다운로드 폴더를 확인하세요.')}catch{backupMessage('백업 파일을 만들지 못했습니다.')}};
$('backupImport').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;pendingBackup=null;$('backupConfirm').classList.add('hidden');try{if(file.size>8000000)throw Error('8MB 이하의 백업을 선택하세요.');prepareBackupRestore(JSON.parse(await file.text()));backupMessage('내용을 확인한 뒤 복원하세요.')}catch(error){backupMessage('가져오기 실패: '+error.message)}e.target.value=''});
$('backupApply').onclick=applyBackupRestore;$('backupCancel').onclick=()=>{pendingBackup=null;$('backupConfirm').classList.add('hidden');backupMessage('복원을 취소했습니다.')};
$('backupUndoRestore').onclick=()=>{try{const raw=localStorage.getItem('starway-restore-backup-v1');if(!raw)throw Error('되돌릴 복원 내역이 없습니다.');prepareBackupRestore(JSON.parse(raw));backupMessage('이전 상태로 되돌릴 내용을 확인하세요.')}catch(error){backupMessage(error.message)}};
function commitProtectedMap(i,next){
 try{
  const backups=JSON.parse(localStorage.getItem('starway-map-backups-v1')||'{}');backups[i]={savedAt:new Date().toISOString(),map:editorStoryOverrides[i]||null};
  const overrides={...editorStoryOverrides,[i]:next};
  storageTransaction([['starway-map-backups-v1',JSON.stringify(backups)],['starway-story-maps-v1',JSON.stringify(overrides)],['starway-editor-v1',JSON.stringify(next)]]);
  editorStoryOverrides=overrides;STORY_COURSES[i]=next;storageOK=true;$('editorStatus').textContent='스토리 '+editorStageLabel(i)+' · '+next.title+' 저장·적용 완료. 이전 맵도 자동 보관했습니다.';return true;
 }catch(error){$('editorStatus').textContent='저장하지 못했습니다. '+error.message;return false;}
}
saveEditorToStory=function(){syncEditorName();try{return commitProtectedMap(editorTarget(),normalizeEditorMap(editorMap))}catch(error){$('editorStatus').textContent='저장하지 못했습니다. '+error.message;return false}};
function confirmEditorMap(i,map,reset=false){pendingEditorSave={target:i,map:normalizeEditorMap(map),reset};$('editorSaveSummary').textContent='저장 대상: 스토리 '+editorStageLabel(i)+'\n기존 맵: '+STORY_COURSES[i].title+'\n새 맵: '+pendingEditorSave.map.title+' ('+pendingEditorSave.map.tiles.length+'줄)\n이 스테이지의 맵을 교체합니다. 이전 맵은 자동 보관됩니다.';$('editorSaveConfirm').classList.remove('hidden');}
$('editorSave').onclick=()=>{syncEditorName();try{confirmEditorMap(editorTarget(),editorMap)}catch(error){$('editorStatus').textContent=error.message}};
$('editorSaveCancel').onclick=()=>{pendingEditorSave=null;$('editorSaveConfirm').classList.add('hidden')};
$('editorSaveAccept').onclick=()=>{if(!pendingEditorSave)return;const p=pendingEditorSave;if(p.reset?resetEditorStory(p.target):commitProtectedMap(p.target,p.map)){pendingEditorSave=null;$('editorSaveConfirm').classList.add('hidden')}};
$('editorRestorePrevious').onclick=()=>{try{const i=editorTarget(),previous=JSON.parse(localStorage.getItem('starway-map-backups-v1')||'{}')[i];if(!previous)throw Error('이 스테이지의 이전 맵이 없습니다.');confirmEditorMap(i,previous.map||editorBuiltInCourses[i],!previous.map);$('editorStatus').textContent='이전 맵 복구 대상을 확인하세요.'}catch(error){$('editorStatus').textContent=error.message}};
const protectedSave=save;save=function(){protectedSave();$('saveFailure').classList.toggle('hidden',storageOK);if(!storageOK)$('saveFailure').textContent='저장 실패 · 이번 변경이 기기에 저장되지 않았습니다. 옵션에서 전체 백업으로 보관하세요.';return storageOK};

const backupEditorOpen=openMapEditor;openMapEditor=function(...args){pendingEditorSave=null;$('editorSaveConfirm').classList.add('hidden');return backupEditorOpen(...args)};
const backupMenu=showMenu;showMenu=function(...args){pendingBackup=null;$('backupConfirm').classList.add('hidden');return backupMenu(...args)};

resetEditorStory=function(i=editorTarget()){
 try{
  const backups=JSON.parse(localStorage.getItem('starway-map-backups-v1')||'{}');backups[i]={savedAt:new Date().toISOString(),map:editorStoryOverrides[i]||null};
  const next={...editorStoryOverrides};delete next[i];
  storageTransaction([['starway-map-backups-v1',JSON.stringify(backups)],['starway-story-maps-v1',JSON.stringify(next)]]);
  editorStoryOverrides=next;STORY_COURSES[i]=editorBuiltInCourses[i];$('editorStatus').textContent='스토리 '+editorStageLabel(i)+'을 원본으로 복원했습니다. 이전 맵과 편집 중인 맵은 유지됩니다.';return true;
 }catch(error){$('editorStatus').textContent='복원하지 못했습니다. '+error.message;return false;}
};
$('editorResetStory').onclick=()=>{const i=editorTarget();confirmEditorMap(i,editorBuiltInCourses[i],true)};
if(!storageOK){$('saveFailure').classList.remove('hidden');$('saveFailure').textContent='저장 공간을 사용할 수 없습니다. 옵션에서 전체 백업으로 보관하세요.';}
