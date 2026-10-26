const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);const html=fs.readFileSync('dist/index.html','utf8'),bundle=html.match(/<script src="([^"]+)"/)[1];const before=process.hrtime.bigint();vm.runInContext(fs.readFileSync('dist/'+bundle,'utf8'),b);const bootMs=Number(process.hrtime.bigint()-before)/1e6;
const strip=createCanvas(390*3,620),g=strip.getContext('2d');
for(const [i,distance]of [0,70,125].entries()){b.distance=distance;vm.runInContext("showMenu('main');startChallenge('reserve');launchFromRest();z=distance+2;speed=18;draw()",b);g.drawImage(main,i*390,0);}
fs.writeFileSync('/tmp/starway-planet-review.png',strip.toBuffer('image/png'));
