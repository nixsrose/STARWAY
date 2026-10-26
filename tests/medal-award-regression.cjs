const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run('level=1;STORY_COURSES[1]=normalizeEditorMap(STORY_COURSES[1]);STORY_COURSES[1].title="새 이름"');
assert.equal(run('medalEligible(1)'),true,'editor normalization and title must preserve eligibility');
run('data.storyTimes[1]={best:17.15};state="win";mode="story";showMedalResult()');
assert.equal(run('medalTier(1)'),'gold');assert.ok(els.medalResult.textContent.includes('금메달'));
run('save()');assert.equal(boot().run('medalTier(1)'),'gold');
// Geometry, gravity, fuel and title edits must never disqualify a story slot.
for(let i=0;i<30;i++){b.stage=i;run('level=stage;STORY_COURSES[stage]=normalizeEditorMap(STORY_COURSES[stage]);STORY_COURSES[stage].tiles[0]=[1,1,1,1,1,1,1];STORY_COURSES[stage].gravity=50;STORY_COURSES[stage].fuelDrainMultiplier=.5;data.storyTimes[stage]={best:medalTargets[stage].gold};state="win";showMedalResult()');assert.equal(run('medalEligible(stage)'),true);assert.equal(run('medalTier(stage)'),'gold');assert.ok(els.medalResult.textContent.includes('금메달'));run('showMenu("story")');assert.ok(!els.medalSelection.textContent.includes('편집된 맵'));}
run('save()');const fresh=boot();for(let i=0;i<30;i++){fresh.b.stage=i;assert.equal(fresh.run('medalTier(stage)'),'gold');}
run('editorTesting=true;state="win";showMedalResult()');
assert.equal(run('medalEligible(-1)'),false);assert.equal(run('medalEligible(STORY_VISIBLE_COUNT)'),false);
console.log('PASS all 30 developer-edited story maps award gold, persisted records re-evaluate, no edited-map warning');
