// Startup owns the reveal; the old menu stays hidden until a complete first frame.
const launch={phase:'logo',progress:0,build:typeof document.currentScript?.src==='string'?document.currentScript.src.match(/starway-([a-f0-9]+)\.js/)?.[1]:null};
if(typeof window!=='undefined')window.starwayLaunchPhase='logo';
const launchWords={
 ko:['음악 ON · 화면을 눌러 재생','음악 켜기','음악 ON','화면·그래픽 준비 중','글꼴·인터페이스 준비 중','최신 버전 확인 중','최신 버전 · 준비 완료','새 버전이 있습니다. 새로고침하면 적용됩니다.','버전 확인 불가 · 현재 버전으로 시작할 수 있습니다.','최신 버전 불러오기','준비를 마치지 못했습니다. 다시 시도해 주세요.','다시 불러오기'],
 en:['Music ON · Tap to play','Enable music','Music ON','Preparing graphics','Preparing fonts and interface','Checking for updates','Up to date · Ready','An update is available. Reload to apply it.','Update check unavailable · You can play this version.','Load latest version','Preparation failed. Please try again.','Reload'],
 ja:['音楽 ON · タップして再生','音楽をオン','音楽 ON','画面を準備中','フォントと画面を準備中','更新を確認中','最新バージョン · 準備完了','新しいバージョンがあります。再読み込みしてください。','更新を確認できません。現在のバージョンで開始できます。','最新バージョンを読み込む','準備できませんでした。再試行してください。','再読み込み'],
 zh:['音乐 ON · 点击播放','开启音乐','音乐 ON','正在准备画面','正在准备字体和界面','正在检查更新','已是最新版本 · 准备完成','有新版本，请重新加载。','无法检查更新，可以使用当前版本开始。','加载最新版本','准备失败，请重试。','重新加载']
};
function startupLanguageRequired(){return !settings.languageConfirmed||!Object.hasOwn(launchWords,settings.language)}
function chooseStartupLanguage(language){
 if(launch.phase!=='language'||!Object.hasOwn(launchWords,language))return;
 settings.language=language;settings.languageConfirmed=true;applySettings();showMenu('main');persistSettings();
 $('bootScreen').classList.remove('language');$('bootLanguages').setAttribute('aria-hidden','true');
 document.documentElement.lang=language==='zh'?'zh-CN':language;launch.phase='logo';startLaunch();
}
for(const language of ['ko','en','ja','zh'])$('bootLanguage-'+language).onclick=()=>chooseStartupLanguage(language);
function launchProgress(value,message){launch.progress=value;$('bootFill').style.width=value+'%';$('bootTrack').setAttribute('aria-valuenow',String(value));$('bootMessage').textContent=message;}
function launchReveal(){if(launch.phase==='done')return;launch.phase='done';if(typeof window!=='undefined')window.starwayLaunchPhase='done';draw();document.documentElement.classList.remove('booting');updateMusic();}
async function launchVersion(){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);
 try{const response=await fetch('./version.json',{cache:'no-store',credentials:'same-origin',signal:controller.signal});if(!response.ok)throw Error('version');const latest=await response.json();if(!latest.build||!launch.build)throw Error('version');return latest.build===launch.build?'current':'changed';}catch{return 'offline';}finally{clearTimeout(timer);}
}
async function launchLoading(){
 const w=launchWords[settings.language]||launchWords.ko;
 launch.phase='loading';if(typeof window!=='undefined')window.starwayLaunchPhase='loading';$('bootScreen').classList.add('loading');
 $('bootAudio').textContent=sound?w[0]:w[1];
 $('bootAudio').onclick=()=>{settings.sound=true;sound=true;settings.bgm=true;applySettings();persistSettings();unlockMusic();$('bootAudio').textContent=w[2];};
 prepareLaunchMusic();launchProgress(20,w[3]);
 try{
  draw();await new Promise(resolve=>requestAnimationFrame(resolve));
  launchProgress(50,w[4]);
  if(document.fonts?.ready)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2000))]);
  launchProgress(75,w[5]);const version=await launchVersion();
  launchProgress(100,version==='current'?w[6]:version==='changed'?w[7]:w[8]);
  if(version==='changed'){$('bootContinue').style.display='inline-block';$('bootContinue').textContent=w[9];$('bootContinue').onclick=()=>location.reload();}
  else setTimeout(launchReveal,version==='offline'?1300:500);
 }catch{launchProgress(100,w[10]);$('bootContinue').style.display='inline-block';$('bootContinue').textContent=w[11];$('bootContinue').onclick=()=>location.reload();}
}
function prepareLaunchMusic(){
 if(!sound||!settings.bgm)return;
 const c=flightAudioReady();if(!c)return;
 loadMusic('menu');
 if(c.state==='suspended')Promise.resolve(c.resume()).then(()=>updateMusic()).catch(()=>{});
 updateMusic();
}
function startLaunch(){
 if(startupLanguageRequired()){
  launch.phase='language';if(typeof window!=='undefined')window.starwayLaunchPhase='language';
  $('bootScreen').classList.add('language');$('bootLanguages').setAttribute('aria-hidden','false');return;
 }
 launch.phase='logo';if(typeof window!=='undefined')window.starwayLaunchPhase='logo';
 document.documentElement.lang=settings.language==='zh'?'zh-CN':settings.language;

 // One-time upgrade from the old silent-by-default startup. Subsequent mute choices persist.
 if(!settings.launchAudioV2){settings.launchAudioV2=true;settings.sound=true;settings.bgm=true;sound=true;applySettings();persistSettings();}
 prepareLaunchMusic();setTimeout(launchLoading,2000);
}
