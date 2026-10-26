// Dedicated local challenge courses reuse the custom-course simulation, never story records.
const CHALLENGES=[
 {id:'sprint',title:'타임어택 · 궤도 질주',tag:'TIME ATTACK',length:280,limit:32,fuel:100,reward:100,goals:['32초 안에 완주','25초 안에 완주','20초 안에 완주'],hint:'블록 사이를 조향하고 짧은 틈은 점프로 넘으세요.'},
 {id:'reserve',title:'연료 생존 · 마지막 항로',tag:'FUEL SURVIVAL',length:170,fuel:55,reward:120,goals:['제한 연료로 완주','12초 안에 완주','10초 안에 완주'],hint:'연료 보급을 활용해 빠르게 완주하세요.'},
 {id:'precision',title:'정밀 비행 · 별빛 회랑',tag:'PRECISION FLIGHT',length:190,fuel:100,reward:140,goals:['좁은 항로 완주','코인 6개 이상 모아 완주','코인 10개 모두 모아 완주'],hint:'한 칸 발판과 연결 구간을 따라 조향하세요. 코인은 경로 위에 놓여 있습니다.'}
];
function normalizeChallengeRules(raw,id){
 const defaults=id==='sprint'?{startFuel:100,timeLimit:32,silverTime:25,goldTime:20}:id==='reserve'?{startFuel:55,silverTime:12,goldTime:10}:{startFuel:100,silverCoins:6,goldCoins:10};
 const rules={...defaults};for(const key of Object.keys(defaults)){if(raw?.[key]===undefined)continue;const v=raw[key];if(!Number.isFinite(v))throw Error('도전 설정은 숫자로 입력하세요.');rules[key]=Math.round(v*100)/100;}
 if(rules.startFuel<1||rules.startFuel>100)throw Error('시작 연료는 1~100%로 설정하세요.');
 if(id==='sprint'&&!(rules.goldTime>=.1&&rules.goldTime<rules.silverTime&&rules.silverTime<rules.timeLimit&&rules.timeLimit<=3600))throw Error('타임어택은 0.1초 이상, 별 3개 시간 < 별 2개 시간 < 제한 시간(별 1개) 순서로 설정하세요.');
 if(id==='reserve'&&!(rules.goldTime>=.1&&rules.goldTime<rules.silverTime&&rules.silverTime<=3600))throw Error('연료 생존은 0.1초 ≤ 별 3개 시간 < 별 2개 시간 ≤ 3600초 순서로 설정하세요.');
 if(id==='precision'&&!(Number.isInteger(rules.silverCoins)&&Number.isInteger(rules.goldCoins)&&rules.silverCoins>=1&&rules.silverCoins<rules.goldCoins&&rules.goldCoins<=100))throw Error('코인 목표는 1 ≤ 별 2개 < 별 3개 ≤ 100개인 정수로 설정하세요.');
 return rules;
}
function effectiveChallenge(id){const base=CHALLENGES.find(d=>d.id===id);if(!base)return null;const rules=normalizeChallengeRules((data.challengeMaps?.[id]||CHALLENGE_MAP_TEMPLATES[id])?.challengeRules,id),d={...base,rules,fuel:rules.startFuel};
 if(id==='sprint'){d.limit=rules.timeLimit;d.goals=[rules.timeLimit+'초 안에 완주',rules.silverTime+'초 안에 완주',rules.goldTime+'초 안에 완주'];}
 if(id==='reserve'){d.hint='시작 연료 '+rules.startFuel+'% · 연료 보급을 활용해 빠르게 완주하세요.';d.goals=['제한 연료로 완주',rules.silverTime+'초 안에 완주',rules.goldTime+'초 안에 완주'];}
 if(id==='precision')d.goals=['좁은 항로 완주','코인 '+rules.silverCoins+'개 이상 모아 완주','코인 '+rules.goldCoins+'개 모아 완주'];
 return d;
}
const CHALLENGE_SHIP_STATS=Object.freeze({ship:0,speed:22,jump:7.8,fuel:1,levels:Object.freeze({speed:0,jump:0,fuel:0})});
let challengeActive=null,challengeReturn=null,challengeSettled=false,challengeFailureZ=null;
function normalizeChallenges(raw){const out={};for(const d of CHALLENGES){const r=raw?.[d.id];out[d.id]={stars:Number.isInteger(r?.stars)?Math.max(0,Math.min(3,r.stars)):0,best:r?.fixedRevision===1&&Number.isFinite(r?.best)&&r.best>0?r.best:null,fixedRevision:1,legacyBest:Number.isFinite(r?.legacyBest)?r.legacyBest:r?.fixedRevision!==1&&Number.isFinite(r?.best)?r.best:null,fuel:Number.isFinite(r?.fuel)?Math.max(0,Math.min(100,r.fuel)):0,coins:Number.isInteger(r?.coins)?Math.max(0,Math.min(500,r.coins)):0};}return out;}
data.challenges=normalizeChallenges(data.challenges);
function challengeCourse(d){
 if(CHALLENGE_MAP_TEMPLATES[d.id])return JSON.parse(JSON.stringify(CHALLENGE_MAP_TEMPLATES[d.id]));
 return legacyChallengeCourse(d);
}
function legacyChallengeCourse(d){
 const m=emptyEditorMap(d.length);m.title=d.title;m.fuelDrainMultiplier=d.id==='reserve'?.75:1;m.startSpeed=0;m.coins=[];m.jumpRows=[];m.sections=[];
 const base=d.id==='sprint'?'slate':d.id==='reserve'?'sand':'indigo';
 for(let r=0;r<d.length;r++){m.tiles[r]=[0,0,1,1,1,0,0];m.guide[r]=3;m.roadPaint[r]=Array(7).fill(base);}
 const road=(start,end,lanes)=>{for(let r=start;r<end;r++)m.tiles[r]=Array.from({length:7},(_,l)=>lanes.includes(l)?1:0);};
 const aim=(start,end,lane)=>{for(let r=start;r<end;r++)m.guide[r]=lane;};
 const wall=(start,end,lanes)=>{for(let r=start;r<end;r++)for(const l of lanes){m.tiles[r][l]=8;m.boxPaint[r][l]=d.id==='reserve'?'ochre':'electricBlue';}};
 const section=(start,end,name)=>m.sections.push({start,end,type:'custom',name,side:3});
 if(d.id==='sprint'){
  // Broad approaches allow a full lane change before the staggered barriers.
  road(28,116,[1,2,3,4,5]);road(174,240,[1,2,3,4,5]);
  aim(30,80,2);wall(42,46,[3,4]);aim(80,116,4);wall(98,102,[1,2,3]);
  aim(178,214,2);wall(190,194,[3,4,5]);aim(214,240,4);wall(226,230,[1,2,3]);
  for(const r of [62,154,246]){road(r,r+2,[]);m.jumpRows.push(r);}
  section(0,28,'출발 직선 · 속도를 올리세요');section(28,78,'왼쪽 통로 → 첫 점프');
  section(78,116,'오른쪽 통로로 전환');section(116,174,'중앙 정렬 → 두 번째 점프');
  section(174,240,'좌우 슬라럼 · 블록 사이를 조향');section(240,d.length,'중앙 점프 → 결승선');
 }else if(d.id==='reserve'){
  // No mandatory jumps or refills: only throttle efficiency and deliberate steering.
  wall(36,40,[3,4]);aim(24,50,2);wall(62,66,[2,3]);aim(50,76,4);
  wall(108,112,[3,4]);aim(96,126,2);wall(140,144,[2,3]);aim(126,150,4);
  section(0,24,'연료를 확인하며 빠르게 출발하세요');section(24,76,'엇갈린 통로 · 부드럽게 조향');
  section(76,96,'정비 직선 · 속도와 연료를 확인');section(96,150,'두 번째 슬라럼 · 남은 연료 관리');section(150,d.length,'중앙으로 복귀 → 결승선');
 }else{
  // Ten-row overlapping links prevent abrupt disconnected corners at full speed.
  let previous=3;
  for(const [start,end,lane]of [[26,62,2],[62,88,3],[88,116,4],[116,138,3],[138,160,2],[160,174,3]]){
   road(start,end,[lane]);road(start,Math.min(start+10,end),Array.from({length:Math.abs(lane-previous)+1},(_,i)=>Math.min(lane,previous)+i));aim(start,end,lane);previous=lane;
  }
  m.coins=[20,42,54,78,102,110,128,150,156,178].map(r=>[r,m.guide[r]]);
  section(0,26,'넓은 진입로 · 첫 코인을 수집');section(26,62,'왼쪽 한 칸 항로 · 연결로에서 이동');
  section(62,88,'중앙 쉼터 · 다음 발판을 확인');section(88,116,'오른쪽 한 칸 항로');section(116,160,'중앙 → 왼쪽 · 연속 조향');section(160,d.length,'중앙 복귀 · 마지막 코인과 결승선');
 }
 // Color shows the safe lane; bright transverse bars mark the lip of each jump.
 const accent=d.id==='sprint'?'electricBlue':d.id==='reserve'?'ochre':'lavender';
 for(let r=0;r<d.length;r++){const l=m.guide[r];if(m.tiles[r][l]===1)m.roadPaint[r][l]=accent;}
 for(const gap of m.jumpRows)for(let r=gap-3;r<gap;r++)for(let l=0;l<7;l++)if(m.tiles[r][l]===1)m.roadPaint[r][l]=r%2?'lemon':'slate';
 // Keep the landing and finish approach unobstructed and three lanes wide.
 road(d.length-16,d.length,[2,3,4]);aim(d.length-16,d.length,3);
 m.finish={row:d.length-5,lane:3,type:'road'};return m;
}
function challengeStars(d){const r=d.rules||normalizeChallengeRules(null,d.id);return (d.id==='sprint'||d.id==='reserve')?(time<=r.goldTime?3:time<=r.silverTime?2:1):(runCoins>=r.goldCoins?3:runCoins>=r.silverCoins?2:1);}
function closeChallengeRun(){if(!challengeActive)return;restoreEditorRun();if(challengeReturn){level=challengeReturn.level;mode=challengeReturn.mode;editorTestProfile=challengeReturn.profile;}challengeActive=null;challengeReturn=null;challengeSettled=false;$('challengeHud').classList.add('hidden');}
function renderChallenges(){
 data.challenges=normalizeChallenges(data.challenges);$('challengeWallet').textContent='보유 코인 ◈ '+data.coins+' · '+tr('지정 기체 · 스카우트')+' · 792 km/h / '+tr('점프')+' 7.80 / 100%';const grid=$('challengeCards');grid.innerHTML='';
 for(const d of CHALLENGES.map(d=>effectiveChallenge(d.id))){const record=data.challenges[d.id],card=document.createElement('article');card.className='challenge-card';const tag=document.createElement('small');tag.className='challenge-tag';tag.textContent=d.tag;card.appendChild(tag);const title=document.createElement('h3');title.className='challenge-name';title.textContent=d.title;card.appendChild(title);const hint=document.createElement('p');hint.className='challenge-hint';hint.textContent=d.hint+(data.challengeMaps?.[d.id]?' · 적용 중: '+data.challengeMaps[d.id].title+' / '+data.challengeMaps[d.id].tiles.length+'줄':'');card.appendChild(hint);const goals=document.createElement('ol');d.goals.forEach((goal,i)=>{const li=document.createElement('li');li.textContent=(i<record.stars?'★ ':'☆ ')+goal;goals.appendChild(li)});card.appendChild(goals);const best=document.createElement('p');best.className='challenge-record';best.textContent=(record.best?'최고 '+record.best.toFixed(2)+'초 · '+'★'.repeat(record.stars)+'☆'.repeat(3-record.stars):'완주 기록 없음')+(data.challengeMaps?.[d.id]?' · 수정 맵':'');card.appendChild(best);const reward=document.createElement('p');reward.className='challenge-reward';reward.textContent=record.stars===3?'보상 획득 완료':'첫 완주 ◈ '+d.reward+' · 추가 단계 ◈ 40';card.appendChild(reward);const button=document.createElement('button');button.type='button';button.className='challenge-play';button.textContent=record.stars?'재도전 →':'도전 →';button.onclick=()=>startChallenge(d.id);card.appendChild(button);if(developerModeEnabled){const edit=document.createElement('button');edit.type='button';edit.className='challenge-edit';edit.textContent='맵 편집';edit.onclick=()=>openChallengeEditor(d.id);card.appendChild(edit);}grid.appendChild(card);}
}
function openChallenges(){showMenu('main');$('challengePanel').classList.remove('hidden');$('challengeBrowse').classList.remove('hidden');$('challengeResult').classList.add('hidden');renderChallenges();}
function startChallenge(id){
 if(revenueBusy)return;const d=effectiveChallenge(id);if(!d)return;const previous=challengeReturn||{level,mode,profile:editorTestProfile};closeChallengeRun();creatorRestore();challengeReturn=previous;challengeActive=d;challengeSettled=false;challengeFailureZ=null;editorOriginalCourse=STORY_COURSES[0];STORY_COURSES[0]=challengeCourse(d);editorTesting=true;editorTestProfile={...stageProfiles[0],gravity:100};level=0;mode='story';$('challengePanel').classList.add('hidden');$('mapEditor').classList.add('hidden');beginRun();fuel=d.fuel;$('editorBackPlay').classList.add('hidden');$('challengeHud').classList.remove('hidden');syncCockpit();syncChallengeHud();
}
function syncChallengeHud(){if(!challengeActive)return;const d=challengeActive;$('challengeHud').textContent=translateDynamic(d.tag+' · '+(d.limit?'남은 시간 '+Math.max(0,d.limit-time).toFixed(1)+'초':d.id==='reserve'?'경과 '+time.toFixed(1)+'초 · 연료 '+Math.max(0,fuel).toFixed(0)+'%':'코인 '+runCoins+' / '+d.rules.goldCoins));$('sector').textContent=tr('도전 항로');$('segment').textContent=translateDynamic(sectionAt(Math.floor(z))?.name||d.title);$('ghostToggle').classList.add('hidden');}
function finishChallenge(win,reason){
 if(challengeSettled||!challengeActive||state!=='play')return;challengeSettled=true;const d=challengeActive;if(win&&d.limit&&time>d.limit){win=false;reason='시간 초과';}
 state=win?'win':'dead';clearTimeout(nextTimer);nextTimer=0;for(const k in keys)keys[k]=false;
 const before=JSON.stringify(data.challenges),balance=data.coins,record=data.challenges[d.id],stars=win?challengeStars(d):0,oldStars=record.stars;
 let reward=0;if(win){reward=(oldStars===0?d.reward:0)+Math.max(0,stars-Math.max(1,oldStars))*40;record.stars=Math.max(oldStars,stars);record.best=record.best?Math.min(record.best,time):time;record.fuel=Math.max(record.fuel,fuel);record.coins=Math.max(record.coins,runCoins);data.coins+=reward;}
 // Custom-course pickups are counted by physics but credited only here.
 data.coins+=runCoins;save();const stored=storageOK;if(!stored){data.challenges=JSON.parse(before);data.coins=balance;reward=0;}
 if(win){addQuestProgress('clears',1);flushQuests();}
 $('overlay').classList.add('hidden');$('challengeHud').classList.add('hidden');$('challengePanel').classList.remove('hidden');$('challengeBrowse').classList.add('hidden');$('challengeResult').classList.remove('hidden');$('challengeResultTitle').textContent=win?'도전 성공':'다시 도전하세요';$('challengeResultName').textContent=d.title;
 $('challengeResultStars').textContent=win?'★'.repeat(stars)+'☆'.repeat(3-stars):'☆☆☆';$('challengeResultDetails').textContent=win?time.toFixed(2)+'초 · 남은 연료 '+Math.max(0,fuel).toFixed(0)+'% · 수집 '+runCoins+'개':(reason||'항로 이탈')+' · 도달 '+displayDistance(flightDistance(challengeFailureZ??z))+' m';
 $('challengeResultReward').textContent=stored?'획득 코인 ◈ '+(reward+runCoins)+(reward?' · 신규 목표 보상 포함':win?' · 달성 보상은 최초 1회 지급':''):'저장 실패 · 이번 코인과 기록을 저장하지 못했습니다. 저장 공간을 확인한 뒤 재도전하세요.';
 const goals=$('challengeResultGoals');goals.innerHTML='';d.goals.forEach((goal,i)=>{const li=document.createElement('li');li.textContent=(i<stars?'★ ':'☆ ')+goal;goals.appendChild(li)});beep(win?900:80,.25);
}
const challengeFinish=finish;finish=function(win,reason){
 if(!challengeActive)return challengeFinish(win,reason);
 if(win||reason==='test'||reason==='연료 소진'||reason==='시간 초과')return finishChallenge(win,reason);
 if(state!=='play'||challengeSettled)return;challengeFailureZ=z;beginFailureSequence(reason);
};result=finish;
const challengeCompleteFailure=completeFailureSequence;completeFailureSequence=function(){return challengeActive?finishChallenge(false,deathReason):challengeCompleteFailure();};
const challengeStats=activeShipStats;activeShipStats=function(){return challengeActive?CHALLENGE_SHIP_STATS:challengeStats();};
const challengeQuestEligible=questEligible;questEligible=function(){return !!challengeActive||challengeQuestEligible();};
const challengeStep=step;step=function(dt){if(challengeActive&&state==='play'&&challengeActive.limit&&time>=challengeActive.limit){finishChallenge(false,'시간 초과');return;}const airborne=!!challengeActive&&state==='play'&&!grounded,descending=vy<0;const out=challengeStep(dt);if(challengeActive){if(airborne&&descending&&grounded&&state==='play')addQuestProgress('landings',1);syncChallengeHud();}return out;};
const challengeDraw=draw;draw=function(...args){const out=challengeDraw(...args);if(challengeActive)syncChallengeHud();return out;};
const challengeGrid=drawEditorRoadGrid;drawEditorRoadGrid=function(...args){if(!challengeActive)return challengeGrid(...args);};
const challengeMenu=showMenu;showMenu=function(...args){closeChallengeRun();$('challengePanel').classList.add('hidden');return challengeMenu(...args);};
const challengeHome=$('home').onclick;$('home').onclick=()=>challengeActive?openChallenges():challengeHome();
const challengeStart=$('start').onclick;$('start').onclick=()=>challengeActive?(state==='pause'?pause():startChallenge(challengeActive.id)):challengeStart();
$('lobby-challenges').onclick=openChallenges;$('challengeClose').onclick=()=>showMenu('main');$('challengeRetry').onclick=()=>challengeActive&&startChallenge(challengeActive.id);$('challengeList').onclick=openChallenges;
const challengeBackup=validateBackup;validateBackup=function(raw){const out=challengeBackup(raw);out.game.challenges=normalizeChallenges(raw.game.challenges);return out;};

const challengeReadability=courseReadabilityActive;courseReadabilityActive=function(){return !!challengeActive||challengeReadability();};

Object.assign(uiWords,{'지정 기체 · 스카우트':['Assigned ship · Scout','指定機体 · スカウト','指定飞船 · 侦察机'],'지정 기체·고정 성능 적용':['Assigned ship and fixed performance','指定機体・固定性能','指定飞船与固定性能']});globalThis.starwayChallengesReady=true;
