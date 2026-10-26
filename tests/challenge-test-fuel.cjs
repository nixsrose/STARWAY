const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,els}=boot();
run(`showMenu('main');developerModeEnabled=true;openChallengeEditor('reserve');$('challengeStartFuel').value='55';globalThis.progress=JSON.stringify(data.quests);globalThis.balance=data.coins;`);
assert.equal(run("$('editorTest').onclick()"),true);assert.equal(run('state'),'ready');assert.equal(run('fuel'),55);assert.equal(els.fuel.textContent,'55%');assert.equal(run('challengeActive'),null);
run(`launchFromRest();speed=0;throttle=0;step(.1)`);assert.ok(run('fuel')<55);assert.equal(run('data.coins'),run('balance'));assert.equal(run('JSON.stringify(data.quests)'),run('progress'));
run(`$('editorBackPlay').onclick();$('editorSettingsOpen').onclick();$('challengeStartFuel').value='40';editorPage=0;`);assert.equal(run("$('editorTestPage').onclick()"),true);assert.equal(run('state'),'play');assert.equal(run('fuel'),40);assert.equal(els.fuel.textContent,'40%');
run(`$('editorBackPlay').onclick();$('editorSettingsOpen').onclick();$('challengeStartFuel').value='55';editorPage=3;`);assert.equal(run("$('editorTestPage').onclick()"),true);assert.ok(run('z')>16);assert.equal(run('fuel'),55);
run(`$('editorBackPlay').onclick();$('editorTest').onclick()`);assert.equal(run('fuel'),55);
run(`showMenu('main');mode='story';level=1;beginRun(true)`);assert.equal(run('fuel'),100);
run(`openChallengeEditor('sprint');$('editorSettingsOpen').onclick();$('challengeStartFuel').value='70';$('editorTest').onclick()`);assert.equal(run('fuel'),70);
run(`$('editorBackPlay').onclick();$('editorSettingsOpen').onclick();$('challengeStartFuel').value='0';globalThis.before=state;`);assert.equal(run("$('editorTest').onclick()"),false);assert.equal(run('state'),run('before'));
console.log('PASS unsaved 55% editor test and gauge, page-zero/mid-page tests, repeated tests, fuel drain, no quest/reward credit, normal story 100%, other challenge drafts, invalid-value rejection');
