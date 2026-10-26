const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),{createCanvas,Path2D}=require('@napi-rs/canvas');
const noop=()=>{},main=createCanvas(390,844),els={};
function el(){return{style:{},classList:{add:noop,remove:noop,toggle:noop},setAttribute:noop,appendChild:noop,addEventListener:noop,getContext:()=>createCanvas(600,340).getContext('2d')}}
const b={document:{getElementById:id=>id==='game'?main:els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?Object.assign(createCanvas(400,300),{style:{},setAttribute:noop}):el(),addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D,console};
vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity','creator','presentation'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);

let inspected=0,faces=0;
vm.runInContext("globalThis.originalPolyForAudit=poly;poly=function(points){for(const p of points)if(!Number.isFinite(p[0])||!Number.isFinite(p[1]))throw Error('non-finite box face');globalThis.auditFaces++};",b);
for(let index=0;index<21;index++){
 b.which=index;
 vm.runInContext("data.unlocked=20;mode='story';level=which;beginRun(true);globalThis.auditFaces=0;globalThis.auditPositions=[];for(let r=2;r<rows.length;r++){if(rows[r].some(t=>boxHeight(t))&&(r%16===0||JSON.stringify(rows[r])!==JSON.stringify(rows[r-1])||JSON.stringify(rows[r])!==JSON.stringify(rows[r+1])))auditPositions.push(Math.max(2,r-1));}globalThis.originalTilesForAudit=JSON.stringify(rows);",b);
 for(const position of vm.runInContext('auditPositions',b)){b.position=position;for(const laneX of [-2,0,2]){b.laneX=laneX;vm.runInContext("z=position;x=laneX;y=.85;drawBoxSurfaces();drawBoxSurfaces(true)",b);inspected++;}}
 assert.equal(vm.runInContext('JSON.stringify(rows)===originalTilesForAudit',b),true);faces+=vm.runInContext('auditFaces',b);
}
assert.ok(inspected>300);assert.ok(faces>10000);console.log('PASS: '+inspected+' block boundary views across all21 courses, '+faces+' finite faces, unchanged map/collision tiles');
