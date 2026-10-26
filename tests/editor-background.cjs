const fs=require('fs'),vm=require('vm'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const main=createCanvas(760,900),els={},noop=()=>{};function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:760,innerHeight:900,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^\"]+)"/)[1],'utf8'),b);




const assert=require('node:assert/strict');const run=s=>vm.runInContext(s,b);
run("globalThis.fixtureBackground={kind:'deep',color:'#123456',dim:.4,image:''};globalThis.fixtureMap=emptyEditorMap(32);fixtureMap.background=fixtureBackground;globalThis.normalizedFixture=normalizeEditorMap(JSON.parse(JSON.stringify(fixtureMap)));");assert.deepEqual(JSON.parse(run('JSON.stringify(normalizedFixture.background)')),{kind:'deep',color:'#123456',dim:.4,image:''});
run("editorMap=normalizedFixture;renderEditorGrid();$('editorBackgroundKind').value='orbit';$('editorBackgroundColor').value='#112233';$('editorBackgroundDim').value='50';$('editorBackgroundKind').onchange()");assert.equal(run('editorMap.background.kind'),'orbit');assert.equal(run('editorMap.background.dim'),.5);run("$('editorBackgroundClear').onclick()");assert.equal(run('editorMap.background.kind'),'auto');
assert.throws(()=>run("normalizeBackground({kind:'image',image:'data:image/svg+xml;base64,PHN2Zz4='})"));assert.throws(()=>run("normalizeBackground({kind:'deep',dim:9})"));
run("editorMap.background=fixtureBackground;globalThis.originalFixture=STORY_COURSES[0];STORY_COURSES[0]=normalizeEditorMap(editorMap);mode='story';level=0;beginRun(true);draw();");assert.equal(run('drawCustomBackground()'),true);run('STORY_COURSES[0]=originalFixture');console.log('PASS: editor background normalization/JSON roundtrip, UI changes/reset, trial rendering and invalid payload rejection');
