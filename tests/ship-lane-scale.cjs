const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{handlers:{},style:{},contains:()=>true,setPointerCapture:noop,releasePointerCapture:noop,classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,removeAttribute:noop,appendChild:noop,addEventListener(name,fn){this.handlers[name]=fn},getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);






const assert=require('node:assert/strict'),run=s=>vm.runInContext(s,b);
run('mode="story";level=1;beginRun(true);z=50;x=0;y=0;grounded=true;state="play";ghostEnabled=false;shipLanding=null;releaseLanding=0;flightShadowStyle=()=>null;globalThis.starwayTunnelClipReady=false;dpr=1;ctx.setTransform(1,0,0,1,0,0)');
for(const width of [320,390,760]){b.width=width;run('W=width;H=676');main.width=width;main.height=676;
 for(let id=0;id<12;id++){b.id=id;run('data.skin=id');const lane=run('proj(.5,z)[0]-proj(-.5,z)[0]'),size=run('flightShipSize(id,proj(0,z)[2])');
  // Test actual mesh vertices throughout each ship's full jump, with steering shear and pitch.
  for(let phase=0;phase<=32;phase++){b.phase=phase/32;const max=run('globalThis.rotation=trickTransform(id,phase);Math.max(...solidShipMesh(id).faces.flatMap(face=>face.points.map(v=>{const a=rotateShipVertex(v,rotation);return Math.abs(a[0])+.68*.5*Math.abs(a[1])})))');assert.ok(max*size/50<=lane*.421,`hull overflow ${id}`)}
  run('ctx.clearRect(0,0,W,H);drawShipAndEffects()');const data=main.getContext('2d').getImageData(0,0,main.width,main.height).data,center=run('proj(0,z)[0]');let count=0;
  for(let i=3;i<data.length;i+=4)if(data[i]>32){const px=((i-3)/4)%main.width;assert.ok(Math.abs(px-center)<=lane*.5,`rendered wing outside lane ${id}`);count++}assert.ok(count>20);
 }
}
run('W=760;H=676;z=50');const near=run('flightShipSize(0,proj(0,z)[2])'),far=run('flightShipSize(0,proj(0,z+20)[2])');assert.ok(far<near/4);
console.log('PASS all12 solid hulls fit one lane across full jump rotations/pitch/shear; actual wing pixels fit at320/390/760 widths; distant ghost scales with road');
