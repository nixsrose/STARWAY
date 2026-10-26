const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
// A shell crossing between old .05/.5/.95 samples must still occlude.
if(!rayTunnelShell(0,2.6,0,-2.15,0,.49,1.15,.66,.70))throw Error('continuous roof intersection');
if(rayTunnelShell(0,.4,0,0,0,.49,1.15,0,.99))throw Error('inside tunnel visibility');
if(rayTunnelShell(2,2.6,0,-2.15,0,.49,1.15,0,.99))throw Error('outside tunnel false hide');
if(rayTunnelShell(0,2.6,0,-2.15,0,.49,1.15,.1,.5))throw Error('finite tunnel end');
// Dense independent surface samples are always detected by the analytic test.
for(let i=0;i<300;i++){const cx=(i%17-8)*.11,cy=2.6,dx=((i*7)%19-9)*.1,dy=-2.15;let dense=false;for(let n=1;n<2000;n++){const t=n/2000,xx=cx+dx*t,yy=cy+dy*t;if(t<.15||t>.95||Math.abs(xx)>.49)continue;const roof=1.15*Math.sqrt(1-(xx/.49)**2);if(yy>=roof&&yy<=roof+.12){dense=true;break;}}if(dense&&!rayTunnelShell(cx,cy,dx,dy,0,.49,1.15,.15,.95))throw Error('missed shell '+i);}
mode='story';level=9;data.unlocked=29;beginRun();z=110;x=0;const before=JSON.stringify(STORY_COURSES[9]),calls=[],boxes=drawBoxSurfaces,tunnels=drawTunnelFrames;drawBoxSurfaces=(f,range,lane)=>calls.push({kind:'box',range,lane,center:lane-roadOffset()+.5});drawTunnelFrames=(f,range,meshes)=>{for(const m of meshes||[])for(const center of m.centers)calls.push({kind:'tunnel',range,center})};drawSolidStructures();drawBoxSurfaces=boxes;drawTunnelFrames=tunnels;if(!calls.some(c=>c.kind==='box')||!calls.some(c=>c.kind==='tunnel'))throw Error('mixed corridor');for(let i=1;i<calls.length;i++)if(calls[i].range.start===calls[i-1].range.start&&Math.abs(calls[i].center)>Math.abs(calls[i-1].center)+1e-7)throw Error('corridor order');if(JSON.stringify(STORY_COURSES[9])!==before)throw Error('map mutation');
settings.flightGuideSeen=false;level=0;beginRun();if(!flightGuide)throw Error('1-1 guide missing');level=1;settings.secondFlightGuideSeen=false;beginRun();if(flightGuide)throw Error('1-2 guide remains');
}`);console.log('PASS continuous finite tunnel occlusion, dense-ray agreement, mixed corridor draw order, map integrity and 1-1-only tutorial');
