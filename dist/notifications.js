// Notifications are derived from real rewards and achievements; read state is persistent.
function normalizeNotificationState(raw){return {read:Array.isArray(raw?.read)?[...new Set(raw.read.filter(v=>typeof v==='string'&&v.length<160))].slice(-300):[]};}
data.notifications=normalizeNotificationState(data.notifications);
function notificationItems(){
 const q=ensureQuests(),items=[];
 dailyQuestDefs().forEach((d,i)=>{if(!q.daily.claimed.includes(i)&&q.daily[d.id]>=d.goal)items.push({id:'daily:'+q.daily.date+':'+i,type:'daily',target:d.id,title:'데일리 완료 · '+d.name,body:'보상 ◈ '+d.reward+'를 받을 수 있습니다.'});});
 QUEST_TOTALS.forEach(d=>{const stage=d.goals.findIndex((_,i)=>!q.claims[d.id].includes(i));if(stage>=0&&totalQuestProgress(d.id)>=d.goals[stage])items.push({id:'total:'+d.id+':'+stage,type:'total',target:d.id,title:'누적 퀘스트 완료 · '+d.name,body:(stage+1)+'단계 달성 · 보상 ◈ '+d.rewards[stage]});});
 BADGE_DEFS.forEach((d,i)=>{const date=data.badges.unlocked[d.id];if(date)items.push({id:'badge:'+d.id+':'+date,type:'badge',target:i,title:'배지 획득 · '+d.name,body:d.condition});});
 return items.map(item=>({...item,read:data.notifications.read.includes(item.id)})).sort((a,b)=>Number(a.read)-Number(b.read));
}
function syncNotificationCount(){const count=notificationItems().filter(item=>!item.read).length,b=$('notificationCount');b.textContent=count>99?'99+':String(count);b.classList.toggle('hidden',!count);$('lobby-notifications').setAttribute('aria-label','알림'+(count?' · 읽지 않음 '+count+'개':''));}
let notificationTab='new';
function visibleNotifications(){return notificationItems().filter(item=>notificationTab==='read'?item.read:!item.read);}
function renderNotifications(){
 const list=$('notificationList'),all=notificationItems(),items=visibleNotifications(),unread=all.filter(i=>!i.read).length;list.innerHTML='';
 $('notificationSummary').textContent='신규 '+unread+'개 · 읽음 '+(all.length-unread)+'개';
 $('notificationNewTab').textContent='신규 ('+unread+')';$('notificationReadTab').textContent='읽음 ('+(all.length-unread)+')';
 $('notificationNewTab').setAttribute('aria-pressed',String(notificationTab==='new'));$('notificationReadTab').setAttribute('aria-pressed',String(notificationTab==='read'));$('notificationReadAll').disabled=unread===0;
 if(!items.length){const empty=document.createElement('p');empty.className='notification-empty';empty.textContent=notificationTab==='new'?'새로운 알림이 없습니다.':'읽은 알림이 없습니다.';list.appendChild(empty);}
 for(const item of items){const button=document.createElement('button');button.type='button';button.className='notification-item'+(item.read?' read':' unread');const title=document.createElement('strong'),body=document.createElement('span');title.textContent=item.title;body.textContent=item.body;button.appendChild(title);button.appendChild(body);button.onclick=()=>visitNotification(item.id);list.appendChild(button);}syncNotificationCount();
}
function readAllNotifications(){
 const unread=notificationItems().filter(item=>!item.read);if(!unread.length)return false;
 const previous=data.notifications.read.slice();data.notifications.read=[...new Set([...previous,...unread.map(item=>item.id)])].slice(-300);save();
 if(!storageOK){data.notifications.read=previous;renderNotifications();$('notificationSummary').textContent='읽음 상태를 저장하지 못했습니다. 다시 시도해 주세요.';return false;}
 renderNotifications();return true;
}
$('notificationReadAll').onclick=readAllNotifications;
$('notificationNewTab').onclick=()=>{notificationTab='new';renderNotifications();$('notificationList').scrollTop=0;};
$('notificationReadTab').onclick=()=>{notificationTab='read';renderNotifications();$('notificationList').scrollTop=0;};
function openNotifications(){if(state!=='menu'||menuScreen!=='main')return;notificationTab='new';closeShipUpgrades();$('questPanel').classList.add('hidden');$('notificationPanel').classList.remove('hidden');$('notificationList').scrollTop=0;renderNotifications();}
function visitNotification(id){
 const item=notificationItems().find(item=>item.id===id);if(!item){renderNotifications();return false;}
 if(!data.notifications.read.includes(id)){data.notifications.read.push(id);data.notifications.read=data.notifications.read.slice(-300);save();}
 $('notificationPanel').classList.add('hidden');
 if(item.type==='badge'){badgeSelected=item.target;showMenu('badges');}
 else{showMenu('main');openQuests();questTab=item.type==='daily'?'daily':'total';renderQuests();$('quest-'+questTab+'-'+item.target).scrollIntoView?.({block:'nearest'});}
 syncNotificationCount();return true;
}
$('lobby-notifications').onclick=openNotifications;$('notificationClose').onclick=()=>{$('notificationPanel').classList.add('hidden');syncNotificationCount();};
const notificationLobby=updateLobby;updateLobby=function(...args){const out=notificationLobby(...args);syncNotificationCount();return out;};
const notificationMenu=showMenu;showMenu=function(...args){$('notificationPanel').classList.add('hidden');return notificationMenu(...args);};
const notificationBackup=validateBackup;validateBackup=function(raw){const out=notificationBackup(raw);out.game.notifications=normalizeNotificationState(raw.game.notifications);return out;};
syncNotificationCount();
// A swipe scrolls the native list and must not activate the item on release.
let notificationSwipe=null,notificationSuppressClickUntil=0;
function beginNotificationSwipe(event){if(event.button!==undefined&&event.button!==0)return;notificationSwipe={id:event.pointerId,x:event.clientX,y:event.clientY,moved:false};}
function moveNotificationSwipe(event){const swipe=notificationSwipe;if(!swipe||swipe.id!==event.pointerId)return;if(Math.hypot(event.clientX-swipe.x,event.clientY-swipe.y)>8){swipe.moved=true;notificationSuppressClickUntil=performance.now()+350;}}
function endNotificationSwipe(event){if(!notificationSwipe||notificationSwipe.id!==event.pointerId)return;if(notificationSwipe.moved||event.type==='pointercancel')notificationSuppressClickUntil=performance.now()+350;notificationSwipe=null;}
$('notificationList').addEventListener('pointerdown',beginNotificationSwipe,{passive:true});
$('notificationList').addEventListener('pointermove',moveNotificationSwipe,{passive:true});
for(const type of ['pointerup','pointercancel'])$('notificationList').addEventListener(type,endNotificationSwipe,{passive:true});
$('notificationList').addEventListener('click',event=>{if(event.detail!==0&&performance.now()<notificationSuppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
