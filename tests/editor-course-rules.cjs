const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run(`showMenu('main');developerModeEnabled=true;editorMap=emptyEditorMap(64);$('editorTemplate').value='0';renderEditorGrid();$('editorMedalGold').value='8';$('editorMedalSilver').value='11';$('editorQuickSave').onclick();$('editorSaveAccept').onclick()`);
assert.equal(run('STORY_COURSES[0].medalTargets.gold'),8);assert.equal(run('medalTargetFor(0).silver'),11);
run('data.storyTimes[0]={best:10}');assert.equal(run('medalTier(0)'),'silver');assert.equal(run('reportTierAt(8,0)'),'gold');assert.ok(run('medalGoalText(0)').includes('08초'));
run(`$('editorMedalGold').value='15';$('editorMedalSilver').value='11'`);assert.equal(run('applyStoryMedalSettings()'),false);assert.equal(run('editorMap.medalTargets.gold'),8);
run(`renderEditorGrid();$('editorBrush').value='gravityGate';paintEditorCell(8,3)`);assert.equal(run('pendingGravityDevice.row'),8);assert.equal(run('editorMap.gravityGates'),undefined);
run(`$('gravityDeviceCancel').onclick()`);assert.equal(run('pendingGravityDevice'),null);
run(`paintEditorCell(8,3);$('gravityDeviceValue').value='500';$('gravityDeviceApply').onclick()`);assert.equal(run('editorMap.gravityGates[0].gravity'),500);
run(`paintEditorCell(8,3);$('gravityDeviceValue').value='50';$('gravityDeviceApply').onclick()`);assert.equal(run('editorMap.gravityGates.length'),1);assert.equal(run('editorMap.gravityGates[0].gravity'),50);
run(`$('editorBrush').value='finishRoad';paintEditorCell(20,2);paintEditorCell(30,4);globalThis.copy=normalizeEditorMap(JSON.parse(JSON.stringify(editorMap)))`);assert.equal(run('copy.finishes.length'),2);assert.equal(run('copy.gravityGates[0].gravity'),50);assert.equal(run('copy.medalTargets.gold'),8);
assert.equal(run('mapFinishReached(copy,20.4,-1,0,20.7,-1,0)'),true);assert.equal(run('mapFinishReached(copy,30.4,1,0,30.7,1,0)'),true);assert.equal(run('mapFinishReached(copy,20.4,0,0,20.7,0,0)'),false);
run(`STORY_COURSES[0]=copy;mode='story';level=0;beginRun(true);speed=18;throttle=18;z=8.4;x=0;step(1/60)`);assert.equal(run('gravityValue()'),50);
run(`beginRun(true);speed=18;throttle=18;z=8.4;x=1;step(1/60)`);assert.equal(run('gravityValue()'),100);
run(`beginRun(true);speed=18;throttle=18;z=8.4;x=0;y=2;grounded=false;step(1/60)`);assert.equal(run('gravityValue()'),50);
for(const [zz,xx]of [[20.4,-1],[30.4,1]]){b.zz=zz;b.xx=xx;run(`beginRun(true);speed=18;throttle=18;z=zz;x=xx;step(1/60)`);assert.equal(run('state'),'win');}
run(`editorMap=copy;$('editorBrush').value='finishRemove';paintEditorCell(20,2)`);assert.equal(run('editorMap.finishes.length'),1);assert.equal(run('editorMap.tiles[20][2]'),1);
run(`$('editorBrush').value='gravityGateRemove';paintEditorCell(8,3)`);assert.equal(run('editorMap.gravityGates.length'),0);
run(`editorMap=normalizeEditorMap({...copy,gravityGates:[{row:8,lane:3,gravity:500}]});$('editorLength').value='24';$('editorResize').onclick()`);assert.equal(run('editorMap.medalTargets.gold'),8);assert.equal(run('editorMap.gravityGates[0].gravity'),500);assert.equal(run('editorMap.finishes.length'),0);
assert.throws(()=>run('normalizeEditorMap({...copy,gravityGates:[{row:8,lane:3,gravity:600}]})'));
run(`globalThis.backup=validateBackup(backupCapture());save()`);const again=boot();assert.equal(again.run('medalTargetFor(0).gold'),8);
console.log('PASS story medal save/UI/ranking/reload, gravity modal cancel/edit, persistence, crossing/lane/height/reset, multiple finish routes/removal, resize and invalid metadata');
