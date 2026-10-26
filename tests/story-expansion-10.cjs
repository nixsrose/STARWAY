const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,run}=boot();
const cp=require('child_process');const original=JSON.parse(cp.execSync('git show HEAD:dist/story-data.js',{encoding:'utf8',maxBuffer:10000000}).replace(/^const STORY_COURSES=/,'').trim().replace(/;$/,''));
assert.equal(run('STORY_VISIBLE_COUNT'),30);assert.equal(run('STORY_COURSES.length'),30);assert.equal(JSON.stringify(JSON.parse(fs.readFileSync('dist/story-data.js','utf8').replace(/^const STORY_COURSES=/,'').trim().replace(/;$/,'')).slice(0,21)),JSON.stringify(original.slice(0,21)));
for(let stage=21;stage<30;stage++){
 b.stage=stage;run('mode="story";data.unlocked=29;level=stage;beginRun(true);throttle=12;speed=12;globalThis.usedJumps=new Set();');
 run(`for(let tick=0;tick<120*70&&state==='play';tick++){
 const c=STORY_COURSES[level],r=Math.floor(z),wide=rows[r].every(t=>t===1||t===3),target=(c.guide[Math.min(rows.length-1,r)]??3)-3;
 steeringInput=()=>Math.max(-1,Math.min(1,(target-x)*12));
 for(const j of c.jumpRows)if(!usedJumps.has(j)&&z>=j&&z<j+1&&grounded){jump();usedJumps.add(j)}
 step(1/120);
 }`);
 assert.equal(run('state'),'win','stage '+stage+' '+run('deathReason')+' z='+run('z'));
 run('draw();showMenu("story");showMenu("records");');
}
console.log('PASS 9 new stages physically completed at speed12; rendering, selection, records; original21 unchanged');

run('data.unlocked=29;data.cleared=Array.from({length:30},(_,i)=>i);data.storyTimes[29]={best:28};editorMap=normalizeEditorMap(STORY_COURSES[29]);globalThis.back=validateBackup(backupCapture());');
assert.equal(run('back.game.unlocked'),29);assert.equal(run('back.game.storyTimes[29].best'),28);assert.equal(run('medalTargets.length'),30);assert.equal(run('releaseChapters.length'),10);assert.equal(run('nextUnclearedStory()'),null);assert.equal(run('badgeProgress(BADGE_DEFS.find(d=>d.kind==="all"))'),30);
console.log('PASS 30-stage backup, records, medal targets, chapter names and completion');
const geometry=new Set();let forcedFailures=0;
for(let stage=21;stage<30;stage++){
 b.stage=stage;run('level=stage;mode="story";data.unlocked=29;globalThis.hardMap=STORY_COURSES[level];normalizeEditorMap(hardMap);');
 const signature=run('JSON.stringify([hardMap.tiles,hardMap.ceilings,hardMap.tunnelCenters])');assert.ok(!geometry.has(signature),'duplicate geometry');geometry.add(signature);
 run('beginRun(true);throttle=12;speed=12;steeringInput=()=>0;for(let tick=0;tick<120*60&&state==="play";tick++)step(1/120)');if(run('state')!=='win')forcedFailures++;
}
assert.equal(forcedFailures,9);console.log('PASS nine distinct maps normalize for editor; all9 require steering/jumping rather than holding center');
