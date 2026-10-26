const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
const el=()=>({style:{},setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild:noop,getContext:()=>ctx});
let els={},saved={},timers=[];
const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},requestAnimationFrame:noop,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

vm.runInContext(`{
 const seedRandom=seed=>{let value=seed>>>0;Math.random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}};
 for(const seed of [1,7,31])for(const velocity of [18,24])for(const start of [0,5760])for(const p of MAP_PATTERN_CATALOG){seedRandom(seed);mode='endless';beginRun(true);rows=[];coins.clear();infiniteRoad={roadPaint:[],roadColors:[],boxColors:[],tunnelColors:[],ceilings:[],tunnelCenters:{},tunnelRadius:{},guide:[],sections:[],jumpRows:[],bridges:[]};generated=0;nextFuelRow=start+50;generateBlock(start,0,p.id);const end=generated;z=start+2;x=0;y=0;vy=0;grounded=true;speed=velocity;throttle=velocity;
 for(let f=0;f<2000&&state==='play'&&z<end-3;f++){const lane=infiniteRoad.guide[Math.floor(z)];keys.left=x>lane-3+.06;keys.right=x<lane-3-.06;if(grounded&&infiniteRoad.jumpRows.includes(Math.floor(z)))jump();step(1/120)}
 if(state!=='play'||z<end-3)throw Error('seed '+seed+' v '+velocity+' start '+start+' '+p.id+' '+state+' '+deathReason+' z '+z+' x '+x+' y '+y);
 }
 console.log('PASS: 480 pattern/seed/speed/tier combinations');
 for(const velocity of [18,22,24]){seedRandom(123+velocity);mode='endless';beginRun(true);speed=velocity;throttle=velocity;let minFuel=100;const seen=new Set(),sources=new Set();for(let f=0;f<160000&&state==='play'&&z<20000;f++){const lane=infiniteRoad.guide[Math.floor(z)]??3;keys.left=x>lane-3+.06;keys.right=x<lane-3-.06;for(const s of infiniteRoad.sections){seen.add(s.patternId);sources.add(s.source)}if(grounded&&infiniteRoad.jumpRows.includes(Math.floor(z)))jump();step(1/120);minFuel=Math.min(minFuel,fuel)}if(z<20000)throw Error('fuel/route '+velocity+' '+state+' '+deathReason+' '+z+' fuel '+fuel+' section '+JSON.stringify(sectionAt(Math.floor(z))));if(seen.size!==40||sources.size!==STORY_VISIBLE_COUNT)throw Error('coverage');console.log('PASS: 20km v'+velocity+' all40/allStory minFuel '+minFuel);}
}`,b);
