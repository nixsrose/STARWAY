const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
const uploaded=JSON.parse(fs.readFileSync('tests/fixtures/reserve-save-regression.json','utf8'));
let quota=Infinity;
const nativeStorage={getItem:k=>saved[k]??null,setItem(k,v){const next=String(v),used=Object.entries(saved).reduce((n,[key,value])=>n+key.length+String(value).length,0)-(saved[k]===undefined?0:k.length+String(saved[k]).length)+k.length+next.length;if(used>quota){const e=new Error('quota');e.name='QuotaExceededError';throw e;}saved[k]=next;},removeItem:k=>delete saved[k],key:i=>Object.keys(saved)[i]??null,get length(){return Object.keys(saved).length;}};
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:nativeStorage,requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const initial=boot();
initial.run(`data.coins=77;data.quests.totals.clears=9;for(const d of CHALLENGES)data.challengeMaps[d.id]=challengeCourse(d);save();localStorage.setItem('starway-story-maps-v1',JSON.stringify({0:STORY_COURSES[0]}));`);
// Re-create a pre-update, uncompressed browser save at its quota boundary.
for(const key of Object.keys(saved)){initial.b.raw=saved[key];saved[key]=initial.run('starwayDecodeStored(raw)');}
const oldSize=Object.entries(saved).reduce((n,[k,v])=>n+k.length+v.length,0);quota=oldSize+1000;
const oldGame=JSON.parse(saved['starway-v2']);const uncompressedNext={...oldGame,challengeMaps:{...oldGame.challengeMaps,reserve:uploaded},challengeMapBackups:{reserve:oldGame.challengeMaps.reserve}};
assert.throws(()=>nativeStorage.setItem('starway-v2',JSON.stringify(uncompressedNext)),e=>e.name==='QuotaExceededError');
const fresh=boot();fresh.b.uploaded=uploaded;
fresh.run(`{
 const retained=JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,storyTimes:data.storyTimes,cleared:data.cleared,settings:data.settings,shipUpgrades:data.shipUpgrades}),maps=JSON.stringify(editorStoryOverrides);
 if(!commitChallengeMap('reserve',uploaded))throw Error('quota regression still fails');
 if(data.challengeMaps.reserve.challengeRules.goldTime!==8||data.challengeMaps.reserve.challengeRules.silverTime!==10)throw Error('uploaded settings not saved');
 if(JSON.stringify({coins:data.coins,quests:data.quests,challenges:data.challenges,storyTimes:data.storyTimes,cleared:data.cleared,settings:data.settings,shipUpgrades:data.shipUpgrades})!==retained||JSON.stringify(editorStoryOverrides)!==maps)throw Error('unrelated progress changed');
 const map=backupCapture();if(map.game.challengeMaps.reserve.challengeRules.goldTime!==8||JSON.stringify(map).includes('STARWAY-COMPACT-1'))throw Error('export was not normal JSON');
 const original=JSON.stringify(uploaded),decoded=JSON.parse(starwayDecodeStored(starwayEncodeStored(original)));decoded.tiles[0][3]=8;if(decoded.tiles[1][3]!==uploaded.tiles[1][3])throw Error('row references aliased');
 const text=JSON.stringify({title:'한글🚀',rows:Array.from({length:100},()=>['초록',null,2,1,true])});if(starwayDecodeStored(starwayEncodeStored(text))!==text)throw Error('unicode round trip');
 const set=localStorage.setItem;localStorage.setItem=()=>{const e=new Error('blocked');e.name='SecurityError';throw e;};
 if(commitChallengeMap('reserve',uploaded)||!$('editorSaveMessage').textContent.includes('차단'))throw Error('security error not classified');
 confirmChallengeMap('reserve',uploaded);if(!pendingEditorSave||!$('editorSaveMessage').textContent.includes('차단'))throw Error('failed draft lost pending map');
 localStorage.setItem=set;
 let count=0;const prior=localStorage.getItem('starway-editor-v1'),priorGame=localStorage.getItem('starway-v2');localStorage.setItem=(k,v)=>{if(++count===2){const e=new Error('quota');e.name='QuotaExceededError';throw e;}return set(k,v);};
 let failed=false;try{storageTransaction([['starway-v2','temporary'],['starway-editor-v1','temporary']]);}catch(e){failed=true;if(!e.message.includes('한도'))throw e;}localStorage.setItem=set;
 if(!failed||localStorage.getItem('starway-v2')!==priorGame||localStorage.getItem('starway-editor-v1')!==prior)throw Error('partial write rollback');
}`);
const again=boot();assert.equal(again.run('data.challengeMaps.reserve.challengeRules.goldTime'),8);assert.equal(again.run('data.coins'),77);
const newSize=Object.entries(saved).reduce((n,[k,v])=>n+k.length+v.length,0);
console.log('PASS uploaded170-row map: old raw save exceeds quota; compact migration/save/reload succeeds, unrelated progress preserved, plaintext export, Unicode/unaliased rows, SecurityError and quota rollback. Before='+oldSize+'chars; after='+newSize+'chars');
