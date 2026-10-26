const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const no=()=>{},canvas=createCanvas(320,550),els={};const element=()=>({style:{},classList:{add:no,remove:no,toggle:no},setAttribute:no,appendChild:no,addEventListener:no});
const b={document:{getElementById:id=>id==='game'?canvas:els[id]||(els[id]=element()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?createCanvas(280,280):element(),addEventListener:no},innerWidth:320,innerHeight:550,devicePixelRatio:1,addEventListener:no,localStorage:{getItem:()=>null,setItem:no},requestAnimationFrame:no,setTimeout:no,clearTimeout:no,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);
const sheet=createCanvas(960,2280),g=sheet.getContext('2d');

for(let i=0;i<12;i++){let position=[12,43,83,106,130,174,191,237,269,298,320,413][i];vm.runInContext("data.unlocked=17;mode='story';level=4;beginRun();z="+position+";x=STORY_COURSES[level].guide[Math.floor(z)]-roadCenterLane();y="+(i===2||i===3||i===4||i===5||i===6||i===9?.85:0)+";draw();",b);let xx=i%3*320,yy=Math.floor(i/3)*570;g.drawImage(canvas,xx,yy);g.fillStyle='#071224';g.fillRect(xx,yy+550,320,20);g.fillStyle='#e1efff';g.font='12px sans-serif';g.fillText('ROAD 2-2 / '+position+'m',xx+10,yy+565)}
fs.writeFileSync('/tmp/road22-reference-grid.png',sheet.toBuffer('image/png'));
