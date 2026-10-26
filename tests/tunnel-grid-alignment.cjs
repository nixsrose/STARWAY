const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run("$('editorTemplate').value='10';$('editorLoadTemplate').onclick()");
assert.equal(run('editorMap.title'), 'Solar Junction · Road 2');
assert.ok(run('Object.values(editorMap.tunnelCenters).flat().every(Number.isInteger)'));
assert.ok(run('Object.values(STORY_COURSES[10].tunnelCenters).flat().every(Number.isInteger)'));
const before=run('JSON.stringify(editorMap.tiles)');
run("globalThis.targetRows=Object.keys(editorMap.tunnelCenters).filter(r=>editorMap.ceilings[r]>0).map(Number);globalThis.first=targetRows[0];globalThis.centersBefore=editorMap.tunnelCenters[first].slice();$('editorBrush').value='0';$('editorColor').value='gray';paintEditorCell(first,centersBefore[0]+3)");
assert.equal(run('editorMap.tunnelCenters[first].includes(centersBefore[0])'),false);
assert.equal(run('editorMap.tunnelCenters[first].length'),run('centersBefore.length-1'));
run("$('editorUndo').onclick()");assert.equal(run('editorMap.tunnelCenters[first].length'),run('centersBefore.length'));
run("$('editorBrush').value='0';for(const r of targetRows)for(const center of [...editorMap.tunnelCenters[r]])paintEditorCell(r,center+3,true);saveEditorToStory()");
assert.ok(run('targetRows.every(r=>!STORY_COURSES[10].ceilings[r]&&!STORY_COURSES[10].tunnelCenters[r].length)'));
run("testEditorMap();z=20;globalThis.remainingMeshes=collectTunnelMeshes().length;restoreEditorRun()");assert.equal(run('remainingMeshes'),0,'editor test contains no deleted shells');
const fresh=boot();assert.ok(fresh.run('Object.keys(STORY_COURSES[10].tunnelCenters).every(r=>!STORY_COURSES[10].ceilings[r])'),'deletion survives save/reload');
run("globalThis.legacy=emptyEditorMap(32);legacy.ceilings[8]=1.15;legacy.tunnelCenters[8]=[-2.4,-1.5,-.65,.65,1.5,2.4];editorMap=normalizeEditorMap(legacy)");
assert.equal(run('JSON.stringify(editorMap.tunnelCenters[8])'),'[-2,-1,1,2]');
assert.equal(run('JSON.stringify(normalizeEditorMap(editorMap).tunnelCenters[8])'),'[-2,-1,1,2]','normalization idempotent');
run("$('editorBrush').value='tunnel';paintEditorCell(8,3);$('editorBrush').value='0';paintEditorCell(8,3)");assert.equal(run('editorMap.tunnelCenters[8].includes(0)'),false);
console.log('PASS 4-2 grid alignment, per-cell removal/neighbor preservation/undo, all tunnel deletion, saved reload, symmetric legacy snapping and new tunnel erase');
