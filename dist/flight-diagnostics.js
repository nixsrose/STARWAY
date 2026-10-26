// Opt-in, bounded local diagnostics. No network, identifiers or per-frame storage writes.
let flightDiagnosticsEnabled=false,flightDiagnosticRun=null,flightDiagnosticRuns=[],flightDiagnosticLastFrame=null;
try{const saved=JSON.parse(localStorage.getItem('starway.diagnostics.v1')||'[]');if(Array.isArray(saved))flightDiagnosticRuns=saved.slice(-20)}catch{}
let flightDiagnosticStudy={stages:{}};
try{const saved=JSON.parse(localStorage.getItem('starway.study.v1')||'null');if(saved?.stages&&typeof saved.stages==='object'&&!Array.isArray(saved.stages))flightDiagnosticStudy={stages:Object.fromEntries(Object.entries(saved.stages).slice(-60))}}catch{}
function diagnosticPersist(){try{localStorage.setItem('starway.diagnostics.v1',JSON.stringify(flightDiagnosticRuns));localStorage.setItem('starway.study.v1',JSON.stringify(flightDiagnosticStudy))}catch{}}
function diagnosticStudyKey(run){return run.mode+':'+run.stage+':'+run.mapRevision}
function diagnosticStudyRow(run){return flightDiagnosticStudy.stages[run.studyKey]}
function diagnosticDecision(run,action){if(!run||run.decision)return;run.decision={action,row:run.endRow??Math.floor(z),at:new Date().toISOString()};const stat=diagnosticStudyRow(run);if(stat){if(action==='retry'){stat.retries++;if(run.outcome==='failure')stat.retryAfterFailure=(stat.retryAfterFailure||0)+1;}if(action==='menu'){stat.menuExits++;if(run.outcome==='failure')stat.menuAfterFailure=(stat.menuAfterFailure||0)+1;}}diagnosticPersist()}
function diagnosticLaunch(){const run=flightDiagnosticRun;if(!flightDiagnosticsEnabled||!run||run.outcome!=='running'||run.launchDelaySeconds!==null)return;run.launchDelaySeconds=run.readySeconds;run.events.push({type:'launch',readySeconds:run.readySeconds,row:Math.floor(z)});diagnosticCheckpoint()}
function diagnosticSettle(run){const stat=diagnosticStudyRow(run);if(!stat||run.studySettled)return;run.studySettled=true;stat.activeSeconds+=run.activeSeconds;if(run.outcome==='failure'){stat.failures++;const failure=run.events.filter(e=>e.type==='failure').at(-1);if(failure){stat.failureLocations??={};const key=failure.row+':'+String(failure.reason).slice(0,80);if(!stat.failureLocations[key]&&Object.keys(stat.failureLocations).length>=60)delete stat.failureLocations[Object.keys(stat.failureLocations)[0]];stat.failureLocations[key]={row:failure.row,reason:failure.reason,count:(stat.failureLocations[key]?.count||0)+1};}}if(run.outcome==='clear'){stat.clears++;if(!stat.firstClear)stat.firstClear={attempt:run.attemptIndex,activeSeconds:stat.activeSeconds,playSeconds:time};}}

