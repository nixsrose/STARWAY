const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot(),results=[];
const selected=process.env.STARWAY_AUDIT_STAGES?JSON.parse(process.env.STARWAY_AUDIT_STAGES):Array.from({length:27},(_,i)=>i+3);
for(const stage of selected){b.stage=stage;const hasJumps=run('Array.isArray(STORY_COURSES[stage].jumpRows)');if(!hasJumps)continue;
for(const pace of [8,10,12,14,15.4])for(const offset of [-2,-1,0,1,2])for(const guideLead of [0,2]){
 b.pace=pace;b.offset=offset;b.guideLead=guideLead;run(`mode='story';level=stage;data.unlocked=29;data.skin=0;data.shipUpgrades=normalizeShipUpgrades({});beginRun(true);speed=pace;throttle=pace;globalThis.used=new Set();globalThis.jumps=[];globalThis.originalMap=JSON.stringify(STORY_COURSES[level]);
 for(let tick=0;tick<120*90&&state==='play';tick++){
 const m=STORY_COURSES[level],target=(m.guide[Math.min(rows.length-1,Math.floor(z)+guideLead)]??3)-3;steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*10));
 for(const j of m.jumpRows||[])if(!used.has(j)&&z>=j+offset&&z<j+offset+1&&grounded){jump();used.add(j);jumps.push(+z.toFixed(2));}
 step(1/120);
 }`);
 assert.equal(run('JSON.stringify(STORY_COURSES[level])'),run('originalMap'));assert.equal(run('shipJumpPower()'),6.55);assert.equal(run('shipSpeedCap()'),15.4);
 results.push({stage:stage+1,controller:'authored',pace,offset,guideLead,state:run('state'),row:+run('z').toFixed(2),time:+run('time').toFixed(2),fuel:+run('fuel').toFixed(1),reason:run('state')==='win'?null:run('deathReason'),jumps:JSON.parse(run('JSON.stringify(jumps)'))});
}
console.log('AUTHORED stage '+(Math.floor(stage/3)+1)+'-'+(stage%3+1)+': '+results.filter(r=>r.stage===stage+1&&r.state==='win').length+' clears');if(process.env.STARWAY_AUTHORED_REPORT)fs.writeFileSync(process.env.STARWAY_AUTHORED_REPORT,JSON.stringify(results,null,2));}
