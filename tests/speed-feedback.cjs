const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 const map=emptyEditorMap(500);map.tiles[8][3]=4;STORY_COURSES[0]=map;mode='story';level=0;editorTesting=true;beginRun(true);state='play';z=8.1;throttle=12;step(1/120);syncCockpit();
 if(!$('flightStatus').textContent.includes('3.0s')||!$('flightStatus').textContent.includes('432 km/h'))throw Error('boost duration and target');
 state='pause';const left=boostRemaining;step(.5);syncCockpit();if(boostRemaining!==left||!$('flightStatus').textContent.includes('일시정지'))throw Error('paused feedback');
 state='play';throttle=10;syncCockpit();if(!$('flightStatus').textContent.includes('360 km/h'))throw Error('live lever target');
 for(const language of ['en','ja','zh']){settings.language=language;syncCockpit();if(/[가-힣]/.test($('flightStatus').textContent))throw Error('localized feedback');}
 settings.language='ko';boostRemaining=0;slowRemaining=1.5;syncCockpit();if(!$('flightStatus').textContent.includes('감속 1.5s'))throw Error('slow feedback');
 beginRun();syncCockpit();if($('flightStatus').textContent.includes('1.5s'))throw Error('retry stale cue');
 state='play';boostRemaining=2;syncCockpit();showMenu('main');syncCockpit();if($('flightStatus').textContent.includes('2.0s'))throw Error('menu stale cue');
}`);
console.log('PASS speed feedback duration, lever target updates, pause freeze, four languages, slow priority and retry/menu cleanup');
