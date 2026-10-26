const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();
run(`{settings.language='ko';data.unlocked=29;level=7;showMenu('story');}`);
els.levels.scrollTop=350;
let line=els.description.children.filter(c=>c.className==='story-ship-briefing').at(-1);
assert.ok(line.children[0].textContent.includes('554.4 km/h'));
line.children[1].onclick();assert.equal(run('menuScreen'),'main');assert.equal(run('shipUpgradeReturnToStory'),true);assert.equal(run('shipUpgradeSelection'),run('data.skin'));
run(`{data.coins=1000;purchaseShipUpgrade('speed');purchaseShipUpgrade('speed');}`);
els.shipUpgradesClose.onclick();assert.equal(run('menuScreen'),'story');assert.equal(run('level'),7);assert.equal(els.levels.scrollTop,350);
line=els.description.children.filter(c=>c.className==='story-ship-briefing').at(-1);assert.ok(line.children[0].textContent.includes('604.8 km/h'));
run(`{const old=JSON.stringify(STORY_COURSES[7]);storyCourseTip(7);if(JSON.stringify(STORY_COURSES[7])!==old)throw Error('map mutated');STORY_COURSES[7].gravityGates=[{row:5,lane:3,gravity:300}];}`);
for(const language of ['ko','en','ja','zh']){b.language=language;run('settings.language=language;showMenu("story")');const tip=run('storyCourseTip(7)');assert.ok(tip.length);if(language!=='ko')assert.ok(!/[가-힣]/.test(tip));}
run(`{settings.language='ko';STORY_COURSES[7].medalTargets={gold:9,silver:12};showMenu('story');if(!storyCourseFeatures(7).includes('중력 변환'))throw Error('map features');if(!medalSelection.textContent){} }`.replace('if(!medalSelection.textContent){}',''));
assert.ok(els.medalSelection.innerHTML.includes('9초00'));
console.log('PASS equipped stats, upgrade round trip, selected stage/scroll retention, refreshed stats, live map features/medal settings and four-language tips');
