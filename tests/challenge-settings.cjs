const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,els}=boot();
run(`showMenu('main');developerModeEnabled=true;openChallengeEditor('sprint');$('editorSettingsOpen').onclick();$('challengeTimeLimit').value='20';$('challengeSilverTime').value='14';$('challengeGoldTime').value='12';$('challengeStartFuel').value='90';$('editorQuickSave').onclick();$('editorSaveAccept').onclick();`);
assert.equal(run('data.challengeMaps.sprint.challengeRules.goldTime'),12);assert.equal(run('effectiveChallenge("sprint").goals[2]'),'12초 안에 완주');
run(`showMenu('main');startChallenge('sprint');launchFromRest();if(fuel!==90||challengeActive.limit!==20)throw Error('runtime rules');time=13;finish(true,'')`);assert.equal(els.challengeResultStars.textContent,'★★☆');
run(`startChallenge('sprint');launchFromRest();time=21;step(1/60)`);assert.equal(run('state'),'dead');
run(`openChallengeEditor('sprint');$('editorSettingsOpen').onclick();$('challengeGoldTime').value='15';$('challengeSilverTime').value='14';$('editorQuickSave').onclick()`);assert.equal(run('challengeRuleError'),true);assert.equal(run('data.challengeMaps.sprint.challengeRules.goldTime'),12);
run(`openChallengeEditor('reserve');$('editorSettingsOpen').onclick();$('challengeStartFuel').value='40';$('challengeSilverTime').value='14';$('challengeGoldTime').value='10';$('editorSave').onclick();$('editorSaveAccept').onclick();showMenu('main');startChallenge('reserve');`);assert.equal(run('fuel'),40);run(`launchFromRest();time=12;fuel=25;finish(true,'')`);assert.equal(els.challengeResultStars.textContent,'★★☆');
run(`openChallengeEditor('precision');$('editorSettingsOpen').onclick();$('challengeSilverCoins').value='8';$('challengeGoldCoins').value='12';$('editorQuickSave').onclick();$('editorSaveAccept').onclick();showMenu('main');startChallenge('precision')`);assert.equal(run('coins.size'),12);assert.ok(els.challengeHud.textContent.includes('/ 12'));run('runCoins=10;time=10;launchFromRest();finish(true,"")');assert.equal(els.challengeResultStars.textContent,'★★☆');
run(`showMenu('main');globalThis.restore=validateBackup(backupCapture());if(restore.game.challengeMaps.sprint.challengeRules.goldTime!==12||restore.game.challengeMaps.reserve.challengeRules.startFuel!==40||restore.game.challengeMaps.precision.challengeRules.goldCoins!==12)throw Error('backup');save()`);
const again=boot();assert.equal(again.run('effectiveChallenge("sprint").limit'),20);assert.equal(again.run('effectiveChallenge("reserve").fuel'),40);assert.equal(again.run('effectiveChallenge("precision").rules.goldCoins'),12);
for(const rules of [{startFuel:0},{timeLimit:10,silverTime:14,goldTime:12},{goldTime:NaN}]){const value=JSON.stringify(rules).replace('null','NaN');assert.throws(()=>run('normalizeChallengeRules('+value+',"sprint")'));}
run(`openChallengeEditor('sprint');$('editorResetStory').onclick();$('editorSaveAccept').onclick()`);assert.equal(run('effectiveChallenge("sprint").limit'),25);run(`$('editorRestorePrevious').onclick();$('editorSaveAccept').onclick()`);assert.equal(run('effectiveChallenge("sprint").limit'),20);
console.log('PASS editable time thresholds, 13-second two-star result, timeout, fuel capacity/time targets, configurable coin count, UI validation, restart, backup, reset/previous-map rules');

// Fuel is a survival resource; ranking depends only on completion time.
run(`showMenu('main');startChallenge('reserve');launchFromRest();fuel=1;time=10;`);assert.equal(run('challengeStars(challengeActive)'),3);
run('time=10.01;fuel=99');assert.equal(run('challengeStars(challengeActive)'),2);
run('time=14');assert.equal(run('challengeStars(challengeActive)'),2);
run('time=14.01');assert.equal(run('challengeStars(challengeActive)'),1);
assert.equal(run('normalizeChallengeRules({startFuel:33,silverFuel:10,goldFuel:25},"reserve").startFuel'),33);
assert.equal(run('normalizeChallengeRules({startFuel:33,silverFuel:10,goldFuel:25},"reserve").goldTime'),10);
assert.throws(()=>run('normalizeChallengeRules({silverTime:9,goldTime:10},"reserve")'));
run(`fuel=1;time=20;rows[Math.floor(z)][3]=3;x=0;y=0;grounded=true;speed=0;throttle=0;charge=-1;step(1/120)`);
assert.ok(run('fuel')>22);assert.equal(run('state'),'play');
run('fuel=0;rows[Math.floor(z)][3]=1;step(1/120)');assert.equal(run('state'),'dead');
console.log('PASS time boundary stars independent of fuel, legacy map rules, invalid times, live refuel, fuel depletion');
