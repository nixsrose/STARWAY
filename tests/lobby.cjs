const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();assert.equal(run('menuScreen'),'main');
for(const [key,screen] of [['story','story'],['endless','endless'],['records','records'],['shop','shop'],['badges','badges'],['settings','options']]){els['lobby-'+key].onclick();assert.equal(run('menuScreen'),screen,key);assert.equal(run('state'),'menu');els.lobbyBack.onclick();assert.equal(run('menuScreen'),'main');}
run('showMenu("modes")');assert.equal(run('menuScreen'),'main');
for(const language of ['ko','en','ja','zh']){b.language=language;run('settings.language=language;showMenu("main")');for(const key of ['story','endless','creator','records','shop','badges','settings'])assert.ok(els['lobby-'+key].innerHTML.includes('<svg'));}
assert.ok(run('lobbyShipPose(2).lift')>0);assert.ok(run('lobbyShipPose(3).yaw')<run('lobbyShipPose(2).yaw'));assert.equal(run('lobbyShipPose(2,true).lift'),0);
run('settings.language="ko";data.skin=3;showMenu("main")');assert.equal(els.lobbyShipName.textContent,run('skins[3][0]'));
run('level=0;mode="story";beginRun(true);pause()');assert.equal(run('state'),'pause');els.home.onclick();assert.equal(run('menuScreen'),'story');assert.equal(run('state'),'menu');
run('showMenu("endless");mode="endless";beginRun(true);pause()');els.home.onclick();assert.equal(run('menuScreen'),'endless');
console.log('PASS direct lobby navigation, 4 languages, equipped ship, left rotation/jump, reduced motion, pause return destinations');

for(let id=0;id<12;id++){b.ship=id;const seconds=1.2+1.35*.3;b.seconds=seconds;const actual=run('lobbyShipPose(seconds,false,ship)'),expected=run('trickTransform(ship,.3)');assert.ok(Math.abs(actual.roll-expected.roll)<1e-9);assert.ok(Math.abs(actual.flip-expected.flip)<1e-9);assert.ok(Math.abs(actual.yaw-(-seconds*.42+expected.yaw))<1e-9);assert.ok(actual.lift>0);assert.equal(run('lobbyShipPose(seconds,true,ship).roll'),0);}
console.log('PASS all12 equipped-ship jump traits share gameplay transforms, with reduced-motion suppression');
run('showMenu("main");lobbyClock=0;lobbyPreviousFrame=null;lobbyAnimationFrame(0);for(let f=1;f<=120;f++)lobbyAnimationFrame(f*1000/60)');assert.ok(Math.abs(run('lobbyClock')-2)<1e-8);
run('globalThis.clockBefore=lobbyClock;document.hidden=true;lobbyAnimationFrame(10000);document.hidden=false;lobbyAnimationFrame(11000)');assert.equal(run('lobbyClock'),run('clockBefore'));
run('showMenu("options");lobbyAnimationFrame(12000)');assert.equal(run('lobbyClock'),run('clockBefore'));
console.log('PASS 60Hz independent preview clock; hidden/background/submenu animation suspension without a return-time jump');

run('showMenu("shop");shopClock=0;shopPreviousFrame=null;lobbyAnimationFrame(0);for(let f=1;f<=120;f++)lobbyAnimationFrame(f*1000/60)');assert.ok(Math.abs(run('shopClock')-2)<1e-8);run('globalThis.shopBefore=shopClock;document.hidden=true;lobbyAnimationFrame(10000);document.hidden=false;lobbyAnimationFrame(11000)');assert.equal(run('shopClock'),run('shopBefore'));console.log('PASS shop animation at60Hz and hidden-tab clock suspension');
