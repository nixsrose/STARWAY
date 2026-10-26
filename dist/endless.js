// Story measurements inform procedural geometry; no story tile sequence is copied.
const ENDLESS_GRAVITIES=[14,16,18,20];
let lastEndlessCleanup=-Infinity;
let endlessGravity=18,endlessGravityStage=1,pendingEndlessGravity=null,previewEndlessGravity=null;
function pickEndlessGravity(previous){const pool=ENDLESS_GRAVITIES.filter(g=>g!==previous);return pool[Math.floor(Math.random()*pool.length)]}
let infiniteRoad={roadPaint:[],roadColors:[],boxColors:[],tunnelColors:[],ceilings:[],tunnelCenters:{},tunnelRadius:{},guide:[],sections:[],jumpRows:[],bridges:[],speedPads:[],noJumpZones:[],jumpAllowZones:[]},endlessHistory=[];
function activeRoadData(){return mode==='story'?STORY_COURSES[level]:infiniteRoad}
const originalBuildTrack=buildTrack;
buildTrack=function(){if(mode==='endless'){lastEndlessCleanup=-Infinity;endlessGravity=18;endlessGravityStage=1;pendingEndlessGravity=null;previewEndlessGravity=null;infiniteRoad={roadPaint:[],roadColors:[],boxColors:[],tunnelColors:[],ceilings:[],tunnelCenters:{},tunnelRadius:{},guide:[],sections:[],jumpRows:[],bridges:[],speedPads:[],noJumpZones:[],jumpAllowZones:[]};endlessHistory=[]}originalBuildTrack()};
// Learn dimensions and visual vocabulary, never copy a course's tile sequence.
function measureEndlessCourse(c){
 const blockRuns=[];
 for(let lane=0;lane<7;lane++)for(let r=0;r<c.tiles.length;r++){
  const tile=c.tiles[r]?.[lane];if(tile!==2&&tile!==8)continue;
  let end=r+1;while(end<c.tiles.length&&c.tiles[end]?.[lane]===tile)end++;
  blockRuns.push({start:r,end,lane,tile});r=end-1;
 }
 const widths=c.tiles.map(row=>row.filter(t=>t===1||t===3||t===4||t===5).length).filter(n=>n>0),gaps=[];let run=0,boxes=0,highBoxes=0;
 for(const row of c.tiles){for(const t of row){if(t===2||t===8)boxes++;if(t===8)highBoxes++;}if(row.every(t=>!t))run++;else if(run){gaps.push(run);run=0;}}
 return {blockRuns,widths:[...new Set(widths)],gaps,roofs:[...new Set(c.ceilings.filter(Boolean))],paints:[...new Set((c.roadPaint||[]).flat().filter(p=>p&&p!=='pink'))],boxes:[...new Set([...(c.boxColors||[]),...(c.boxPaint||[]).flat()])].filter(Boolean),tints:[...new Set(c.tunnelColors||[])].filter(Boolean),boxCount:boxes,highBoxRatio:boxes?highBoxes/boxes:0,hazards:(c.roadPaint||[]).some(row=>row?.includes('pink'))};
}
let endlessRules=STORY_COURSES.slice(0,STORY_VISIBLE_COUNT).map(measureEndlessCourse);
function refreshEndlessRules(){endlessRules=STORY_COURSES.slice(0,STORY_VISIBLE_COUNT).map(measureEndlessCourse);}

