const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 mode='story';level=0;STORY_COURSES[0]=emptyEditorMap(500);beginRun();
 setThrottleLever(100/36);if(state!=='play'||Math.abs(throttle*36-100)>1e-8)throw Error('100km/h start');
 for(let i=0;i<120;i++)step(1/120);if(speed*36>100.01||speed<=0)throw Error('low speed physics');
 slowRemaining=1;step(1/120);if(speed*36>100)throw Error('slow accelerates low throttle');
 setThrottleLever(0);slowRemaining=1;for(let i=0;i<120;i++)step(1/120);if(speed*36>6)throw Error('cannot brake to stop');
 beginRun();setThrottleLever(0);if(state!=='ready')throw Error('zero starts');setThrottleLever(1/36);if(Math.abs(throttle*36-1)>1e-8)throw Error('1km/h start');
 beginRun();keys.ArrowUp=true;step(1/120);keys.ArrowUp=false;if(throttle<=0||throttle>=6)throw Error('keyboard jumps to minimum');
}`);
console.log('PASS continuous low throttle, 100/1kmh start, zero stays ready, slow pad never raises low target, keyboard gradual start');
