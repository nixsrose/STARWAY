const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity','creator','presentation'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

const sheet=createCanvas(1820,1080),g=sheet.getContext('2d');
for(let levelIndex=0;levelIndex<21;levelIndex++){
 b.which=levelIndex;
 vm.runInContext("data.unlocked=20;mode='story';level=which;beginRun(true);var course=STORY_COURSES[which];z=course.sections.find(s=>['tunnel','box_channel','split','redheat_tunnel'].includes(s.type))?.start+3||12;z=Math.min(rows.length-3,Math.max(3,z));x=(course.guide?.[Math.floor(z)]??3)-3;y=boxHeight(rows[Math.floor(z)]?.[Math.floor(x+roadOffset())]||0);draw()",b);
 g.drawImage(main,0,0,390,544,levelIndex%7*260,Math.floor(levelIndex/7)*360,260,360);
 g.fillStyle='#081321';g.fillRect(levelIndex%7*260,Math.floor(levelIndex/7)*360,58,24);g.fillStyle='#dff6ff';g.font='bold 14px sans-serif';g.fillText(Math.floor(levelIndex/3)+1+'-'+(levelIndex%3+1),levelIndex%7*260+10,Math.floor(levelIndex/7)*360+17);
}
vm.runInContext("mode='endless';beginRun(true);z=20;draw();openMapEditor();testEditorMap();draw()",b);
fs.writeFileSync('/tmp/starway-all-flight.png',sheet.toBuffer('image/png'));console.log('PASS: real Canvas rendering of 21 story courses plus endless and editor trial with shared materials');