let endlessPatterns=[];
const proceduralBuild=buildTrack;buildTrack=function(){if(mode==='endless')endlessPatterns=[];proceduralBuild()};
// Recompose measured story motifs around a traversable route, rather than joining story slices.
const STORY_REMIX_RECIPES=[
 ['rail_links','중앙 도로와 외곽 연결','rails'],['zigzag','좌우 꺾임','weave'],['narrow_jump','좁아지는 점프','jump'],
 ['split_merge','분기와 합류','fork'],['block_slalom','엇갈린 블록','blocks'],['paired_tunnels','두 갈래 터널','tunnel'],
 ['jump_chain','연속 도약','chain'],['offset_links','엇갈린 연결로','weave'],['hazard_fork','위험색 분기','hazard'],
 ['cross_windows','격자 연결과 창','fork'],['roof_choice','터널과 지붕 경로','tunnel'],['mixed_jump','측면 진입과 도약','mixed'],
 ['narrow_weave','좁은 지그재그','weave'],['split_jump','분리 도로 점프','chain'],['block_islands','공중 블록 군도','blocks'],
 ['long_slalom','장거리 좌우 전환','blocks'],['tunnel_channel','터널 진입 채널','tunnel'],['checker_gaps','색상 격자와 단절','jump'],
 ['hazard_weave','위험 구역 우회','hazard'],['alternating_necks','교대 병목','weave'],['nebula_mix','복합 경로','mixed']
];
let remixBag=[],remixExitLane=3;
const remixBuild=buildTrack;buildTrack=function(){if(mode==='endless'){refreshEndlessRules();remixBag=[];remixExitLane=3;}return remixBuild()};
// These legacy acceleration values map to the displayed 50/100/150/200 coefficients.
ENDLESS_GRAVITIES.splice(0,ENDLESS_GRAVITIES.length,9,18,27,36);
function remixPacing(start){
 const index=Math.floor(start/168),tier=Math.min(3,Math.floor(start/1008)),recovery=index>=4&&index%5===4;
 return {tier,recovery,phase:recovery?'recovery':index<2?'intro':index%5===3?'peak':'build',pressure:recovery||index<2?0:Math.min(3,Math.max(1,tier)+(index%5===3?1:0))};
}
function remixSource(start=Infinity){
 if(!remixBag.length){remixBag=Array.from({length:21},(_,i)=>i);for(let i=20;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remixBag[i],remixBag[j]]=[remixBag[j],remixBag[i]]}}
 const pacing=remixPacing(start),preferred=remixBag.filter(i=>pacing.phase==='intro'?['rails','fork','weave','jump','tunnel'].includes(STORY_REMIX_RECIPES[i][2]):pacing.phase==='peak'?['chain','mixed','hazard','blocks'].includes(STORY_REMIX_RECIPES[i][2]):true);
 const source=(preferred.length?preferred:remixBag).at(-1);remixBag.splice(remixBag.indexOf(source),1);return source;
}
generateBlock=function(start,_difficulty,forcedSource,forcedFamily){
 const source=Number.isInteger(forcedSource)?forcedSource:remixSource(start),course=STORY_COURSES[source],rule=endlessRules[source],recipe=STORY_REMIX_RECIPES[source].slice(),pacing=remixPacing(start),tier=pacing.tier,length=168;
 if(['tunnel','mixed'].includes(recipe[2])&&!rule.roofs.length)recipe[2]=rule.boxCount?'blocks':rule.gaps.length?'chain':'weave';
 if(recipe[2]==='blocks'&&!rule.boxCount)recipe[2]=rule.gaps.length?'jump':'weave';
 if(recipe[2]==='hazard'&&!rule.hazards)recipe[2]=rule.roofs.length?'tunnel':rule.boxCount?'blocks':'weave';
 // Device challenges alternate with normal motifs and never overlap jumps/tunnels.
 const sectionIndex=Math.floor(start/168),deviceCycle=sectionIndex<15||Math.floor(sectionIndex/5)%2===0;
 const event=deviceCycle&&!pacing.recovery&&start>=504?(Math.floor(start/168)%5===2?'noJump':start>=1008&&Math.floor(start/168)%5===3?'boost':start>=1008&&Math.floor(start/168)%5===1?'gravityBlocks':null):null;
  // Device and scenery cycles alternate; eligible story sources cannot suppress a motif.
 const scheduledFamily=sectionIndex===1?'tunnel':sectionIndex===2?'hazard':sectionIndex===3?'hazardBlocks':sectionIndex>=5&&sectionIndex%5!==3?['tunnel','hazard','hazardBlocks'][sectionIndex%3]:null;
 const family=pacing.recovery?'recovery':event?'device':forcedFamily||scheduledFamily||recipe[2];
 const tunnelVariant=Math.floor(sectionIndex/5)%3;
 if(!event&&!pacing.recovery&&family!==recipe[2]){recipe[0]=family;recipe[1]=family==='tunnel'?'직선 터널 항로':family==='hazard'?'위험도로 우회':family==='hazardBlocks'?'위험 블록 회랑':recipe[1];}
 const eventSpeed=1000+Math.floor(Math.random()*201);
 const blockSource=event==='gravityBlocks'?19:source,blockRule=endlessRules[blockSource];
 const runs=blockRule.blockRuns||[],anchor=runs.length?runs[Math.floor(Math.random()*runs.length)].start:0;
 const blockMotifs=runs.filter(m=>m.start>=anchor&&m.start<anchor+120).slice(0,24).map(m=>({...m,start:24+m.start-anchor,end:Math.min(144,24+m.start-anchor+Math.max(12,Math.min(32,m.end-m.start)))}));
 // An optional stepped runway uses 7-2's measured block lengths; the ground route stays open.
 const measuredRun=Math.max(40,Math.min(48,runs.length?Math.round(runs.reduce((n,m)=>n+m.end-m.start,0)/runs.length):44));
 const blockSteps=event==='gravityBlocks'?[{start:48,end:48+measuredRun,lane:1,tile:2},{start:48+measuredRun,end:124,lane:1,tile:8},{start:124,end:148,lane:1,tile:2}]:[];
 const measuredLanes=course.tiles.reduce((set,row)=>{row.forEach((v,l)=>{if(v===1||v===3)set.add(l)});return set},new Set()),spread=Math.max(...measuredLanes)-Math.min(...measuredLanes),margin=['tunnel','hazard','hazardBlocks'].includes(family)?2:pacing.pressure===0?2:pacing.pressure>=2?1:spread>=4&&Math.random()<.7?1:2;
 const entry=start===0?3:remixExitLane,side=Math.random()<.5?-1:1,a=side<0?margin:6-margin,b=6-a,exit=[1,2,4,5][Math.floor(Math.random()*4)];remixExitLane=exit;
 const nodes=family==='tunnel'?[[0,entry],[12,entry],[36,a],[100,a],[132,b],[167,exit]]:event==='noJump'?[[0,entry],[24,3],[36,3],[60,2],[84,4],[108,2],[132,3],[144,3],[167,exit]]:event==='boost'?[[0,entry],[24,3],[44,3],[64,side<0?2:4],[72,side<0?2:4],[104,side<0?4:2],[116,side<0?4:2],[140,3],[167,exit]]:event?[[0,entry],[24,3],[144,3],[167,exit]]:pacing.recovery?[[0,entry],[24,entry],[56,2],[112,2],[167,exit]]:pacing.pressure>=2&&['weave','hazard','hazardBlocks','blocks'].includes(family)?[[0,entry],[8,entry],[32,a],[46,a],[68,b],[90,b],[112,a],[136,a],[167,exit]]:['weave','hazard','hazardBlocks','blocks'].includes(family)?[[0,entry],[12,entry],[36,a],[52,a],[76,b],[100,b],[124,a],[144,a],[167,exit]]:[[0,entry],[12,entry],[36,a],[76,a],[100,b],[144,b],[167,exit]];
 const route=j=>{for(let k=0;k<nodes.length-1;k++){const [r,v]=nodes[k],[s,w]=nodes[k+1];if(j>=r&&j<=s)return v+(w-v)*(j-r)/(s-r)}return exit};
 const jumpStarts=pacing.pressure>=2&&['blocks'].includes(family)?[42]:['chain'].includes(family)?[44+Math.floor(Math.random()*6),104+Math.floor(Math.random()*6)]:['jump','mixed'].includes(family)?[104+Math.floor(Math.random()*6)]:[];
 const measuredGap=rule.gaps.length?rule.gaps[Math.floor(Math.random()*rule.gaps.length)]:2,gap=Math.max(1,Math.min(pacing.pressure>=2?3:2,measuredGap)),tunnel=['tunnel','mixed'].includes(family),tunnelStart=44,tunnelEnd=family==='tunnel'?68+tier*8:68;
 const measuredWidth=rule.widths.length?Math.min(...rule.widths.filter(Boolean)):1;
 const paint=rule.paints.filter(p=>p!=='pink'&&p!=='crimson')[Math.floor(Math.random()*rule.paints.filter(p=>p!=='pink'&&p!=='crimson').length)]||'gray';
 const blockColor=rule.boxes.find(p=>p!=='pink'&&p!=='crimson')||'violet',tint=rule.tints[0]||'aqua';
 const randomBlocks=[];
 for(let j=0;j<length;j++){
  const r=start+j,lane=route(j),cells=Array(7).fill(0),colors=Array(7).fill(paint),nearJump=jumpStarts.some(q=>j>=q-6&&j<q+44);
  // Two cells only while crossing a tile boundary; stationary necks remain one cell wide.
  const low=Math.floor(lane),high=Math.ceil(lane);cells[low]=cells[high]=1;
  if(pacing.pressure===0)for(let l=Math.max(0,low-1);l<=Math.min(6,high+1);l++)cells[l]=1;
  if(start===0&&j<12)for(let l=2;l<=4;l++)cells[l]=1;
  if(family==='rails'||family==='fork'){
   for(const l of [1,5])cells[l]=1;
   if(j%32<5&&!nearJump)for(let l=1;l<=5;l++)cells[l]=1;
   if(family==='rails'&&measuredWidth>2&&tier<2&&j%32<12)cells[Math.min(6,high+1)]=1;
  }
  if(family==='hazard'&&j>=24&&j<144){
   for(let l=1;l<=5;l++){cells[l]=1;colors[l]='pink';}
   for(let l=low;l<=high;l++)colors[l]=paint;
   if(tier===0)for(let l=Math.max(1,low-1);l<=Math.min(5,high+1);l++)colors[l]=paint;
  }
  // Recompose contiguous story block footprints, preserving their lanes and heights.
  // Keep collision clearance around the required route, tunnel and jump envelopes.
  if(!pacing.recovery&&!nearJump&&!tunnel&&!event&&family!=='hazard'&&family!=='hazardBlocks')for(const m of blockMotifs){
   if(j>=m.start&&j<m.end&&Math.abs(m.lane-lane)>1.35){cells[m.lane]=m.tile;randomBlocks.push({row:r,lane:m.lane,placement:'story',source:blockSource});}
  }
  if(event==='gravityBlocks'&&j>=24)cells[1]=1; // Flat entry/exit aprons for the raised alternative.
  for(const m of blockSteps)if(j>=m.start&&j<m.end){cells[m.lane]=m.tile;randomBlocks.push({row:r,lane:m.lane,placement:'gravity-step',source:19});}
  if(event==='gravityBlocks'&&j>=28&&j<=144)for(let l=2;l<=4;l++){cells[l]=1;colors[l]=paint;}
  if(event==='noJump'){
   // Start/end devices span the full width. The state persists across the zigzag.
   if(j===28||j===144){cells.fill(1);colors.fill(paint);for(let l=0;l<7;l++)(j===28?infiniteRoad.noJumpZones:infiniteRoad.jumpAllowZones).push({row:r,lane:l});}
  }
  if(event==='boost'&&j>=28&&j<=144){
   // Wide aprons between two alternating block gates, with >0.9 seconds of warning.
   for(let l=1;l<=5;l++){cells[l]=1;colors[l]=paint;}
   if(j===32)for(let l=1;l<=5;l++){cells[l]=4;infiniteRoad.speedPads.push({row:r,lane:l,speedKmh:eventSpeed});}
   const gate=j>=64&&j<68?0:j>=108&&j<112?1:-1;
   if(gate>=0){const left=(side<0)===(gate===0),open=left?[1,2]:[4,5];
    for(let l=0;l<7;l++)if(!open.includes(l)){cells[l]=8;randomBlocks.push({row:r,lane:l,placement:'boost-gate',source:blockSource});}
   }
  }
  if(source===17&&!['hazard','hazardBlocks'].includes(family))for(let l=0;l<7;l++)colors[l]=(Math.floor(j/4)+l)%2?'ochre':'amber';
  if(tunnel&&j>=tunnelStart&&j<tunnelEnd){
   infiniteRoad.ceilings[r]=rule.roofs.length?Math.max(.85,Math.min(1.8,rule.roofs[0])):1.15;infiniteRoad.tunnelCenters[r]=[a-3];infiniteRoad.tunnelRadius[r]=.65;cells[a]=1;
   // The second straight bore is a genuine optional route, with an approach/exit apron.
   if(family==='tunnel'&&tunnelVariant>=1){cells[b]=1;infiniteRoad.tunnelCenters[r].push(b-3);if(tunnelVariant===2&&a!==3&&b!==3){cells[3]=1;infiniteRoad.tunnelCenters[r].push(0);}}
  }
  if(family==='tunnel'&&((j>=32&&j<44)||(j>=tunnelEnd&&j<tunnelEnd+8)))for(let l=1;l<=5;l++)cells[l]=1;
  if(family==='hazardBlocks'&&((j>=32&&j<56)||(j>=88&&j<116))){
   for(let l=0;l<7;l++)if(Math.abs(l-lane)>1.35){cells[l]=tier>=1&&l%2===0?8:2;colors[l]='pink';randomBlocks.push({row:r,lane:l,placement:'hazard',source});}
  }
  if(jumpStarts.some(q=>j>=q&&j<q+gap))cells.fill(0);
  rows[r]=cells;infiniteRoad.guide[r]=lane;infiniteRoad.roadPaint[r]=colors;infiniteRoad.boxColors[r]=blockColor;infiniteRoad.tunnelColors[r]=tint;
  const li=Math.round(lane);
  // Reserve guaranteed refuelling opportunities independently of random decorations.
  if(r>=nextFuelRow&&cells[li]===1&&Math.abs(lane-li)<.1&&!infiniteRoad.ceilings[r]&&!nearJump){cells[li]=3;nextFuelRow=r+54;}
  if(pacing.recovery&&j===24){cells[li]=3;nextFuelRow=Math.max(nextFuelRow,r+54);}
  if(j%27===16&&Math.random()<.55){const safe=cells.map((v,l)=>v===1&&colors[l]!=='pink'?l:-1).filter(l=>l>=0);if(safe.length)coins.set(r,{lane:safe[Math.floor(Math.random()*safe.length)],height:.4});}
 }
 infiniteRoad.noJumpZones=infiniteRoad.noJumpZones.slice(); // Invalidate the cell lookup after streamed generation.
 for(const q of jumpStarts)infiniteRoad.jumpRows.push(start+q-2);
 infiniteRoad.sections.push({start,end:start+length,type:pacing.recovery?'recovery':recipe[0],name:pacing.recovery?'회복 항로':event==='gravityBlocks'?'중력 50 · 블록 계단 / 지상 우회':event==='noJump'?'점프 차단 → 지그재그 → 해제':event==='boost'?'강제 가속 '+eventSpeed+'km/h · 교대 블록 게이트':recipe[1],family,tunnelVariant:family==='tunnel'?tunnelVariant:null,event,eventSpeed:event==='boost'?eventSpeed:null,blockSource,blockMotifs,blockSteps,lockedGravity:event==='gravityBlocks'?9:null,source,sourceStage:Math.floor(source/3)+1+'-'+(source%3+1),patternId:'S'+source,procedural:true,tier,pacing:pacing.phase,pressure:pacing.pressure,requiresSteering:!pacing.recovery,randomBlocks,entryLane:entry,exitLane:exit,measuredWidth,measuredGap,sourceHighBoxRatio:rule.highBoxRatio});
 endlessHistory.push(source);if(endlessHistory.length>100)endlessHistory.shift();endlessPatterns.push(recipe[0]);if(endlessPatterns.length>100)endlessPatterns.shift();generated=start+length;
};
function deckAt(r,xx){return (activeRoadData().bridges||[]).find(m=>r>=m.start&&r<m.end&&xx>=m.left&&xx<=m.right)}
roadOffset=function(){return 3.5};
ceilingAt=function(r){return activeRoadData().ceilings?.[r]||0};
tunnelCenters=function(r=Math.floor(z)){return activeRoadData().tunnelCenters?.[r]||[0]};
// One lane-sized passage everywhere: placement count must not resize connected shells.
// Shared by rendering, roof height and collision, including imported maps.
tunnelRadius=function(r=Math.floor(z)){return TUNNEL_PASSAGE_RADIUS};
const oldSectionAt=sectionAt;sectionAt=function(r){return mode==='story'?oldSectionAt(r):infiniteRoad.sections.find(s=>r>=s.start&&r<s.end)};
lethalRoadAt=function(r,l){return activeRoadData().roadPaint?.[r]?.[l]==='pink'};
const originalGravity=gravityValue;gravityValue=function(){return mode==='story'?originalGravity():endlessGravity};
let persistedEndlessBest=data.best;
const endlessStep=step;step=function(dt){if(mode==='endless'&&state==='play'&&!infiniteRoad.authoredSegments){
 const stage=Math.floor(z/180)+1,distance=stage*180-z,locked=sectionAt(Math.floor(z))?.lockedGravity;
 if(locked){endlessGravityStage=stage;previewEndlessGravity=null;pendingEndlessGravity=endlessGravity===locked?null:locked;if(pendingEndlessGravity!==null&&grounded&&vy===0){endlessGravity=locked;pendingEndlessGravity=null;}}else{
 if(stage!==endlessGravityStage){endlessGravityStage=stage;pendingEndlessGravity=previewEndlessGravity??pickEndlessGravity(endlessGravity);previewEndlessGravity=null;}
 if(pendingEndlessGravity!==null&&grounded&&vy===0){endlessGravity=pendingEndlessGravity;pendingEndlessGravity=null;}
 if(distance<=48&&previewEndlessGravity===null&&pendingEndlessGravity===null)previewEndlessGravity=pickEndlessGravity(endlessGravity);
 }}endlessStep(dt);if(mode!=='endless')return;const record=flightDistance();if(record>data.best){data.best=record;if(record>=persistedEndlessBest+25){save();persistedEndlessBest=record}}const cutoff=Math.floor(z)-50;if(cutoff===lastEndlessCleanup)return;lastEndlessCleanup=cutoff;for(const key of ['roadPaint','roadColors','boxColors','tunnelColors','ceilings','guide','tunnelCenters','tunnelRadius']){const map=infiniteRoad[key];for(let r=Math.max(0,cutoff-40);r<cutoff;r++)delete map[r]}infiniteRoad.sections=infiniteRoad.sections.filter(s=>s.end>=cutoff);infiniteRoad.jumpRows=infiniteRoad.jumpRows.filter(r=>r>=cutoff);infiniteRoad.speedPads=infiniteRoad.speedPads.filter(p=>p.row>=cutoff);infiniteRoad.noJumpZones=infiniteRoad.noJumpZones.filter(p=>p.row>=cutoff);infiniteRoad.jumpAllowZones=infiniteRoad.jumpAllowZones.filter(p=>p.row>=cutoff);infiniteRoad.bridges=infiniteRoad.bridges.filter(m=>m.end>=cutoff)};
const menuEndless=showMenu;showMenu=function(tab='story'){menuEndless(tab);if(tab==='endless')$('description').textContent='1-1~7-3의 경로 데이터를 응용한 무한 항로. 단일·복수 직선 터널, 위험도로와 위험 블록, 낮고 높은 블록이 번갈아 등장합니다. 거리가 늘면 도로가 좁아지고 차단·해제 장치가 있는 점프 불가 지그재그·1,000~1,200km/h 가속 블록 게이트·중력 50 블록 계단이 등장합니다. 다섯 구간마다 회복 항로가 이어집니다. 중력은 50·100·150·200으로 바뀌며 착지 후 적용됩니다. 연료를 확보하며 최고 거리에 도전하세요.'};

addEventListener('pagehide',()=>{if(mode==='endless')save()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='endless')save()});

const endlessGravityDraw=draw;draw=function(){endlessGravityDraw();if(mode==='endless')$('difficultyBadge').textContent=floor+'단계 · 중력 '+gravityValue()+''+(pendingEndlessGravity!==null?' · 착지 후 '+gravityCoefficientFromLegacy(pendingEndlessGravity)+'':'')};
