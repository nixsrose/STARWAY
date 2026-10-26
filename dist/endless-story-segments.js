// Master-selected editor line numbers, inclusive and one-based.
const ENDLESS_STORY_RANGES=[[1,187],[1,350],[1,183],[67,265],[157,346],[1,214],[70,192],[37,282],[1,200],[1,256],[1,240],[65,430],[1,199],[1,350],[43,445],[81,450],[1,327],[1,400],[1,463],[1,470],[1,350]];
let endlessSegmentBag=[],endlessSegmentCycle=0,endlessLastSource=-1,endlessExit={lane:3,height:0},endlessSegmentState=null,endlessSegmentGravity=null;
const endlessClone=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
function endlessSourceGravity(source){
 const previousMode=mode,previousLevel=level;
 try{mode='story';level=source;return stageProfile().gravity;}finally{mode=previousMode;level=previousLevel;}
}
function endlessBoundary(map,row){
 const candidates=[];
 for(let lane=0;lane<7;lane++){const tile=map.tiles[row]?.[lane];if(!tile||map.roadPaint?.[row]?.[lane]==='pink')continue;candidates.push({lane,height:boxHeight(tile)});}
 // Prefer a ground entrance, then a central safe block top. No source cells are edited.
 candidates.sort((a,b)=>a.height-b.height||Math.abs(a.lane-3)-Math.abs(b.lane-3));
 return candidates[0]||{lane:3,height:0,unsupported:true};
}
const ENDLESS_FULL_POOL_METERS=5000;
let endlessWindowCache=new Map(),endlessPreviousStart=null,endlessExitLanes=null,endlessActivePool=0;
function endlessWindowProfile(source){
 if(endlessWindowCache.has(source))return endlessWindowCache.get(source);
 const map=STORY_COURSES[source],[a,b]=ENDLESS_STORY_RANGES[source],first=Math.min(a-1,map.tiles.length-1),last=Math.min(b,map.tiles.length),edges=[],interest=[0];
 const safe=(r,l)=>[1,3].includes(map.tiles[r]?.[l])&&map.roadPaint?.[r]?.[l]!=='pink'&&!map.ceilings?.[r]&&!(map.bridges||[]).some(d=>r>=d.start&&r<d.end);
 for(let r=first;r<last;r++){
  const entry=[],exit=[];for(let l=0;l<7;l++){
   if(r+7<last&&Array.from({length:8},(_,i)=>r+i).every(q=>safe(q,l)))entry.push(l);
   if(r-7>=first&&Array.from({length:8},(_,i)=>r-i).every(q=>safe(q,l)))exit.push(l);
  }
  edges[r]={entry,exit};
  const changed=r>first&&JSON.stringify(map.tiles[r])!==JSON.stringify(map.tiles[r-1]),feature=map.tiles[r].some(t=>t===2||t===8)||map.ceilings?.[r]>0||map.roadPaint?.[r]?.includes('pink');
  interest.push(interest.at(-1)+(changed?1:0)+(feature?2:0));
 }
 const out={map,first,last,edges,interest};endlessWindowCache.set(source,out);return out;
}
function endlessWindows(source,start){
 const p=endlessWindowProfile(source),out=[],allowed=start===0?null:endlessExitLanes;
 for(const minimum of [56,32,16]){
  for(let first=p.first;first+minimum<=p.last;first++){
   const entry=p.edges[first]?.entry.filter(l=>!allowed||allowed.includes(l));if(!entry?.length)continue;
   const ends=[];for(let end=first+minimum;end<=Math.min(p.last,first+120);end++)if(p.edges[end-1]?.exit.length&&(minimum===16||p.interest[end-p.first]-p.interest[first-p.first]>=2))ends.push(end);
   if(ends.length)out.push({first,ends,lanes:entry});
  }
  if(out.length)break;
 }
 return out;
}
function endlessPickWindow(start,forcedSource){
 const poolSize=start<ENDLESS_FULL_POOL_METERS/10+2?9:21;
 const eligible=Number.isInteger(forcedSource)?[forcedSource]:Array.from({length:poolSize},(_,i)=>i);
 const options=eligible.map(source=>({source,windows:endlessWindows(source,start)})).filter(o=>o.windows.length);
 let choices=options.filter(o=>o.source!==(start===0?endlessPreviousStart?.source:endlessLastSource));if(!choices.length)choices=options;
 if(!choices.length)throw Error('호환되는 원본 항로 구간을 찾을 수 없습니다.');
 if(!endlessSegmentBag.length||endlessActivePool!==poolSize){endlessSegmentBag=eligible.slice();endlessActivePool=poolSize;}
 let fresh=choices.filter(o=>endlessSegmentBag.includes(o.source));if(!fresh.length){endlessSegmentBag=eligible.slice();fresh=choices;}
 const choice=fresh[Math.floor(Math.random()*fresh.length)],window=choice.windows[Math.floor(Math.random()*choice.windows.length)];
 let end=window.ends[Math.floor(Math.random()*window.ends.length)];
 if(start===0&&endlessPreviousStart?.source===choice.source&&endlessPreviousStart.first===window.first&&endlessPreviousStart.end===end&&window.ends.length>1)end=window.ends[(window.ends.indexOf(end)+1)%window.ends.length];
 endlessSegmentBag=endlessSegmentBag.filter(i=>i!==choice.source);endlessLastSource=choice.source;
 if(start===0)endlessPreviousStart={source:choice.source,first:window.first,end};
 return {source:choice.source,first:window.first,end,entryLane:window.lanes.slice().sort((a,b)=>Math.abs(a-3)-Math.abs(b-3))[0]};
}
function initializeAuthoredEndless(){
 if(infiniteRoad.authoredSegments)return;
 infiniteRoad.authoredSegments=true;
 for(const key of ['boxPaint','gravityGates','hazardTunnels','speedPads','noJumpZones','jumpAllowZones'])infiniteRoad[key]||=[];
}
const proceduralEndlessGenerator=generateBlock;
generateBlock=function(start,_difficulty,forcedSource){
 initializeAuthoredEndless();
 const selected=endlessPickWindow(start,forcedSource),{source,first,end}=selected,map=STORY_COURSES[source],range=ENDLESS_STORY_RANGES[source];
 if(!map||!range)throw Error('무한 항로 원본을 찾을 수 없습니다.');
 // Editor overrides are resolved each run. Short edited maps use their available rows.
 const entry={lane:selected.entryLane,height:0},exit=endlessBoundary(map,end-1),gravity=endlessSourceGravity(source);
 const segmentStart=start,shift=segmentStart-first;
 const rowFields=['roadPaint','roadColors','boxColors','boxPaint','tunnelColors','ceilings'];
 for(let row=first;row<end;row++){
  const r=row+shift;rows[r]=map.tiles[row].slice();
  for(const key of rowFields)if(map[key]?.[row]!==undefined)infiniteRoad[key][r]=endlessClone(map[key][row]);
  if(map.tunnelCenters?.[row])infiniteRoad.tunnelCenters[r]=map.tunnelCenters[row].slice();
  if(map.tunnelRadius?.[row]!==undefined)infiniteRoad.tunnelRadius[r]=map.tunnelRadius[row];
 }
 for(const key of ['gravityGates','speedPads','noJumpZones','jumpAllowZones','hazardTunnels']){
  const copied=(map[key]||[]).filter(g=>g.row>=first&&g.row<end).map(g=>({...endlessClone(g),row:g.row+shift}));
  infiniteRoad[key]=infiniteRoad[key].concat(copied);
 }
 for(const bridge of map.bridges||[])if(bridge.end>first&&bridge.start<end)infiniteRoad.bridges.push({...endlessClone(bridge),start:Math.max(first,bridge.start)+shift,end:Math.min(end,bridge.end)+shift});
 // Carry device state from before a cropped entry; actual devices inside remain lane-sensitive.
 const before=(map.gravityGates||[]).filter(g=>g.row<first).sort((a,b)=>a.row-b.row).at(-1);
 const lastNo=(map.noJumpZones||[]).filter(g=>g.row<first).reduce((m,g)=>Math.max(m,g.row),-1),lastAllow=(map.jumpAllowZones||[]).filter(g=>g.row<first).reduce((m,g)=>Math.max(m,g.row),-1);
 const stage=Math.floor(source/3)+1+'-'+(source%3+1),section={start:segmentStart,end:segmentStart+end-first,type:'story_segment',family:'authored',pacing:source<3?'intro':'build',name:stage+' · '+(first+1)+'~'+end+'줄',source,sourceStage:stage,sourceFirst:first+1,sourceLast:end,requestedFirst:range[0],requestedLast:range[1],patternId:'S'+source,procedural:false,gravity:before?.gravity??gravity,initialJumpDisabled:!!map.jumpAllowZones?.length&&lastNo>lastAllow,background:endlessClone(map.background),fuelDrainMultiplier:map.fuelDrainMultiplier??1,entryLane:entry.lane,exitLane:exit.lane,entryHeight:entry.height,exitHeight:exit.height,truncated:end<range[1]||first!==range[0]-1};
 infiniteRoad.sections.push(section);
 // Collectibles are spread within this segment, independently of previously generated rows.
 const candidates=[];for(let r=section.start+3;r<section.end-3;r++){const lanes=rows[r].flatMap((t,l)=>[1,3,4,5].includes(t)&&infiniteRoad.roadPaint[r]?.[l]!=='pink'?[l]:[]);if(lanes.length)candidates.push({r,lanes});}
 const count=Math.min(16,Math.floor(candidates.length/24));for(let i=0;i<count;i++){const a=Math.floor(i*candidates.length/count),b=Math.floor((i+1)*candidates.length/count),c=candidates[a+Math.floor(Math.random()*(b-a))];coins.set(c.r,{lane:c.lanes[Math.floor(Math.random()*c.lanes.length)],height:.4});}
 for(let r=section.start+8;r<section.end-8;r++)if(r>=nextFuelRow){const lanes=rows[r].flatMap((t,l)=>t===1&&[r-1,r,r+1].every(q=>[1,3].includes(rows[q]?.[l])&&infiniteRoad.roadPaint[q]?.[l]!=='pink'&&!infiniteRoad.ceilings[q])?[l]:[]);if(lanes.length){const lane=lanes[Math.floor(Math.random()*lanes.length)];rows[r][lane]=3;(infiniteRoad.randomFuelPads||=[]).push({row:r,lane});nextFuelRow=r+56;}}
 endlessExit=exit;endlessExitLanes=endlessWindowProfile(source).edges[end-1].exit.slice();endlessHistory.push(source);if(endlessHistory.length>100)endlessHistory.shift();generated=section.end;
};
const authoredEndlessBuild=buildTrack;buildTrack=function(...args){if(mode==='endless'){endlessSegmentBag=[];endlessSegmentCycle=0;endlessLastSource=-1;endlessExit={lane:3,height:0};endlessSegmentState=null;endlessSegmentGravity=null;endlessWindowCache=new Map();endlessExitLanes=null;endlessActivePool=0;}return authoredEndlessBuild(...args);};
const authoredGravity=gravityValue;gravityValue=function(){return mode==='endless'&&infiniteRoad.authoredSegments?(endlessSegmentGravity??sectionAt(Math.floor(z))?.gravity??100):authoredGravity();};
const authoredSegmentStep=step;step=function(dt){
 if(dt>1/120+.000001){const n=Math.ceil(dt/(1/120));for(let i=0;i<n;i++)step(dt/n);return;}
 const playing=mode==='endless'&&state==='play'&&infiniteRoad.authoredSegments,oldZ=z,oldX=x;
 if(playing){const section=sectionAt(Math.floor(z));if(section&&section!==endlessSegmentState){endlessSegmentState=section;endlessSegmentGravity=section.gravity;runJumpDisabled=!!section.initialJumpDisabled;pendingEndlessGravity=null;previewEndlessGravity=null;infiniteRoad.background=section.background;infiniteRoad.fuelDrainMultiplier=section.fuelDrainMultiplier??1;}}
 const out=authoredSegmentStep(dt);
 if(playing&&state==='play'&&endlessSegmentState?.connector){const r=Math.floor(z),l=Math.floor(x+3.5);if(grounded&&rows[r]?.[l]===3&&charge!==r){charge=r;fuel=Math.min(100,fuel+40);}}
 if(playing&&state==='play')for(const gate of infiniteRoad.gravityGates||[]){const goal=gate.row+.5;if(oldZ<goal&&z>=goal){const q=(goal-oldZ)/(z-oldZ);if(Math.floor(oldX+(x-oldX)*q+3.5)===gate.lane)endlessSegmentGravity=gate.gravity;}}
 if(playing){const cutoff=Math.floor(z)-50;infiniteRoad.randomFuelPads=(infiniteRoad.randomFuelPads||[]).filter(g=>g.row>=cutoff);for(const key of ['gravityGates','hazardTunnels'])infiniteRoad[key]=(infiniteRoad[key]||[]).filter(g=>g.row>=cutoff);for(let r=Math.max(0,cutoff-40);r<cutoff;r++)delete infiniteRoad.boxPaint[r];}
 return out;
};

