const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const no=()=>{},canvas=createCanvas(390,700),els={};const element=()=>({style:{},classList:{add:no,remove:no,toggle:no},setAttribute:no,appendChild:no,addEventListener:no});
const b={document:{getElementById:id=>id==='game'?canvas:els[id]||(els[id]=element()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?createCanvas(280,280):element(),addEventListener:no},innerWidth:390,innerHeight:700,devicePixelRatio:1,addEventListener:no,localStorage:{getItem:()=>null,setItem:no},requestAnimationFrame:no,setTimeout:no,clearTimeout:no,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);
const sheet=createCanvas(780,700),g=sheet.getContext('2d');
for(let i=0;i<2;i++){vm.runInContext("data.unlocked=17;mode='story';level=9;beginRun();z=STORY_COURSES[level].sections.find(s=>s.type==='tunnel').start+"+(i?18:4)+";draw();",b);g.drawImage(canvas,i*390,0)}
fs.writeFileSync('/tmp/starway-tunnel-qa.png',sheet.toBuffer('image/png'));
