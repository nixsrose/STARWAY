// Shared mixer for BGM and bounded one-shot effects. No continuous engine sound.
const flightAudio={context:null,master:null,effects:null,voices:0,last:{},duckUntil:0};
function flightAudioReady(){
 if(!sound||document.hidden||globalThis.flightLifecycleSuspended)return null;
 try{
  if(!flightAudio.context){
   const C=globalThis.AudioContext||globalThis.webkitAudioContext;if(!C)return null;
   const c=new C(),master=c.createGain(),compressor=c.createDynamicsCompressor();
   master.gain.value=.65;compressor.threshold.value=-22;compressor.ratio.value=4;compressor.knee.value=18;compressor.attack.value=.008;compressor.release.value=.15;master.connect(compressor);compressor.connect(c.destination);
   flightAudio.context=c;flightAudio.master=master;flightAudio.effects=c.createGain();flightAudio.effects.gain.value=settings.sfxVolume;flightAudio.effects.connect(master);

  }
  return flightAudio.context;
 }catch{return null;}
}
function flightAudioUnlock(){const c=flightAudioReady();if(c?.state==='suspended')c.resume().catch(()=>{});}
function flightTone(f,end,duration,volume,type='sine',delay=0){
 const c=flightAudioReady();if(!c||c.state!=='running'||flightAudio.voices>=12)return;
 const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();flightAudio.voices++;o.type=type;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(flightAudio.effects);o.onended=()=>{flightAudio.voices--;o.disconnect();g.disconnect()};o.start(t);o.stop(t+duration+.02);
}
function flightNoise(duration=.4,volume=.2){
 const c=flightAudioReady();if(!c||c.state!=='running'||flightAudio.voices>=12)return;
 const b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
 const s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();s.buffer=b;f.type='lowpass';f.frequency.value=1500;g.gain.setValueAtTime(volume,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+duration);s.connect(f);f.connect(g);g.connect(flightAudio.effects);flightAudio.voices++;s.onended=()=>{flightAudio.voices--;s.disconnect();f.disconnect();g.disconnect()};s.start();s.stop(c.currentTime+duration);
}
function flightSfx(name,detail={}){
 const c=flightAudioReady();if(!c||c.state!=='running')return;
 const cooldown={coin:.065,fuel:.2,jump:.12,landing:.12,ui:.07,crash:.8,fall:.8,complete:1,warning:4}[name]||.1;
 if(c.currentTime-(flightAudio.last[name]??-Infinity)<cooldown)return;flightAudio.last[name]=c.currentTime;
 if(['coin','fuel','jump','warning','landing'].includes(name))flightAudio.duckUntil=Math.max(flightAudio.duckUntil,c.currentTime+(name==='fuel'?.4:.22));
 if(name==='jump'){flightTone(170,620,.16,.07,'triangle');flightTone(90,180,.1,.045);flightNoise(.045,.018)}
 else if(name==='landing'){const strength=Math.max(.35,Math.min(1,detail.strength??.7));flightTone(detail.roof?140:95,detail.roof?65:40,.08+.06*strength,.035+.05*strength,'triangle');flightNoise(.04+.04*strength,.012+.028*strength)}
 else if(name==='coin'){flightTone(1250,1250,.09,.06);flightTone(1875,1875,.13,.045,'sine',.045)}
 else if(name==='fuel'){[440,660,880].forEach((f,i)=>flightTone(f,f,.16,.065,'triangle',i*.07))}
 else if(name==='boost')flightTone(180,950,.3,.08,'triangle');
 else if(name==='slow')flightTone(500,100,.28,.08,'triangle');
 else if(name==='crash'){flightNoise(.65,.15);flightTone(125,28,.6,.11,'triangle')}
 else if(name==='fall')flightTone(420,45,.7,.08,'triangle');
 else if(name==='complete'){[523,659,784,1046].forEach((f,i)=>flightTone(f,f,.32,.07,'triangle',i*.11))}
 else if(name==='record'){[1046,1318,1568].forEach((f,i)=>flightTone(f,f,.35,.06,'sine',.5+i*.09))}
 else if(name==='warning'){flightTone(650,650,.1,.055,'sine');flightTone(650,650,.1,.055,'sine',.2)}
 else if(name==='ready')flightTone(220,440,.18,.065,'triangle');
 else if(name==='failure')flightTone(180,55,.3,.08,'triangle');
 else flightTone(740,540,.065,.045,'sine');
}
// Route the legacy semantic call sites to distinct designed sounds.
beep=function(freq,duration=.12){
 const names={650:'jump',115:'landing',1400:'coin',1000:'fuel',1200:'boost',300:'slow',65:'crash',180:'fall',900:'complete',80:'failure',500:'ready',700:'ui'};
 flightSfx(names[freq]||'ui');
};
function updateFlightAudio(){
 const c=flightAudio.context;if(!c)return;
 const enabled=sound&&!document.hidden&&!globalThis.flightLifecycleSuspended;
 flightAudio.master.gain.setTargetAtTime(enabled?.65:0,c.currentTime,.015);flightAudio.effects.gain.setTargetAtTime(settings.sfxVolume,c.currentTime,.02);

}
const audioDraw=draw;draw=function(){audioDraw();updateFlightAudio()};
const audioStep=step;step=function(dt){
 const wasGrounded=grounded,oldVy=vy,wasPlaying=state==='play';audioStep(dt);
 if(wasPlaying&&!wasGrounded&&grounded&&oldVy< -1&&state==='play')flightSfx('landing',{strength:Math.abs(oldVy)/7.8,roof:!!tunnelGrounded});
 if(state==='play'&&fuel>0&&fuel<=20)flightSfx('warning');
};
const audioBegin=beginRun;beginRun=function(...args){flightAudio.last={};return audioBegin(...args)};
const audioFinish=finish;finish=function(win,reason){
 const best=mode==='story'?data.storyTimes[level]?.best:null,record=win&&state==='play'&&!editorTesting&&mode==='story'&&time>0&&(!best||time<best);
 const out=audioFinish(win,reason);if(record)flightSfx('record');return out;
};result=finish;
for(const event of ['pointerdown','keydown'])document.addEventListener(event,flightAudioUnlock,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{updateFlightAudio();if(document.hidden||globalThis.flightLifecycleSuspended)flightAudio.context?.suspend().catch(()=>{});else flightAudioUnlock()});
const audioSoundClick=$('sound').onclick;$('sound').onclick=()=>{audioSoundClick();flightAudioUnlock();updateFlightAudio()};
const audioApplySettings=applySettings;applySettings=function(...args){const r=audioApplySettings(...args);flightAudioUnlock();updateFlightAudio();return r};