const authoredEndlessMenu=showMenu;showMenu=function(tab='story'){const out=authoredEndlessMenu(tab);if(tab==='endless')$('description').textContent=({ko:'5,000m까지는1-1~3-3, 이후에는1-1~7-3의 일부 구간이 무작위로 연결됩니다. 재시작할 때 출발 구간도 달라집니다.',en:'Random story excerpts:1-1 to3-3 for the first5,000m, then all21 courses. Restart selects a new starting excerpt.',ja:'5,000mまでは1-1〜3-3、以降は全21航路から一部区間をランダム接続。再挑戦時の開始区間も変わります。',zh:'前5,000米随机选取1-1至3-3的片段，之后使用全部21条航线。重试时起点片段也会变化。'})[settings.language]||'';return out;};
// Spawn inside the new excerpt, at a supported lane; run distance still begins at zero.
const excerptBeginRun=beginRun;beginRun=function(...args){const out=excerptBeginRun(...args);if(mode==='endless'&&infiniteRoad.authoredSegments){const section=sectionAt(Math.floor(z));if(section){x=section.entryLane-3;y=0;vy=0;grounded=true;endlessSegmentState=null;endlessSegmentGravity=section.gravity;syncCockpit();}}return out;};start=beginRun;
function syncEndlessCourseReadout(){
 const endless=mode==='endless';$('courseReadout').classList.toggle('hidden',endless);$('runMetric').style.marginLeft=endless?'auto':'';
}
const endlessReadoutDraw=draw;draw=function(...args){const out=endlessReadoutDraw(...args);syncEndlessCourseReadout();return out;};
const endlessReadoutClock=syncRunClock;syncRunClock=function(...args){const out=endlessReadoutClock(...args);syncEndlessCourseReadout();return out;};
