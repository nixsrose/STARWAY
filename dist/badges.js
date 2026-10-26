// Permanent achievement badges; no currency or gameplay advantage is awarded.
const BADGE_DEFS=[
 {id:'launch',name:'첫 항해',condition:'스토리 1-1 완주',goal:1,kind:'stage',stage:0,color:'#8ce8ef',shape:0,icon:'M25 41V24l7-9 7 9v17l-7-5z M25 33l-5 8h5m14-8 5 8h-5 M29 42l3 7 3-7'},
 {id:'redheat',name:'태양 돌파',condition:'1-1~1-3 모두 완주',goal:3,kind:'chapter',chapter:0,color:'#ffaf65',shape:1,icon:'M32 46c-17-2-11-18-5-23-1 7 3 8 4 5l4-12c2 11 16 20 8 27-3 3-7 4-11 3z'},
 {id:'orbital',name:'궤도 항해사',condition:'2-1~2-3 모두 완주',goal:3,kind:'chapter',chapter:1,color:'#6fd8ff',shape:0,icon:'M39 25a10 10 0 1 0 0 14 M16 41c-5-5 27-27 32-18s-27 26-32 18z M42 19l3-3'},
 {id:'lunar',name:'달의 경계',condition:'3-1~3-3 모두 완주',goal:3,kind:'chapter',chapter:2,color:'#c4b7ff',shape:2,icon:'M38 16a17 17 0 1 0 10 26A17 17 0 0 1 38 16z M42 20v8m-4-4h8'},
 {id:'junction',name:'분기점 돌파',condition:'4-1~4-3 모두 완주',goal:3,kind:'chapter',chapter:3,color:'#ffd06c',shape:1,icon:'M32 48V32L20 20m12 12 12-12 M15 23l5-8 5 8m14 0 5-8 5 8 M27 43h10'},
 {id:'mist',name:'안개 너머',condition:'5-1~5-3 모두 완주',goal:3,kind:'chapter',chapter:4,color:'#a7ded7',shape:2,icon:'M16 29h32M19 35h26M16 41h32 M25 23l7-9 7 9 M27 47h10'},
 {id:'asteroid',name:'운석 회피자',condition:'6-1~6-3 모두 완주',goal:3,kind:'chapter',chapter:5,color:'#daa67e',shape:1,icon:'M26 22l13-4 9 12-7 16-17-3-6-11z M29 27l7-2 5 8-7 6-7-5z M18 15l-4 5m4 23-5 6m34-32 4-4'},
 {id:'nebula',name:'성운 관문',condition:'7-1~7-3 모두 완주',goal:3,kind:'chapter',chapter:6,color:'#dc9dff',shape:2,icon:'M20 44V27a12 12 0 0 1 24 0v17 M26 44V28a6 6 0 0 1 12 0v16 M16 45h32 M30 34l2-4 2 4 4 2-4 2-2 4-2-4-4-2z'},
 {id:'all',name:'STARWAY 개척자',condition:'스토리 21개 스테이지 모두 완주',goal:STORY_VISIBLE_COUNT,kind:'all',color:'#ffe39b',shape:2,icon:'M23 49V16l22 4-8 8 8 8-22-4 M17 49h16 M28 21l3 1m-3 5 3 1'},
 {id:'gold',name:'골든 파일럿',condition:'1-1~1-3 모두 금메달 획득',goal:3,kind:'gold',color:'#ffd659',shape:0,icon:'M24 17h16v15c0 12-16 12-16 0z M24 21h-8v9c0 6 8 8 10 7m14-16h8v9c0 6-8 8-10 7 M32 41v6m-9 2h18'},
 {id:'distance500',name:'심우주 정찰',condition:'무한모드 한 번의 주행에서 500m 도달',goal:500,kind:'distance',color:'#8cc9ff',shape:1,icon:'M32 16l7 16-7 16-7-16z M16 32h8m16 0h8 M32 10v4m0 36v4'},
 {id:'distance1000',name:'천 미터의 궤적',condition:'무한모드 한 번의 주행에서 1,000m 도달',goal:1000,kind:'distance',color:'#93aaff',shape:0,icon:'M37 27l10-12M31 23l9-13M41 33l12-10 M22 44a10 10 0 1 0 14-14 10 10 0 0 0-14 14z M25 37l5-4 4 5-5 4z'},
 {id:'distance3000',name:'은하 횡단자',condition:'무한모드 한 번의 주행에서 3,000m 도달',goal:3000,kind:'distance',color:'#e3a6ff',shape:2,icon:'M32 25c20-12 27 6 11 17-16 12-32-3-24-16 9-14 26-4 20 7-5 8-18 2-11-5 M12 16l3 3m33 28 3 3 M31 12v5'},
 {id:'landings',name:'착지의 달인',condition:'점프 후 0.3초간 안전한 착지 누적 100회',goal:100,kind:'stat',stat:'landings',color:'#89e4b1',shape:2,icon:'M21 20l11 15 11-15 M26 32l6 6 6-6 M15 43h34 M20 49h24'},
 {id:'records',name:'기록 파괴자',condition:'스토리 기존 최고기록을 0.05초 이상 단축 5회',goal:5,kind:'stat',stat:'records',color:'#ff9b9b',shape:1,icon:'M28 14h8m-4 0v6 M43 19l4 4 M32 48a14 14 0 1 0 0-28 14 14 0 0 0 0 28z M32 25v10l8-5 M14 42l7-4'},
 {id:'coins',name:'별빛 수집가',condition:'주행 중 코인 누적 1,000개 수집',goal:1000,kind:'stat',stat:'coins',color:'#f7d782',shape:0,icon:'M27 43a13 13 0 1 1 0-26 13 13 0 0 1 0 26z M27 23l6 7-6 7-6-7z M43 29a11 11 0 0 1-5 20 M44 13v8m-4-4h8'}
];
BADGE_DEFS.push({id:'challenge9',name:'도전 항로 정복자',condition:'도전 항로 3종에서 별 9개 달성',goal:9,kind:'challenge',color:'#ffe29a',shape:2,icon:'M32 10l6 14 15 2-11 10 3 16-13-8-13 8 3-16-11-10 15-2z'});
function normalizeBadgeState(raw){const input=raw&&typeof raw==='object'?raw:{},stats={},unlocked={};for(const key of ['landings','records','coins','distance'])stats[key]=Number.isSafeInteger(input.stats?.[key])&&input.stats[key]>=0?Math.min(1e9,input.stats[key]):0;for(const d of BADGE_DEFS)if(typeof input.unlocked?.[d.id]==='string'&&input.unlocked[d.id].length<40)unlocked[d.id]=input.unlocked[d.id];return {version:1,stats,unlocked}}
function ensureBadgeState(){data.badges=normalizeBadgeState(data.badges)}ensureBadgeState();
let badgeSelected=0,badgePage=0,badgePendingLanding=null,badgeJumpArmed=false,badgeDirty=false,badgeSaveElapsed=0,badgeToastUntil=0;
function badgeRunEligible(){return (mode==='story'||mode==='endless')&&!editorTesting&&!creatorActive}
function badgeProgress(d){const b=data.badges;if(d.kind==='challenge')return challengeStarTotal();if(d.kind==='stage')return data.cleared.includes(d.stage)?1:0;if(d.kind==='chapter')return [0,1,2].filter(i=>data.cleared.includes(d.chapter*3+i)).length;if(d.kind==='all')return new Set(data.cleared.filter(i=>i>=0&&i<STORY_VISIBLE_COUNT)).size;if(d.kind==='gold')return [0,1,2].filter(i=>medalTier(i)==='gold').length;if(d.kind==='distance')return Math.floor(Math.max(data.best||0,b.stats.distance));return b.stats[d.stat]||0}
function flushBadges(){if(!badgeDirty)return;save();if(storageOK){badgeDirty=false;badgeSaveElapsed=0}}
function awardBadges(notify=true){const fresh=[];for(const d of BADGE_DEFS)if(!data.badges.unlocked[d.id]&&badgeProgress(d)>=d.goal){data.badges.unlocked[d.id]=new Date().toISOString();fresh.push(d);badgeDirty=true}if(fresh.length&&notify){$('badgeToast').textContent='배지 획득 · '+fresh.map(d=>d.name).join(' · ');$('badgeToast').classList.remove('hidden');badgeToastUntil=performance.now()+3500}return fresh}
// Geometry-native relief badges: no image sheet, texture, glow or shared frame.
const BADGE_RELIEF=[
 ['M32 5 39 24 56 43 55 49 38 43 38 55 26 55 26 43 9 49 8 43 25 24Z','M32 14 36 31 32 36 28 31Z'],
 ['M32 4 37 14 47 9 47 20 59 21 52 31 59 40 47 43 46 55 36 50 29 60 24 49 12 53 14 41 4 35 14 28 8 17 21 18 23 6Z','M32 19a13 13 0 1 0 0 26 13 13 0 0 0 0-26Z'],
 ['M32 10a22 22 0 1 0 0 44 22 22 0 0 0 0-44Z M6 43 52 12 59 17 12 50Z','M32 19a13 13 0 1 0 0 26 13 13 0 0 0 0-26Z'],
 ['M40 7C12 3 1 33 18 51 31 64 51 54 57 40 34 49 18 22 40 7Z','M44 13 47 21 55 24 47 27 44 35 41 27 33 24 41 21Z'],
 ['M25 5 39 5 39 22 56 22 56 37 39 37 39 57 25 57 25 37 8 37 8 22 25 22Z','M29 12 35 12 35 26 48 26 48 32 35 32 35 49 29 49 29 32 16 32 16 26 29 26Z'],
 ['M32 4 49 19 57 40 43 56 20 56 7 40 15 19Z','M32 12 40 27 35 46 25 46 23 27Z'],
 ['M23 6 45 10 58 29 50 50 28 59 9 43 5 24Z','M22 20 34 16 43 28 36 40 20 36Z'],
 ['M32 4 38 17 53 12 49 27 61 35 46 40 45 56 32 48 19 56 18 40 3 35 15 27 11 12 26 17Z','M32 20 41 32 32 44 23 32Z'],
 ['M32 4 51 13 51 29 58 17 60 38 48 52 32 61 16 52 4 38 6 17 13 29 13 13Z','M32 15 36 25 47 26 39 33 42 44 32 38 22 44 25 33 17 26 28 25Z'],
 ['M17 6 27 6 32 16 37 6 47 6 42 26 51 35 48 49 32 60 16 49 13 35 22 26Z','M32 27 36 35 45 36 38 42 40 51 32 46 24 51 26 42 19 36 28 35Z'],
 ['M32 4 53 32 42 32 42 49 32 59 22 49 22 32 11 32Z','M32 14 40 30 32 39 24 30Z'],
 ['M32 4 42 18 56 13 50 31 42 36 42 49 32 59 22 49 22 36 14 31 8 13 22 18Z','M32 15 39 29 32 40 25 29Z'],
 ['M32 3 41 18 58 8 52 27 44 33 57 27 50 43 40 48 32 61 24 48 14 43 7 27 20 33 12 27 6 8 23 18Z','M32 19 40 33 32 47 24 33Z'],
 ['M22 6 42 6 49 27 44 36 53 47 58 47 58 54 42 54 42 48 35 39 29 39 22 48 22 54 6 54 6 47 11 47 20 36 15 27Z','M27 13 37 13 40 27 35 32 29 32 24 27Z'],
 ['M25 4 39 4 39 12 47 16 52 11 58 17 52 23 57 38 50 53 32 61 14 53 7 38 12 23 17 16 25 12Z','M29 20 35 20 35 33 45 29 48 35 32 43 29 39Z'],
 ['M25 7a22 22 0 1 0 0 44 22 22 0 0 0 0-44Z M43 23 58 28 60 43 50 56 35 59 28 51 45 42Z','M25 17 35 29 25 41 15 29Z']
];
// Restrained machined relief with individually engraved task details.
const BADGE_ENGRAVING=[
 'M24 34 18 43 27 40M40 34 46 43 37 40M29 43v8m6-8v8',
 'M29 22c-5 6 0 8 1 6l4-6c-1 6 7 9 3 14-5 5-14-1-8-7',
 'M20 36c6 3 17-1 24-10M23 24l4-3m10 19 3-3',
 'M18 28l-3 5m5 6 4 4M28 47l5 1',
 'M18 23v7h8m20-7v7h-8M29 41h6m-6 5h6',
 'M20 36h24M19 42h26M23 49h18',
 'M15 29l4-9m18 26 7-4m-15 8 6 1',
 'M20 25 26 20m12 24 6-5M32 25v14',
 'M19 21v18l6 8m20-26v18l-6 8M27 51h10',
 'M22 13l3 8m17-8-3 8M25 51l7 5 7-5',
 'M27 44l5 5 5-5M29 53h6',
 'M17 22l6 8m24-8-6 8M27 46l5 5 5-5',
 'M15 18l8 9m26-9-8 9M21 40l5 3m17-3-5 3M29 51l3 4 3-4',
 'M20 44l-5 6m29-6 5 6M27 36h10M29 17v9m6-9v9',
 'M20 24l-3 4m27-4 3 4M16 39h3m26 0h3M24 51l3-3m13 3-3-3',
 'M12 26v7m24-7v7M39 49l9-3 5-7'
];
BADGE_RELIEF.push(['M32 3 42 15 57 18 53 34 57 49 42 53 32 64 22 53 7 49 11 34 7 18 22 15Z','M32 17 37 28 49 29 40 37 43 49 32 43 21 49 24 37 15 29 27 28Z']);
BADGE_ENGRAVING.push('M19 19l4 5m22-5-4 5M16 42l6-2m26 2-6-2 M29 54h6');
function badgeTone(hex,k){return '#'+[1,3,5].map(i=>Math.max(0,Math.min(255,Math.round(parseInt(hex.slice(i,i+2),16)*k))).toString(16).padStart(2,'0')).join('')}
function badgeSVG(d,locked=false){const i=Math.max(0,BADGE_DEFS.indexOf(d)),[outline,detail]=BADGE_RELIEF[i],uid='badge-'+d.id+(locked?'-locked':'-earned'),gold=['all','gold','distance3000','coins','challenge9'].includes(d.id),rim=gold?['#fff0bd','#b99750','#6e5029']:['#e6f2f7','#859eaf','#344e63'],body=gold?['#af8a4a','#5c482d']:['#607e93','#263e52'];
 if(locked)return '<svg class="badge-relief locked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 68" aria-hidden="true"><path d="'+outline+'" fill="#405566" transform="translate(0 1)"/><path d="'+outline+'" fill="#081522" stroke="#07111c" stroke-width="1.6"/></svg>';
 const gradient=(name,stops)=>'<linearGradient id="'+uid+name+'" x1="0" y1="0" x2=".75" y2="1">'+stops.map(([at,c])=>'<stop offset="'+at+'" stop-color="'+c+'"/>').join('')+'</linearGradient>';
 return '<svg class="badge-relief" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 68" aria-hidden="true"><defs>'+gradient('rim',[[0,rim[0]],[.3,rim[1]],[.48,rim[0]],[.53,rim[1]],[1,rim[2]]])+gradient('body',[[0,body[0]],[.55,body[1]],[1,rim[2]]])+gradient('enamel',[[0,'#f3f8f7'],[.23,d.color],[.65,badgeTone(d.color,.8)],[1,badgeTone(d.color,.45)]])+'<clipPath id="'+uid+'clip"><path d="'+outline+'"/></clipPath></defs><path d="'+outline+'" fill="#020a13" transform="translate(0 4)"/><path d="'+outline+'" fill="'+rim[2]+'" stroke="'+rim[2]+'" stroke-width="1.5" transform="translate(0 2)"/><path d="'+outline+'" fill="url(#'+uid+'rim)" stroke="'+rim[0]+'" stroke-width=".45" stroke-linejoin="round"/><path d="'+outline+'" fill="url(#'+uid+'body)" stroke="#08121c" stroke-opacity=".7" stroke-width=".7" transform="translate(3.2 3.2) scale(.9)"/><g clip-path="url(#'+uid+'clip)"><path d="M0 7 64 0 12 44 0 48Z" fill="#f1faff" opacity=".07"/><path d="'+BADGE_ENGRAVING[i]+'" fill="none" stroke="#071725" stroke-width="1.7" stroke-linecap="round" transform="translate(0 .6)"/><path d="'+BADGE_ENGRAVING[i]+'" fill="none" stroke="'+rim[0]+'" stroke-opacity=".65" stroke-width=".65" stroke-linecap="round"/></g><path d="'+detail+'" fill="#081420" stroke="#0a1520" stroke-width="1.4" transform="translate(0 1.1)"/><path d="'+detail+'" fill="url(#'+uid+'enamel)" stroke="'+d.color+'" stroke-width=".6" stroke-linejoin="round"/></svg>';
}
function renderBadgePanel(){ensureBadgeState();awardBadges(false);flushBadges();const grid=$('badgeGrid');grid.innerHTML='';grid.style.gridTemplateRows='repeat('+Math.ceil(BADGE_DEFS.length/4)+',minmax(0,1fr))';$('badgeCount').textContent='획득 '+Object.keys(data.badges.unlocked).length+' / '+BADGE_DEFS.length;BADGE_DEFS.forEach((d,i)=>{const earned=!!data.badges.unlocked[d.id],button=document.createElement('button');button.className='badge-card'+(earned?' earned':'');button.setAttribute('aria-pressed',String(i===badgeSelected));button.setAttribute('aria-label',d.name+' · '+(earned?'획득':'미획득'));button.innerHTML=badgeSVG(d,!earned)+'<span>'+d.name+'</span>';button.onclick=()=>{badgeSelected=i;renderBadgePanel()};grid.appendChild(button)});const d=BADGE_DEFS[badgeSelected],earned=data.badges.unlocked[d.id],value=Math.min(d.goal,badgeProgress(d));$('badgeDetailIcon').innerHTML=badgeSVG(d,!earned);$('badgeDetailName').textContent=d.name+(earned?' · 획득':' · 미획득');$('badgeCondition').textContent=d.kind==='distance'?translateDynamic(d.condition).replace(/[\d,]+\s*m/,displayDistance(d.goal).toLocaleString()+'m'):d.condition;$('badgeProgress').textContent=(d.kind==='distance'?displayDistance(value):value).toLocaleString()+' / '+(d.kind==='distance'?displayDistance(d.goal):d.goal).toLocaleString();$('badgeProgressBar').value=value;$('badgeProgressBar').max=d.goal;$('badgeRules').textContent='안전 착지·코인 수집·기록 경신은 업데이트 후부터 누적됩니다. 에디터 시험 주행·창작맵은 제외합니다.';}
const badgesMenu=showMenu;showMenu=function(tab='main'){if(tab==='badges'){flushBadges();badgesMenu('records');menuScreen='badges';$('overlay').setAttribute('data-screen','badges');$('title').textContent='도전 배지';$('home').textContent='뒤로';renderBadgePanel();return}flushBadges();return badgesMenu(...arguments)};
$('badgesOpen').onclick=()=>showMenu('badges');const badgesHome=$('home').onclick;$('home').onclick=()=>menuScreen==='badges'?showMenu('modes'):badgesHome();
const badgesBegin=beginRun;beginRun=function(...args){badgePendingLanding=null;badgeJumpArmed=false;flushBadges();ensureBadgeState();return badgesBegin(...args)};
const badgesJump=jump;jump=function(...args){const before=grounded,out=badgesJump(...args);if(before&&!grounded&&state==='play'&&badgeRunEligible()){badgeJumpArmed=true;badgePendingLanding=null}return out};
const badgesStep=step;step=function(dt){const playing=state==='play',eligible=playing&&badgeRunEligible(),oldCoins=runCoins,wasGrounded=grounded,incoming=vy,out=badgesStep(dt);if(!eligible)return out;const stats=data.badges.stats,delta=Math.max(0,runCoins-oldCoins);if(delta){stats.coins=Math.min(1e9,stats.coins+delta);badgeDirty=true}if(mode==='endless'&&Math.floor(z)>stats.distance){stats.distance=Math.floor(z);badgeDirty=true}if(state!=='play'){badgePendingLanding=null;badgeJumpArmed=false}else{
 if(badgePendingLanding){if(!grounded)badgePendingLanding=null;else{badgePendingLanding-=dt;if(badgePendingLanding<=0){stats.landings=Math.min(1e9,stats.landings+1);badgeDirty=true;badgePendingLanding=null}}}
 if(!wasGrounded&&grounded&&incoming< -1&&badgeJumpArmed){badgePendingLanding=.3;badgeJumpArmed=false}
 }
 badgeSaveElapsed+=dt;if(badgeDirty||mode==='endless')awardBadges();if(badgeSaveElapsed>=1||state!=='play')flushBadges();return out};
const badgesFinish=finish;finish=function(win,reason){const eligible=state==='play'&&badgeRunEligible(),previous=eligible&&mode==='story'?data.storyTimes[level]?.best:null,out=badgesFinish(...arguments);if(eligible){if(win&&mode==='story'&&state==='win'&&Number.isFinite(previous)&&previous-time>=.05-1e-7){data.badges.stats.records++;badgeDirty=true}awardBadges();flushBadges()}return out};result=finish;
const badgesDraw=draw;draw=function(...args){const out=badgesDraw(...args);if(badgeToastUntil&&performance.now()>badgeToastUntil){$('badgeToast').classList.add('hidden');badgeToastUntil=0}return out};
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushBadges()});addEventListener('pagehide',flushBadges);
const badgeBackupValidator=validateBackup;validateBackup=function(raw){const out=badgeBackupValidator(raw);out.game.badges=normalizeBadgeState(raw.game.badges);return out};
awardBadges(false);flushBadges();
