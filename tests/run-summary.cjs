const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {els,run}=boot();
run(`settings.sound=false;mode='story';level=0;data.cleared=[];data.quests=normalizeQuests();beginRun(true);state='play';runCoins=7;data.quests.daily.clears=1;data.quests.totals.clears=4;time=12;finish(true,'')`);
assert.equal(els.reportCoins.textContent,'◈ 27');assert.ok(els.reportCoinsDetail.textContent.includes('+20'));assert.ok(els.reportQuestProgress.children.length>=2);assert.ok(els.reportQuestOpen.textContent.includes('보상'));
const balance=run('data.coins');run('renderRunSummary();renderRunSummary()');assert.equal(run('data.coins'),balance);
els.reportQuestOpen.onclick();assert.equal(run('state'),'menu');assert.equal(run('menuScreen'),'main');assert.equal(run('questTab'),'daily');assert.equal(run('runSummaryStart'),null);
run(`mode='story';level=0;beginRun(true);state='play';runCoins=3;time=15;finish(true,'')`);assert.equal(els.reportCoins.textContent,'◈ 3');
run(`beginRun(true);state='play';runCoins=2;finish(false,'연료 소진')`);assert.equal(els.reportCoins.textContent,'◈ 2');
run(`showMenu('main');mode='endless';beginRun(true)`);assert.equal(run('runSummaryStart'),null);
console.log('PASS: first-clear breakdown, daily/lifetime progress, reward routing, repeat-clear coins, failure coins, no duplicate awards, endless exclusion');
