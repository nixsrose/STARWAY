const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{handlers:{},style:{},contains:()=>true,setPointerCapture:noop,releasePointerCapture:noop,classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,removeAttribute:noop,appendChild:noop,addEventListener(name,fn){this.handlers[name]=fn},getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);






const assert=require('node:assert/strict'),run=s=>vm.runInContext(s,b);
b.innerWidth=390;b.innerHeight=844;run('resize();mode="story";level=0;STORY_COURSES[0]=emptyEditorMap(100);beginRun(true);state="play";speed=0;throttle=0;jump();step(.06)');
const sheet=createCanvas(780,600),g=sheet.getContext('2d');
for(const [kind,index]of [['launch',0],['landing',1]]){
 if(kind==='landing')run('while(!grounded)step(1/120);step(.04)');
 run('globalThis.savedTakeoff=shipTakeoff;globalThis.savedLanding=shipLanding;shipTakeoff=null;shipLanding=null;draw()');const plain=main.getContext('2d').getImageData(0,0,390,600).data;
 run('shipTakeoff=savedTakeoff;shipLanding=savedLanding;draw()');const shown=main.getContext('2d').getImageData(0,0,390,600).data;let changed=0;for(let i=0;i<shown.length;i+=4)if(Math.abs(shown[i]-plain[i])+Math.abs(shown[i+1]-plain[i+1])+Math.abs(shown[i+2]-plain[i+2])>40)changed++;
 assert.ok(changed>150,kind+' burst too subtle: '+changed);console.log(kind+': '+changed+' visibly changed pixels');g.drawImage(main,index*390,0,390,600);
}
if(process.env.STARWAY_CONTACT_PREVIEW)fs.writeFileSync(process.env.STARWAY_CONTACT_PREVIEW,sheet.toBuffer('image/png'));
