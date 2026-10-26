const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={location:{search:'?filming=1'},URLSearchParams,document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}


const {run}=boot();
assert.equal(run('data.unlocked>=STORY_VISIBLE_COUNT-1'),true);
assert.equal(run('data.owned.length===skins.length'),true);
assert.equal(run("['paint','flame','trail'].every(t=>data.cosmetics[t].owned.length===cosmeticCatalog[t].length)"),true);
assert.equal(run('data.owned.every(i=>shipUpgradeKeys.every(k=>data.shipUpgrades[i][k]===5))'),true);
assert.equal(run('challengeCosmeticLocked("paint",7)'),false);
run('save();localStorage.setItem("starway-editor-v1","test");localStorage.removeItem("starway-v2");');
assert.deepEqual(saved,{});
assert.equal(run('Object.keys(data.storyTimes).length'),0);
run('reconcileChallengeCosmetics(data)');
assert.equal(run('data.cosmetics.paint.owned.length'),run('cosmeticCatalog.paint.length'));
const fs2=require('fs');
const codec=fs2.readFileSync('dist/storage-codec.js','utf8');
const native={a:'original','starway-v2':'{"coins":7}'};
const box={location:{search:'?filming=1'},URLSearchParams,localStorage:{get length(){return Object.keys(native).length},key:i=>Object.keys(native)[i],getItem:k=>native[k]??null,setItem:(k,v)=>native[k]=v,removeItem:k=>delete native[k]}};
vm.createContext(box);vm.runInContext(codec,box);
vm.runInContext('localStorage.setItem("starway-v2","changed");localStorage.removeItem("a");',box);
assert.equal(native['starway-v2'],'{"coins":7}');assert.equal(native.a,'original');
console.log('PASS filming: all visible stages, hulls, reward cosmetics, max upgrades; no forged records; saves/removals isolated from native storage');
