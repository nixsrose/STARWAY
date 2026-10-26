const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(749,454),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:749,innerHeight:454,devicePixelRatio:2,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);const html=fs.readFileSync('dist/index.html','utf8'),bundle=html.match(/<script src="([^"]+)"/)[1];const before=process.hrtime.bigint();vm.runInContext(fs.readFileSync('dist/'+bundle,'utf8'),b);const bootMs=Number(process.hrtime.bigint()-before)/1e6;

if(process.env.STARWAY_TUNNEL_REFERENCE)vm.runInContext(fs.readFileSync('tests/fixtures/tunnel-render-reference.js','utf8'),b);
b.profileNow=()=>Number(process.hrtime.bigint())/1e6;
vm.runInContext(`data.unlocked=29;mode='story';level=1;beginRun(true);z=330;settings.graphics='high';resize();state='play';globalThis.profileTotals={};
for(const name of ['drawRoadSurfaces','drawBoxSurfaces','drawTunnelFrames','drawOverheadBridges','drawFinishHologram','drawStageScenery','drawRedHeatSun','drawShipAndEffects']){const fn=eval(name);eval(name+'=function(...args){const start=profileNow();try{return fn(...args)}finally{profileTotals["'+name+'"]=(profileTotals["'+name+'"]||0)+profileNow()-start}}');}
for(let i=0;i<10;i++)draw();profileTotals={};for(let i=0;i<60;i++){z=320+(i%30);draw()}`,b);
const totals=JSON.parse(vm.runInContext('JSON.stringify(profileTotals)',b));console.log(JSON.stringify({reference:!!process.env.STARWAY_TUNNEL_REFERENCE,stage:'1-2',rows:'321–350',viewport:'749x454 DPR2',frames:60,msPerFrame:Object.fromEntries(Object.entries(totals).map(([k,v])=>[k,+(v/60).toFixed(3)])),notice:'Native Canvas CPU benchmark, not mobile browser frame time; nested routines may overlap.'}));

