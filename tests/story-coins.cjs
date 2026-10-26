const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
const audit=JSON.parse(run(`JSON.stringify(STORY_COURSES.map((m,i)=>({stage:editorStageLabel(i),coins:m.coins.length,normalized:normalizeEditorMap(m).coins.length})))`));
for(const item of audit){assert.ok(item.coins>0,item.stage+' missing coins');assert.equal(item.normalized,item.coins,item.stage+' normalization lost coins');}
run(`{
 const m=emptyEditorMap(220);m.coins=[[20,3],[90,2],[170,4]];
 const copy=normalizeEditorMap(m);if(JSON.stringify(copy.coins)!==JSON.stringify(m.coins))throw Error('authored coins lost');
 const blank=normalizeEditorMap({...m,coins:[]});if(blank.coins.length<6)throw Error('empty map not repaired');
 for(const [r,l] of blank.coins)if(blank.tiles[r][l]!==1||r<8||r>=217)throw Error('unsafe fallback');
 if(JSON.stringify(normalizeEditorMap(blank).coins)!==JSON.stringify(blank.coins))throw Error('unstable fallback');
 const hazard=emptyEditorMap(64);hazard.roadPaint.forEach(row=>row.fill('pink'));if(normalizeEditorMap(hazard).coins.length)throw Error('unsafe coins on hazard');
 editorMap=emptyEditorMap(64);$('editorTemplate').value='0';$('editorBrush').value='challengeCoin';paintEditorCell(20,3);if(editorMap.coins.length!==1)throw Error('story coin brush failed');paintEditorCell(20,3);if(editorMap.coins.length)throw Error('story coin erase failed');
 const before=JSON.stringify(STORY_COURSES[11].tiles);level=11;mode='story';data.unlocked=29;beginRun();if(!coins.size)throw Error('coins missing from run');if(before!==JSON.stringify(STORY_COURSES[11].tiles))throw Error('geometry changed');
}`);
console.log(JSON.stringify(audit));console.log('PASS story coin preservation, empty-map repair, safe placement, editor brush and runtime');
