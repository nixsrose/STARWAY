// Capture the point of failure before the forward-moving fall camera advances.
let runFailure=null,runStartingBest=0;
const failureWords={
 collision:['▣','장애물 충돌','장애물의 옆면을 피하거나 위로 점프하세요.','Obstacle collision','Avoid the sides or jump onto the top.','障害物に衝突','側面を避けるか上へジャンプ。','撞到障碍','避开侧面，或跳到顶部。'],
 tunnel:['∩','터널 충돌','터널 입구에 맞춰 진입하거나 지붕 위로 이동하세요.','Tunnel collision','Align with the entrance or travel over the roof.','トンネルに衝突','入口に合わせるか屋根の上へ。','撞到隧道','对准入口，或从顶部通过。'],
 hazard:['⚠','위험 구역 접촉','진홍색 바닥과 블록은 닿으면 폭발합니다.','Hazard contact','Crimson surfaces explode on contact.','危険地帯に接触','深紅の床とブロックは接触すると爆発。','接触危险区域','触碰深红色地面和方块会爆炸。'],
 fuel:['▱','연료 소진','속도를 조절하고 연료 패드를 확보하세요.','Out of fuel','Manage speed and collect fuel pads.','燃料切れ','速度を調整し燃料パッドを確保。','燃料耗尽','控制速度，并经过补给地块。'],
 fall:['↓','항로 이탈','다음 발판까지의 거리와 점프 시점을 확인하세요.','Off course','Check the next platform and jump timing.','航路から落下','次の足場とジャンプのタイミングを確認。','偏离航线','注意下一个平台和起跳时机。']
};
function failureKind(reason){return reason?.includes('위험')?'hazard':reason==='연료 소진'?'fuel':reason?.includes('터널')||reason?.includes('상단 구조')?'tunnel':reason?.includes('충돌')?'collision':'fall'}
function thirdFlightFailureHint(reason,position){
 if(mode!=='story'||level!==2||editorTesting||creatorActive)return null;
 const kind=failureKind(reason);if(!['fall','collision'].includes(kind))return null;
 const row=Math.floor(position);let gap=false;
 for(let r=Math.max(0,row-14);r<=Math.min(rows.length-1,row+4);r++)if(rows[r].every(t=>t===0)){gap=true;break}
 const w={
 ko:['점프 전에 맞은편 발판의 방향을 확인하고, 공중에서 좌우로 착지 위치를 맞추세요.','높은 발판은 앞면·옆면을 피해야 합니다. 가장자리 전에 점프하고 윗면에 착지하세요.','다음 도로의 방향을 먼저 확인하세요. 좁은 길에서는 감속하고 짧게 조향하세요.','블록 옆면을 피하세요. 빈 통로로 정렬하거나 점프로 윗면에 올라가세요.'],
 en:['Check the landing direction before jumping, then steer in the air to line up.','Avoid the raised platform front and sides. Jump before the edge and land on top.','Look for the next road direction. Slow down and make small corrections on narrow roads.','Avoid block sides. Line up with the open lane or jump onto the top.'],
 ja:['ジャンプ前に向こうの足場の方向を確認し、空中で左右に着地点を調整。','高い足場の前面と側面を避け、端の手前でジャンプし上面に着地。','次の道の方向を先に確認。狭い道は減速して小さく操縦。','ブロック側面を避け、空いた道に合わせるか上面へジャンプ。'],
 zh:['起跳前确认对面平台方向，在空中左右调整落点。','避开高台前侧和侧面，在边缘前起跳并落在顶部。','提前确认下一段道路方向，窄路减速并小幅转向。','避开方块侧面，对准空路或跳到顶部。']
 }[settings.language]||[];
 return w[gap?(kind==='collision'?1:0):(kind==='collision'?3:2)];
}
function showFailureFeedback(){
 if(state!=='dead'||!runFailure||runFailure.shown||editorTesting&&!creatorActive)return;
 runFailure.shown=true;const custom=!!creatorActive,lang=['ko','en','ja','zh'].indexOf(settings.language),offset=1+Math.max(0,lang)*2,words=failureWords[failureKind(runFailure.reason)];
 $('overlay').setAttribute('data-screen',custom?'creator-result':'result');$('overlay').setAttribute('data-failure','true');menuScreen=custom?'creator-result':'result';
 $('failureInfo').classList.remove('hidden');$('failureIcon').textContent=words[0];$('failureReason').textContent=words[offset];$('failureHint').textContent=thirdFlightFailureHint(runFailure.reason,runFailure.z)||secondFlightFailureHint(runFailure.reason,runFailure.z)||words[offset+1];
 const labels={ko:['다시 도전','완주까지, 한 번 더.','재도전 →','진행','도달 거리','스테이지 선택','무한모드로','창작모드로'],en:['Try again','Find your next line.','Retry →','Progress','Distance','Select stage','Endless mode','Creator mode'],ja:['もう一度','次のルートに挑もう。','リトライ →','進行','到達距離','ステージ選択','無限モードへ','クリエイトへ'],zh:['再试一次','再次挑战下一段航线。','重试 →','进度','到达距离','选择关卡','返回无尽模式','返回创作模式']}[settings.language];
 $('eyebrow').textContent='FLIGHT REPORT';$('title').textContent=labels[0];$('description').textContent=custom?creatorActive.title:mode==='story'?STORY_COURSES[level].title:labels[1];
 const percent=Math.max(0,Math.min(100,Math.floor((runFailure.z-2)/Math.max(1,trackLength-4)*100))),endless=mode==='endless';
 $('failureLocation').textContent=endless?labels[4]:labels[3];$('failureProgress').textContent=endless?displayDistance(flightDistance(runFailure.z))+' m':percent+'%';
 $('failureTrack').classList.toggle('hidden',endless);$('failureTrack').setAttribute('aria-valuenow',String(percent));$('failureFill').style.width=percent+'%';
 $('endlessResultRecord').classList.toggle('hidden',!endless||custom);
 if(endless&&!custom){
  const distance=flightDistance(runFailure.z),previous=runStartingBest,best=Math.max(previous,distance),fresh=distance>previous;
  const words={ko:['최고 도달 거리','신기록','첫 도전','이전 최고기록보다 ',' m 더 멀리 도달','최고기록까지 ',' m 남았습니다','최고기록과 동일합니다'],en:['BEST DISTANCE','NEW BEST','FIRST RUN','Previous best +',' m','To your best: ',' m','Matched your best'],ja:['最長到達距離','新記録','初挑戦','前回ベストより +',' m','ベストまで ',' m','自己ベストと同じ'],zh:['最远距离','新纪录','首次挑战','比此前最佳多 ',' 米','距离最佳还差 ',' 米','与最佳纪录相同']}[settings.language];
  $('endlessBestLabel').textContent=words[0];$('endlessResultBest').textContent=displayDistance(best)+' m';$('endlessRecordBadge').textContent=fresh?(previous?words[1]:words[2]):'';
  $('endlessRecordDelta').textContent=fresh?words[3]+displayDistance(distance-previous)+words[4]:distance===previous?words[7]:words[5]+displayDistance(previous-distance)+words[6];
  $('endlessResultRecord').setAttribute('data-new-best',String(fresh));
 }
 $('start').textContent=labels[2];$('home').textContent=custom?labels[7]:endless?labels[6]:labels[5];
 $('overlay').setAttribute('data-live-ads',String(!custom&&hasAds()));
}
const failureFinish=finish;finish=function(win,reason){if(!win&&state==='play')runFailure={z,reason,shown:false};const out=failureFinish(win,reason);showFailureFeedback();return out};result=finish;
const failureStep=step;step=function(dt){failureStep(dt);showFailureFeedback()};
const failureBegin=beginRun;beginRun=function(...args){runStartingBest=Number(data.best)||0;runFailure=null;$('failureInfo').classList.add('hidden');$('overlay').setAttribute('data-failure','false');return failureBegin(...args)};
const failureMenu=showMenu;showMenu=function(...args){$('failureInfo').classList.add('hidden');$('overlay').setAttribute('data-failure','false');return failureMenu(...args)};
