// Instrument-only speed effects: no changes to physics, maps or saved progress.
function syncSpeedEffectFeedback(){
 const visible=['play','pause'].includes(state),boost=visible&&boostRemaining>0,slow=visible&&!boost&&slowRemaining>0;
 const effect=boost?'boost':slow?'slow':'none',status=$('flightStatus'),dial=$('speedDial');
 status.setAttribute('data-speed-effect',effect);dial.setAttribute('data-speed-effect',effect);
 if(effect==='none'){status.removeAttribute?.('title');return;}
 const words={ko:['가속','감속','복귀','일시정지','가속 중에는 레버의 목표 속도를 유지하며, 종료 후 해당 속도로 복귀합니다.','감속 패드 효과가 끝나면 레버의 목표 속도로 복귀합니다.'],en:['BOOST','SLOW','RETURN','PAUSED','The lever keeps your target speed. Boost ends at that speed.','When the slow effect ends, speed returns to the lever target.'],ja:['加速','減速','復帰','一時停止','レバーの目標速度を維持し、加速終了後に復帰します。','減速終了後、レバーの目標速度へ復帰します。'],zh:['加速','减速','恢复','已暂停','保留速度杆目标速度，加速结束后恢复该速度。','减速结束后恢复速度杆的目标速度。']}[settings.language]||['BOOST','SLOW','RETURN','PAUSED','',''];
 const remaining=boost?boostRemaining:slowRemaining,seconds=(Math.ceil(remaining*10-1e-7)/10).toFixed(1),target=Math.round(Math.min(throttle,shipSpeedCap())*36);
 const text=words[boost?0:1]+' '+seconds+'s · '+words[2]+' '+target+' km/h'+(state==='pause'?' · '+words[3]:'');
 if(status.textContent!==text)status.textContent=text;
 status.setAttribute('title',words[boost?4:5]);
}
const speedEffectCockpit=syncCockpit;syncCockpit=function(...args){const out=speedEffectCockpit(...args);syncSpeedEffectFeedback();return out;};