function diagnosticCheckpoint(){if(!flightDiagnosticRun)return;flightDiagnosticRun.updated=new Date().toISOString();diagnosticPersist()}
function diagnosticEnd(outcome){if(!flightDiagnosticRun||flightDiagnosticRun.outcome!=='running')return;flightDiagnosticRun.outcome=outcome;flightDiagnosticRun.endRow=Math.floor(z);diagnosticSettle(flightDiagnosticRun);diagnosticCheckpoint();flightDiagnosticLastFrame=null;}
function diagnosticStart(){
 if(!flightDiagnosticsEnabled)return;
 const map=activeRoadData(),version=$('gameVersion')?.textContent||'',signature=JSON.stringify(map);let hash=2166136261;for(let i=0;i<signature.length;i++){hash^=signature.charCodeAt(i);hash=Math.imul(hash,16777619)}
 flightDiagnosticRun={started:new Date().toISOString(),version,mode:challengeActive?'challenge':creatorActive?'creator':editorTesting?'editor':mode,stage:challengeActive?.id|| (mode==='story'?(Math.floor(level/3)+1)+'-'+(level%3+1):'endless'),mapRevision:(hash>>>0).toString(16),viewport:{width:W,height:H,dpr},graphics:settings.graphics,ship:shipRunStats?JSON.parse(JSON.stringify(shipRunStats)):null,outcome:'running',readySeconds:0,activeSeconds:0,launchDelaySeconds:null,segments:{},events:[]};
 const key=diagnosticStudyKey(flightDiagnosticRun);flightDiagnosticRun.studyKey=key;
 if(!flightDiagnosticStudy.stages[key]){if(Object.keys(flightDiagnosticStudy.stages).length>=60)delete flightDiagnosticStudy.stages[Object.keys(flightDiagnosticStudy.stages)[0]];flightDiagnosticStudy.stages[key]={mode:flightDiagnosticRun.mode,stage:flightDiagnosticRun.stage,mapRevision:flightDiagnosticRun.mapRevision,attempts:0,failures:0,clears:0,retries:0,menuExits:0,activeSeconds:0,firstClear:null};}
 flightDiagnosticRun.attemptIndex=++flightDiagnosticStudy.stages[key].attempts;
 flightDiagnosticRuns.push(flightDiagnosticRun);flightDiagnosticRuns=flightDiagnosticRuns.slice(-20);flightDiagnosticLastFrame=null;diagnosticCheckpoint();if(state==='play')diagnosticLaunch();
}
function diagnosticFrame(t,renderMs,simulationMs,playing){
 if(!flightDiagnosticsEnabled||!flightDiagnosticRun||flightDiagnosticRun.outcome!=='running')return;
 if(!playing||document.hidden||globalThis.flightLifecycleSuspended){flightDiagnosticLastFrame=null;return}
 const gap=flightDiagnosticLastFrame===null?null:t-flightDiagnosticLastFrame;flightDiagnosticLastFrame=t;
 const row=Math.floor(z),key=Math.floor(row/10)*10;let s=flightDiagnosticRun.segments[key];
 if(!s&&Object.keys(flightDiagnosticRun.segments).length>=500){delete flightDiagnosticRun.segments[Object.keys(flightDiagnosticRun.segments)[0]];}
 if(!s)s=flightDiagnosticRun.segments[key]={from:key,to:key+9,frames:0,totalFrameMs:0,maxFrameMs:0,over33:0,over50:0,renderMs:0,simulationMs:0,histogram:Array(101).fill(0)};
 if(gap!==null&&gap>=0){s.frames++;s.totalFrameMs+=gap;s.maxFrameMs=Math.max(s.maxFrameMs,gap);s.over33+=gap>33.34?1:0;s.over50+=gap>50?1:0;s.histogram[Math.min(100,Math.floor(gap/5))]++;s.renderMs+=renderMs;s.simulationMs+=simulationMs;}
 // Keep only the most recent 60 detailed stalls and failures per run.
 if(gap>50){flightDiagnosticRun.events.push({type:'stall',row,x:+x.toFixed(2),gapMs:+gap.toFixed(1),renderMs:+renderMs.toFixed(1),simulationMs:+simulationMs.toFixed(1)});flightDiagnosticRun.events=flightDiagnosticRun.events.slice(-60)}
}
const diagnosticBeginRun=beginRun;beginRun=function(...args){const previous=flightDiagnosticsEnabled?flightDiagnosticRun:null;diagnosticEnd('retry');const out=diagnosticBeginRun(...args);diagnosticStart();if(previous&&flightDiagnosticRun&&previous!==flightDiagnosticRun)diagnosticDecision(previous,previous.studyKey===flightDiagnosticRun.studyKey?'retry':previous.mode===flightDiagnosticRun.mode&&previous.stage===flightDiagnosticRun.stage?'map_change':previous.outcome==='clear'?'next_stage':'stage_change');return out};start=beginRun;
const diagnosticFinish=finish;finish=function(win,reason){
 if(flightDiagnosticsEnabled&&flightDiagnosticRun&&state==='play'){
  flightDiagnosticRun.events.push({type:win?'clear':'failure',row:Math.floor(z),x:+x.toFixed(2),y:+y.toFixed(2),speedKmh:+(speed*36).toFixed(1),fuel:+fuel.toFixed(1),gravity:gravityValue(),reason:win?'clear':reason});flightDiagnosticRun.events=flightDiagnosticRun.events.slice(-60);diagnosticEnd(win?'clear':'failure');
 }
 return diagnosticFinish(...arguments);
};result=finish;
const diagnosticPause=pause;pause=function(...args){flightDiagnosticLastFrame=null;diagnosticCheckpoint();return diagnosticPause(...args)};
const diagnosticMenu=showMenu;showMenu=function(...args){diagnosticEnd('menu');if(flightDiagnosticsEnabled)diagnosticDecision(flightDiagnosticRun,'menu');const out=diagnosticMenu(...args);syncFlightDiagnostics();return out};
function diagnosticPercentile(s){const target=Math.ceil(s.frames*.95);let n=0;for(let i=0;i<s.histogram.length;i++){n+=s.histogram[i];if(n>=target)return i===100?'500+':String((i+1)*5)}return '—'}
function diagnosticIntroRows(){
 const all=Object.values(flightDiagnosticStudy.stages).filter(s=>s?.mode==='story');
 return ['1-1','1-2','1-3'].map(stage=>{
  const versions=all.filter(s=>s.stage===stage),latestRun=[...flightDiagnosticRuns].reverse().find(r=>r.mode==='story'&&r.stage===stage),stat=versions.find(s=>s.mapRevision===latestRun?.mapRevision)||versions.at(-1)||null;
  const recent=stat?[...flightDiagnosticRuns].reverse().find(r=>r.studyKey==='story:'+stage+':'+stat.mapRevision)||null:null;
  const hotspots=Object.values(stat?.failureLocations||{}).filter(f=>Number.isFinite(f.row)&&f.count>0).sort((a,b)=>b.count-a.count||a.row-b.row).slice(0,3);
  return {stage,stat,recent,versions:versions.length,hotspots};
 });
}
function syncFlightDiagnostics(){
 $('diagnosticToggle').textContent='주행 진단 '+(flightDiagnosticsEnabled?'ON · 끄기':'OFF · 켜기');$('diagnosticToggle').setAttribute('aria-pressed',String(flightDiagnosticsEnabled));
 const latest=flightDiagnosticRuns.at(-1),stat=latest?diagnosticStudyRow(latest):null;
 $('diagnosticStudySummary').textContent=stat?stat.stage+' · 시도 '+stat.attempts+' / 실패 '+stat.failures+' / 재도전 '+stat.retries+' / 메뉴 이동 '+stat.menuExits+'\n최근 출발 대기 '+(latest.launchDelaySeconds===null||latest.launchDelaySeconds===undefined?'미출발':latest.launchDelaySeconds.toFixed(1)+'초')+' · '+(stat.firstClear?'테스트 첫 완주: '+stat.firstClear.attempt+'회째 / 누적 '+stat.firstClear.activeSeconds.toFixed(1)+'초':'테스트 첫 완주: 아직 없음'):'최근 상세 주행 기록이 없습니다.';if(stat)$('diagnosticStudySummary').textContent+='\n실패 후: 재도전 '+(stat.retryAfterFailure||0)+' / 메뉴 '+(stat.menuAfterFailure||0);$('diagnosticStatus').textContent=(flightDiagnosticsEnabled?'기록 중 · 다음 주행부터 적용됩니다. ':'기록 꺼짐 · ')+flightDiagnosticRuns.length+'회 보관 / 최대 20회';
 $('diagnosticReport').textContent=latest?latest.stage+' · '+latest.outcome+'\n'+Object.values(latest.segments||{}).filter(s=>s.frames).sort((a,b)=>b.maxFrameMs-a.maxFrameMs).slice(0,5).map(s=>s.from+'~'+s.to+'행: 평균 '+(s.totalFrameMs/s.frames).toFixed(1)+'ms / P95 ≤ '+diagnosticPercentile(s)+'ms / 최대 '+s.maxFrameMs.toFixed(1)+'ms / 50ms 초과 '+s.over50+'회').join('\n')+'\n'+(latest.events||[]).filter(e=>e.type==='failure').map(e=>e.row+'행 · '+e.reason).join('\n'):'상세 주행 기록이 없습니다. 진단을 켜고 문제 구간을 주행해 주세요.';
}
$('diagnosticToggle').onclick=()=>{if(flightDiagnosticsEnabled)diagnosticEnd('disabled');flightDiagnosticsEnabled=!flightDiagnosticsEnabled;flightDiagnosticLastFrame=null;syncFlightDiagnostics()};
$('diagnosticClear').onclick=()=>{flightDiagnosticRuns=[];flightDiagnosticRun=null;flightDiagnosticStudy={stages:{}};diagnosticPersist();syncFlightDiagnostics()};
$('diagnosticExport').onclick=()=>{diagnosticCheckpoint();const blob=new Blob([JSON.stringify({schema:2,study:flightDiagnosticStudy,notice:'Local opt-in flight diagnostics; frame gaps include browser scheduling. P95 uses 5ms buckets.',runs:flightDiagnosticRuns},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='starway-diagnostics.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
addEventListener('pagehide',diagnosticCheckpoint);document.addEventListener('visibilitychange',()=>{if(document.hidden)diagnosticCheckpoint();flightDiagnosticLastFrame=null});
syncFlightDiagnostics();

const diagnosticLaunchFromRest=launchFromRest;launchFromRest=function(...args){const out=diagnosticLaunchFromRest(...args);if(state==='play')diagnosticLaunch();return out};
let diagnosticStudyDepth=0;
const diagnosticStudyStep=step;step=function(dt){const run=flightDiagnosticRun;if(diagnosticStudyDepth===0&&flightDiagnosticsEnabled&&run?.outcome==='running'&&!document.hidden&&!globalThis.flightLifecycleSuspended&&['ready','play'].includes(state)){const elapsed=Math.max(0,Math.min(Number(dt)||0,.05));run.activeSeconds+=elapsed;if(state==='ready')run.readySeconds+=elapsed;}diagnosticStudyDepth++;try{const out=diagnosticStudyStep(...arguments);if(state==='play')diagnosticLaunch();return out}finally{diagnosticStudyDepth--}};
