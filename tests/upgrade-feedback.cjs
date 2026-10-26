const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run}=boot();
run(`{
showMenu('main');data.coins=1000;openShipUpgrades();
const cost=shipUpgradeCost(data.skin,'speed');purchaseShipUpgrade('speed');purchaseShipUpgrade('speed');
if(!shipUpgradeFeedback||shipUpgradeFeedback.key!=='speed')throw Error('success feedback missing');
if(!$('shipUpgradeStatus').textContent.includes('554.4 km/h → 604.8 km/h'))throw Error('before/after speed');
if(data.coins!==1000-cost)throw Error('deduction');
closeShipUpgrades();openShipUpgrades();if(shipUpgradeFeedback)throw Error('stale feedback');
data.coins=0;renderShipUpgradePanel();const fuelButton=$('shipUpgradeCards').children.at(-1).children.at(-1);
if(fuelButton.disabled||!fuelButton.textContent.includes('부족'))throw Error('shortfall navigation');
fuelButton.onclick();if(!$('questCards').children.length||data.coins!==0)throw Error('quest route');
closeQuestPanel();openShipUpgrades();data.shipUpgrades[data.skin].fuel=5;renderShipUpgradePanel();const max=$('shipUpgradeCards').children.at(-1);if(!max.children.at(-1).disabled||max.children.at(-1).textContent!=='MAX'||!max.children[2].textContent.includes('128%'))throw Error('max display');
if(displayDistance(100)!==1000||speedKmh(21)!==756)throw Error('world display scale');
for(const language of ['ko','en','ja','zh']){settings.language=language;if(!upgradeText('done')||!upgradeText('missing'))throw Error('locale');}
}`);console.log('PASS upgrade before/after, success feedback, shortfall quest route, MAX, world display scale and four languages');
