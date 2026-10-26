const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
const events={},docEvents={};b.addEventListener=(k,fn)=>(events[k]??=[]).push(fn);b.document.addEventListener=(k,fn)=>(docEvents[k]??=[]).push(fn);vm.createContext(b);const code=fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8');vm.runInContext(code,b);const run=s=>vm.runInContext(s,b);
run(`{
 const map=emptyEditorMap(80);for(let r=23;r<44;r++){map.tiles[r]=[0,1,1,8,1,1,0];map.boxPaint[r][3]='amber';}STORY_COURSES[20]=map;data.unlocked=29;mode='story';level=20;beginRun(true);x=3;y=0;
 globalThis.wallColor=boxFaceColors('amber').right;globalThis.wallCalls=0;globalThis.basePoly=poly;poly=function(points,color,...rest){if(color===wallColor)wallCalls++;return basePoly(points,color,...rest)};
 z=22;drawRoadSurfaces();drawBoxSurfaces();if(wallCalls!==1)throw Error('side wall not continuous '+wallCalls);
}`);
for(const position of [22,23.2,24.4,25.6,27.8]){
 b.position=position;run('z=position;ctx.clearRect(0,0,W,H);drawRoadSurfaces();drawBoxSurfaces();globalThis.sample=proj(.5,Math.max(29,position+5),1)');
 const p=run('sample'),pixel=main.getContext('2d').getImageData(Math.round(p[0]),Math.round(p[1]),1,1).data;
 const color=run('wallColor');assert.deepEqual([...pixel].slice(0,3),[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),'road visible through tall wall at '+position);
}
run("poly=basePoly;STORY_COURSES[20].boxPaint[30][3]='mint';if(connectedBoxSideStart(43,3,1,0,79)!==31)throw Error('material boundary merged');");
console.log('PASS continuous opaque tall-block side across moving row seams, correct road occlusion and material boundary preservation');
// The camera can be above and laterally inside the long block while the pilot
// flies next to it. The occluding top then lies almost four rows behind z.
run(`{
 const map=emptyEditorMap(120);for(let r=23;r<100;r++){map.tiles[r]=[0,1,1,8,1,1,0];map.boxPaint[r][3]='indigo';}STORY_COURSES[20]=map;mode='story';level=20;beginRun(true);z=48;x=1;y=0;
 ctx.clearRect(0,0,W,H);drawRoadSurfaces();drawSolidStructures();globalThis.nearSample=proj(1,46.5,0);globalThis.topColor=boxFaceColors('indigo').top;
}`);
const near=run('nearSample'),nearPixel=main.getContext('2d').getImageData(Math.round(near[0]),Math.round(near[1]),1,1).data;
assert.deepEqual([...nearPixel].slice(0,3),[1,3,5].map(i=>parseInt(run('topColor').slice(i,i+2),16)),'near-camera block top missing: road shows through');
console.log('PASS camera-aligned long block hides the adjacent road through the near plane');
for(const [width,height] of [[344,780],[390,844],[768,900]]){
 b.innerWidth=width;b.innerHeight=height;run('resize()');
 for(const offset of [0,.2,.49,.51,.8,.94,.96])for(const side of [-1,1]){
  b.testPosition=48+offset;b.testSide=side;
  run('z=testPosition;x=testSide;ctx.clearRect(0,0,W,H);drawRoadSurfaces();drawSolidStructures();globalThis.nearSample=proj(testSide,z-4+(2.6+cameraDrop)*Math.min(W*.6,H*.8)/(H*.8-(W/H>1.5?H*.30:H*.43)),0)');
  const p=run('nearSample'),pixel=main.getContext('2d').getImageData(Math.round(p[0]),Math.round(p[1]),1,1).data;
  assert.deepEqual([...pixel].slice(0,3),[1,3,5].map(i=>parseInt(run('topColor').slice(i,i+2),16)),'near-plane leak '+[width,height,offset,side]);
 }
}
console.log('PASS both sides and 42 near-camera positions across cover, phone and unfolded viewport sizes');
