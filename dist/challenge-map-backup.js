// Partial restore deliberately merges only challenge maps, with a reversible map backup.
let pendingChallengeMapRestore=null;
function validateChallengeMapBackup(raw){
 if(raw?.format!=='starway-challenge-maps'||raw.version!==1||!raw.challengeMaps||typeof raw.challengeMaps!=='object')throw Error('도전 항로 맵 파일이 아닙니다.');
 const out={};for(const id of Object.keys(raw.challengeMaps)){if(!CHALLENGES.some(d=>d.id===id))throw Error('알 수 없는 도전 항로입니다.');out[id]=normalizeChallengeMap(raw.challengeMaps[id],id);}
 if(!Object.keys(out).length)throw Error('가져올 도전 항로가 없습니다.');return out;
}
const challengeMapsPrepare=prepareBackupRestore;prepareBackupRestore=function(raw){
 pendingChallengeMapRestore=null;$('backupApply').textContent=tr('현재 데이터를 교체하여 복원');
 if(raw?.format!=='starway-challenge-maps')return challengeMapsPrepare(raw);
 const maps=validateChallengeMapBackup(raw);pendingBackup=null;pendingChallengeMapRestore=maps;$('backupApply').textContent=({ko:'도전 항로 맵만 적용',en:'Apply challenge maps only',ja:'チャレンジマップのみ適用',zh:'仅应用挑战地图'})[settings.language]||'Apply challenge maps only';
 $('backupSummary').textContent='도전 항로 맵만 적용합니다: '+Object.values(maps).map(m=>m.title+' ('+m.tiles.length+'줄)').join(' · ')+'. 코인·스토리·강화·퀘스트·도전 기록은 유지됩니다. 현재 도전 맵은 이전 맵으로 보관합니다.';
 $('backupConfirm').classList.remove('hidden');
};
const challengeMapsApply=applyBackupRestore;applyBackupRestore=function(){
 if(!pendingChallengeMapRestore)return challengeMapsApply();
 try{
  const maps={...(data.challengeMaps||{})},backups={...(data.challengeMapBackups||{})};
  for(const [id,map]of Object.entries(pendingChallengeMapRestore)){backups[id]=normalizeChallengeMap(challengeCourse(CHALLENGES.find(d=>d.id===id)),id);maps[id]=map;}
  const next={...data,challengeMaps:maps,challengeMapBackups:backups};storageTransaction([['starway-v2',JSON.stringify(next)]]);
  data=next;pendingChallengeMapRestore=null;pendingBackup=null;$('backupConfirm').classList.add('hidden');backupMessage('도전 항로 맵만 적용했습니다. 다음 도전부터 반영됩니다. 기존 진행 기록은 유지했습니다.');return true;
 }catch(e){backupMessage('도전 항로를 적용하지 못했습니다. '+e.message);return false;}
};
$('backupApply').onclick=applyBackupRestore;
const challengeMapsCancel=$('backupCancel').onclick;$('backupCancel').onclick=(...args)=>{pendingChallengeMapRestore=null;return challengeMapsCancel?.(...args);};
const challengeMapsMenu=showMenu;showMenu=function(...args){pendingChallengeMapRestore=null;return challengeMapsMenu(...args);};
