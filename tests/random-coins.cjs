const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 for(let i=0;i<30;i++){
  const m=STORY_COURSES[i],before=JSON.stringify(m),layouts=new Set();
  for(let attempt=0;attempt<20;attempt++){
   const layout=randomStoryCoins(m,m.tiles);if(!layout.length)throw Error('empty stage '+i);
   layouts.add(JSON.stringify(layout));const used=new Set();
   for(const [r,l] of layout){if(used.has(r))throw Error('duplicate row');used.add(r);if(r<8||r>=Math.min(m.tiles.length-3,...mapFinishes(m).map(f=>f.row)))throw Error('outside course');for(const rr of [r-1,r,r+1])if(![1,3,4,5].includes(m.tiles[rr][l])||m.roadPaint?.[rr]?.[l]==='pink')throw Error('unsafe coin');}
  }
  if(layouts.size<2)throw Error('not random '+i);if(JSON.stringify(m)!==before)throw Error('map mutated');
 }
 data.unlocked=29;mode='story';level=0;beginRun();const first=JSON.stringify([...coins]);beginRun();if(JSON.stringify([...coins])===first)throw Error('retry did not randomize');
 for(const d of CHALLENGES){startChallenge(d.id);const expected=JSON.stringify(STORY_COURSES[0].coins),actual=JSON.stringify([...coins].map(([r,c])=>[r,c.lane]));if(expected!==actual)throw Error('challenge randomized '+d.id);startChallenge(d.id);if(JSON.stringify([...coins].map(([r,c])=>[r,c.lane]))!==expected)throw Error('challenge retry changed');}closeChallengeRun();
 const m=emptyEditorMap(64);m.roadPaint.forEach(row=>row.fill('pink'));if(randomStoryCoins(m,m.tiles).length)throw Error('hazard spawn');
}`);
console.log('PASS 30-stage randomized safe placement, run/retry variation, immutable maps and fixed challenge coins');
