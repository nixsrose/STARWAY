const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 editorMap=emptyEditorMap(64);$('editorTemplate').value='0';$('editorBrush').value='noJumpZone';paintEditorCell(8,3);$('editorBrush').value='jumpAllowZone';paintEditorCell(15,3);
 const map=normalizeEditorMap(editorMap);if(map.jumpAllowZones.length!==1||map.noJumpZones.length!==1)throw Error('zone normalization');STORY_COURSES[0]=map;level=0;mode='story';data.unlocked=29;beginRun(true);state='play';z=8.2;throttle=0;speed=0;step(1/120);jump();if(!grounded||vy)throw Error('block entry failed');
 z=12;x=1;step(1/120);jump();if(!inNoJumpZone()||!grounded)throw Error('block did not persist across lane/row exit');
 z=15.2;x=1;step(1/120);if(!inNoJumpZone())throw Error('wrong lane released');
 x=0;step(1/120);if(inNoJumpZone())throw Error('enable failed');jump();if(grounded||vy<=0)throw Error('jump not restored');
 beginRun(true);state='play';if(runJumpDisabled)throw Error('retry retained lock');z=8.2;updateRunJumpZone();z=14.9;speed=22;throttle=22;step(1/60);if(inNoJumpZone()||runJumpDisabled)throw Error('swept enable missed');
 z=8.2;updateRunJumpZone();z=20;state='pause';step(1/120);if(!runJumpDisabled)throw Error('pause changed lock');mode='endless';if(inNoJumpZone())throw Error('endless leaked lock');
 editorMap=JSON.parse(JSON.stringify(map));$('editorCopyFirst').value='16';$('editorCopyLast').value='16';copyEditorRange();$('editorPasteAt').value='25';$('editorPasteMirror').checked=true;pasteEditorRange();if(!jumpAllowCell(editorMap,24,3))throw Error('copy lost enable zone');
 const round=normalizeEditorMap(JSON.parse(JSON.stringify(editorMap)));if(!jumpAllowCell(round,24,3))throw Error('export/import lost zone');
 $('editorBrush').value='noJumpRemove';paintEditorCell(15,3);if(jumpAllowCell(editorMap,15,3)||editorMap.tiles[15][3]!==1)throw Error('remove damaged road');
 $('editorBrush').value='jumpAllowZone';paintEditorCell(8,3);if(noJumpCell(editorMap,8,3)||!jumpAllowCell(editorMap,8,3))throw Error('overlap replacement failed');
 $('editorBrush').value='0';paintEditorCell(8,3);if(jumpAllowCell(editorMap,8,3))throw Error('erase orphaned zone');
 $('editorLength').value='18';$('editorResize').onclick();if(editorMap.jumpAllowZones.some(g=>g.row>=18))throw Error('resize orphaned zone');
 mode='story';editorMap=JSON.parse(JSON.stringify(map));$('editorSave').onclick();$('editorSaveAccept').onclick();if(!validateBackup(backupCapture()).storyMaps[0].jumpAllowZones.length)throw Error('backup lost zone');
}`);
const fresh=boot();assert.equal(fresh.run('STORY_COURSES[0].jumpAllowZones.length'),1);
assert.throws(()=>run('normalizeEditorMap({...emptyEditorMap(64),jumpAllowZones:[{row:15,lane:0}]})'));
console.log('PASS enable zone persistence/release, wrong lane, swept entry, retry/pause/endless, copy/import/resize/remove, save/backup/reload');
