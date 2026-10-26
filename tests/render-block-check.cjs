const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity','creator','presentation'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

const sheet=createCanvas(1560,1080),g=sheet.getContext('2d');
for(let i=0;i<8;i++){
 b.position=[106,115,130,174,298,306,320,413][i];
 vm.runInContext("data.unlocked=20;mode='story';level=4;beginRun(true);z=position;x=-2;y=.85;draw()",b);
 g.drawImage(main,0,0,390,544,i%4*390,Math.floor(i/4)*540,390,540);
}
fs.writeFileSync('/tmp/block-check.png',sheet.toBuffer('image/png'));
