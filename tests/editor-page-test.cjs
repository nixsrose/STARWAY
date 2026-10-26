const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 editorMap=emptyEditorMap(80);editorPage=2;$('editorPageTestSpeed').value='20';const original=JSON.stringify(STORY_COURSES[0]),progress=JSON.stringify(data),map=JSON.stringify(editorMap);
 if(!testEditorPage()||state!=='play'||z!==29.5||x!==0||speed!==20||throttle!==20)throw Error('page launch');
 step(.01);if(state!=='play'||z<=29.5)throw Error('spawn instant death');
 finish(true);if(JSON.stringify(data)!==progress)throw Error('progress rewards leaked');
 $('start').onclick();if(state!=='editor'||editorPage!==2||JSON.stringify(editorMap)!==map||JSON.stringify(STORY_COURSES[0])!==original)throw Error('return restore');
 editorMap.tiles[29][3]=2;editorMap.tiles[30][3]=2;if(!testEditorPage()||x!==-1)throw Error('safe lane search');openMapEditor();
 editorMap=emptyEditorMap(80);editorPage=2;for(let r=22;r<=35;r++)editorMap.tiles[r].fill(0);if(testEditorPage()||state!=='editor')throw Error('unsafe launch accepted');
 editorMap=emptyEditorMap();editorPage=0;editorMap.tiles[2][3]=0;if(testEditorPage())throw Error('unsafe first page');editorMap.tiles[2][3]=1;
 for(const v of [6,12,16,20,22]){$('editorPageTestSpeed').value=String(v);if(!testEditorPage()||z!==2.5||speed!==v)throw Error('speed');finish(false,'test');$('start').onclick();}
 testEditorMap();if(state!=='ready'||z!==2)throw Error('full test changed');openMapEditor();
}`);
console.log('PASS: page approach, selected speed, safe lane/failure, first page, original full test, return page/map, original course and no reward/progress changes');
