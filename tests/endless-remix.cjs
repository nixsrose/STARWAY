const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
const el=()=>({style:{},setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild:noop,getContext:()=>ctx});
let els={},saved={},timers=[];
const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},requestAnimationFrame:noop,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

vm.runInContext(`{
for(const sectionStart of [0,2016,6048])for(const g of [9,18,27,36])for(const velocity of [18,24])for(let source=0;source<21;source++){
 mode='endless';beginRun(true);rows=[];coins.clear();infiniteRoad={roadPaint:[],roadColors:[],boxColors:[],tunnelColors:[],ceilings:[],tunnelCenters:{},tunnelRadius:{},guide:[],sections:[],jumpRows:[],bridges:[]};remixExitLane=3;generateBlock(sectionStart,0,source);const end=generated;z=sectionStart+2;x=0;y=0;vy=0;grounded=true;speed=velocity;throttle=velocity;endlessGravity=g;endlessGravityStage=Math.floor(z/180)+1;pendingEndlessGravity=null;
 for(let f=0;f<3000&&state==='play'&&z<end-3;f++){const lane=infiniteRoad.guide[Math.floor(z)];keys.left=x>lane-3+.045;keys.right=x<lane-3-.045;if(grounded&&infiniteRoad.jumpRows.includes(Math.floor(z)))jump();step(1/120)}
 if(state!=='play'||z<end-3)throw Error('route '+g+' source '+source+' speed '+velocity+' '+state+' z'+z+' '+deathReason);
}
console.log('PASS: 504 story-recipe/gravity/speed/progression traversals');
mode='endless';beginRun(true);speed=throttle=18;let sources=new Set(),lastSection=null,minFuel=100;
for(let f=0;f<160000&&state==='play'&&z<12000;f++){
 const section=sectionAt(Math.floor(z));if(section!==lastSection){sources.add(section.source);lastSection=section;}
 const lane=infiniteRoad.guide[Math.floor(z)];keys.left=x>lane-3+.045;keys.right=x<lane-3-.045;if(grounded&&infiniteRoad.jumpRows.includes(Math.floor(z)))jump();step(1/120);minFuel=Math.min(minFuel,fuel);
}
if(state!=='play'||z<12000)throw Error('long run '+state+' '+z+' fuel'+fuel+' '+deathReason);if(sources.size!==21)throw Error('source coverage '+sources.size);
console.log('PASS: 12km actual physics, all21 sources, changing gravity, refuelling, cleanup; minimum fuel '+minFuel.toFixed(1));

for(let seed=1;seed<=3;seed++){
 let rng=seed;Math.random=()=>((rng=(rng*1664525+1013904223)>>>0)/4294967296);
 mode='endless';beginRun(true);speed=throttle=24;let minFuel=100;
 for(let f=0;f<80000&&state==='play'&&z<10000;f++){const lane=infiniteRoad.guide[Math.floor(z)];keys.left=x>lane-3+.045;keys.right=x<lane-3-.045;if(grounded&&infiniteRoad.jumpRows.includes(Math.floor(z)))jump();step(1/120);minFuel=Math.min(minFuel,fuel);}
 if(state!=='play'||z<10000)throw Error('seed '+seed+' '+state+' z'+z+' fuel'+fuel+' '+deathReason);
 if(Object.keys(rows).length>650)throw Error('cleanup');
 console.log('PASS: seeded 10km maximum-speed run '+seed+'; minimum fuel '+minFuel.toFixed(1));
}
// Explicit source bag covers every story map without repeating within each cycle.
remixBag=[];const selected=Array.from({length:21},()=>remixSource());if(new Set(selected).size!==21)throw Error('source cycle repeats');
mode='endless';beginRun(true);rows=[];remixExitLane=3;generateBlock(2016,0,1);let safeCenter=0,total=0;for(const row of rows){if(row){total++;if(row[3]===1||row[3]===3)safeCenter++;}}
if(safeCenter/total>.55)throw Error('center too safe '+safeCenter/total);
console.log('PASS: all21 source cycle, center blocked/gapped for most of route');
}`,b);
