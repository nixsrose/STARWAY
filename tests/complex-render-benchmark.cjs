const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);const html=fs.readFileSync('dist/index.html','utf8'),bundle=html.match(/<script src="([^"]+)"/)[1];const before=process.hrtime.bigint();vm.runInContext(fs.readFileSync('dist/'+bundle,'utf8'),b);const bootMs=Number(process.hrtime.bigint()-before)/1e6;

const run=s=>vm.runInContext(s,b),result=[];
for(const fixture of ['tunnels','blocks','hazards']){b.fixture=fixture;run(`showMenu('main');mode='story';level=0;editorTesting=true;STORY_COURSES[0]=emptyEditorMap(400);var m=STORY_COURSES[0];for(let r=0;r<400;r++){m.tiles[r]=Array.from({length:7},(_,l)=>fixture==='blocks'?(r%2===l%2?8:1):1);m.roadPaint[r]=Array.from({length:7},(_,l)=>fixture==='hazards'?'pink':l%2?'gray':'slate');if(fixture==='tunnels'){m.ceilings[r]=1.15;m.tunnelCenters[r]=[-3,-2,-1,0,1,2,3];m.tunnelColors[r]=r%2?'aqua':'rose';}}beginRun();state='play';z=40;speed=18;throttle=18;for(let i=0;i<1;i++)draw();`);
 const start=process.hrtime.bigint();run('for(let i=0;i<4;i++){z=40+i*.16;draw()}');const ms=Number(process.hrtime.bigint()-start)/1e6/4;result.push({fixture,ms:+ms.toFixed(3)});
}
console.log(JSON.stringify(result));
