const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot(),results=[];
for(const stage of [4,5,10,11,14,18,20,25]){b.stage=stage;
for(const pace of [8,10,12,14,15.4])for(const horizon of [5,9,14])for(const lead of [0,.08,.16,.24]){
 b.pace=pace;b.horizon=horizon;b.lead=lead;run(`mode='story';level=stage;data.unlocked=29;data.skin=0;data.shipUpgrades=normalizeShipUpgrades({});beginRun(true);speed=pace;throttle=pace;globalThis.jumps=[];globalThis.originalMap=JSON.stringify(STORY_COURSES[level]);
 for(let tick=0;tick<120*90&&state==='play';tick++){
 const m=STORY_COURSES[level],r=Math.floor(z),guide=(m.guide[Math.min(rows.length-1,r+1)]??3)-3;
 let target=guide;
 if(ceilingAt(r)&&y<ceilingAt(r)*.7&&!tunnelGrounded){target=tunnelCenters(r).reduce((a,b)=>Math.abs(a-x)<Math.abs(b-x)?a:b);}
 else {let best=Infinity;for(const candidate of [-3,-2,-1,0,1,2,3,guide]){let cost=Math.abs(candidate-x)*.4+Math.abs(candidate-guide)*.08;
 for(let n=1;n<=horizon;n++){const q=Math.min(rows.length-1,r+n),xx=x+Math.sign(candidate-x)*Math.min(Math.abs(candidate-x),4.8/pace*Math.max(0,q-z)),lane=Math.floor(xx+roadOffset()),tile=rows[q]?.[lane]||0;
 cost+=(!tile?20:boxHeight(tile)>y+.1?25:m.roadPaint?.[q]?.[lane]==='pink'?40:0)*(1-n/(horizon+1));
 if(ceilingAt(q)&&y<ceilingAt(q)*.7){const d=Math.min(...tunnelCenters(q).map(c=>Math.abs(c-xx)));if(d>.18)cost+=40*(1-n/(horizon+1));}}
 if(cost<best){best=cost;target=candidate;}}
 }
 steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*10));
 if(grounded&&!ceilingAt(r)){const ahead=Math.min(rows.length-1,Math.floor(z+pace*lead+1));let danger=false;for(let q=r+1;q<=ahead;q++){const xx=x+Math.sign(target-x)*Math.min(Math.abs(target-x),4.8/pace*Math.max(0,q-z)),lane=Math.floor(xx+roadOffset()),tile=rows[q]?.[lane]||0;if(!tile||boxHeight(tile)>y+.15||m.roadPaint?.[q]?.[lane]==='pink')danger=true;}if(danger){jump();jumps.push(+z.toFixed(2))}}
 step(1/120);
 }`);
 assert.equal(run('JSON.stringify(STORY_COURSES[level])'),run('originalMap'));assert.equal(run('shipJumpPower()'),6.55);assert.equal(run('shipSpeedCap()'),15.4);results.push({stage:stage+1,controller:'terrain',pace,horizon,lead,state:run('state'),row:+run('z').toFixed(2),time:+run('time').toFixed(2),fuel:+run('fuel').toFixed(1),reason:run('state')==='win'?null:run('deathReason'),jumps:JSON.parse(run('JSON.stringify(jumps)'))});}
 console.log('TERRAIN '+(Math.floor(stage/3)+1)+'-'+(stage%3+1)+': '+results.filter(r=>r.stage===stage+1&&r.state==='win').length+' clears');if(process.env.STARWAY_TERRAIN_REPORT)fs.writeFileSync(process.env.STARWAY_TERRAIN_REPORT,JSON.stringify(results,null,2));}
