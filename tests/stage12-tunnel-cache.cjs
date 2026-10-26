const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(749,454),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:749,innerHeight:454,devicePixelRatio:2,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);const html=fs.readFileSync('dist/index.html','utf8'),bundle=html.match(/<script src="([^"]+)"/)[1];const before=process.hrtime.bigint();vm.runInContext(fs.readFileSync('dist/'+bundle,'utf8'),b);const bootMs=Number(process.hrtime.bigint()-before)/1e6;


const run=s=>vm.runInContext(s,b),reference=fs.readFileSync('tests/fixtures/tunnel-render-reference.js','utf8');
run('globalThis.optimizedTunnels=[tunnelMaterialMix,tunnelFacetOrder,drawTunnelFrames]');
let frames=0;
for(const viewport of [[749,454],[390,780],[820,900]])for(const stage of [1,4])for(const row of (stage===1?[319.9,320,329.5,339.5,349.5]:[50,100]))for(const altitude of [0,1.5]){
 b.innerWidth=viewport[0];b.innerHeight=viewport[1];b.testStage=stage;b.testRow=row;b.testHeight=altitude;
 run('mode="story";level=testStage;data.unlocked=29;settings.graphics="high";beginRun(true);state="pause";resize();globalThis.mapSnapshot=JSON.stringify(activeRoadData());z=testRow;x=.4;y=testHeight;tunnelGrounded=false;draw()');
 const optimized=main.getContext('2d').getImageData(0,0,main.width,main.height).data;
 vm.runInContext(reference,b);run('draw()');
 const original=main.getContext('2d').getImageData(0,0,main.width,main.height).data;
 assert.deepEqual(Buffer.from(optimized),Buffer.from(original),'exact full-frame parity '+stage+'/'+row+'/'+altitude);
 assert.equal(run('JSON.stringify(activeRoadData())'),run('mapSnapshot'));run('[tunnelMaterialMix,tunnelFacetOrder,drawTunnelFrames]=optimizedTunnels');frames++;
}
run('for(let i=0;i<200;i++)tunnelMaterialMix("#"+i.toString(16).padStart(6,"0"),"#102b3b",.67)');assert.ok(run('tunnelMixCache.size')<=128);
console.log('PASS '+frames+' exact pixel comparisons, tunnel interior/roof/entrance and bounded color cache');
