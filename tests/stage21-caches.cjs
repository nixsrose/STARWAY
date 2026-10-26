const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
 data.unlocked=29;mode='story';level=3;beginRun();editorTesting=false;
 for(const position of [2,20,40,80,120]){z=position+.1;const tunnels=collectTunnelMeshes(),hazards=dangerPatches();if(JSON.stringify(tunnels)!==JSON.stringify(uncachedTunnelMeshes())||JSON.stringify(hazards)!==JSON.stringify(scanDangerPatches()))throw Error('cache geometry parity');z+=.2;if(collectTunnelMeshes()!==tunnels||dangerPatches()!==hazards)throw Error('same row rebuild');z=position+1.1;if(collectTunnelMeshes()===tunnels||dangerPatches()===hazards)throw Error('row invalidation');}
 const old=collectTunnelMeshes();beginRun();if(collectTunnelMeshes()===old)throw Error('run invalidation');
 for(const color of Object.keys(ROAD_PAINT_COLORS)){const p=boxFaceColors(color);if(boxFaceColors(color)!==p)throw Error('palette rebuild');}
}`);
console.log('PASS: stage2-1 row-window cache parity/reuse/invalidation, new-run invalidation, palette reuse; no physics or map changes');
