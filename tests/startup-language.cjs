const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},saved={},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
function boot(storageFails=false){const els={},el=()=>({style:{},children:[],setAttribute:noop,classList:{add:noop,remove:noop,toggle:noop},addEventListener:noop,appendChild(c){this.children.push(c)},getContext:()=>ctx});const b={document:{documentElement:{classList:{remove:noop},lang:""},getElementById:id=>els[id]??(els[id]=el()),querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:1,addEventListener:noop,localStorage:{getItem:k=>saved[k]??null,setItem:(k,v)=>{if(storageFails)throw Error("QuotaExceededError");saved[k]=v},removeItem:k=>delete saved[k]},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);vm.runInContext(fs.readFileSync('dist/'+fs.readFileSync('dist/index.html','utf8').match(/<script src="([^"]+)"/)[1],'utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)}}

const {b,els,run}=boot();assert.equal(run('launch.phase'),'language');assert.equal(run('startupLanguageRequired()'),true);run('chooseStartupLanguage("bad")');assert.equal(run('launch.phase'),'language');
run('data.coins=123;chooseStartupLanguage("en")');assert.equal(run('settings.language'),'en');assert.equal(run('settings.languageConfirmed'),true);assert.equal(run('launch.phase'),'logo');assert.equal(b.document.documentElement.lang,'en');assert.ok(els['lobby-story'].innerHTML.includes('Story'));assert.equal(run('data.coins'),123);
run('chooseStartupLanguage("ja")');assert.equal(run('settings.language'),'en','repeated click ignored');const fresh=boot();assert.equal(fresh.run('settings.language'),'en');assert.equal(fresh.run('startupLanguageRequired()'),false);assert.equal(fresh.run('launch.phase'),'logo');assert.equal(fresh.run('data.coins'),123);
fresh.els.settingLanguage.value='ja';fresh.els.settingLanguage.onchange();assert.equal(fresh.run('settings.language'),'ja');assert.equal(fresh.run('settings.languageConfirmed'),true);const changed=boot();assert.equal(changed.run('settings.language'),'ja');assert.equal(changed.run('startupLanguageRequired()'),false);
console.log('PASS first-run gate, invalid/repeated choices, English lobby, saved choice reload, settings language change and progress preserved');

// Exercise each first-run language, round-trip through Settings, then reload.
for(const language of ['ko','en','ja','zh']){
 for(const key of Object.keys(saved))delete saved[key];
 const first=boot();first.b.language=language;
 first.run('data.coins=321;chooseStartupLanguage(language)');
 assert.equal(first.run('settings.language'),language);
 assert.equal(first.b.document.documentElement.lang,language==='zh'?'zh-CN':language);
 first.run('localizeUI()');
 assert.equal(first.b.document.documentElement.lang,language==='zh'?'zh-CN':language,'language tag must survive localization');
 const reloaded=boot();assert.equal(reloaded.run('settings.language'),language);assert.equal(reloaded.run('launch.phase'),'logo');assert.equal(reloaded.run('data.coins'),321);
 for(const next of ['en','ja','zh','ko',language]){reloaded.els.settingLanguage.value=next;reloaded.els.settingLanguage.onchange();assert.equal(reloaded.b.document.documentElement.lang,next==='zh'?'zh-CN':next);}
 assert.equal(boot().run('settings.language'),language);
}
for(const key of Object.keys(saved))delete saved[key];
const unavailable=boot(true);unavailable.run('chooseStartupLanguage("en")');
assert.equal(unavailable.run('launch.phase'),'logo','storage failure must not block entry');
assert.equal(unavailable.els.settingsNote.textContent,'Storage unavailable. Settings apply to this session.');
assert.equal(unavailable.run('storageOK'),false);
console.log('PASS all four first-run choices, language cycling, reload persistence, zh-CN tag and storage-unavailable entry');

const checks=boot();
for(const lang of ['en','ja','zh']){
 checks.b.lang=lang;checks.run('settings.language=lang');
 for(const source of ['소리 켜기','우주선 조종석','왼쪽 조종','오른쪽 조종','속도','우주선 속도 레버','개인 최고기록 고스트 · 스토리 모드','저장 실패 · 이번 코인과 기록을 저장하지 못했습니다. 저장 공간을 확인한 뒤 재도전하세요.','확인 · ◈ 80 사용','보상 ◈ 120를 받을 수 있습니다.']){
 checks.b.source=source;assert.ok(!/[가-힣]/.test(checks.run('translateDynamic(source)')),lang+': '+source);
 }
 checks.run('state="pause";syncPauseControl();syncGhostButton()');
 checks.run('state="ready";syncPauseControl()');
}
console.log('PASS control descriptions, ghost refresh, pause/resume, save failure, purchase confirmation and reward prompts');
