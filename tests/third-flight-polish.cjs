const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,els}=boot();
run('data.unlocked=2;mode="story";level=2;beginRun();globalThis.originalMap=JSON.stringify(STORY_COURSES[2])');assert.equal(run('flightGuide'),null,'no extra in-run tutorial for 1-3');assert.equal(run('courseReadabilityActive()'),true);
assert.ok(run('thirdFlightFailureHint("도로 이탈 · 낙하",63)').includes('공중'));
assert.ok(run('thirdFlightFailureHint("블록 옆면 충돌",188)').includes('윗면'));
assert.ok(run('thirdFlightFailureHint("도로 이탈 · 낙하",20)').includes('감속'));
assert.ok(run('thirdFlightFailureHint("블록 옆면 충돌",45)').includes('통로'));
for(const reason of ['연료 소진','위험 바닥 접촉','터널 벽 충돌'])assert.equal(run('thirdFlightFailureHint('+JSON.stringify(reason)+',63)'),null);
run('globalThis.markCalls=[];releaseGroundQuad=(...args)=>markCalls.push(args);z=50;drawIntroLandingEdge(66,2,66,.8,{front:true})');assert.equal(run('markCalls.length'),3);assert.ok(run('markCalls.every(q=>q[4]>.8)'));
run('markCalls=[];drawIntroLandingEdge(90,2,90,.8,{front:true});drawIntroLandingEdge(66,2,66,.8,{front:false});editorTesting=true;drawIntroLandingEdge(66,2,66,.8,{front:true})');assert.equal(run('markCalls.length'),0,'range, hidden front and editor excluded');
run('editorTesting=false;level=1');assert.equal(run('thirdFlightFailureHint("도로 이탈 · 낙하",63)'),null);
run('level=2;beginRun(true);time=15.2;finish(true)');assert.ok(els.start.textContent.includes('다음 스테이지로'));assert.equal(run('state'),'win');assert.ok(run('data.unlocked>=3'));assert.equal(run('nextTimer'),0);els.start.onclick();assert.equal(run('level'),3);assert.equal(run('state'),'ready');assert.equal(run('time'),0,'2-1 waits at rest');
run('level=2');assert.equal(run('JSON.stringify(STORY_COURSES[2])'),run('originalMap'));
console.log('PASS 1-3 cue scope, failure contexts, landing-edge bounds, unchanged map, unlocked 2-1 and manual next-stage launch');
