const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 if(questDate(Date.parse('2026-10-19T14:59:59Z'))!=='2026-10-19'||questDate(Date.parse('2026-10-19T15:00:00Z'))!=='2026-10-20')throw Error('KST boundary');
 showMenu('main');openQuests();if(dailyQuestDefs().length!==3||dailyQuestDefs().reduce((s,d)=>s+d.reward,0)!==160)throw Error('daily definitions');
 addQuestProgress('clears',2);const balance=data.coins;if(!claimQuest('daily','clears',0)||data.coins!==balance+60||claimQuest('daily','clears',0))throw Error('claim duplicate');
 const oldTotals=JSON.stringify(data.quests.totals);data.quests.daily.date='2020-01-01';ensureQuests();if(data.quests.daily.clears!==0||data.quests.daily.claimed.length||JSON.stringify(data.quests.totals)!==oldTotals)throw Error('rollover');
 data.owned=[0,1,2,3];if(totalQuestProgress('ships')!==4)throw Error('owned');data.shipUpgrades[0].speed=3;if(totalQuestProgress('upgrades')!==3)throw Error('upgrades');
 if(!claimQuest('total','ships',0)||!claimQuest('total','ships',1)||claimQuest('total','ships',2))throw Error('milestone');
 addQuestProgress('clears',5);const set=localStorage.setItem,old=JSON.stringify(data.quests),cash=data.coins;localStorage.setItem=()=>{throw Error('full')};if(claimQuest('total','clears',0)||JSON.stringify(data.quests)!==old||data.coins!==cash)throw Error('rollback');localStorage.setItem=set;save();
 STORY_COURSES[0]=emptyEditorMap(500);data.unlocked=29;level=0;mode='story';beginRun();launchFromRest();speed=6;throttle=6;const distance=data.quests.totals.distance;step(.05);if(data.quests.totals.distance<=distance)throw Error('distance tracking');time=10;finish(true);const clears=data.quests.totals.clears;if(clears!==8)throw Error('finish tracking '+clears);finish(true);if(data.quests.totals.clears!==clears)throw Error('duplicate finish');
 editorTesting=true;state='play';time=10;finish(true);if(data.quests.totals.clears!==clears)throw Error('editor leak');editorTesting=false;creatorActive=true;state='play';finish(true);if(data.quests.totals.clears!==clears)throw Error('creator leak');creatorActive=false;
 const backup=validateBackup(backupCapture());if(backup.game.quests.totals.clears!==clears)throw Error('backup');
 showMenu('main');questTab='total';renderQuests();
}`);
console.log('PASS: KST reset, three daily rewards, lifetime preservation, existing ships/upgrades, duplicate/locked claims, save rollback, real distance/finish tracking, editor/creator exclusions and backup');
