const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,b}=boot();
run(`{
 const before=JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,cleared:data.cleared,storyMaps:editorStoryOverrides});
 for(const id of ['sprint','reserve','precision']){
  const c=CHALLENGES.find(d=>d.id===id),map=challengeCourse(c),template=normalizeChallengeMap(CHALLENGE_MAP_TEMPLATES[id],id);
  if(JSON.stringify(map.tiles)!==JSON.stringify(template.tiles)||JSON.stringify(map.coins)!==JSON.stringify(template.coins)||JSON.stringify(map.challengeRules)!==JSON.stringify(template.challengeRules))throw Error('template not restored '+id);
  if(JSON.stringify(effectiveChallenge(id).rules)!==JSON.stringify(template.challengeRules))throw Error('effective rules differ '+id);
 }
 if(effectiveChallenge('sprint').rules.goldTime!==15||effectiveChallenge('sprint').rules.timeLimit!==25||effectiveChallenge('reserve').fuel!==25||challengeCourse(CHALLENGES[2]).gravity!==200)throw Error('backup settings lost');
 if(JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,cleared:data.cleared,storyMaps:editorStoryOverrides})!==before)throw Error('personal progress imported');
 const map=emptyEditorMap(80);map.title='current override';data.challengeMaps={sprint:normalizeChallengeMap(map,'sprint')};
 if(challengeCourse(CHALLENGES[0]).title!=='current override')throw Error('existing custom map overwritten');
 data.coins=73;data.quests.totals.clears=7;const retained=JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,cleared:data.cleared,storyTimes:data.storyTimes,shipUpgrades:data.shipUpgrades,settings:data.settings});
 prepareBackupRestore({format:'starway-challenge-maps',version:1,challengeMaps:CHALLENGE_MAP_TEMPLATES});if(!applyBackupRestore())throw Error('partial apply');
 if(data.challengeMapBackups.sprint.title!=='current override')throw Error('previous map not retained');
 if(JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,cleared:data.cleared,storyTimes:data.storyTimes,shipUpgrades:data.shipUpgrades,settings:data.settings})!==retained)throw Error('partial restore changed player data');
 const savedState=JSON.stringify(data),write=localStorage.setItem;localStorage.setItem=()=>{throw Error('full')};prepareBackupRestore({format:'starway-challenge-maps',version:1,challengeMaps:CHALLENGE_MAP_TEMPLATES});if(applyBackupRestore()||JSON.stringify(data)!==savedState)throw Error('failed restore not atomic');localStorage.setItem=write;
 let rejected=false;try{validateChallengeMapBackup({format:'starway-challenge-maps',version:1,challengeMaps:{bad:{}}})}catch{rejected=true}if(!rejected)throw Error('invalid key accepted');
}`);
console.log('PASS extracted maps/settings become defaults without importing progress; overrides preserved; partial map restore/previous maps/storage-failure rollback');

run(`{
 data.challengeMaps={};
 for(const id of ['sprint','reserve','precision']){showMenu('main');startChallenge(id);const rules=effectiveChallenge(id).rules;if(fuel!==rules.startFuel)throw Error('imported starting fuel');launchFromRest();throttle=10;for(let i=0;i<60&&state==='play';i++)step(1/120);if(state!=='play'||!Number.isFinite(z)||!Number.isFinite(y))throw Error('imported map startup');}
 showMenu('main');
}`);
console.log('PASS actual imported maps start with restored rules/fuel and run finite physics; full human clears remain separate');
