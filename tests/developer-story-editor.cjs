const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run('data.unlocked=29;showMenu("main");level=29;');els.storyEditorOpen.onclick();assert.notEqual(run('state'),'editor');
run('developerModeEnabled=true;syncDeveloperMode();');assert.match(els.storyEditorOpen.textContent,/맵 에디터/);
els.storyEditorOpen.onclick();assert.equal(run('state'),'editor');assert.equal(run('editorTarget()'),29);assert.equal(run('editorMap.title'),run('STORY_COURSES[29].title'));
els.editorClose.onclick();assert.equal(run('menuScreen'),'main');assert.equal(run('level'),29);
run('developerModeEnabled=false;syncDeveloperMode();');els.storyEditorOpen.onclick();assert.notEqual(run('state'),'editor');
const css=fs.readFileSync('dist/cockpit.css','utf8');assert.ok(css.includes('[data-screen=main][data-developer-mode=on] #storyEditorOpen'));console.log('PASS developer gate, selected10-3 editor load, return to story and disabled gate');
