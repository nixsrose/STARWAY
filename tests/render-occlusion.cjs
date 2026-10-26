const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const no=()=>{},canvas=createCanvas(390,700),els={};const element=()=>({style:{},classList:{add:no,remove:no,toggle:no},setAttribute:no,appendChild:no,addEventListener:no});
const b={document:{getElementById:id=>id==='game'?canvas:els[id]||(els[id]=element()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?createCanvas(280,280):element(),addEventListener:no},innerWidth:390,innerHeight:700,devicePixelRatio:1,addEventListener:no,localStorage:{getItem:()=>null,setItem:no},requestAnimationFrame:no,setTimeout:no,clearTimeout:no,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);
const sheet=createCanvas(780,2100),g=sheet.getContext('2d');
const scenarios=["level=0;beginRun();z=114.5;x=-1;y=0;","level=0;beginRun();z=10.2;x=0;y=0;rows[9]=[1,1,1,8,1,1,1];","level=0;beginRun();z=10.2;x=0;y=.85;rows[9]=[1,1,1,2,1,1,1];"];
for(let i=0;i<3;i++){
vm.runInContext("data.unlocked=17;mode='story';"+scenarios[i]+"var foregroundSaved=drawForegroundStructures;drawForegroundStructures=()=>{};draw();",b);
const before=canvas.getContext('2d').getImageData(0,0,390,700).data;g.drawImage(canvas,0,i*700);
vm.runInContext("drawForegroundStructures=foregroundSaved;draw();",b);const after=canvas.getContext('2d').getImageData(0,0,390,700).data;g.drawImage(canvas,390,i*700);
const point=vm.runInContext("proj(x,z,.15+y)",b);let changed=0;
for(let yy=Math.max(0,Math.floor(point[1]-45));yy<Math.min(700,point[1]+40);yy++)for(let xx=Math.max(0,Math.floor(point[0]-45));xx<Math.min(390,point[0]+45);xx++){const k=(yy*390+xx)*4;if(before[k]!==after[k]||before[k+1]!==after[k+1]||before[k+2]!==after[k+2])changed++}
if(i<2)assert.ok(changed>100,'structure must cover part of ship');else assert.equal(changed,0,'standing ship remains visible');
console.log(['tunnel','front box','standing on box'][i]+': '+changed+' changed pixels near ship');
}
fs.writeFileSync('/tmp/occlusion-qa.png',sheet.toBuffer('image/png'));
