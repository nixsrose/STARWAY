const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);

let checked=0;
for(const [width,height] of [[390,844],[760,900],[844,390]]){b.innerWidth=width;b.innerHeight=height;vm.runInContext('resize()',b);
for(const variant of ['solid','recolor','delete','step'])for(const pos of [3.15,3.7,4.2,4.85])for(const px of [-2,0,2]){
 b.variant=variant;b.pos=pos;b.px=px;
 vm.runInContext("data.unlocked=20;mode='story';level=4;beginRun(true);z=pos;x=px;y=0;globalThis.starwayPixelRatioCap=1;rows=Array.from({length:14},(_,r)=>Array.from({length:7},(_,l)=>r>=1&&r<=7&&(r<=4||l===0||l===6)?2:0));if(variant==='delete')rows[4][4]=0;if(variant==='step')rows[4][4]=8;STORY_COURSES[level].tiles=rows;STORY_COURSES[level].boxPaint=rows.map((row,r)=>row.map((_,l)=>variant==='recolor'&&r===4&&l%2?'indigo':'aqua'));ctx.clearRect(0,0,W,H);drawBoxSurfaces();drawBoxSurfaces(true);globalThis.testBoxes=[];for(let r=0;r<rows.length;r++)for(let l=0;l<7;l++){const h=boxHeight(rows[r][l]);if(h)testBoxes.push({r,l,h,a:l-roadOffset(),color:boxFaceColors(boxColorAt(r,l)).top})}",b);
 const boxes=vm.runInContext('testBoxes',b),camera=[px*.28,2.6,pos-4];
 for(const box of boxes)for(const u of [.3,.7])for(const v of [.3,.7]){
  const target=[box.a+u,box.h,box.r+v];let occluded=false;
  for(const other of boxes){if(other===box)continue;const lo=[other.a,0,other.r],hi=[other.a+1,other.h,other.r+1];let enter=0,exit=1;for(let axis=0;axis<3;axis++){const d=target[axis]-camera[axis];if(Math.abs(d)<1e-9){if(camera[axis]<lo[axis]||camera[axis]>hi[axis]){exit=-1;break;}}else{let a=(lo[axis]-camera[axis])/d,c=(hi[axis]-camera[axis])/d;if(a>c)[a,c]=[c,a];enter=Math.max(enter,a);exit=Math.min(exit,c);}}if(enter<exit&&enter<.9999&&exit>0){occluded=true;break;}}
  if(occluded)continue;b.target=target;const p=vm.runInContext('proj(target[0],target[2],target[1])',b);if(p[0]<3||p[0]>=main.width-3||p[1]<3||p[1]>=vm.runInContext('H',b)-3||p[2]<16)continue;
  let edge=false;const w=vm.runInContext('W',b),h=vm.runInContext('H',b),k=Math.min(w*.6,h*.8),horizon=w/h>1.5?h*.30:h*.43;
  for(const dx of [-1.5,1.5])for(const dy of [-1.5,1.5]){const screenX=Math.round(p[0])+.5+dx,screenY=Math.round(p[1])+.5+dy,depth=(2.6-box.h)*k/(screenY-horizon),point=[camera[0]+(screenX-w*.5)*depth/k,box.h,camera[2]+depth];if(point[0]<=box.a||point[0]>=box.a+1||point[2]<=box.r||point[2]>=box.r+1){edge=true;continue;}for(const other of boxes){if(other===box)continue;const lo=[other.a,0,other.r],hi=[other.a+1,other.h,other.r+1];let near=0,far=1;for(let axis=0;axis<3;axis++){const d=point[axis]-camera[axis];if(Math.abs(d)<1e-9){if(camera[axis]<lo[axis]||camera[axis]>hi[axis]){far=-1;break;}}else{let a=(lo[axis]-camera[axis])/d,c=(hi[axis]-camera[axis])/d;if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);}}if(near<far&&near<.9999&&far>0)edge=true;}}
  if(edge)continue;
  const pixel=main.getContext('2d').getImageData(Math.round(p[0]),Math.round(p[1]),1,1).data,expected=box.color.slice(1).match(/../g).map(v=>parseInt(v,16));assert.ok(expected.every((v,i)=>Math.abs(v-pixel[i])<5),JSON.stringify({variant,pos,px,box,pixel:[...pixel],expected}));checked++;
 }
}
}
assert.ok(checked>1000);console.log('PASS: '+checked+' visible top pixels match independent ray/box visibility for solid, recolored, deleted and stepped blocks at fractional camera positions, including foreground redraw');
