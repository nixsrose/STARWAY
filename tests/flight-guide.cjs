const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();run('mode="story";level=0;settings.flightGuideSeen=false;beginRun()');assert.equal(run('state'),'ready');assert.equal(run('time'),0);assert.equal(run('flightGuide.stage'),0);run('pause();globalThis.guideAge=flightGuide.age;step(2)');assert.equal(run('flightGuide.age'),run('guideAge'));run('pause()');els.flightGuideSkip.onclick();assert.equal(run('settings.flightGuideSeen'),true);assert.equal(run('flightGuide'),null);const fresh=boot();assert.equal(fresh.run('settings.flightGuideSeen'),true);
run('showMenu("options")');els.replayFlightGuide.onclick();assert.equal(run('level'),0);assert.equal(run('mode'),'story');assert.ok(run('flightGuide'));assert.equal(run('time'),0);
run('endFlightGuide(false);settings.flightGuideSeen=false;beginRun(true);for(let i=0;i<120;i++)guidedStep(1/120);globalThis.baseline=JSON.stringify([x,y,z,vy,speed,time,fuel,grounded]);beginRun(true);for(let i=0;i<120;i++)step(1/120)');assert.equal(run('JSON.stringify([x,y,z,vy,speed,time,fuel,grounded])'),run('baseline'));
run('data.unlocked=20;mode="story";level=1;settings.flightGuideSeen=false;beginRun(true)');assert.equal(run('flightGuide.lesson'),2);run('level=0;editorTesting=true;beginRun(true)');assert.equal(run('flightGuide'),null);console.log('PASS first1-1 guide, ready clock untouched, pause freezes hints, skip saved/reload, replay settings, identical simulation with/without guide, other stages/editor excluded');

run('editorTesting=false;level=0;settings.flightGuideSeen=false;beginRun();state="play";flightGuide.stage=2;z=15;x=0;speed=0;grounded=true;vy=0;step(0)');
assert.equal(run('guideObstacleAhead()'),false,'safe center road does not demand a jump');
run('z=126');assert.equal(run('guideObstacleAhead()'),true,'actual upcoming center gap is detected');
run('z=15;grounded=false;vy=-1;step(0)');assert.equal(run('flightGuide.stage'),2,'falling is not successful jump learning');
run('grounded=true;vy=0;y=0;jump();step(1/120)');assert.equal(run('flightGuide.airborne'),true);assert.equal(run('flightGuide.stage'),2,'wait for landing');
run('grounded=true;vy=0;y=0;step(0)');assert.equal(run('flightGuide.stage'),3,'landing after ascent advances');
run('settings.flightGuideSeen=false;state="dead";step(0)');assert.equal(run('settings.flightGuideSeen'),false,'failure keeps guidance available on retry');
run('beginRun();state="win";step(0)');assert.equal(run('settings.flightGuideSeen'),true,'clear completes guidance');
console.log('PASS 1-1 safe-road silence, actual gap detection, fall vs jump, landing, failure retry and clear completion');

run('settings.flightGuideSeen=false;beginRun();state="play";speed=0;flightGuide.stage=1;flightGuide.age=0;step(.05)');assert.ok(run('flightGuide.age')<=.050001,'nested simulation steps do not accelerate guide');
