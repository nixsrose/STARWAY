// Non-blocking first-flight guide: no physics, clock, throttle or rewards are altered.
settings.flightGuideSeen=typeof settings.flightGuideSeen==='boolean'?settings.flightGuideSeen:data.cleared.includes(0);
settings.secondFlightGuideSeen=typeof settings.secondFlightGuideSeen==='boolean'?settings.secondFlightGuideSeen:data.cleared.includes(1);
let flightGuide=null;
const secondGuideWords={
 ko:['1-2 · 조종 연습','중간 속도로 출발하세요. 좁은 길 앞에서는 감속하고 착지할 길을 먼저 확인하세요.','좁은 길이 다가옵니다. 속도 레버를 내려 감속하고, 진입할 길에 기체를 맞추세요.','앞에 틈이 있습니다. 맞은편 발판을 확인하고 점프할 위치를 잡으세요.','틈이 가까워졌습니다. 가장자리 전에 점프하고 공중에서 착지 위치를 맞추세요.','착지 성공! 먼저 기체를 도로 중앙에 맞춘 뒤 속도를 올리세요.'],
 en:['1-2 · FLIGHT PRACTICE','Launch at moderate speed. Slow before narrow roads and check your landing path.','Narrow road ahead. Lower the throttle and line up with the entrance.','Gap ahead. Check the landing platform and prepare your takeoff.','Gap approaching. Jump before the edge and steer toward your landing.','Landed! Center the ship on the road before accelerating.'],
 ja:['1-2 · 操縦練習','中速で出発。狭い道の前で減速し、着地先を確認しましょう。','狭い道が近づきます。減速して進入する道に機体を合わせましょう。','前方に隙間。向こうの足場を確認してジャンプを準備。','隙間が接近。端の手前でジャンプし空中で着地点を調整。','着地成功！道の中央に機体を合わせてから加速。'],
 zh:['1-2 · 操纵练习','以中速出发。窄路前减速，并提前确认落点。','前方窄路，请降低速度并对准入口。','前方缺口，请观察对面的平台并准备起跳。','即将到达缺口，请在边缘前起跳并在空中调整落点。','着陆成功！先回到道路中央，再加速。']
};
function secondFlightCue(){
 if(state==='ready')return {word:1,focus:['throttleLever']};
 if(flightGuide.age<flightGuide.landedUntil)return {word:5,focus:settings.controls==='joystick'?['analogStick']:['left','right']};
 if(!grounded)return null;
 const start=Math.floor(z)+1,end=Math.min(rows.length-1,start+Math.max(6,Math.ceil(speed*1.5)));
 for(let r=start;r<=end;r++)if(rows[r].every(t=>t===0))return {word:r-z<=Math.max(3,speed*.55)?4:3,focus:['jump']};
 const current=rows[Math.floor(z)]?.filter(t=>t!==0).length||0;
 if(current>1)for(let r=start;r<=Math.min(end,start+Math.ceil(speed*1.2));r++)if(rows[r].filter(t=>t!==0).length===1)return {word:2,focus:['throttleLever']};
 return flightGuide.age<3?{word:1,focus:[]}:null;
}
function secondFlightFailureHint(reason,position){
 if(mode!=='story'||level!==1||editorTesting||creatorActive)return null;
 const kind=failureKind(reason),w={
 ko:['틈 앞에서 점프하고 공중에서 맞은편 발판에 기체를 맞추세요. 높은 블록은 윗면에 착지하세요.','좁은 길 전에 감속하고 좌우 입력을 짧게 나누어 기체를 정렬하세요.'],
 en:['Jump before the gap and steer toward the landing. Land on top of raised blocks.','Slow before the narrow road and make small steering corrections.'],
 ja:['隙間の手前でジャンプし着地先へ調整。高いブロックは上面に着地。','狭い道の前で減速し、小さな左右操作で機体を合わせましょう。'],
 zh:['在缺口前起跳并调整落点，高方块应落在顶部。','窄路前减速，用小幅左右操作对准道路。']
 }[settings.language]||[];
 const row=Math.floor(position);
 if(['fall','collision'].includes(kind))for(let r=Math.max(0,row-12);r<=Math.min(rows.length-1,row+4);r++)if(rows[r].every(t=>t===0))return w[0];
 if(kind==='fall'&&rows.slice(Math.max(0,row-2),row+3).some(r=>r.filter(t=>t!==0).length===1))return w[1];
 return null;
}
const guideWords={ko:['첫 비행 안내','속도 레버를 위로 올리면 출발합니다. 처음에는 중간 속도로 시작하세요.','중앙 도로에서 좌우로 조금씩 움직여 보세요. 좁은 길 앞에서는 속도 레버를 내려 감속할 수 있습니다.','앞의 틈·높은 발판을 확인하세요. 가장자리 직전에 점프하고, 공중에서도 좌우로 착지 위치를 맞추세요.','착지 성공! 민트색 패드로 연료를 채우고, 금색 FINISH까지 도로를 따라가세요.','안내 종료','1-1 조작 안내 시작','1-1에서 안내를 다시 봅니다. 기록은 일반 주행과 동일하게 측정됩니다.'],en:['FIRST FLIGHT','Raise the throttle to launch. Start around half throttle.','Practice small steering movements on the center road. Lower the throttle before narrow sections.','Check the gap or raised platform. Jump just before the edge and steer in the air to line up your landing.','Landed! Mint pads refill fuel. Follow the road to the golden FINISH.','Dismiss guide','Start 1-1 guide','Replay the guide in 1-1. Timing works as in a normal run.'],ja:['初めての飛行','速度レバーを上げると出発します。','左右ボタンかスティックで移動します。','隙間や高い足場を確認。端の手前でジャンプし、空中でも左右に着地点を調整。','着地成功！ミント色で燃料補給。金色のFINISHまで道を進もう。','ガイド終了','1-1 操作ガイド開始','1-1で再確認。タイム計測は通常と同じです。'],zh:['首次飞行','向上推动速度杆即可出发。','使用左右按钮或摇杆移动。','注意缺口和高台。在边缘前起跳，并在空中左右调整落点。','着陆成功！薄荷色地块补充燃料，沿道路飞向金色FINISH。','结束引导','开始1-1操作引导','在1-1重看引导，计时与正常游戏相同。']};
function clearGuideFocus(){for(const id of ['throttleLever','left','right','analogStick','jump'])$(id).classList.remove('tutorial-focus')}
function endFlightGuide(remember=true){const second=flightGuide?.lesson===2;flightGuide=null;clearGuideFocus();$('flightGuide').classList.add('hidden');if(remember){settings[second?'secondFlightGuideSeen':'flightGuideSeen']=true;persistSettings()}}
function displayFlightGuide(){clearGuideFocus();if(flightGuide?.lesson===2){
 const cue=['ready','play'].includes(state)?secondFlightCue():null;
 $('flightGuide').classList.toggle('hidden',!cue);
 if(cue){const w=secondGuideWords[settings.language]||secondGuideWords.ko;$('flightGuideTitle').textContent=w[0];$('flightGuideText').textContent=w[cue.word];$('flightGuideSkip').textContent=(guideWords[settings.language]||guideWords.ko)[5];for(const id of cue.focus)$(id).classList.add('tutorial-focus')}return;
 }if(!flightGuide||!['ready','play'].includes(state)||(flightGuide.stage===2&&!flightGuide.airborne&&!guideObstacleAhead())){$('flightGuide').classList.add('hidden');return}const w=guideWords[settings.language]||guideWords.ko;$('flightGuideTitle').textContent=w[0]+' · '+(flightGuide.stage+1)+'/4';$('flightGuideText').textContent=w[flightGuide.stage+1];$('flightGuideSkip').textContent=w[5];$('flightGuide').classList.remove('hidden');const ids=flightGuide.stage===0?['throttleLever']:flightGuide.stage===1?(settings.controls==='joystick'?['analogStick']:['left','right']):flightGuide.stage===2?['jump']:[];for(const id of ids)$(id).classList.add('tutorial-focus')}
