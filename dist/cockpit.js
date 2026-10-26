const gaugeCounts={};
function setSegmentGauge(kind,ratio,total){
 ratio=Math.max(0,Math.min(1,Number.isFinite(ratio)?ratio:0));
 const count=ratio===0?0:Math.ceil(ratio*total);
 if(gaugeCounts[kind]!==count){for(let i=0;i<total;i++)$(kind+'Cell'+i).setAttribute('data-lit',i<count?'true':'false');gaugeCounts[kind]=count;}
 if(kind!=='speed')$(kind+'Gauge').setAttribute('aria-valuenow',String(Math.round(ratio*100)));
}
let leverPointer=null;
function setThrottleLever(value){
if(!Number.isFinite(value)||!['ready','play'].includes(state))return;
const requested=Math.max(0,Math.min(shipSpeedCap(),value));
if(state==='ready'&&requested>0)launchFromRest();
throttle=requested;syncCockpit();
}
function syncCockpit(){
 if(!['ready','play'].includes(state))resetJoystick();
const percent=Math.max(0,Math.min(1,throttle/shipSpeedCap())),lever=$('throttleLever');
$('leverScaleHigh').textContent=Math.round(shipSpeedCap()*.82*36);$('leverScaleMid').textContent=Math.round(shipSpeedCap()*.55*36);$('speedDial').setAttribute('aria-valuemax',String(Math.round(Math.max(BOOST_SPEED,boostSpeed,shipSpeedCap()+2)*36)));
$('leverHandle').style.bottom=Math.max(0,(lever.clientHeight||95)-22)*percent+'px';
$('leverFill').style.height=percent*100+'%';
lever.setAttribute('aria-valuemax',String(shipSpeedCap()));
lever.setAttribute('aria-valuenow',String(Math.round(throttle)));
lever.setAttribute('aria-valuetext',globalThis.starwayUpgradesReady?translateDynamic(throttle===0?'정지':'목표 속도 '+(throttle*36).toFixed(1)+' km/h'):String(throttle));
$('throttle').textContent=(throttle*36).toFixed(1);
setSegmentGauge('speed',speed/Math.max(BOOST_SPEED,boostSpeed,shipSpeedCap()+2),32);
$('speedDial').setAttribute('aria-valuenow',String(Math.round(speed*36)));
$('flightStatus').textContent=state==='ready'?tr('STANDBY / 레버를 올려 출발'):state==='play'?(speed<.1?'IDLE':'ENGINE ACTIVE'):state==='pause'?'FLIGHT PAUSED':state==='falling'?'ALTITUDE LOST':state==='exploding'?'HULL FAILURE':state==='menu'?'SYSTEM READY':'SIGNAL LOST';

setSegmentGauge('fuel',fuel/100,8);
$('fuel').textContent=Math.ceil(fuel)+'%';$('fuelbar').style.width=fuel+'%';
 $('fuelbar').style.background=fuel<20?'#ed8b73':'#91e4b5';
}
const lever=$('throttleLever');
function leverPoint(clientY){const rect=lever.getBoundingClientRect(),travel=Math.max(1,rect.height-22);setThrottleLever(Math.max(0,Math.min(1,(rect.bottom-11-clientY)/travel))*shipSpeedCap())}
lever.addEventListener('pointerdown',e=>{if(!['ready','play'].includes(state))return;e.preventDefault();leverPointer=e.pointerId;lever.setPointerCapture(e.pointerId);leverPoint(e.clientY)});
lever.addEventListener('pointermove',e=>{if(e.pointerId!==leverPointer)return;e.preventDefault();leverPoint(e.clientY)});
for(const type of ['pointerup','pointercancel','lostpointercapture'])lever.addEventListener(type,e=>{if(e.pointerId===leverPointer){leverPointer=null;if(type==='pointerup'&&lever.hasPointerCapture?.(e.pointerId))lever.releasePointerCapture(e.pointerId)}});
lever.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','Home','End'].includes(e.code))return;e.preventDefault();e.stopPropagation();setThrottleLever(e.code==='Home'?0:e.code==='End'?shipSpeedCap():throttle+(e.code==='ArrowUp'?2:-2))});
addEventListener('blur',()=>leverPointer=null);

function resetJoystick(){clearTouchControls();steeringAxis=0;for(const k of ['left','right'])keys[k]=false}
addEventListener('blur',resetJoystick);
const beginWithJoystick=beginRun;beginRun=function(...args){resetJoystick();return beginWithJoystick(...args)};
syncCockpit();
for(const id of ['left','right','jump','throttleLever']){
 const control=$(id);
 for(const type of ['contextmenu','selectstart','dragstart'])control.addEventListener(type,e=>e.preventDefault());
 control.addEventListener('pointerdown',()=>{const selection=typeof getSelection==='function'?getSelection():null;if(selection?.rangeCount)selection.removeAllRanges()});
}

const responsiveInputStep=step;step=function(dt){const playing=state==='play';if(playing&&jumpQueued&&grounded&&vy===0&&jumpBufferRemaining>0)jump();responsiveInputStep(dt);if(playing){steeringTapRemaining=Math.max(0,steeringTapRemaining-dt);if(jumpQueued){jumpBufferRemaining=Math.max(0,jumpBufferRemaining-dt);if(jumpBufferRemaining===0)jumpQueued=false;else if(grounded&&vy===0)jump();}}};
