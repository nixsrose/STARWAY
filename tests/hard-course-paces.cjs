const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot();const results=[];
for(let stage=21;stage<30;stage++)for(const pace of [12,14,16,18,20]){
 b.stage=stage;b.pace=pace;run('mode="story";data.unlocked=29;level=stage;beginRun(true);throttle=pace;speed=pace;globalThis.usedJumps=new Set();');
 run(`for(let tick=0;tick<120*75&&state==='play';tick++){const map=STORY_COURSES[level],r=Math.floor(z),target=(map.guide[Math.min(rows.length-1,r)]??3)-3;steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*12));for(const j of map.jumpRows)if(!usedJumps.has(j)&&z>=j&&z<j+1&&grounded){jump();usedJumps.add(j)}step(1/120)}`);
 results.push({stage,pace,state:run('state'),time:run('time'),z:run('z'),reason:run('deathReason')});
}fs.writeFileSync('/tmp/starway-paces.json',JSON.stringify(results));for(let s=21;s<30;s++)console.log(s,results.filter(r=>r.stage===s).map(r=>r.pace+':'+r.state+(r.state==='win'?' '+r.time.toFixed(2):' @'+r.z.toFixed(1))).join(' '));
