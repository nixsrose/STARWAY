const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
const el=()=>({style:{},setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild:noop,getContext:()=>ctx});
let els={},saved={},timers=[];
const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},requestAnimationFrame:noop,setTimeout:fn=>(timers.push(fn),timers.length),clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

vm.runInContext(`{mode='story';data.unlocked=17;level=7;beginRun(true);
const c=STORY_COURSES[7];if(c.reference.indexOf('296050.mp4')<0||c.tiles.length!==340||!c.roadPaint.some(p=>p.includes('pink'))||c.boxColors[220]!=='blue'||c.tunnelCenters[318][0]!==0)throw Error('reference structure');
let landed=false;for(let f=0;f<5000&&state==='play';f++){let lane=c.guide[Math.min(trackLength-1,Math.floor(z))];keys.left=x>lane-roadCenterLane()+.06;keys.right=x<lane-roadCenterLane()-.06;if(grounded&&rows[Math.floor(z)+2]?.every(v=>v===0))jump();step(1/120);if(z>=212&&z<240&&grounded&&Math.abs(y-.85)<.001)landed=true}
if(state!=='win'||!landed)throw Error('3-2 complete/raised platform');beginRun();if(state!=='ready'||speed!==0)throw Error('manual launch');}`,b);
console.log('PASS: Road 3-2 reference sequence, lethal surfaces, blue platform landing, complete route and stationary retry');
