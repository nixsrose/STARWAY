const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v,removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync(process.env.STARWAY_BENCH_BUNDLE||'dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {run,b,els}=boot();
assert.equal(run('settings.steeringSensitivity'),1);
for(const [percent,distance] of [[50,.24],[100,.48],[150,.72]]){
 b.percent=percent;b.distance=distance;
 run(`mode='story';level=0;STORY_COURSES[0]=emptyEditorMap(500);beginRun(true);setSteeringSensitivity(percent);keys.ArrowRight=true;step(.1);keys.ArrowRight=false;if(Math.abs(x-distance)>1e-7)throw Error('keyboard sensitivity '+x);steeringAxis=.5;if(Math.abs(steeringInput()-.5*percent/100)>1e-7)throw Error('joystick sensitivity');steeringAxis=0;keys.left=true;if(Math.abs(steeringInput()+percent/100)>1e-7)throw Error('button sensitivity');keys.left=false;`);
}
assert.equal(run("JSON.parse(localStorage.getItem('starway-v2')).settings.steeringSensitivity"),1.5);
const fresh=boot();assert.equal(fresh.run('settings.steeringSensitivity'),1.5);
run(`{const backup=backupCapture();if(validateBackup(backup).game.settings.steeringSensitivity!==1.5)throw Error('backup sensitivity');backup.game.settings.steeringSensitivity=2;try{validateBackup(backup);throw Error('accepted invalid sensitivity')}catch(e){if(e.message==='accepted invalid sensitivity')throw e;}delete backup.game.settings.steeringSensitivity;if(validateBackup(backup).game.settings.steeringSensitivity!==1)throw Error('legacy default');$('steeringSensitivityReset').onclick();if(settings.steeringSensitivity!==1)throw Error('reset');}`);
const html=fs.readFileSync('dist/index.html','utf8');assert.ok(!html.includes('id="introStudyPanel"'));assert.ok(html.includes('id="diagnosticToggle"')&&html.includes('전체 백업 다운로드'));
console.log('PASS sensitivity scales buttons/joystick/keyboard, persistence/reload, backup bounds/legacy default/reset; early playtest UI removed, diagnostics and backup retained');
