const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,b,els}=boot();
run(`{
 const map=emptyEditorMap(500);map.tiles[8][3]=4;map.tiles[12][3]=5;map.speedPads=[{row:8,lane:3,speedKmh:1000},{row:12,lane:3,speedKmh:100}];
 const normalized=normalizeEditorMap(map);if(normalized.speedPads.length!==2)throw Error('normalize loses speed');
 for(const speed of [1001,-1,1.5]){try{normalizeMapExtras(map,{speedPads:[{row:8,lane:3,speedKmh:speed}]});throw Error('accepted invalid speed')}catch(e){if(e.message==='accepted invalid speed')throw e;}}
 STORY_COURSES[0]=map;mode='story';level=0;editorTesting=true;beginRun(true);z=8.1;x=0;y=.9;grounded=false;vy=1;throttle=12;step(1/120);
 if(Math.abs(speed*36-1000)>1e-7||boostRemaining!==3)throw Error('custom airborne boost');
 state='pause';step(.5);if(boostRemaining!==3)throw Error('paused timer');state='play';z=12.1;padRow=-1;step(1/120);if(boostRemaining!==0||slowTargetSpeed!==100/36)throw Error('custom slow priority');
 beginRun(true);if(boostSpeed!==BOOST_SPEED||slowTargetSpeed!==null)throw Error('reset targets');editorTesting=false;
 editorMap=emptyEditorMap(64);$('editorBrush').value='4';editorPadSpeeds[4]=975;paintEditorCell(10,2);if(editorMap.speedPads[0].speedKmh!==975)throw Error('paint speed');
 $('editorCopyFirst').value='11';$('editorCopyLast').value='11';copyEditorRange();$('editorPasteAt').value='21';$('editorPasteMirror').checked=true;pasteEditorRange();if(!editorMap.speedPads.some(p=>p.row===20&&p.lane===4&&p.speedKmh===975))throw Error('mirror speed');
 const restored=normalizeEditorMap(JSON.parse(JSON.stringify(editorMap)));if(restored.speedPads.length!==2)throw Error('round trip');
 $('editorBrush').value='1';paintEditorCell(10,2);if(editorMap.speedPads.some(p=>p.row===10))throw Error('stale pad metadata');
 $('editorBrush').value='5';openSpeedPadEditor();$('speedPadValue').value='0';$('speedPadApply').onclick();paintEditorCell(30,3);if(speedPadSetting(editorMap,30,3)!==0)throw Error('zero slow');
}`);
console.log('PASS pad speed validation, 1000kmh airborne boost, custom slow/priority, pause/retry, paint, mirrored copy, JSON round trip, erase cleanup and zero slow');
