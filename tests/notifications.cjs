const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 showMenu('main');data.quests=normalizeQuests();data.notifications=normalizeNotificationState();data.badges.unlocked={};
 if(notificationItems().length)throw Error('empty');addQuestProgress('clears',2);let item=notificationItems().find(n=>n.type==='daily');if(!item||item.read)throw Error('daily notification');openNotifications();if(!visitNotification(item.id)||questTab!=='daily'||!data.notifications.read.includes(item.id))throw Error('daily route');
 if(!claimQuest('daily','clears',0)||notificationItems().some(n=>n.id===item.id))throw Error('stale reward');
 data.owned=[0,1];item=notificationItems().find(n=>n.type==='total'&&n.target==='ships');if(!item||!visitNotification(item.id)||questTab!=='total')throw Error('total route');
 const d=BADGE_DEFS[0];data.badges.unlocked[d.id]='2026-10-20T00:00:00Z';item=notificationItems().find(n=>n.type==='badge');if(!visitNotification(item.id)||menuScreen!=='badges'||badgeSelected!==0)throw Error('badge route');
 if(notificationItems().filter(n=>n.id===item.id).length!==1||!notificationItems().find(n=>n.id===item.id).read)throw Error('read/dedup');
 showMenu('main');data.notifications.read=[];const cash=data.coins,claims=JSON.stringify(data.quests.daily.claimed);if(!readAllNotifications()||notificationItems().some(n=>!n.read)||data.coins!==cash||JSON.stringify(data.quests.daily.claimed)!==claims)throw Error('read all');notificationTab='new';if(visibleNotifications().length)throw Error('new filter');notificationTab='read';if(!visibleNotifications().length||visibleNotifications().some(n=>!n.read))throw Error('read filter');if(readAllNotifications())throw Error('repeat read');
 const backup=validateBackup(backupCapture());if(!backup.game.notifications.read.includes(item.id))throw Error('backup');
 showMenu('main');if(visitNotification('missing'))throw Error('invalid route');
}`);
console.log('PASS: real notification sources, daily/total/badge destination, reward cleanup, read state/deduplication, invalid target and backup');
