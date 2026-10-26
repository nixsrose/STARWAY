const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 const m=emptyEditorMap(500);m.tiles[8][3]=4;m.tiles[16][3]=5;m.tiles[32][3]=3;m.gravityGates=[{row:24,lane:3,gravity:500}];m.noJumpZones=[{row:40,lane:3}];m.jumpAllowZones=[{row:48,lane:3}];STORY_COURSES[0]=m;mode='story';level=0;editorTesting=true;$('editorTestPerformance').value='base';
 const setup=(row,lane=3)=>{beginRun(true);state='play';z=row-.1;x=lane-3;y=3;vy=1;grounded=false;speed=18;throttle=18;};
 setup(8);step(1/60);if(boostRemaining<=0||Math.abs(speedKmh(speed)-800)>1e-8||grounded||y<2)throw Error('airborne boost');const oldTimer=boostRemaining;step(1/120);if(boostRemaining>=oldTimer)throw Error('pad retrigger while staying in row');
 setup(8,4);step(1/60);if(boostRemaining)throw Error('adjacent boost');
 setup(16);boostRemaining=2;step(1/60);if(slowRemaining<=0||boostRemaining!==0||grounded)throw Error('airborne slow');
 setup(24);z=24.4;step(1/60);if(gravityValue()!==500||grounded)throw Error('airborne gravity');
 setup(24,4);z=24.4;step(1/60);if(gravityValue()!==100)throw Error('adjacent gravity');
 setup(40);step(1/60);if(!inNoJumpZone()||!runJumpDisabled||grounded)throw Error('airborne jump block');const beforeVy=vy;jump();if(vy!==beforeVy||jumpQueued)throw Error('blocked jump input');
 z=44;step(1/120);if(!runJumpDisabled)throw Error('block not retained');z=47.9;step(1/60);if(inNoJumpZone()||runJumpDisabled||grounded)throw Error('airborne jump release');
 setup(40,4);step(1/60);if(runJumpDisabled)throw Error('adjacent jump block');
 setup(32);fuel=50;step(1/60);if(fuel>=50||charge===32)throw Error('fuel pickup rule changed');
}`);
console.log('PASS airborne boost/slow/gravity/no-jump/release, lane isolation, single row trigger, flight preserved and unchanged fuel pickup');
