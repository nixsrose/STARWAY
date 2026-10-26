const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);

const sheet=createCanvas(1560,1080),g=sheet.getContext('2d');
for(let i=0;i<8;i++){
 b.position=[111.1,111.8,112.3,113.5,114.4,115.7,305.2,306.6][i];
 vm.runInContext("data.unlocked=20;mode='story';level=4;beginRun(true);z=position;x=0;y=0;draw()",b);
 g.drawImage(main,0,0,390,544,i%4*390,Math.floor(i/4)*540,390,540);
}
fs.writeFileSync('/tmp/block-bundle.png',sheet.toBuffer('image/png'));