function guideObstacleAhead(){const start=Math.floor(z)+1;for(let row=start;row<=Math.min(rows.length-1,start+Math.max(4,Math.ceil(speed*.9)));row++){const tile=rows[row]?.[Math.floor(x+roadOffset())]||0;if(tile===0||tile===2||tile===8)return true}return false}
const guidedBegin=beginRun;beginRun=function(...args){endFlightGuide(false);const out=guidedBegin(...args);if(mode==='story'&&level===0&&!editorTesting&&!creatorActive&&!settings.flightGuideSeen){flightGuide={stage:0,age:0,airborne:false};displayFlightGuide()}return out};
// The simulation can recurse through the global step for substeps; advance hints once.
let flightGuideStepDepth=0;
const guidedStep=step;step=function(dt){
 if(flightGuideStepDepth)return guidedStep(dt);
 flightGuideStepDepth++;
 try{
  if(flightGuide&&state==='play'&&!grounded&&vy>0)flightGuide.airborne=true;
  const out=guidedStep(dt);
  if(!flightGuide)return out;
  if(!['ready','play','pause'].includes(state)){endFlightGuide(state==='win');return out}
  if(state==='pause'||document.hidden)return out;
  if(state==='play')flightGuide.age+=Math.max(0,Math.min(.05,Number(dt)||0));
  if(state==='play'&&!grounded&&vy>0)flightGuide.airborne=true;
  if(flightGuide.lesson===2){
   if(flightGuide.airborne&&grounded){flightGuide.airborne=false;flightGuide.landedUntil=flightGuide.age+2}
   displayFlightGuide();return out;
  }
  let next=flightGuide.stage;
  if(next===0&&state==='play'&&speed>.1)next=1;
  else if(next===1&&(flightGuide.age>4||Math.abs(steeringInput())>.1))next=2;
  else if(next===2&&flightGuide.airborne&&grounded)next=3;
  else if(next===3&&flightGuide.age>7){endFlightGuide(true);return out}
  if(next!==flightGuide.stage){flightGuide.stage=next;flightGuide.age=0}
  displayFlightGuide();return out;
 }finally{flightGuideStepDepth--}
};
const guidedPause=pause;pause=function(...args){const out=guidedPause(...args);displayFlightGuide();return out};
const guidedMenu=showMenu;showMenu=function(...args){if(flightGuide)endFlightGuide(false);const out=guidedMenu(...args);const w=guideWords[settings.language]||guideWords.ko;$('replayFlightGuide').textContent=w[6];$('replayFlightGuideNote').textContent=w[7];return out};
$('flightGuideSkip').onclick=()=>endFlightGuide(true);$('replayFlightGuide').onclick=()=>{settings.flightGuideSeen=false;persistSettings();mode='story';level=0;beginRun()};

const secondGuideMenu=showMenu;showMenu=function(...args){const out=secondGuideMenu(...args);$('replaySecondFlightGuide').textContent=({ko:'1-2 조종 연습 시작',en:'Start 1-2 flight practice',ja:'1-2 操縦練習を開始',zh:'开始1-2操纵练习'})[settings.language]||'Start 1-2 flight practice';$('replaySecondFlightGuide').disabled=true;$('replaySecondFlightGuide').classList.add('hidden');return out};
$('replaySecondFlightGuide').onclick=()=>{};
