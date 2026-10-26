const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},events={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:(name,fn)=>(events[name]??=[]).push(fn),localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run("data.unlocked=29;mode='story';level=0;beginRun();");
assert.equal(run('flightDiagnosticRuns.length'),0,'disabled by default');
run("flightDiagnosticsEnabled=true;beginRun();state='play';z=25;diagnosticFrame(100,4,2,true);diagnosticFrame(116,5,2,true);diagnosticFrame(180,7,3,true);");
assert.equal(run('flightDiagnosticRun.segments[20].frames'),2);
assert.equal(run('flightDiagnosticRun.segments[20].over50'),1);
run("diagnosticFrame(1000,0,0,false);diagnosticFrame(2000,2,1,true);diagnosticFrame(2016,2,1,true)");
assert.equal(run('flightDiagnosticRun.segments[20].maxFrameMs'),64,'pause gap excluded');
run("finish(false,'장애물 충돌')");
assert.equal(run("flightDiagnosticRun.outcome"),'failure');
assert.equal(run("flightDiagnosticRun.events.filter(e=>e.type==='failure').length"),1);
run("diagnosticFrame(3000,2,1,true)");assert.equal(run('flightDiagnosticRun.segments[20].frames'),3,'no samples after result');
run("beginRun();state='play';finish(true,'');");assert.equal(run('flightDiagnosticRun.outcome'),'clear');
run("for(let i=0;i<23;i++)beginRun();showMenu('main');");assert.equal(run('flightDiagnosticRuns.length'),20);assert.equal(run('flightDiagnosticRun.outcome'),'menu');
run("$('diagnosticClear').onclick()");assert.equal(run('flightDiagnosticRuns.length'),0);
run("flightDiagnosticsEnabled=false;beginRun()");assert.equal(run('flightDiagnosticRuns.length'),0);
console.log('PASS opt-in, row buckets, stalls, pause exclusion, failure/clear capture, post-result exclusion, retry cap and local deletion');

// Study metrics exclude paused/hidden time and survive trimming of detailed runs.
run("$('diagnosticClear').onclick();flightDiagnosticsEnabled=true;mode='story';level=0;STORY_COURSES[0]=emptyEditorMap(100);beginRun();for(let i=0;i<10;i++)step(.01)");
assert.ok(Math.abs(run('flightDiagnosticRun.readySeconds')-.1)<1e-9);
run('setThrottleLever(12)');assert.ok(Math.abs(run('flightDiagnosticRun.launchDelaySeconds')-.1)<1e-9);
run('pause();step(.05)');assert.ok(Math.abs(run('flightDiagnosticRun.activeSeconds')-.1)<1e-9,'pause excluded');run('pause();step(.01);z=25;finish(false,"장애물 충돌")');
assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).failures'),1);run('finish(false,"장애물 충돌")');assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).failures'),1,'terminal event once');
run('globalThis.failed=flightDiagnosticRun;beginRun()');assert.equal(run('failed.decision.action'),'retry');assert.equal(run('failed.decision.row'),25);assert.equal(run('flightDiagnosticRun.attemptIndex'),2);assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).retryAfterFailure'),1);assert.equal(run('Object.values(diagnosticStudyRow(flightDiagnosticRun).failureLocations)[0].row'),25);assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).retries'),1);
run('showMenu("main");showMenu("story")');assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).menuExits'),1,'nested menu once');
run('beginRun();setThrottleLever(12);step(.01);time=9;finish(true)');assert.equal(run('diagnosticStudyRow(flightDiagnosticRun).firstClear.attempt'),3);assert.ok(run('diagnosticStudyRow(flightDiagnosticRun).firstClear.activeSeconds')>.1);
run('globalThis.firstClear=JSON.stringify(diagnosticStudyRow(flightDiagnosticRun).firstClear);beginRun();setThrottleLever(12);step(.01);finish(true)');assert.equal(run('JSON.stringify(diagnosticStudyRow(flightDiagnosticRun).firstClear)'),run('firstClear'));
const fresh=boot();assert.equal(fresh.run('flightDiagnosticsEnabled'),false);assert.equal(fresh.run('Object.values(flightDiagnosticStudy.stages)[0].attempts'),4,'aggregate reload');
run('globalThis.priorKey=flightDiagnosticRun.studyKey;STORY_COURSES[0].tiles[20][0]=1;beginRun()');assert.notEqual(run('flightDiagnosticRun.studyKey'),run('priorKey'));assert.equal(run('flightDiagnosticRun.attemptIndex'),1,'map versions separate');
run("$('diagnosticClear').onclick()");assert.equal(run('Object.keys(flightDiagnosticStudy.stages).length'),0);assert.equal(run('flightDiagnosticRuns.length'),0);
console.log('PASS launch delay, active-only time, failure/decision dedup, retry location, first clear, aggregate reload and map revision separation');
