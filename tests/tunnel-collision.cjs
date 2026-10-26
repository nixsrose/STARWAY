const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);


const assert=require('node:assert/strict');const run=s=>vm.runInContext(s,b);
function reset(){run("data.unlocked=20;mode='story';level=0;beginRun(true);var tunnelFixture=STORY_COURSES[0];tunnelFixture.tiles=Array.from({length:30},()=>[0,0,0,1,0,0,0]);tunnelFixture.ceilings=Array(30).fill(1.15);tunnelFixture.tunnelCenters={};tunnelFixture.tunnelRadius={};for(let r=0;r<30;r++){tunnelFixture.tunnelCenters[r]=[0];tunnelFixture.tunnelRadius[r]=.65}rows=tunnelFixture.tiles;trackLength=30;z=10;x=0;y=0;vy=0;grounded=true;tunnelGrounded=false;state='play';speed=0;throttle=0;fuel=100;keys.left=false;keys.right=false;");}
for(const direction of [-1,1]){reset();b.D=direction;run("keys.left=D<0;keys.right=D>0;for(let i=0;i<60&&state==='play';i++)step(1/120)");assert.equal(run('state'),'exploding');assert.equal(run('deathReason'),'터널 벽 충돌');assert.ok(run('particles.length')>0);}
reset();run('for(let i=0;i<60;i++)step(1/120)');assert.equal(run('state'),'play');
reset();assert.equal(run('tunnelSweepCollision(0,10,1.5,0,10,1.1)'),null,'descending roof landing');assert.ok(run("tunnelSweepCollision(0,10,.6,0,10,1.1)"),'underside jump hits roof');assert.ok(run('tunnelSweepCollision(0,10,0,1.5,10,0)'),'sweep cannot skip wall');assert.equal(run('tunnelSweepCollision(0,10,2,1.5,10,2)'),null,'clear above roof');
reset();run('y=1.27;tunnelGrounded=true;step(1/120)');assert.equal(run('state'),'play');assert.equal(run('tunnelGrounded'),true);
console.log('PASS: left/right wall explode before gap fall, stationary passage, fast side sweep, underside hit, above-roof clearance and roof landing');

reset();assert.ok(run("tunnelSweepCollision(.5,9.9,0,.5,10.1,0)"),"entrance wall between hull sample points");
reset();assert.equal(run("tunnelSweepCollision(0,9.9,0,0,10.1,0)"),null,"center entrance clear");
console.log("PASS full-width entrance wall contact and centered clearance");
for(let skin=0;skin<12;skin++)for(const offset of [-.15,0,.15]){reset();b.S=skin;b.O=offset;run('data.skin=S;x=O;throttle=22;speed=22;for(let i=0;i<60&&state==="play";i++)step(1/120)');assert.equal(run('state'),'play','centered tunnel clearance skin '+skin+' offset '+offset);}
console.log('PASS all12 skins at center and both safe offsets through tunnel at speed22');
