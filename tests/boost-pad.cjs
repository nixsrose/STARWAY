const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 const map=emptyEditorMap(500);map.tiles[8][3]=4;STORY_COURSES[0]=map;mode='story';level=0;editorTesting=true;$('editorTestPerformance').value='base';beginRun(true);state='play';z=8.1;x=0;speed=12;throttle=12;step(1/120);
 if(Math.abs(speedKmh(speed)-800)>1e-8||boostRemaining!==3)throw Error('pad not immediate 800 / 3sec');const origin=z;
 for(let i=0;i<359;i++)step(1/120);if(Math.abs(speedKmh(speed)-800)>1e-8||boostRemaining<=0)throw Error('boost ended early');
 step(1/120);if(boostRemaining!==0||Math.abs(speed-12)>1e-8)throw Error('boost did not return at 3sec '+boostRemaining+' / '+speed);
 if(Math.abs((z-origin)-BOOST_SPEED*3)>.1)throw Error('boost speed and distance diverged');
 z=8.1;padRow=-1;step(1/120);state='pause';const remaining=boostRemaining;step(.5);if(boostRemaining!==remaining)throw Error('pause consumed boost');state='play';throttle=10;for(let i=0;i<360;i++)step(1/120);if(Math.abs(speed-10)>1e-8)throw Error('lever return ignored');
 z=8.1;padRow=-1;step(1/120);for(let i=0;i<120;i++)step(1/120);z=8.1;padRow=-1;step(1/120);if(boostRemaining!==3)throw Error('retrigger did not refresh');
 z=12.1;rows[12][3]=5;padRow=-1;step(1/120);if(boostRemaining!==0||slowRemaining<=0)throw Error('slow pad priority');
 beginRun(true);if(boostRemaining!==0)throw Error('retry boost leaked');
}`);
console.log('PASS boost immediate 800km/h, 3-second duration and distance, throttle return, pause, refresh, slow pad and retry');
