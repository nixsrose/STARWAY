const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}


const {run}=boot();
assert.equal(run('Object.keys(RELEASE_STORY_MAPS).length'),14);
run(`for(const [key,raw] of Object.entries(RELEASE_STORY_MAPS)){
 const i=Number(key),expected=normalizeEditorMap(raw),actual=STORY_COURSES[i];
 for(const field of ['tiles','roadPaint','ceilings','tunnelCenters','tunnelRadius','boxPaint','gravity','fuelDrainMultiplier','finish','gravityZones','noJumpZones','jumpReleaseZones','speedPads'])if(JSON.stringify(actual[field])!==JSON.stringify(expected[field]))throw Error('map mismatch '+key+' '+field);
 if(JSON.stringify(editorBuiltInCourses[i])!==JSON.stringify(actual))throw Error('original map mismatch '+key);
}`);
assert.equal(run('CHALLENGE_MAP_TEMPLATES.reserve.challengeRules.startFuel'),25);
assert.equal(run('CHALLENGE_MAP_TEMPLATES.reserve.challengeRules.silverTime'),10);
assert.equal(run('CHALLENGE_MAP_TEMPLATES.reserve.challengeRules.goldTime'),8);
assert.equal(run('data.coins'),0);assert.equal(run('data.unlocked'),0);
assert.equal(run('Object.keys(data.storyTimes).length'),0);
assert.equal(run('STORY_VISIBLE_COUNT'),21);
const again=boot();assert.equal(again.run('JSON.stringify(STORY_COURSES[19].tiles)'),run('JSON.stringify(STORY_COURSES[19].tiles)'));
console.log('PASS new browser: all 14 authored story maps equal normalized backup, editor originals match, reserve25/10/8, 21 visible courses, no player progress shipped, reload stable');
