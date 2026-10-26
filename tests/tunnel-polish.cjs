const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);

const assert=require('node:assert/strict');let frames=0;
for(const level of [0,4]){b.L=level;vm.runInContext("data.unlocked=20;mode='story';level=L;beginRun(true);globalThis.starwayPixelRatioCap=2;globalThis.firstTunnel=STORY_COURSES[level].tiles.findIndex((_,r)=>ceilingAt(r)>0);globalThis.geometryBefore=JSON.stringify(STORY_COURSES[level]);",b);
 for(const [w,h] of [[390,844],[760,900],[844,390]]){b.innerWidth=w;b.innerHeight=h;vm.runInContext('resize()',b);
 for(const offset of [-4,-.1,.5,2,5])for(const height of [0,1,2.5]){b.O=offset;b.Y=height;
 vm.runInContext("z=firstTunnel+O;x=tunnelCenters(firstTunnel)[0];y=Y;tunnelGrounded=y>1;state='play';globalThis.faces=0;globalThis.originalPoly=poly;poly=function(points,...args){for(const point of points)for(const v of point)if(!Number.isFinite(v))throw Error('Invalid tunnel projection');faces++;return originalPoly(points,...args)};try{draw()}finally{poly=originalPoly};if(!faces)throw Error('No geometry');",b);assert.equal(vm.runInContext('JSON.stringify(STORY_COURSES[level])',b),vm.runInContext('geometryBefore',b));frames++;
 }
 }
}
console.log('PASS: '+frames+' real Canvas pilot tunnel frames across entrance/interior/roof/jump and cover/unfolded/landscape; finite geometry and unchanged map data');
// A full entrance must retain all16 cap segments, including rear-facing sides.
vm.runInContext("mode='story';level=0;z=5;x=-2;y=0;tunnelGrounded=false;globalThis.savedMeshes=collectTunnelMeshes;collectTunnelMeshes=()=>[{start:8,end:15,height:1.15,radius:.65,centers:[-2,2],color:'rose',entrance:true}];globalThis.savedPoly=poly;globalThis.capSegments=0;poly=function(points,...args){if(points.length===4&&Math.abs(Math.abs(points[3][1]-points[0][1])-.12*points[0][2])<1e-7&&Math.abs(points[0][2]-points[1][2])<1e-9&&Math.abs(points[0][2]-points[2][2])<1e-9&&Math.abs(points[0][2]-points[3][2])<1e-9)capSegments++;return savedPoly(points,...args)};try{drawTunnelFrames()}finally{poly=savedPoly;collectTunnelMeshes=savedMeshes}",b);
assert.equal(vm.runInContext('capSegments',b),vm.runInContext('tunnelRenderSegments()*2',b),'both complete entrance arches');
console.log('PASS: complete twin entrance caps retain all segments');
// Roof-riding must not remove the opaque shell behind the player.
let roofPixels=0;
for(const [width,height] of [[390,844],[760,900],[844,390]]){
 b.innerWidth=width;b.innerHeight=height;
 vm.runInContext("resize();mode='story';level=11;data.unlocked=20;beginRun(true);globalThis.roofRow=STORY_COURSES[11].tiles.findIndex((_,r)=>ceilingAt(r)>0);z=roofRow+5;x=tunnelCenters(roofRow)[0];y=tunnelRoofAt(z,x);tunnelGrounded=true;ctx.clearRect(0,0,W,H);drawTunnelFrames();",b);
 for(const behind of [.5,1,2]){b.behind=behind;const point=vm.runInContext('proj(x,z-behind,tunnelRoofAt(z-behind,x))',b);if(point[0]<2||point[0]>=main.width-2||point[1]<2||point[1]>=main.height-2)continue;const pixel=main.getContext('2d').getImageData(Math.round(point[0]),Math.round(point[1]),1,1).data;assert.ok(pixel[3]>240,'roof missing behind ship '+width+' '+behind);roofPixels++;}
}
assert.ok(roofPixels>=6);console.log('PASS: opaque roof behind the roof-riding ship at '+roofPixels+' positions across cover/unfolded/landscape');
// Adjacent passages must never intersect; the effective radius also drives physics.
vm.runInContext("mode='story';globalThis.checkedPassages=0;for(level=0;level<STORY_COURSES.length;level++){for(let r=0;r<STORY_COURSES[level].tiles.length;r++){if(!ceilingAt(r))continue;const centers=[...new Set(tunnelCenters(r))].sort((a,b)=>a-b),radius=tunnelRadius(r);for(let i=1;i<centers.length;i++){if(2*radius>=centers[i]-centers[i-1])throw Error('Intersecting tunnels at '+level+':'+r);checkedPassages++}if(radius!==.49)throw Error('Inconsistent tunnel width');if(r>0&&ceilingAt(r-1)&&tunnelRadius(r-1)!==radius)throw Error('Connected tunnel width changed')}}",b);
assert.ok(vm.runInContext('checkedPassages',b)>0);
console.log('PASS: non-intersecting adjacent tunnel widths across all21 courses; single/parallel/connected passages share the same width');
