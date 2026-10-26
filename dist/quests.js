// First quest edition: local KST daily rotation, persistent lifetime milestones.
const QUEST_TOTALS=[
 {id:'clears',name:'항로 완주',goals:[5,20,50,100],rewards:[80,160,300,600]},
 {id:'landings',name:'안전 착지',goals:[30,100,300,1000],rewards:[80,160,300,600]},
 {id:'coins',name:'주행 코인 수집',goals:[100,500,2000,5000],rewards:[80,200,500,1000]},
 {id:'ships',name:'우주선 수집',goals:[2,4,8,12],rewards:[80,200,500,1000]},
 {id:'upgrades',name:'기체 강화',goals:[3,10,30,60],rewards:[80,200,500,1000]}
];
let questTab='daily',questDirty=false,questSaveElapsed=0,questRewardReady=false;
function questDate(now=Date.now()){return new Date(now+9*3600000).toISOString().slice(0,10);}
function questNumber(v){return Number.isFinite(v)?Math.max(0,Math.min(1e9,v)):0;}
function normalizeQuests(raw){const stats=v=>Object.fromEntries(['clears','landings','coins','distance'].map(k=>[k,questNumber(v?.[k])])),q={totals:stats(raw?.totals),claims:{},daily:{date:/^\d{4}-\d{2}-\d{2}$/.test(raw?.daily?.date)?raw.daily.date:questDate(),...stats(raw?.daily),stages:[],claimed:[]}};
 q.daily.stages=Array.isArray(raw?.daily?.stages)?[...new Set(raw.daily.stages.filter(n=>Number.isInteger(n)&&n>=0&&n<30))]:[];
 q.daily.claimed=Array.isArray(raw?.daily?.claimed)?raw.daily.claimed.filter(n=>Number.isInteger(n)&&n>=0&&n<3):[];
 for(const d of QUEST_TOTALS)q.claims[d.id]=Array.isArray(raw?.claims?.[d.id])?[...new Set(raw.claims[d.id].filter(n=>Number.isInteger(n)&&n>=0&&n<4))]:[];return q;
}
function ensureQuests(){if(!data.quests)data.quests=normalizeQuests();const today=questDate();if(today>data.quests.daily.date){data.quests.daily={date:today,clears:0,landings:0,coins:0,distance:0,stages:[],claimed:[]};questDirty=true;}return data.quests;}
data.quests=normalizeQuests(data.quests);ensureQuests();
function dailyQuestDefs(){const day=ensureQuests().daily.date,index=Number(day.replaceAll('-',''))%3;return [{id:'clears',name:'항로 완주',goal:2,reward:60},...[ [{id:'landings',name:'안전 착지',goal:10,reward:50},{id:'distance',name:'누적 항해 거리',goal:500,reward:50}], [{id:'coins',name:'주행 코인 수집',goal:15,reward:50},{id:'distance',name:'누적 항해 거리',goal:500,reward:50}], [{id:'landings',name:'안전 착지',goal:10,reward:50},{id:'coins',name:'주행 코인 수집',goal:15,reward:50}] ][index]];}
function questEligible(){return mode==='story'&&!editorTesting&&!creatorActive;}
function addQuestProgress(id,amount){if(!(amount>0))return;const q=ensureQuests();q.totals[id]=questNumber(q.totals[id]+amount);q.daily[id]=questNumber(q.daily[id]+amount);questDirty=true;}
function flushQuests(){if(questDirty){save();if(storageOK)questDirty=false;}}
function totalQuestProgress(id){if(id==='ships')return new Set(data.owned).size;if(id==='upgrades')return data.owned.reduce((sum,id)=>sum+shipUpgradeKeys.reduce((s,k)=>s+(data.shipUpgrades[id]?.[k]||0),0),0);return ensureQuests().totals[id]||0;}
function claimQuest(kind,id,index){
 if(state!=='menu'||menuScreen!=='main')return false;const q=ensureQuests();let reward,claims;
 if(kind==='daily'){const d=dailyQuestDefs()[index];if(!d||d.id!==id||q.daily[id]<d.goal)return false;reward=d.reward;claims=q.daily.claimed;}
 else{const d=QUEST_TOTALS.find(d=>d.id===id);if(!d||!Number.isInteger(index)||index<0||index>=d.goals.length||totalQuestProgress(id)<d.goals[index])return false;reward=d.rewards[index];claims=q.claims[id];}
 if(claims.includes(index))return false;const before=JSON.stringify(q),balance=data.coins;claims.push(index);data.coins+=reward;save();if(!storageOK){data.coins=balance;data.quests=JSON.parse(before);$('questStatus').textContent='저장 실패 · 보상과 수령 상태를 복원했습니다.';renderQuests();return false;}
 questRewardReady=true;questDirty=false;$('questStatus').textContent='보상 수령 · ◈ '+reward;updateLobby();wallet();renderQuests();return true;
}
function claimableQuests(kind=questTab){
 const q=ensureQuests(),items=[];
 if(kind==='daily')dailyQuestDefs().forEach((d,i)=>{if(!q.daily.claimed.includes(i)&&q.daily[d.id]>=d.goal)items.push({id:d.id,index:i,reward:d.reward});});
 else if(kind==='total')for(const d of QUEST_TOTALS)for(let i=0;i<d.goals.length;i++)if(!q.claims[d.id].includes(i)&&totalQuestProgress(d.id)>=d.goals[i])items.push({id:d.id,index:i,reward:d.rewards[i]});
 return items;
}
function claimAllQuests(){
 if(state!=='menu'||menuScreen!=='main')return false;
 const kind=questTab,items=claimableQuests(kind);if(!items.length)return false;
 const q=ensureQuests(),before=JSON.stringify(q),coinsBefore=data.coins,reward=items.reduce((sum,item)=>sum+item.reward,0);
 for(const item of items)(kind==='daily'?q.daily.claimed:q.claims[item.id]).push(item.index);
 data.coins+=reward;save();
 if(!storageOK){data.coins=coinsBefore;data.quests=JSON.parse(before);renderQuests();$('questStatus').textContent='저장 실패 · 코인과 수령 상태를 복원했습니다.';return false;}
 questRewardReady=true;questDirty=false;wallet();updateLobby();renderQuests();$('questStatus').textContent=items.length+'개 보상 수령 · 총 ◈ '+reward;return true;
}
$('questClaimAll').onclick=claimAllQuests;
function questFlowWords(){return ({
 ko:{go:'도전하기',shop:'상점으로',upgrade:'강화하기',spend:'보상으로 강화하기',upgradeOpen:'우주선 강화',remaining:'남은 목표',complete:'완료 · 보상을 받을 수 있습니다.',claimed:'수령 완료',all:'전체 완료',claim:'보상 받기',units:{clears:'회',landings:'회',coins:'개',distance:'m',ships:'기',upgrades:'회'}},
 en:{go:'Take on quest',shop:'Open shop',upgrade:'Upgrade',spend:'Use rewards to upgrade',upgradeOpen:'Ship upgrades',remaining:'Remaining',complete:'Complete · Reward available.',claimed:'Claimed',all:'All complete',claim:'Claim reward',units:{clears:' clears',landings:' landings',coins:' coins',distance:' m',ships:' ships',upgrades:' upgrades'}},
 ja:{go:'挑戦する',shop:'ショップへ',upgrade:'強化する',spend:'報酬で強化する',upgradeOpen:'宇宙船強化',remaining:'残り目標',complete:'達成 · 報酬を受け取れます。',claimed:'受取済み',all:'全達成',claim:'報酬を受け取る',units:{clears:'回',landings:'回',coins:'個',distance:'m',ships:'機',upgrades:'回'}},
 zh:{go:'前往挑战',shop:'前往商店',upgrade:'升级',spend:'使用奖励升级',upgradeOpen:'飞船升级',remaining:'剩余目标',complete:'已完成，可领取奖励。',claimed:'已领取',all:'全部完成',claim:'领取奖励',units:{clears:'次',landings:'次',coins:'枚',distance:'m',ships:'艘',upgrades:'次'}}
 })[settings.language]||null;}
