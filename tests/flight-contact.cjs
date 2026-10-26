const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot();
function setup(){run('mode="story";level=0;editorTesting=true;STORY_COURSES[0]=emptyEditorMap(100);beginRun(true);state="play";z=20.5;x=0;y=0;vy=0;grounded=true;tunnelGrounded=false;throttle=0;speed=0;for(const k in keys)keys[k]=false;for(let r=0;r<rows.length;r++)rows[r]=[0,0,0,1,0,0,0]');}
// Previous center-only lookup wrongly dropped the player in these supported cases.
for(const xx of [-.65,.65]){setup();b.xx=xx;run('x=xx;step(1/60)');assert.equal(run('state'),'play');assert.equal(run('y'),0);}
setup();run('x=.82;step(1/60)');assert.equal(run('state'),'falling');assert.equal(run('deathReason'),'도로 이탈');
setup();run('for(let r=0;r<rows.length;r++)rows[r][3]=2;x=.65;y=.85;step(1/60)');assert.equal(run('state'),'play');assert.equal(run('y'),.85);
setup();run('rows[20][3]=2;y=1;vy=-4;grounded=false;for(let i=0;i<30&&state==="play"&&!grounded;i++)step(1/120)');assert.equal(run('state'),'play');assert.equal(run('y'),.85);assert.equal(run('grounded'),true);
for(let id=0;id<12;id++){setup();b.id=id;run('data.skin=id;for(let r=0;r<rows.length;r++){rows[r][2]=2;rows[r][4]=2}step(1/60)');assert.equal(run('state'),'play');run('x=.3;step(1/60)');assert.equal(run('state'),'exploding');assert.equal(run('deathReason'),'장애물 충돌');}
setup();run('rows[21][3]=2;z=20.1;throttle=24;speed=24;step(.15)');assert.equal(run('state'),'exploding');assert.ok(run('z<21.2'));
setup();run('rows[20][3]=2;y=2.6;vy=-3;grounded=false;step(.05)');assert.equal(run('state'),'play');
setup();run('STORY_COURSES[0].roadPaint[20][3]="pink";x=.65;step(1/60)');assert.equal(run('state'),'exploding');assert.equal(run('deathReason'),'위험 타일 접촉');
// All 21 built-in surfaces: valid cell centers must never be mislabeled as void.
let count=0;for(let stage=0;stage<21;stage++){b.stage=stage;run('editorTesting=false;level=stage;mode="story";beginRun(true)');const length=run('rows.length');for(let r=3;r<length-3;r+=3){b.r=r;for(let lane=0;lane<7;lane++){b.lane=lane;if(!run('rows[r][lane]')||run('lethalRoadAt(r,lane)'))continue;run('state="play";z=r+.5;x=lane-3;y=boxHeight(rows[r][lane]);vy=0;grounded=true;tunnelGrounded=false;throttle=0;speed=0;fuel=100;step(1/120)');assert.notEqual(run('state'),'falling',`false fall stage${stage} row${r} lane${lane}`);count++;}}}
console.log('PASS road/block edge support, real void fall, block top landing/side impact, all12 identical body, high-speed sweep, airborne clearance, lethal edge; '+count+' built-in surface centers without false falling');
