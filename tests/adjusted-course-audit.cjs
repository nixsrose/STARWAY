const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot();const results=[];
for(const stage of [18,25])for(const pace of [10,12,14,15.4])for(const lead of [-.08,-.04,0,.04,.08,.12,.16,.20,.24,.28,.32]){
 b.stage=stage;b.pace=pace;b.lead=lead;run(`mode='story';level=stage;data.unlocked=29;data.skin=0;data.shipUpgrades=normalizeShipUpgrades({});beginRun(true);speed=pace;throttle=pace;globalThis.jumps=[];globalThis.originalMap=JSON.stringify(STORY_COURSES[level]);
 for(let tick=0;tick<120*90&&state==='play';tick++){
 const m=STORY_COURSES[level],r=Math.floor(z),target=(m.guide[Math.min(rows.length-1,r+1)]??3)-3;
 steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*10));
 if(grounded){const ahead=Math.min(rows.length-1,Math.floor(z+pace*lead+1));let danger=false;for(let q=r+1;q<=ahead;q++){const xx=Math.max(-3,Math.min(3,x+Math.max(-4.8/pace,Math.min(4.8/pace,(target-x)))*(q-z))),tile=rows[q]?.[Math.floor(xx+roadOffset())]||0;if(!tile||boxHeight(tile)>y+.15||m.roadPaint?.[q]?.[Math.floor(xx+roadOffset())]==='pink')danger=true;}if(danger){jump();jumps.push(+z.toFixed(2))}}
 step(1/120);
 }`);
 assert.equal(run('JSON.stringify(STORY_COURSES[level])'),run('originalMap'),'map data unchanged');assert.equal(run('shipJumpPower()'),6.55,'unupgraded scout jump');assert.equal(run('shipSpeedCap()'),15.4,'unupgraded scout speed');
 results.push({stage:stage+1,pace,lead,state:run('state'),row:+run('z').toFixed(2),time:+run('time').toFixed(2),fuel:+run('fuel').toFixed(1),reason:run('state')==='win'?null:run('deathReason'),jumps:JSON.parse(run('JSON.stringify(jumps)'))});
}

for(const stage of [19,26]){
 for(const pace of [10,12,14])assert.ok(results.some(r=>r.stage===stage&&r.pace===pace&&r.state==='win'),'base ship route at stage '+stage+' pace '+pace);
}
// Scope guard: every other authored map remains byte-equivalent to the previous source.
const cp=require('child_process'),previous=cp.execFileSync('git',['show','HEAD:dist/story-data.js'],{encoding:'utf8',maxBuffer:10000000}),now=fs.readFileSync('dist/story-data.js','utf8');
const parse=s=>JSON.parse(s.replace(/^const STORY_COURSES=/,'').trim().replace(/;$/,''));
const oldMaps=parse(previous),newMaps=parse(now);for(let i=0;i<newMaps.length;i++)if(![18,25].includes(i))assert.deepEqual(newMaps[i],oldMaps[i],'unrelated map '+i);
const original=JSON.parse(fs.readFileSync('docs/map-originals/9-2-before-base-ship-adjustment.json','utf8'));
assert.equal(newMaps[25].gravity,150);for(let r=0;r<original.tiles.length;r++)for(let l=0;l<7;l++)if(original.tiles[r][l]===2||original.tiles[r][l]===8)assert.equal(newMaps[25].tiles[r][l],original.tiles[r][l],'original block retained');
for(const r of Array.from({length:10},(_,i)=>104+i))assert.notEqual(newMaps[18].roadPaint[r][3],'pink');
if(process.env.STARWAY_ADJUSTED_REPORT)fs.writeFileSync(process.env.STARWAY_ADJUSTED_REPORT,JSON.stringify(results,null,2));for(const s of [19,26]){const wins=results.filter(r=>r.stage===s&&r.state==='win');console.log('AUDIT stage '+(Math.floor((s-1)/3)+1)+'-'+((s-1)%3+1)+': '+wins.length+'/'+results.filter(r=>r.stage===s).length+' scripted timing/pace cases clear; unchanged geometry; Scout Lv0');}
