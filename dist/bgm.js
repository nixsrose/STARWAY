// Music uses the shared audio mixer, and fetches bundled assets only after audio unlock.
const music={buffers:{},loading:{},failed:{},offsets:{menu:0,flight:0},current:null};
Object.assign(uiWords,{'배경음악':['Background music','BGM','背景音乐']});
function desiredMusic(){
 if((typeof window!=='undefined'&&window.starwayLaunchPhase==='logo')||globalThis.flightLifecycleSuspended||!sound||!settings.bgm||document.hidden||!flightAudio.context||flightAudio.context.state!=='running')return null;
 if(state==='ready'||state==='play')return 'flight';
 if(state==='menu'||state==='editor')return 'menu';
 return null;
}
function stopMusic(){
 const active=music.current;if(!active)return;music.current=null;
 const c=flightAudio.context;music.offsets[active.key]=(active.offset+c.currentTime-active.started)%active.buffer.duration;
 active.gain.gain.cancelScheduledValues(c.currentTime);active.gain.gain.setTargetAtTime(0,c.currentTime,.035);active.source.stop(c.currentTime+(document.hidden?0:.15));
}
function loadMusic(key){
 if(music.loading[key]||music.failed[key])return;
 const c=flightAudio.context;
 music.loading[key]=fetch(BGM_TRACKS[key],{credentials:'same-origin'}).then(r=>{if(!r.ok)throw Error('music');return r.arrayBuffer()}).then(bytes=>c.decodeAudioData(bytes)).then(buffer=>{music.buffers[key]=buffer;$('bgmStatus').textContent='';updateMusic()}).catch(()=>{music.failed[key]=true;$('bgmStatus').textContent='배경음악을 불러오지 못했습니다. 다음 조작 때 다시 시도합니다.';}).finally(()=>{delete music.loading[key]});
}
function updateMusic(){
 const key=desiredMusic();if(music.current?.key!==key)stopMusic();if(!key)return;
 const c=flightAudio.context,buffer=music.buffers[key];if(!buffer){loadMusic(key);return;}
 if(!music.current){const source=c.createBufferSource(),gain=c.createGain(),offset=music.offsets[key]%buffer.duration;source.buffer=buffer;source.loop=true;gain.gain.setValueAtTime(0,c.currentTime);source.connect(gain);gain.connect(flightAudio.master);source.onended=()=>{source.disconnect();gain.disconnect()};source.start(0,offset);music.current={key,source,gain,buffer,offset,started:c.currentTime};}
 // Music leaves room for one-shot effects; warning/pickup cues briefly take priority.
 const duck=c.currentTime<flightAudio.duckUntil?.65:1;
 music.current.gain.gain.setTargetAtTime((key==='menu'?.27:.21)*duck*settings.bgmVolume,c.currentTime,.25);
}
function unlockMusic(){flightAudioUnlock();music.failed={};updateMusic()}
for(const event of ['pointerdown','keydown'])document.addEventListener(event,unlockMusic,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>updateMusic());
addEventListener('pagehide',stopMusic);
const musicDraw=draw;draw=function(){musicDraw();updateMusic()};
const musicApply=applySettings;applySettings=function(...args){const out=musicApply(...args);$('settingBGM').value=settings.bgm?'on':'off';updateMusic();return out};
$('settingBGM').value=settings.bgm?'on':'off';$('settingBGM').onchange=()=>{settings.bgm=$('settingBGM').value==='on';applySettings();persistSettings();};
