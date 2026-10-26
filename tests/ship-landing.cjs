const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{handlers:{},style:{},contains:()=>true,setPointerCapture:noop,releasePointerCapture:noop,classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,removeAttribute:noop,appendChild:noop,addEventListener(name,fn){this.handlers[name]=fn},getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);






const assert=require('node:assert/strict'),run=s=>vm.runInContext(s,b);
run('data.unlocked=20;mode="story";level=0;STORY_COURSES[0]=emptyEditorMap(100)');
for(const grav of [50,100,150,200,300,500]){b.grav=grav;run('STORY_COURSES[0].gravity=grav;beginRun(true);state="play";speed=0;throttle=0;landingJump();globalThis.expected=[];for(let i=0;i<300;i++){landingStep(1/120);expected.push([time,x,y,z,vy,grounded,fuel])}');const expected=run('JSON.stringify(expected)');run('beginRun(true);state="play";speed=0;throttle=0;jump();globalThis.actual=[];globalThis.landCount=0;for(let i=0;i<300;i++){const previous=shipLanding;step(1/120);if(!previous&&shipLanding)landCount++;actual.push([time,x,y,z,vy,grounded,fuel])}');assert.equal(run('JSON.stringify(actual)'),expected);assert.equal(run('landCount'),1);assert.equal(run('shipLanding'),null)}
run('beginRun(true);state="play";speed=0;throttle=0;jump();while(!grounded)step(1/120)');assert.ok(run('shipLanding'));run('step(.08);state="pause";globalThis.elapsedBefore=shipLanding.elapsed;step(.5)');assert.equal(run('shipLanding.elapsed'),run('elapsedBefore'));assert.ok(run('liveLandingPose().sink>0'));run('draw()');b.matchMedia=()=>({matches:true});assert.equal(run('liveLandingPose().sink'),0);delete b.matchMedia;run('state="play";jump()');assert.equal(run('shipLanding'),null);run('beginRun(true)');assert.equal(run('shipLanding'),null);
// Raised block landing anchors its effect on the surface instead of the road below.
run('state="play";speed=0;throttle=0;rows[2][3]=2;y=3;vy=-5;grounded=false;for(let i=0;i<200&&!grounded&&state==="play";i++)step(1/120)');assert.ok(run('grounded&&shipLanding&&shipLanding.height>0'));run('draw()');assert.equal(run('landingPoseAt(1).sink'),0);assert.ok(run('landingPoseAt(.32).sink>0'));
console.log('PASS identical physics at all six gravities; one landing cue; block-surface anchor; pause/retry/jump reset; reduced-motion; rendered landing');

// Actual launch only: air taps and blocked zones must not create a new pulse.
run('beginRun(true);state="play";speed=0;throttle=0;jump();globalThis.pulse=shipTakeoff');assert.ok(run('pulse'));run('step(.04);jump()');assert.equal(run('shipTakeoff'),run('pulse'));assert.ok(run('shipTakeoff.elapsed>0'));
run('state="pause";globalThis.takeoffAge=shipTakeoff.elapsed;step(.5)');assert.equal(run('shipTakeoff.elapsed'),run('takeoffAge'));
run('beginRun(true);state="play";STORY_COURSES[0].noJumpZones=[{row:2,lane:3}];jump()');assert.equal(run('shipTakeoff'),null);assert.equal(run('grounded'),true);
run('STORY_COURSES[0].noJumpZones=[];jump();showMenu("main")');assert.equal(run('shipTakeoff'),null);assert.equal(run('shipLanding'),null);
// Surface projections may not bridge gaps, block edges, or tunnel shell boundaries.
run('mode="story";level=0;beginRun(true);state="play";rows[8][3]=1;rows[8][4]=0;globalThis.floorEffect={x:0,z:8.5,height:0,roof:false}');assert.ok(run('flightEffectPoint(floorEffect,0,8.5)'));assert.equal(run('flightEffectPoint(floorEffect,1,8.5)'),null);
run('rows[8][3]=2;globalThis.blockEffect={x:0,z:8.5,height:boxHeight(2),roof:false}');assert.ok(run('flightEffectPoint(blockEffect,0,8.5)'));assert.equal(run('flightEffectPoint(blockEffect,1,8.5)'),null);
run('STORY_COURSES[0].ceilings[8]=1.15;STORY_COURSES[0].tunnelCenters[8]=[0];globalThis.roofEffect={x:0,z:8.5,height:1.27,roof:true,center:0}');assert.ok(run('flightEffectPoint(roofEffect,.2,8.5)'));assert.equal(run('flightEffectPoint(roofEffect,.8,8.5)'),null);assert.equal(run('flightEffectPoint(roofEffect,0,9.5)'),null);
console.log('PASS launch-only pulse, no-jump rejection, pause/menu reset, surface-bound floor/block/curved-roof effects and gap clipping');
