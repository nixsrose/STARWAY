const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const texts=[],noop=()=>{},map={roadPaint:Array.from({length:30},()=>Array(7).fill('gray'))};
const b={rows:Array.from({length:30},()=>Array(7).fill(1)),z:5,state:'play',activeRoadData:()=>map,boxHeight:t=>t===2?.8:0,draw:noop,finishReducedMotion:()=>true,finishGlint:()=>1,finishSignPresentation:()=>({size:10,alpha:1,stroke:1,glow:2}),proj:(x,z,y)=>[x,z,10],ctx:new Proxy({fillText:t=>texts.push(t)},{get:(o,k)=>o[k]||noop}),performance:{now:()=>0}};
for(let r=8;r<=12;r++)for(let l=2;l<=4;l++)map.roadPaint[r][l]='pink';map.roadPaint[18][1]='pink';b.rows[18][1]=2;
vm.createContext(b);vm.runInContext(fs.readFileSync('dist/danger-marker.js','utf8'),b);
const patches=vm.runInContext('dangerPatches()',b);assert.equal(patches.length,2);assert.equal(patches[0].center,0);assert.equal(patches[0].depth,10.5);assert.equal(patches[1].height,.8);
const before=JSON.stringify(map);vm.runInContext('draw()',b);assert.deepEqual(texts,['DANGER','DANGER']);assert.equal(JSON.stringify(map),before);texts.length=0;b.state='menu';vm.runInContext('draw()',b);assert.equal(texts.length,0);
console.log('PASS: contiguous lethal patch centered once, hazard block height, DANGER text, menu hidden, map unchanged');
