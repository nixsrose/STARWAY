const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 showMenu('main');data.quests=normalizeQuests();questTab='daily';for(const d of dailyQuestDefs())data.quests.daily[d.id]=d.goal;const balance=data.coins,totals=JSON.stringify(data.quests.totals);if(claimableQuests().length!==3||!claimAllQuests()||data.coins!==balance+160||claimAllQuests())throw Error('daily duplicate or amount');if(JSON.stringify(data.quests.totals)!==totals)throw Error('coin progress leak');if(notificationItems().some(n=>n.type==='daily'))throw Error('notification cleanup');
 data.quests=normalizeQuests();data.owned=[0,1,2,3];questTab='total';const items=claimableQuests(),reward=items.reduce((s,i)=>s+i.reward,0),cash=data.coins;if(items.length!==2||!claimAllQuests()||data.coins!==cash+reward||claimableQuests().length)throw Error('all achieved tiers');
 data.quests.totals.clears=20;const old=JSON.stringify(data.quests),money=data.coins,set=localStorage.setItem;localStorage.setItem=()=>{throw Error('full')};if(claimAllQuests()||JSON.stringify(data.quests)!==old||data.coins!==money)throw Error('transaction rollback');localStorage.setItem=set;
 if(!claimAllQuests()||claimAllQuests())throw Error('retry after failure');
 questTab='daily';if(claimAllQuests())throw Error('cross tab');
}`);
console.log('PASS: daily combined amount, lifetime all-achieved tiers, active tab isolation, duplicate prevention, notification cleanup, no collection progress leakage, failed-save rollback and retry');
