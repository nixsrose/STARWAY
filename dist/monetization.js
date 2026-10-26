// Live providers are registered only by the host integration, never simulated here.
let revenueProvider=null,revenueBusy=false,runSerial=0,revived=false,doubled=false,resultCoins=0,resultVersion=0,lastRewardAt=0;
const coinProducts=[{id:'coins120',coins:120,title:'120 코인'},{id:'coins400',coins:400,title:'400 코인'},{id:'coins1000',coins:1000,title:'1,000 코인'}];
if(!data.orders||typeof data.orders!=='object')data.orders={};
function revenueEvent(name,details={}){if(revenueProvider?.track)try{revenueProvider.track(name,details)}catch{}}
function registerRevenueProvider(provider){revenueProvider=provider;showMenu('shop')}
function revenueMessage(message){$('revenueStatus').textContent=message}
function revenueButton(label,fn,enabled=true){let b=document.createElement('button');b.textContent=label;b.disabled=!enabled||revenueBusy;b.onclick=fn;$('revenue').appendChild(b);return b}
function hasAds(){return !!revenueProvider?.showRewarded}
function safeReviveSpot(){for(let r=Math.max(2,Math.floor(z)-12);r>=Math.max(2,Math.floor(z)-45);r--)for(const lane of Array.from({length:mode==='story'?STORY_COURSES[level].tiles[0].length:5},(_,i)=>i).sort((a,b)=>Math.abs(a-roadCenterLane())-Math.abs(b-roadCenterLane()))){let safe=true;for(let ahead=0;ahead<6;ahead++)if(![1,3].includes(rows[r+ahead]?.[lane]))safe=false;if(safe)return {z:r+.1,x:lane-roadCenterLane()}}return null}
function reviveRun(){const spot=safeReviveSpot();if(!spot||revived)return false;revived=true;tunnelRoofDeparture=null;tunnelGrounded=false;z=spot.z;x=spot.x;y=0;vy=0;grounded=true;speed=6;throttle=6;boostRemaining=0;slowRemaining=0;boostSpeed=BOOST_SPEED;slowTargetSpeed=null;fuel=Math.max(50,fuel);cameraDrop=0;deathTime=0;particles=[];impact=null;bank=0;fxPaused=false;for(const k in keys)keys[k]=false;state='play';$('overlay').classList.add('hidden');$('note').textContent='부활 완료 · 이번 항해에서 부활을 사용했습니다';revenueEvent('revive_granted');return true}
async function requestReward(kind){
if(revenueBusy||!hasAds()||!(state==='dead'||state==='win'))return false;
if(kind==='revive'&&(state!=='dead'||revived||!safeReviveSpot()))return false;
if(kind==='double'&&(doubled||resultCoins<=0))return false;
const token=runSerial,version=resultVersion,previous=state,oldSound=sound;
revenueBusy=true;clearTimeout(nextTimer);nextTimer=0;state='rewardPending';sound=false;revenueMessage('광고를 준비하고 있습니다…');revenueEvent('reward_requested',{kind});
try{const response=await revenueProvider.showRewarded(kind);if(token!==runSerial||version!==resultVersion)return false;state=previous;
if(response?.earned!==true){revenueMessage('광고 보상을 받지 못했습니다. 다시 플레이할 수 있습니다.');revenueEvent('reward_cancelled',{kind});return false}
if(kind==='revive'){if(!reviveRun())return false}else{if(doubled)return false;doubled=true;data.coins+=resultCoins;save();wallet();revenueMessage('추가 '+resultCoins+' 코인을 받았습니다.');revenueEvent('double_granted',{coins:resultCoins})}return true;
}catch{if(token===runSerial){state=previous;revenueMessage('광고를 불러오지 못했습니다. 보상은 지급되지 않았습니다.')}return false}
finally{sound=oldSound;revenueBusy=false;if(token===runSerial&&(state==='dead'||state==='win'))drawRevenueResult()}
}
function drawRevenueResult(){
$('revenue').innerHTML='';
if(state==='dead'&&!revived&&safeReviveSpot())revenueButton(hasAds()?'광고 보고 1회 부활 · 연료 50% 이상':'광고 부활 · 준비 중',()=>requestReward('revive'),hasAds());
if(!doubled&&resultCoins>0)revenueButton(hasAds()?'광고 보고 획득 코인 2배 · +'+resultCoins:'코인 2배 보상 · 준비 중',()=>requestReward('double'),hasAds());
if(!hasAds())revenueMessage('광고 서비스 준비 중 · 무료 재도전은 바로 가능합니다.');
}
function showRevenueResult(win){resultVersion++;resultCoins=runCoins;drawRevenueResult();revenueEvent('run_finished',{win,mode,coins:runCoins,distance:Math.floor(z)})}
async function buyCoinProduct(productId){
if(revenueBusy||!revenueProvider?.purchase||!revenueProvider?.verifyPurchase||state!=='menu')return false;
const product=coinProducts.find(p=>p.id===productId);if(!product)return false;
revenueBusy=true;const oldSound=sound;sound=false;revenueMessage('결제를 진행하고 있습니다…');
try{const receipt=await revenueProvider.purchase(productId);if(!receipt?.orderId){revenueMessage('결제가 취소되었습니다.');return false}
const verified=await revenueProvider.verifyPurchase(receipt);
if(verified?.valid!==true||verified.productId!==productId||verified.orderId!==receipt.orderId){revenueMessage('결제 확인 중입니다. 구매 복원으로 다시 확인해 주세요.');return false}
if(!grantPurchase(verified)){revenueMessage('상품 지급을 저장하지 못했습니다. 구매 복원을 이용해 주세요.');return false}
wallet();revenueMessage(product.title+' 충전 완료');revenueEvent('purchase_granted',{productId});return true;
}catch{revenueMessage('결제가 완료되지 않았습니다. 구매 복원으로 확인할 수 있습니다.');return false}
finally{sound=oldSound;revenueBusy=false}
}
function grantPurchase(receipt){
const product=coinProducts.find(p=>p.id===receipt.productId);if(!product||receipt.valid!==true||!receipt.orderId)return false;
if(data.orders[receipt.orderId])return true;
const before=data.coins;data.coins+=product.coins;data.orders[receipt.orderId]=product.id;save();
if(!storageOK){data.coins=before;delete data.orders[receipt.orderId];return false}return true;
}
async function restoreRevenuePurchases(){if(revenueBusy||!revenueProvider?.restorePurchases)return;revenueBusy=true;try{for(const receipt of await revenueProvider.restorePurchases()){const verified=await revenueProvider.verifyPurchase(receipt);if(verified?.valid===true)grantPurchase(verified)}wallet();revenueMessage('구매 내역을 확인했습니다.')}catch{revenueMessage('구매 내역을 확인하지 못했습니다.')}finally{revenueBusy=false}}
const revenueBegin=beginRun;beginRun=function(){runSerial++;revived=false;doubled=false;resultCoins=0;resultVersion++;$('revenue').innerHTML='';revenueMessage('');revenueBegin();revenueEvent('run_started',{mode,level})};start=beginRun;
const revenueMenu=showMenu;showMenu=function(tab){if(revenueBusy)return;resultVersion++;$('revenue').innerHTML='';revenueMessage('');revenueMenu(tab);if(tab==='shop'){
let label=document.createElement('p');label.textContent='코인 충전 · 스킨 외형 구매에 사용';$('revenue').appendChild(label);
for(const p of coinProducts){const info=revenueProvider?.products?.[p.id];revenueButton(p.title+' · '+(info?.priceLabel||'판매 준비 중'),()=>buyCoinProduct(p.id),!!info&&!!revenueProvider?.purchase&&!!revenueProvider?.verifyPurchase)}
revenueButton('구매 복원',restoreRevenuePurchases,!!revenueProvider?.restorePurchases);
if(!revenueProvider)revenueMessage('현재 버전은 실제 광고와 결제를 제공하지 않습니다. 코인은 플레이로 모을 수 있습니다.')}
};
for(const id of ['start','home','story','endless','shop']){const prior=$(id).onclick;$(id).onclick=()=>{if(!revenueBusy)prior()}}
const revenueStep=step;step=function(dt){if(state==='rewardPending')return;revenueStep(dt)};

function updateDifficultyUI(){$('difficultyBadge').textContent=mode==='story'?'항로 난도 '+(level+1)+' / '+STORY_VISIBLE_COUNT:'무한 항로 · '+floor+'층'}
const stageMenu=showMenu;showMenu=function(tab){stageMenu(tab);updateDifficultyUI()};
const stageBegin=beginRun;beginRun=function(){stageBegin();updateDifficultyUI()};
start=beginRun;


const preparedRun=beginRun;
beginRun=function(startMovingForTest=false){preparedRun();if(startMovingForTest)return;speed=0;throttle=0;state='ready';$('note').textContent='정지 상태 · ↑ 키 또는 속도 레버를 올리면 출발합니다';};
start=beginRun;
function launchFromRest(){if(state!=='ready')return;state='play';$('note').textContent='출발 · 속도 레버 또는 ↑/↓로 조절';}
const movingStep=step;step=function(dt){if(state==='ready'){if(!keys.ArrowUp)return;launchFromRest();}movingStep(dt)};
showMenu('story');buildTrack();requestAnimationFrame(loop);