function closeQuestPanel(){$('questPanel').classList.add('hidden');flushQuests();}
function goQuestTarget(id){
 if(state!=='menu'||menuScreen!=='main')return false;
 closeQuestPanel();
 if(id==='ships')showMenu('shop');else if(id==='upgrades')openShipUpgrades();else showMenu('story');
 return true;
}
function questDisplayItems(){
 const q=ensureQuests(),defs=questTab==='daily'?dailyQuestDefs():QUEST_TOTALS;
 return defs.map((d,i)=>{let index=i,goal=d.goal,reward=d.reward,value=q.daily[d.id],claimed=q.daily.claimed.includes(i),all=false;
  if(questTab==='total'){index=d.goals.findIndex((_,n)=>!q.claims[d.id].includes(n));all=index<0;if(all)index=d.goals.length-1;goal=d.goals[index];reward=d.rewards[index];value=totalQuestProgress(d.id);claimed=all;}
  return {d,index,goal,reward,value,claimed,all,order:i,rank:claimed?2:value>=goal?0:1};
 }).sort((a,b)=>a.rank-b.rank||a.order-b.order);
}
function renderQuests(){
 const w=questFlowWords(),available=claimableQuests(),sum=available.reduce((s,item)=>s+item.reward,0);$('questClaimAll').disabled=!available.length;$('questClaimAll').textContent=available.length?'모두 받기 · ◈ '+sum:'모두 받기';
 const q=ensureQuests();$('questWallet').textContent='보유 코인 ◈ '+data.coins;$('questDailyTab').setAttribute('aria-pressed',String(questTab==='daily'));$('questTotalTab').setAttribute('aria-pressed',String(questTab==='total'));
 $('questRules').textContent=questTab==='daily'?q.daily.date+' · 매일 한국 시간 00시 초기화 · 전체 보상 160코인':'초기화 없는 단계형 목표 · 기체 수집·강화는 기존 보유분 반영';
 $('questUpgradeOpen').textContent=questRewardReady?w.spend:w.upgradeOpen;
 const grid=$('questCards');grid.innerHTML='';
 for(const {d,index,goal,reward,value,claimed,all,rank} of questDisplayItems()){
  const card=document.createElement('article');card.className='quest-card';card.id='quest-'+questTab+'-'+d.id;card.setAttribute('data-state',rank===0?'claimable':claimed?'claimed':'progress');
  const h=document.createElement('strong');h.textContent=d.name+(questTab==='total'?' · '+(index+1)+'단계':'');card.appendChild(h);
  const line=document.createElement('p');line.textContent=(d.id==='distance'?displayDistance(Math.min(value,goal)):Math.floor(Math.min(value,goal)))+' / '+(d.id==='distance'?displayDistance(goal):goal)+' · 보상 ◈ '+reward;card.appendChild(line);
  const progress=document.createElement('progress');progress.max=goal;progress.value=Math.min(value,goal);progress.setAttribute('aria-label',d.name+' 진행도');card.appendChild(progress);
  const remaining=document.createElement('small');remaining.className='quest-remaining';remaining.textContent=claimed?(all?w.all:w.claimed):rank===0?w.complete:w.remaining+' '+(d.id==='distance'?displayDistance(Math.max(0,Math.ceil(goal-value))):Math.max(0,Math.ceil(goal-value)))+(w.units[d.id]||'');card.appendChild(remaining);
  const button=document.createElement('button');button.type='button';button.disabled=claimed;button.textContent=claimed?(all?w.all:w.claimed):rank===0?w.claim:d.id==='ships'?w.shop:d.id==='upgrades'?w.upgrade:w.go;const kind=questTab;button.onclick=()=>rank===0?claimQuest(kind,d.id,index):goQuestTarget(d.id);card.appendChild(button);grid.appendChild(card);
 }
 flushQuests();
}
function openQuests(){if(state!=='menu'||menuScreen!=='main')return;questTab='daily';questRewardReady=false;$('questStatus').textContent='스토리·도전 항로 집계 · 에디터·창작맵 제외';$('questPanel').classList.remove('hidden');renderQuests();}
$('lobby-quests').onclick=openQuests;$('questClose').onclick=()=>{closeQuestPanel();updateLobby();};
$('questUpgradeOpen').onclick=()=>goQuestTarget('upgrades');
$('questDailyTab').onclick=()=>{questTab='daily';renderQuests();};$('questTotalTab').onclick=()=>{questTab='total';renderQuests();};
const questMenu=showMenu;showMenu=function(...args){$('questPanel').classList.add('hidden');flushQuests();return questMenu(...args);};
const questBegin=beginRun;beginRun=function(...args){ensureQuests();flushQuests();return questBegin(...args);};start=beginRun;
const questStep=step;step=function(dt){const eligible=state==='play'&&questEligible(),oldZ=z,oldCoins=runCoins,oldLandings=data.badges.stats.landings;const out=questStep(dt);if(eligible){addQuestProgress('distance',Math.max(0,z-oldZ));addQuestProgress('coins',Math.max(0,runCoins-oldCoins));addQuestProgress('landings',Math.max(0,data.badges.stats.landings-oldLandings));questSaveElapsed+=dt;if(questSaveElapsed>=1||state!=='play'){questSaveElapsed=0;flushQuests();}}return out;};
const questFinish=finish;finish=function(win,reason){const eligible=state==='play'&&questEligible(),stage=level,out=questFinish(win,reason);if(eligible&&win&&state==='win'){addQuestProgress('clears',1);const daily=ensureQuests().daily;if(!daily.stages.includes(stage))daily.stages.push(stage);flushQuests();}return out;};result=finish;
const questBackup=validateBackup;validateBackup=function(raw){const out=questBackup(raw);out.game.quests=normalizeQuests(raw.game.quests);return out;};
document.addEventListener('visibilitychange',()=>{if(document.hidden)flushQuests();});addEventListener('pagehide',flushQuests);
