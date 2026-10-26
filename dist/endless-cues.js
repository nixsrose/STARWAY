// A preselected gravity value is shown before it becomes active; airborne changes wait.
const pacingCockpit=syncCockpit;syncCockpit=function(){
 pacingCockpit();const active=mode==='endless'&&['ready','play','pause'].includes(state),pending=active&&pendingEndlessGravity!==null,preview=active&&previewEndlessGravity!==null;
 $('gravityPreview').classList.toggle('hidden',!pending&&!preview);
 if(pending||preview){const value=gravityCoefficientFromLegacy(pending?pendingEndlessGravity:previewEndlessGravity),labels={ko:['착지 후','다음'],en:['ON LAND','NEXT'],ja:['着地後','次'],zh:['着陆后','下次']}[settings.language];const text=labels[pending?0:1]+' '+value;if($('gravityPreview').textContent!==text)$('gravityPreview').textContent=text;}
 if(active&&state==='play'){const s=sectionAt(Math.floor(z)),labels={ko:{intro:'적응 항로',build:'항해 중',peak:'집중 구간',recovery:'회복 구간'},en:{intro:'WARM UP',build:'FLIGHT',peak:'CHALLENGE',recovery:'RECOVERY'},ja:{intro:'準備航路',build:'航行中',peak:'挑戦区間',recovery:'回復区間'},zh:{intro:'适应航线',build:'航行中',peak:'挑战路段',recovery:'恢复路段'}}[settings.language];if(s?.pacing)$('flightStatus').textContent=labels[s.pacing];}
};
