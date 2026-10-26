const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`for(const gravity of [50,100,150,200])for(const type of ['mixed','jump','blocks','tunnel','branch'])for(const difficulty of ['easy','normal','hard'])for(let page=0;page<4;page++)for(let trial=0;trial<5;trial++){
 editorMap=emptyEditorMap(60);editorMap.gravity=gravity;editorMap.finish={row:40,lane:3,type:'road'};editorPage=page;
 $('editorRandomType').value=type;$('editorRandomDifficulty').value=difficulty;
 const old=JSON.stringify(editorMap),before=JSON.parse(old);randomizeEditorPage();
 for(let r=0;r<60;r++){
 const protectedRow=r<6||r<page*16+2||r>=Math.min(60,page*16+16)-2||Math.abs(r-40)<=2;
 if(protectedRow)for(const key of ['tiles','roadPaint','boxPaint','ceilings'])if(JSON.stringify(editorMap[key][r])!==JSON.stringify(before[key][r]))throw Error('protected row '+r);
 if(editorMap.ceilings[r])for(const c of editorMap.tunnelCenters[r])if(![1,3].includes(editorMap.tiles[r][c+3])||editorMap.roadPaint[r][c+3]==='pink')throw Error('blocked tunnel');
 }
 normalizeEditorMap(editorMap);if(JSON.stringify(editorMap.finish)!==JSON.stringify(before.finish))throw Error('finish changed');
 $('editorUndo').onclick();if(JSON.stringify(editorMap)!==old)throw Error('undo mismatch');
}
for(const type of ['jump','blocks','tunnel','branch']){
 const variants=[];for(const difficulty of ['easy','normal','hard']){
 editorMap=emptyEditorMap();editorPage=1;$('editorRandomType').value=type;$('editorRandomDifficulty').value=difficulty;randomizeEditorPage();variants.push(JSON.stringify(editorMap.tiles)+JSON.stringify(editorMap.roadPaint));
 if(type==='jump'){const count=editorMap.tiles.slice(18,30).filter(row=>row.every(t=>t===0)).length;if(count!==({easy:1,normal:2,hard:3})[difficulty])throw Error('gap length');}
 }
 if(new Set(variants).size!==3)throw Error('difficulty identical '+type);
}
`);
console.log('PASS: 1200 generations across types/difficulties/gravity/pages; retained rows, FINISH, tunnel floor, import, undo and distinct difficulty geometry');
