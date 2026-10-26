const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 const ranges=[[1,187],[1,350],[1,183],[67,265],[157,346],[1,214],[70,192],[37,282],[1,200],[1,256],[1,240],[65,430],[1,199],[1,350],[43,445],[81,450],[1,327],[1,400],[1,463],[1,470],[1,350]];
 if(JSON.stringify(ranges)!==JSON.stringify(ENDLESS_STORY_RANGES))throw Error('source limits changed');
 const authored=JSON.stringify(STORY_COURSES);mode='endless';beginRun(true);let previous=infiniteRoad.sections.at(-1),seen=new Set(),short=0;
 for(let i=0;i<180;i++){
  const start=generated;generateBlock(start,0);const s=infiniteRoad.sections.at(-1),map=STORY_COURSES[s.source],[first,last]=ranges[s.source];
  if(s.connector||s.start!==previous.end||s.sourceFirst<first||s.sourceLast>last||s.end-s.start>120)throw Error('bad excerpt boundary');
  if(s.start<502&&s.source>8)throw Error('late course before5000m');
  if(s.source===previous.source)throw Error('consecutive source repeat');
  const incoming=endlessWindowProfile(s.source).edges[s.sourceFirst-1].entry,outgoing=endlessWindowProfile(previous.source).edges[previous.sourceLast-1].exit;
  if(!incoming.some(l=>outgoing.includes(l)))throw Error('no supported seam');
  for(let row=s.sourceFirst-1;row<s.sourceLast;row++){
   const r=s.start+row-s.sourceFirst+1;for(let l=0;l<7;l++)if(rows[r][l]!==map.tiles[row][l]&&!(rows[r][l]===3&&map.tiles[row][l]===1&&infiniteRoad.randomFuelPads.some(p=>p.row===r&&p.lane===l)))throw Error('source geometry altered');
   for(const key of ['roadPaint','roadColors','boxColors','boxPaint','tunnelColors','ceilings','tunnelCenters','tunnelRadius'])if(map[key]?.[row]!==undefined&&JSON.stringify(infiniteRoad[key][r])!==JSON.stringify(map[key][row]))throw Error('lost metadata '+key);
  }
  seen.add(s.source);short+=s.sourceLast-s.sourceFirst+1<last-first+1;previous=s;
 }
 if(seen.size!==21||short!==180||infiniteRoad.sections.some(s=>s.connector)||infiniteRoad.bridges.some(b=>b.connector))throw Error('pool coverage / long connectors');
 if(JSON.stringify(STORY_COURSES)!==authored)throw Error('story changed');
}`);
console.log('PASS180 random partial excerpts:21-source coverage, early9-only pool, exact bounds/geometry/metadata, contiguous compatible seams, no long connector roads');
run(`{
 const starts=new Set();let previous=null;
 for(let i=0;i<30;i++){
  mode='endless';beginRun(true);const s=sectionAt(2),signature=s.source+':'+s.sourceFirst;
  if(s.source>8||s.source===previous||x!==s.entryLane-3||y!==0||flightDistance()!==0)throw Error('restart/spawn contract');
  for(let r=2;r<8;r++)if(![1,3].includes(rows[r][s.entryLane])||infiniteRoad.roadPaint[r]?.[s.entryLane]==='pink'||infiniteRoad.ceilings[r])throw Error('unsafe starting runway');
  starts.add(signature);previous=s.source;
 }
 if(starts.size<10)throw Error('restart randomness missing');
 const stats=shipRunStats;shipRunStats={speed:25.5,jump:6.4,fuel:1};
 // Test each source's approach and the next seam at max cruise, using its common lane.
 for(let source=0;source<21;source++){
  beginRun(true);const start=generated;generateBlock(start,0,source);const current=infiniteRoad.sections.at(-1);generateBlock(generated,0);const next=infiniteRoad.sections.at(-1),lane=next.entryLane;
  shipRunStats={speed:25.5,jump:6.4,fuel:1};state='play';z=current.end-6;x=lane-3;y=0;vy=0;grounded=true;speed=25.5;throttle=25.5;fuel=100;steeringAxis=0;
  while(z<next.start+5&&state==='play')step(1/120);
  if(state!=='play'||!grounded||y!==0)throw Error('unsafe direct seam '+source+' / '+state);
 }
 shipRunStats=stats;
}`);
console.log('PASS30 randomized restarts with safe source-lane spawns and zero distance;21 direct seams physically traversed at max cruise');
run(`{
 mode='endless';beginRun(true);z=221;syncRunClock();draw();
 if($('runClock').textContent!=='2190'||$('clockUnit').textContent!=='m'||$('runMetric').style.marginLeft!=='auto')throw Error('meter counter changed');
 for(const lang of ['en','ja','zh']){settings.language=lang;syncRunClock();if($('clockUnit').textContent!=='m')throw Error('localized meter counter');}
 settings.language='ko';mode='story';level=0;beginRun(true);syncRunClock();if($('courseLabel').textContent!=='항로'||$('runMetric').style.marginLeft!=='')throw Error('story label changed');
}`);
console.log('PASS meter distance retained and right-aligned in endless; story course label and layout restored');
