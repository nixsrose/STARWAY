const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,b,els}=boot();
run(`{
 if(STORY_VISIBLE_COUNT!==21||STORY_COURSES.length<30)throw Error('visibility/storage split');
 data.unlocked=29;data.storyTimes[29]={best:12.3};data.cleared=[20,29];editorStoryOverrides[29]=normalizeEditorMap(emptyEditorMap(64));STORY_COURSES[29]=editorStoryOverrides[29];save();localStorage.setItem('starway-story-maps-v1',JSON.stringify(editorStoryOverrides));
 level=29;showMenu('story');if(level!==20||nextUnclearedStory()>20)throw Error('hidden stage selected');
 beginRun(true);time=10;finish(true);if(storyCompletion.level!==20||!$('title').textContent.includes('최종'))throw Error('7-3 final');$('start').onclick();if(level!==20)throw Error('advanced into 8-1');
}`);
const fresh=boot();assert.equal(fresh.run('data.unlocked'),29);assert.equal(fresh.run('data.storyTimes[29].best'),12.3);assert.ok(fresh.run('editorStoryOverrides[29]'));
console.log('PASS7-3 final/hidden navigation and hidden progress/maps survive reload');
