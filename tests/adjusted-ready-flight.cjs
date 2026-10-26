const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot();const results=[];
for(const stage of [18,25])for(const pace of [12])for(const lead of [.12]){
 b.stage=stage;b.pace=pace;b.lead=lead;run(`mode='story';level=stage;data.unlocked=29;data.skin=0;data.shipUpgrades=normalizeShipUpgrades({});beginRun();setThrottleLever(pace);globalThis.jumps=[];globalThis.originalMap=JSON.stringify(STORY_COURSES[level]);
 for(let tick=0;tick<120*90&&state==='play';tick++){
 const m=STORY_COURSES[level],r=Math.floor(z),target=(m.guide[Math.min(rows.length-1,r+1)]??3)-3;
 steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*10));
 if(grounded){const ahead=Math.min(rows.length-1,Math.floor(z+pace*lead+1));let danger=false;for(let q=r+1;q<=ahead;q++){const xx=Math.max(-3,Math.min(3,x+Math.max(-4.8/pace,Math.min(4.8/pace,(target-x)))*(q-z))),tile=rows[q]?.[Math.floor(xx+roadOffset())]||0;if(!tile||boxHeight(tile)>y+.15||m.roadPaint?.[q]?.[Math.floor(xx+roadOffset())]==='pink')danger=true;}if(danger){jump();jumps.push(+z.toFixed(2))}}
 step(1/120);
 }`);
 assert.equal(run('JSON.stringify(STORY_COURSES[level])'),run('originalMap'),'map data unchanged');assert.equal(run('shipJumpPower()'),6.55,'unupgraded scout jump');assert.equal(run('shipSpeedCap()'),15.4,'unupgraded scout speed');
 results.push({stage:stage+1,pace,lead,state:run('state'),row:+run('z').toFixed(2),time:+run('time').toFixed(2),fuel:+run('fuel').toFixed(1),reason:run('state')==='win'?null:run('deathReason'),jumps:JSON.parse(run('JSON.stringify(jumps)'))});
}

for(const r of results)assert.equal(r.state,'win','ready launch stage '+r.stage+' '+r.reason+' @'+r.row);console.log('PASS actual rest-to-launch, unupgraded Scout: 7-1 and 9-2 physically cleared');
