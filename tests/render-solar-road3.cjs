const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const no=()=>{},canvas=createCanvas(320,550),els={};const element=()=>({style:{},classList:{add:no,remove:no,toggle:no},setAttribute:no,appendChild:no,addEventListener:no});
const b={document:{getElementById:id=>id==='game'?canvas:els[id]||(els[id]=element()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?createCanvas(280,280):element(),addEventListener:no},innerWidth:320,innerHeight:550,devicePixelRatio:1,addEventListener:no,localStorage:{getItem:()=>null,setItem:no},requestAnimationFrame:no,setTimeout:no,clearTimeout:no,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);
const sheet=createCanvas(1280,840),g=sheet.getContext('2d');
const samples=[8,46,78,112,144,172,195,242,274,322,390,446];
for(let i=0;i<samples.length;i++){const pos=samples[i];vm.runInContext("data.unlocked=11;mode='story';level=11;beginRun(true);z="+pos+";x=STORY_COURSES[11].guide[Math.floor(z)]-3;y=boxHeight(rows[Math.floor(z)][Math.floor(x+roadOffset())]);draw()",b);const xx=i%4*320,yy=Math.floor(i/4)*280;g.drawImage(canvas,0,0,320,250,xx,yy,320,250);g.fillStyle='#132638';g.fillRect(xx,yy+250,320,30);g.fillStyle='#eef6ff';g.font='14px sans-serif';g.fillText('4-3 / row '+(pos+1),xx+10,yy+270)}
fs.writeFileSync('/tmp/starway43/render.png',sheet.toBuffer('image/png'));
