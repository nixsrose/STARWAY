// Individual hull progression. Physics hooks keep the editor's reference profile available.
const shipBaseStats=[
 [15.4,6.55,.78],[18,6.4,.70],[16,7.25,.74],[18.5,6.6,.72],
 [15.8,6.8,.90],[17.2,7,.80],[16.4,7.3,.76],[17.8,6.5,.84],
 [17,7.15,.73],[16.6,6.9,.88],[18.2,6.7,.77],[16.2,7.1,.86]
];
const shipUpgradeCosts=[80,160,300,500,800],shipUpgradeKeys=['speed','jump','fuel'];
let shipRunStats=null,shipUpgradeSelection=0,shipUpgradePending=null,shipUpgradeFeedback=null,shipUpgradeReturnToStory=false;
function normalizeShipUpgrades(raw){const out={};for(let i=0;i<skins.length;i++){const row=raw?.[i];out[i]={};for(const key of shipUpgradeKeys)out[i][key]=Number.isInteger(row?.[key])?Math.max(0,Math.min(5,row[key])):0;}return out;}
data.shipUpgrades=normalizeShipUpgrades(data.shipUpgrades);
function shipStats(id,upgrades=data.shipUpgrades){const b=shipBaseStats[id]||shipBaseStats[0],u=upgrades?.[id]||{};return {ship:id,speed:b[0]+1.4*(u.speed||0),jump:b[1]+.38*(u.jump||0),fuel:b[2]+.10*(u.fuel||0),levels:{speed:u.speed||0,jump:u.jump||0,fuel:u.fuel||0}};}
function activeShipStats(){if(!globalThis.starwayUpgradesReady||(editorTesting&&$('editorTestPerformance').value!=='ship'))return {speed:22,jump:7.8,fuel:1};return shipRunStats||shipStats(data.skin);}
function shipSpeedCap(){return activeShipStats().speed;}
function shipJumpPower(){return activeShipStats().jump;}
function shipFuelEfficiency(){return activeShipStats().fuel;}
function shipUpgradeCost(id,key){const lv=data.shipUpgrades[id]?.[key]||0;return lv>=5?0:Math.round(shipUpgradeCosts[lv]*(1+id*.12)/10)*10;}
const upgradedBegin=beginRun;beginRun=function(...args){shipRunStats=shipStats(data.skin);return upgradedBegin(...args);};start=beginRun;
const upgradedFinish=finish;finish=function(win,reason){const previous=data.storyTimes[level]?.best,eligible=state==='play'&&win&&mode==='story'&&!editorTesting&&!creatorActive,stats=JSON.parse(JSON.stringify(shipRunStats||shipStats(data.skin)));const out=upgradedFinish(win,reason);if(eligible&&(!previous||time<previous)&&data.storyTimes[level]){data.storyTimes[level].equipment=stats;save();}return out;};result=finish;
const upgradedGhostKey=ghostMapKey;ghostMapKey=function(){return upgradedGhostKey()+'-stats-'+JSON.stringify(shipRunStats||shipStats(data.skin));};
function closeShipUpgrades(){shipUpgradeReturnToStory=false;shipUpgradePending=null;shipUpgradeFeedback=null;$('shipUpgradePanel').classList.add('hidden');}
function upgradeText(key){return ({ko:{missing:'부족',quests:'퀘스트',done:'강화 완료'},en:{missing:'Need',quests:'Quests',done:'Upgrade complete'},ja:{missing:'不足',quests:'クエスト',done:'強化完了'},zh:{missing:'还差',quests:'任务',done:'升级完成'}})[settings.language]?.[key]||key;}
function renderShipUpgradePanel(){
 const id=shipUpgradeSelection,stats=shipStats(id),owned=data.owned.includes(id);
 const fleet=ownedUpgradeShips();$('shipUpgradeSelectionInfo').textContent=(id===data.skin?'장착 중':'보유 기체')+' · '+(fleet.indexOf(id)+1)+' / '+fleet.length;$('shipUpgradePrev').disabled=fleet.length<2;$('shipUpgradeNext').disabled=fleet.length<2;
 $('shipUpgradeTitle').textContent=skins[id][0]+' · 업그레이드';$('shipUpgradeWallet').textContent='보유 코인 ◈ '+data.coins+' · 최대 Lv.5';
 paintShopShip($('shipUpgradePreview'),id,true);
 const numbers=$('shipUpgradeNumbers');numbers.innerHTML='';for(const [label,value] of [['최대 속도 (km/h)',(stats.speed*36).toFixed(1)],['점프 출력',stats.jump.toFixed(2)],['연료 효율',Math.round(stats.fuel*100)+'%']]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;numbers.appendChild(dt);numbers.appendChild(dd);}
 const grid=$('shipUpgradeCards');grid.innerHTML='';
 for(const key of shipUpgradeKeys){const lv=stats.levels[key],cost=shipUpgradeCost(id,key),next=shipStats(id,{[id]:{...stats.levels,[key]:Math.min(5,lv+1)}}),label={speed:'최대 속도',jump:'점프 출력',fuel:'연료 효율'}[key],format=v=>key==='speed'?(v*36).toFixed(1)+' km/h':key==='jump'?v.toFixed(2):Math.round(v*100)+'%';
 const card=document.createElement('div');card.className='ship-upgrade-card'+(shipUpgradeFeedback?.ship===id&&shipUpgradeFeedback.key===key?' upgrade-success':'');const title=document.createElement('strong');title.textContent=label+' · Lv.'+lv+'/5';card.appendChild(title);
 const gauge=document.createElement('div');gauge.className='ship-upgrade-gauge';gauge.setAttribute('role','meter');gauge.setAttribute('aria-label',label+' 강화 단계');gauge.setAttribute('aria-valuemin','0');gauge.setAttribute('aria-valuemax','5');gauge.setAttribute('aria-valuenow',String(lv));for(let i=0;i<5;i++){const cell=document.createElement('i');cell.className=i<lv?'filled':i===lv?'next':'';gauge.appendChild(cell);}card.appendChild(gauge);
 const detail=document.createElement('p');detail.textContent=lv<5?format(stats[key])+' → '+format(next[key]):'MAX · '+format(stats[key]);card.appendChild(detail);
 const button=document.createElement('button');button.id='upgradeShip'+key;button.type='button';button.disabled=!owned||lv>=5;button.textContent=!owned?'기체 구매 후 강화 가능':lv>=5?'MAX':data.coins<cost?upgradeText('missing')+' ◈ '+(cost-data.coins)+' · '+upgradeText('quests'):shipUpgradePending===key?'확인 · ◈ '+cost+' 사용':'강화 · ◈ '+cost;button.onclick=()=>{if(owned&&lv<5&&data.coins<cost){closeShipUpgrades();openQuests();}else purchaseShipUpgrade(key);};card.appendChild(button);grid.appendChild(card);
 }
}
function purchaseShipUpgrade(key){
 const id=shipUpgradeSelection;if(menuScreen!=='main'||!shipUpgradeKeys.includes(key)||!data.owned.includes(id))return false;
 const cost=shipUpgradeCost(id,key);if(!cost||data.coins<cost)return false;
 if(shipUpgradePending!==key){shipUpgradePending=key;$('shipUpgradeStatus').textContent='코인을 사용해 영구 강화합니다. 같은 버튼을 다시 누르면 구매합니다.';renderShipUpgradePanel();return false;}
 const before=shipStats(id)[key];shipUpgradeFeedback=null;const oldCoins=data.coins,old=JSON.stringify(data.shipUpgrades);data.coins-=cost;data.shipUpgrades[id][key]++;save();
 if(!storageOK){data.coins=oldCoins;data.shipUpgrades=JSON.parse(old);$('shipUpgradeStatus').textContent='저장하지 못했습니다. 코인과 강화 단계를 복원했습니다.';}else {shipUpgradeFeedback={ship:id,key};const f=v=>key==='speed'?(v*36).toFixed(1)+' km/h':key==='jump'?v.toFixed(2):Math.round(v*100)+'%';$('shipUpgradeStatus').textContent=upgradeText('done')+' · '+f(before)+' → '+f(shipStats(id)[key]);}
 shipUpgradePending=null;wallet();updateLobby();renderShipUpgradePanel();return storageOK;
}
function openShipUpgrades(){
 if(menuScreen!=='main'||state!=='menu')return;
 shipUpgradeReturnToStory=false;shipUpgradeSelection=data.skin;shipUpgradePending=null;shipUpgradeFeedback=null;
 $('shipUpgradeStatus').textContent='연료 효율이 높을수록 연료 소모가 줄어듭니다.';
 $('shipUpgradePanel').classList.remove('hidden');renderShipUpgradePanel();
}
$('lobby-upgrades').onclick=openShipUpgrades;
function cycleShipUpgrade(direction){
 const owned=ownedUpgradeShips();if(owned.length<2)return;
 const index=owned.indexOf(shipUpgradeSelection);shipUpgradeSelection=owned[(Math.max(0,index)+direction+owned.length)%owned.length];shipUpgradePending=null;shipUpgradeFeedback=null;
 $('shipUpgradeStatus').textContent='강화할 항목을 선택하세요.';renderShipUpgradePanel();
}
function ownedUpgradeShips(){return skins.map((_,id)=>id).filter(id=>data.owned.includes(id));}
$('shipUpgradePrev').onclick=()=>cycleShipUpgrade(-1);$('shipUpgradeNext').onclick=()=>cycleShipUpgrade(1);
$('shipUpgradesClose').onclick=()=>{const returnStory=shipUpgradeReturnToStory;closeShipUpgrades();if(returnStory){showMenu('story');$('storyShipUpgrade').focus?.();}else{updateLobby();$('lobby-upgrades').focus?.();}};
const upgradedShop=renderShopInterface;renderShopInterface=function(){const out=upgradedShop();if(cosmeticTab==='ship'){const s=shipStats(shopSelection);$('shopFairness').textContent='최대 속도 '+(s.speed*36).toFixed(1)+' km/h'+' · 점프 '+s.jump.toFixed(2)+' · 연비 '+Math.round(s.fuel*100)+'%';}return out;};
const upgradedMenu=showMenu;showMenu=function(...args){closeShipUpgrades();return upgradedMenu(...args);};
const upgradedValidateBackup=validateBackup;validateBackup=function(raw){const result=upgradedValidateBackup(raw);result.game.shipUpgrades=normalizeShipUpgrades(raw.game.shipUpgrades);for(const [key,r] of Object.entries(result.game.storyTimes)){const equipment=raw.game.storyTimes[key]?.equipment;if(equipment&&Number.isInteger(equipment.ship)&&equipment.ship>=0&&equipment.ship<skins.length&&['speed','jump','fuel'].every(k=>Number.isFinite(equipment[k])&&equipment[k]>0&&equipment[k]<100))r.equipment=JSON.parse(JSON.stringify(equipment));}return result;};
globalThis.starwayUpgradesReady=true;
