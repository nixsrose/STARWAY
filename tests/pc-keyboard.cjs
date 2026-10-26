const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},events={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:(name,fn)=>(events[name]??=[]).push(fn),localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
function key(code,type='keydown',extra={}){let prevented=false;const e={code,key:code,repeat:false,preventDefault:()=>prevented=true,...extra};for(const fn of events[type]||[])fn(e);return prevented;}
run(`mode='story';level=0;STORY_COURSES[0]=emptyEditorMap(100);STORY_COURSES[0].tiles=STORY_COURSES[0].tiles.map(()=>Array(7).fill(1));beginRun()`);assert.equal(run('state'),'ready');assert.equal(key('ArrowUp'),true);run('step(.15)');assert.equal(run('state'),'play');assert.ok(run('throttle')>0&&run('throttle')<6,'keyboard starts below 216km/h');key('ArrowUp','keyup');const held=run('throttle');run('step(.1)');assert.equal(run('throttle'),held);
key('ArrowUp');run('step(.5)');assert.ok(run('throttle')>held);key('ArrowUp','keyup');key('ArrowDown');run('step(2)');key('ArrowDown','keyup');assert.equal(run('throttle'),0);
key('ArrowLeft');run('step(.1)');key('ArrowLeft','keyup');assert.ok(run('x')<0);key('ArrowRight');run('step(.2)');key('ArrowRight','keyup');assert.ok(run('x')>0);
assert.equal(key('Space'),true);assert.ok(run('vy')>0);assert.equal(run('grounded'),false);key('Space','keydown',{repeat:true});assert.equal(run('jumpQueued'),false);key('Space','keyup');
run('globalThis.prior=throttle');assert.equal(key('ArrowUp','keydown',{target:{closest:()=>({tagName:'INPUT'})}}),false);run('step(.1)');assert.equal(run('throttle'),run('prior'));
key('KeyP');assert.equal(run('state'),'pause');const pauseZ=run('z');key('Space');run('step(.2)');assert.equal(run('z'),pauseZ);key('Space','keyup');key('KeyP','keyup');key('KeyP');assert.equal(run('state'),'play');key('KeyP','keyup');
run(`showMenu('main')`);assert.equal(key('ArrowUp'),false);assert.equal(key('Space'),false);
run(`state='editor'`);assert.equal(key('ArrowLeft'),false);assert.equal(key('Space'),false);
run(`STORY_COURSES[0].noJumpZones=[{row:8,lane:3}];beginRun(true);z=8.2;x=0;grounded=true;vy=0;`);key('Space');assert.equal(run('vy'),0);assert.equal(run('grounded'),true);key('Space','keyup');
assert.ok(fs.readFileSync('dist/index.html','utf8').includes('PC 조작: ← → 조향 · ↑ ↓ 속도 조절 · Space 점프'));
console.log('PASS PC arrows steer/start/accelerate/brake/stop, key release, Space jumps once, pause/menu/editor/form isolation, no-jump zones and controls help');
