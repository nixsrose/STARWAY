const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run(`editorMap=emptyEditorMap(64);$('editorTemplate').value='0';$('editorBrush').value='noJumpZone';paintEditorCell(8,3);paintEditorCell(9,3);globalThis.custom=normalizeEditorMap(editorMap)`);
assert.equal(run('custom.noJumpZones.length'),2);assert.equal(run('custom.tiles[8][3]'),1);
run(`mode='story';level=0;STORY_COURSES[0]=custom;beginRun(true);z=8.2;speed=0;throttle=0;syncCockpit();jump()`);assert.equal(run('grounded'),true);assert.equal(run('vy'),0);assert.equal(run('inNoJumpZone()'),true);
run(`jumpQueued=true;jumpBufferRemaining=.12;step(1/60)`);assert.equal(run('jumpQueued'),false);assert.equal(run('vy'),0);
run(`x=1;jump()`);assert.equal(run('grounded'),false);assert.ok(run('vy')>0);
run(`beginRun(true);z=7.8;speed=18;throttle=18;jump();step(.05)`);assert.ok(run('y')>0);assert.equal(run('inNoJumpZone()'),true);run(`jump();`);assert.equal(run('jumpQueued'),false);
run(`beginRun(true);z=9.8;speed=18;throttle=18;step(.03);jump()`);assert.equal(run('inNoJumpZone()'),false);assert.ok(run('vy')>0);
run(`beginRun(true);z=8.2;state='pause';jump()`);assert.equal(run('vy'),0);run(`state='play';z=10.2;jump()`);assert.ok(run('vy')>0);
run(`editorMap=JSON.parse(JSON.stringify(custom));$('editorCopyFirst').value='9';$('editorCopyLast').value='10';copyEditorRange();$('editorPasteAt').value='21';$('editorPasteMirror').checked=true;pasteEditorRange()`);assert.equal(run('editorMap.noJumpZones.some(g=>g.row===20&&g.lane===3)'),true);
run(`$('editorBrush').value='noJumpRemove';paintEditorCell(8,3)`);assert.equal(run('noJumpCell(editorMap,8,3)'),false);assert.equal(run('editorMap.tiles[8][3]'),1);
run(`$('editorBrush').value='0';paintEditorCell(9,3)`);assert.equal(run('noJumpCell(editorMap,9,3)'),false);
run(`$('editorLength').value='18';$('editorResize').onclick()`);assert.equal(run('editorMap.noJumpZones.length'),0);
run(`editorMap=JSON.parse(JSON.stringify(custom));$('editorSave').onclick();$('editorSaveAccept').onclick();globalThis.backup=validateBackup(backupCapture())`);assert.equal(run('backup.storyMaps[0].noJumpZones.length'),2);
const fresh=boot();assert.equal(fresh.run('STORY_COURSES[0].noJumpZones.length'),2);
assert.throws(()=>run('normalizeEditorMap({...custom,noJumpZones:[{row:8,lane:0}]})'));
run(`mode='endless';state='play';grounded=true;vy=0;jump()`);assert.ok(run('vy')>0);
console.log('PASS no-jump placement/removal, jump and buffer blocking, lane/exit recovery, incoming flight preserved, pause/retry/endless isolation, mirrored copy, resize, backup/save/reload, invalid cells');
