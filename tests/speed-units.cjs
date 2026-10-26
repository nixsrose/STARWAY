const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 STORY_COURSES[0]=emptyEditorMap(500);mode='story';level=0;editorTesting=true;$('editorTestPerformance').value='base';beginRun();launchFromRest();speed=21;throttle=21;const startZ=z,startTime=time;while(z-startZ<100&&state==='play')step(1/120);if(state!=='play'||Math.abs((time-startTime)-100/21)>.02)throw Error('distance/time physics');draw();if($('speed').textContent!=='756.0'||$('throttle').textContent!=='756.0')throw Error('kmh display '+$('speed').textContent);if(Math.abs(speedKmh(21)/3.6-210)>1e-8)throw Error('unit conversion');
}`);
console.log('PASS: displayed 1000m in ~4.76s at 210m/s, HUD and lever show756 km/h, unchanged movement physics');
