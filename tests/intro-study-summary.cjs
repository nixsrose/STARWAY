const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,els}=boot();assert.equal(run('diagnosticIntroRows().length'),3);assert.equal(run('diagnosticIntroRows().every(r=>r.stat===null)'),true);
run(`flightDiagnosticStudy={stages:{
 'story:1-1:a':{mode:'story',stage:'1-1',mapRevision:'a',attempts:4,clears:1,failures:3,retries:2,menuExits:1,firstClear:{attempt:4,activeSeconds:52},failureLocations:{a:{row:129,reason:'추락',count:2},b:{row:30,reason:'충돌',count:3}}},
 'story:1-1:b':{mode:'story',stage:'1-1',mapRevision:'b',attempts:1,clears:0},
 'story:1-2:c':{mode:'story',stage:'1-2',mapRevision:'c',attempts:2,clears:1},
 'editor:1-3:d':{mode:'editor',stage:'1-3',mapRevision:'d',attempts:88}
 }};flightDiagnosticRuns=[{mode:'story',stage:'1-1',mapRevision:'b',studyKey:'story:1-1:b',launchDelaySeconds:1},{mode:'story',stage:'1-1',mapRevision:'a',studyKey:'story:1-1:a',launchDelaySeconds:2.5}];syncFlightDiagnostics()`);
assert.equal(run('diagnosticIntroRows()[0].stat.attempts'),4,'latest played map, not sum or insertion order');assert.equal(run('diagnosticIntroRows()[0].versions'),2);assert.equal(run('diagnosticIntroRows()[0].hotspots[0].row'),30);assert.equal(run('diagnosticIntroRows()[0].recent.launchDelaySeconds'),2.5);assert.equal(run('diagnosticIntroRows()[2].stat'),null,'editor excluded');
run('flightDiagnosticRuns=[]');assert.equal(run('diagnosticIntroRows()[1].recent'),null,'old aggregate without retained run');assert.equal(run('diagnosticIntroRows()[1].stat.attempts'),2);run('syncFlightDiagnostics()');
for(const stage of [0,1,2,3]){run('mode="story";data.unlocked=29;level='+stage+';beginRun(true);time=12;finish(true)');assert.equal(els.start.textContent,'다음 스테이지로 →');}
run('level=STORY_VISIBLE_COUNT-1;beginRun(true);finish(true)');assert.ok(!els.start.textContent.includes('다음'),'final stage still retries');
els.diagnosticClear.onclick();assert.equal(run('diagnosticIntroRows().every(r=>r.stat===null)'),true);assert.equal(run('flightDiagnosticsEnabled'),false,'summary does not enable recording');
console.log('PASS empty/partial summary, version separation, latest played revision, failure ranking, retained-run limits, reset, local opt-in and uniform next button');
