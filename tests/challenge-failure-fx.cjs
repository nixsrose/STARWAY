const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
for(const reason of ['장애물 충돌','터널 벽 충돌','터널 천장 충돌','위험 타일 접촉','위험 블록 접촉','상단 구조 충돌']){
 run(`showMenu('main');startChallenge('precision');launchFromRest();runCoins=3;globalThis.cash=data.coins;globalThis.q=JSON.stringify(data.quests.totals);`);
 run('globalThis.collisionReason='+JSON.stringify(reason));run(`finish(false,collisionReason)`);
 assert.equal(run('state'),'exploding');assert.equal(run('particles.length'),72);assert.equal(run('challengeSettled'),false);assert.equal(run('data.coins'),run('cash'));
 run(`step(.4);draw()`);assert.equal(run('state'),'exploding');
 run(`pause();globalThis.frozen=deathTime;step(.8)`);assert.equal(run('deathTime'),run('frozen'));assert.equal(run('state'),'exploding');
 run(`pause();for(let i=0;i<90;i++)step(1/60)`);assert.equal(run('state'),'dead');assert.equal(run('challengeSettled'),true);assert.equal(run('data.coins'),run('cash+3'));assert.equal(run('JSON.stringify(data.quests.totals)'),run('q'));
 run(`step(1);finish(false,collisionReason)`);assert.equal(run('data.coins'),run('cash+3'));
}
// Trigger a real solid-block collision through the flight simulation.
run(`showMenu('main');startChallenge('precision');launchFromRest();rows[6][3]=8;STORY_COURSES[0].tiles[6][3]=8;z=5.5;x=0;speed=10;throttle=10;for(let i=0;i<30&&state==='play';i++)step(1/120)`);assert.equal(run('state'),'exploding');assert.equal(run('challengeSettled'),false);run('for(let i=0;i<80;i++)step(1/60)');assert.equal(run('state'),'dead');
run(`showMenu('main');startChallenge('precision');launchFromRest();z=42;speed=15;finish(false,'도로 이탈');step(.5);draw()`);assert.equal(run('state'),'falling');run('for(let i=0;i<100;i++)step(1/60)');assert.equal(run('state'),'dead');assert.equal(run('challengeFailureZ'),42);
run(`startChallenge('precision');launchFromRest();finish(false,'장애물 충돌');showMenu('story');step(2)`);assert.equal(run('challengeActive'),null);assert.equal(run('state'),'menu');assert.equal(run('particles.length'),0);
run(`startChallenge('reserve');launchFromRest();finish(false,'연료 소진')`);assert.equal(run('state'),'dead');
run(`startChallenge('sprint');launchFromRest();time=32.1;step(1/60)`);assert.equal(run('state'),'dead');
run(`showMenu('main');mode='story';level=0;beginRun(true);state='play';finish(false,'장애물 충돌')`);assert.equal(run('state'),'exploding');run('for(let i=0;i<100;i++)step(1/60)');assert.equal(run('state'),'dead');
console.log('PASS six challenge collision effects, visible intermediate frames, delayed settlement once, FX pause/resume, fall sequence, menu cancellation, fuel/timeout, normal story effects');
