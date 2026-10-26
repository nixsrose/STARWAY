const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 editorMap=emptyEditorMap();editorMap.tiles[8]=[0,1,2,3,8,1,0];editorMap.roadPaint[8]=['gray','mint','ochre','aqua','lime','pink','gray'];editorMap.boxPaint[8][2]='ochre';editorMap.ceilings[8]=1.15;editorMap.tunnelCenters[8]=[-2];editorMap.tunnelRadius[8]=.49;
 $('editorCopyFirst').value='9';$('editorCopyLast').value='10';if(!copyEditorRange())throw Error('copy');const before=JSON.stringify(editorMap);$('editorPasteAt').value='25';$('editorPasteMirror').checked=true;
 if(!pasteEditorRange())throw Error('paste');if(JSON.stringify(editorMap.tiles[24])!==JSON.stringify([0,1,8,3,2,1,0])||editorMap.tunnelCenters[24][0]!==2||editorMap.roadPaint[24][1]!=='pink'||editorMap.boxPaint[24][4]!=='ochre')throw Error('mirror attributes');
 if(editorPage!==1)throw Error('page');$('editorUndo').onclick();if(JSON.stringify(editorMap)!==before)throw Error('undo');
 editorMap.tiles[8][1]=5;if(editorRangeClipboard[0].tiles[1]!==1)throw Error('clipboard alias');$('editorPasteMirror').checked=false;$('editorPasteAt').value='10';if(!pasteEditorRange()||editorMap.tiles[9][1]!==1)throw Error('overlap');
 const saved=JSON.stringify(editorMap),undos=editorUndoStack.length;$('editorPasteAt').value='64';if(pasteEditorRange()||JSON.stringify(editorMap)!==saved||editorUndoStack.length!==undos)throw Error('overflow');
 editorMap=emptyEditorMap();editorMap.finish={row:30,lane:3,type:'road'};$('editorCopyFirst').value='9';$('editorCopyLast').value='9';copyEditorRange();$('editorPasteAt').value='31';if(pasteEditorRange())throw Error('missing finish review');if(!pasteEditorRange()||editorMap.finish.row!==30)throw Error('review apply');
 editorMap.tiles[8][3]=0;copyEditorRange();const original=JSON.stringify(editorMap);if(pasteEditorRange()||JSON.stringify(editorMap)!==original)throw Error('invalid finish');
 $('editorPasteAt').value='3';if(pasteEditorRange())throw Error('unsafe start');editorMap.tiles[8][3]=1;copyEditorRange();if(pasteEditorRange())throw Error('missing start review');if(!pasteEditorRange())throw Error('start apply');
 editorPage=2;$('editorSelectPage').onclick();if($('editorCopyFirst').value!=='33'||$('editorCopyLast').value!=='48')throw Error('page selection');
 const stack=editorUndoStack.length;$('editorCopyFirst').value='0';if(copyEditorRange()||editorUndoStack.length!==stack)throw Error('invalid copy');
}`);
console.log('PASS: deep copy, overlapping paste, tile/color/fuel/block/tunnel mirror, undo, page selection, overflow, START/FINISH review and invalid geometry protection');
