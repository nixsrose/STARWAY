const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8'),ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1])),els={},frames=[];
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function el(){let handlers={};return {style:{setProperty(k,v){this[k]=v}},handlers,attrs:{},clientHeight:95,classList:{add:noop,remove:noop,toggle:noop},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){(handlers[k]??=[]).push(fn)},appendChild:noop,getContext:()=>ctx,getBoundingClientRect:()=>({top:200,bottom:295,height:95}),setPointerCapture:noop,hasPointerCapture:()=>true,releasePointerCapture:noop}}
let b={document:{getElementById:id=>ids.has(id)?els[id]??(els[id]=el()):null,querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:fn=>frames.push(fn),setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);
const run=s=>vm.runInContext(s,b);run('beginRun();draw()');
assert.equal(run('H'),544);assert.equal(els.throttleLever.attrs['aria-valuenow'],'0');
const pointer=(type,y)=>{for(const fn of els.throttleLever.handlers[type])fn({pointerId:7,clientY:y,preventDefault:noop})};
pointer('pointerdown',284);assert.equal(run('state'),'ready');
pointer('pointermove',211);assert.equal(run('state'),'play');assert.equal(run('throttle'),22);
pointer('pointermove',248);assert.equal(run('throttle'),11);
pointer('pointerup',248);pointer('pointermove',211);assert.equal(run('throttle'),11);
for(const fn of els.throttleLever.handlers.keydown)fn({code:'Home',preventDefault:noop,stopPropagation:noop});
assert.equal(run('throttle'),0);run('for(let i=0;i<2000;i++)step(.005);draw()');assert.equal(run('speed'),0);
b.innerWidth=844;b.innerHeight=390;run('resize();draw()');assert.equal(run('H'),234);
console.log('PASS: actual HTML IDs, lever drag/capture/release, idle launch, keyboard stop, target/readout synchronization, portrait/landscape game viewport');

run('beginRun();setThrottleLever(12)');
for(const fn of els.left.handlers.pointerdown)fn({pointerId:1,preventDefault:noop});assert.equal(run('steeringInput()'),-1);
for(const fn of els.jump.handlers.pointerdown)fn({pointerId:2,preventDefault:noop});assert.ok(run('vy')>0);
for(const fn of els.left.handlers.pointerup)fn({pointerId:1});assert.equal(run('steeringInput()'),0);
run('fuel=50;syncCockpit()');assert.equal(els.fuelGauge.attrs['aria-valuenow'],'50');
for(const kind of ['fuel'])for(let i=0;i<8;i++)assert.equal(els[kind+'Cell'+i].attrs['data-lit'],i<4?'true':'false');
run('speed=12;syncCockpit()');for(let i=0;i<32;i++)assert.equal(els['speedCell'+i].attrs['data-lit'],i<16?'true':'false');
run('speed=0;fuel=0;syncCockpit()');for(const kind of ['speed','fuel'])assert.equal(els[kind+'Cell0'].attrs['data-lit'],'false');
run('speed=24;fuel=100;syncCockpit()');assert.equal(els.speedCell31.attrs['data-lit'],'true');assert.equal(els.fuelCell7.attrs['data-lit'],'true');
console.log('PASS: segmented gauges at empty/half/full, speed 32 cells and fuel 8 cells, button multitouch');

for(const [width,height,dock] of [[360,800,300],[390,844,300],[599,900,300],[600,900,224],[768,900,224],[844,390,156]]){b.innerWidth=width;b.innerHeight=height;run('resize()');assert.equal(run('H'),height-dock)}
console.log('PASS: phone/cover stacked dock, unfolded wide dock, fold resize, landscape canvas sizing');
for(const id of ['left','right','jump','throttleLever'])for(const type of ['contextmenu','selectstart','dragstart']){let blocked=false;for(const fn of els[id].handlers[type]||[])fn({preventDefault(){blocked=true}});assert.ok(blocked,id+' '+type)}
assert.ok(fs.readFileSync('dist/cockpit.css','utf8').includes('-webkit-user-select:none'));
console.log('PASS: all flight controls block selection, long-press context menu and native drag');

run('beginRun();keys.left=true;pause();draw()');assert.equal(run('state'),'pause');assert.equal(run('keys.left'),false);assert.equal(els.pause.attrs['aria-label'],'항해 재개');const frozen=run('[z,fuel]');run('step(1)');assert.deepEqual(run('[z,fuel]'),frozen);run('pause()');assert.equal(run('state'),'ready');
const pressPause=()=>els.pause.handlers.pointerdown.forEach(fn=>fn({button:0,preventDefault:noop}));run('setThrottleLever(12)');pressPause();assert.equal(run('state'),'pause');els.pause.onclick({detail:1});assert.equal(run('state'),'pause');pressPause();assert.equal(run('state'),'play');els.pause.onclick({detail:0});assert.equal(run('state'),'pause');els.start.onclick();assert.equal(run('state'),'play');
run("finish(false,'도로 이탈')");pressPause();assert.equal(run('fxPaused'),true);run('draw()');assert.equal(els.pause.attrs['aria-label'],'항해 재개');const fxTime=run('deathTime');run('step(.2)');assert.equal(run('deathTime'),fxTime);pressPause();assert.equal(run('fxPaused'),false);
run('openMapEditor();testEditorMap();pause();pause()');assert.equal(run('state'),'ready');run('setThrottleLever(12);pause()');els.start.onclick();assert.equal(run('state'),'play');console.log('PASS: ready/play/test pause-resume, cleared held controls, frozen resources, pointer/click dedup, keyboard click and falling pause indicator');
run('openMapEditor();restoreEditorRun();mode="story";level=0;beginRun(true)');
const controlEvent=(id,type,pointerId)=>els[id].handlers[type].forEach(fn=>fn({pointerId,preventDefault:noop}));
controlEvent('left','pointerdown',61);controlEvent('left','pointerup',61);assert.equal(run('keys.left'),false);const tapX=run('x');run('step(1/120)');assert.ok(run('x')<tapX);run('step(.1)');const stoppedX=run('x');run('step(.01)');assert.equal(run('x'),stoppedX);
controlEvent('right','pointerdown',71);controlEvent('right','pointerdown',72);controlEvent('right','pointerup',71);assert.equal(run('keys.right'),true);run('step(.01)');controlEvent('right','pointerup',72);assert.equal(run('keys.right'),false);assert.equal(run('steeringTapRemaining'),0);
run('beginRun(true);jump();step(.15);jump();step(.13)');assert.equal(run('jumpQueued'),false);
run('beginRun(true);y=.02;vy=-1;grounded=false;jump()');assert.equal(run('jumpQueued'),true);run('step(.03)');assert.ok(run('vy')>0);assert.equal(run('jumpQueued'),false);assert.equal(run('grounded'),false);
controlEvent('left','pointerdown',80);assert.equal(els.left.attrs['data-pressed'],'true');run('pause()');assert.equal(run('keys.left'),false);assert.equal(els.left.attrs['data-pressed'],'false');assert.equal(run('steeringTapRemaining'),0);
console.log('PASS: brief tap survives before next frame, held controls stop without drift, same-button multitouch, jump buffer/expiry and immediate pressed feedback');
