// Brief, local cause markers. No camera shake, time scaling, or collision changes.
let failureCue=null,failureLastSupport=null;
Object.assign(uiWords,{
 '블록 옆면 충돌':['Block side collision','ブロック側面に衝突','撞到方块侧面'],
 '터널 벽 충돌':['Tunnel wall collision','トンネルの壁に衝突','撞到隧道侧壁'],
 '터널 천장 충돌':['Tunnel ceiling collision','トンネルの天井に衝突','撞到隧道顶部'],
 '상단 구조 충돌':['Overhead structure collision','頭上の構造物に衝突','撞到上方结构'],
 '위험 바닥 접촉':['Hazard floor contact','危険な床に接触','接触危险地面'],
 '위험 블록 접촉':['Hazard block contact','危険なブロックに接触','接触危险方块'],
 '도로 이탈 · 낙하':['Road edge departure · fall','道路から落下','驶离道路并坠落']
});
// Match advice to the actual contact surface instead of a generic hazard/tunnel hint.
const contactAdvice={
 '터널 벽 충돌':['터널 입구 중앙으로 정렬하세요. 옆벽은 통과할 수 없습니다.','Line up with the tunnel entrance. Its side walls are solid.','トンネル入口の中央に合わせましょう。側壁は通過できません。','对准隧道入口中央，侧壁无法穿过。'],
 '터널 천장 충돌':['터널 안에서는 점프를 피하세요. 지붕 위로 갈 때는 입구 전에 점프하세요.','Avoid jumping inside. To reach the roof, jump before the entrance.','内部ではジャンプを避けましょう。屋根へは入口の手前でジャンプ。','避免在隧道内跳跃；要上屋顶，请在入口前起跳。'],
 '상단 구조 충돌':['상단 구조물 아래에서는 점프를 피하고 빈 통로로 이동하세요.','Avoid jumping beneath overhead structures; use the open passage.','頭上の構造物の下ではジャンプを避け、空いた通路へ。','不要在上方结构下起跳，请选择空旷通道。'],
 '위험 터널 지붕 접촉':['위험 터널은 내부로 통과하세요. 지붕에 닿으면 폭발합니다.','Pass through the hazard tunnel interior. Its roof explodes on contact.','危険トンネルは内部を通過しましょう。屋根に触れると爆発します。','请从危险隧道内部通过，触碰屋顶会爆炸。'],
 '위험 바닥 접촉':['진홍색 바닥을 피해 조향하거나, 닿기 전에 점프하세요.','Steer away from crimson floors or jump before contact.','深紅の床を避けて操縦するか、触れる前にジャンプ。','转向避开深红地面，或在接触前起跳。'],
 '위험 블록 접촉':['위험 블록은 윗면도 위험합니다. 빈 통로로 우회하세요.','Hazard block tops are dangerous too. Use the open lane.','危険ブロックは上面も危険です。空いた通路へ迂回。','危险方块的顶部同样危险，请从空路绕行。']
};
function failureContactAdvice(label){const words=contactAdvice[label];return words?.[Math.max(0,['ko','en','ja','zh'].indexOf(settings.language))]||null;}
function captureFailureCue(reason){
 const kind=failureKind(reason),contact=flightContacts(activeRoadData(),rows,x,z,y,y,0),cell=contact.collision||contact.landing;
 let label=reason==='위험 타일 접촉'?'위험 바닥 접촉':kind==='fall'?'도로 이탈 · 낙하':reason;
 if(kind==='collision'&&cell?.box)label='블록 옆면 충돌';
 const cue={kind,label,age:0,x,y,z,cell:cell?{...cell}:null,support:failureLastSupport?{...failureLastSupport}:null};
 if(kind==='tunnel'&&reason.includes('터널')){const r=Math.floor(z),centers=tunnelCenters(r);if(centers.length){const center=centers.reduce((a,b)=>Math.abs(x-a)<Math.abs(x-b)?a:b);cue.tunnel={center,radius:tunnelRadius(r),height:ceilingAt(r)};}}
 const impact=globalThis.starwayLastImpact;if(impact?.reason===reason&&Math.abs(impact.z-z)<.001&&impact.contact){cue.tunnel={...impact.contact};cue.contactX=impact.contact.x;}
 return cue;
}
function resetFailureCue(){failureCue=null;failureLastSupport=null;globalThis.starwayLastImpact=null;$('fuelGauge').setAttribute('data-failure-cause','false')}
const cueFinish=finish;finish=function(win,reason){if(!win&&state==='play')failureCue=captureFailureCue(reason);const out=cueFinish(...arguments);syncFailureInstrument();return out};result=finish;
const cueBegin=beginRun;beginRun=function(...args){resetFailureCue();return cueBegin(...args)};
const cueMenu=showMenu;showMenu=function(...args){resetFailureCue();return cueMenu(...args)};
const cueStep=step;step=function(dt){
 const running=state==='play',animate=running||(['falling','exploding'].includes(state)&&!fxPaused)||state==='dead';
 if(running&&grounded){const support=flightContacts(activeRoadData(),rows,x,z,y,y,0).landing;if(tunnelGrounded||support&&Math.abs(y-support.height)<.04)failureLastSupport={x,z,y};}
 const previous=failureCue,out=cueStep(dt);if(animate&&failureCue===previous&&failureCue)failureCue.age+=dt;
 syncFailureInstrument();return out;
};
function syncFailureInstrument(){const visible=!!failureCue&&failureCue.kind==='fuel'&&failureCue.age<.85&&['dead','play'].includes(state);$('fuelGauge').setAttribute('data-failure-cause',String(visible));}
const cueCockpit=syncCockpit;syncCockpit=function(){cueCockpit();syncFailureInstrument()};
const cueFailureReport=showFailureFeedback;showFailureFeedback=function(...args){const out=cueFailureReport(...args);if(state==='dead'&&failureCue&&(!editorTesting||creatorActive)){$('failureReason').textContent=tr(failureCue.label);const advice=failureContactAdvice(failureCue.label);if(advice)$('failureHint').textContent=advice}return out};
function drawFailureCause(){
 const cue=failureCue;if(!cue||!['falling','exploding'].includes(state)||cue.kind==='fuel'||cue.age>.65)return;
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,fade=1-cue.age/.65;
 ctx.save();ctx.globalAlpha=fade*(reduced?.65:.9);const color=cue.kind==='hazard'?'#ffd7d4':'#ffe3a0';
 if(cue.cell?.box){const c=cue.cell,a=c.lane-roadOffset(),b=a+1,r=c.row,h=c.height;
  for(const height of [0,h])releaseWorldLine([[a,r,height],[b,r,height],[b,r+1,height],[a,r+1,height],[a,r,height]].map(v=>proj(...v)),color,1.7);
  for(const xx of [a,b])for(const zz of [r,r+1])releaseWorldLine([proj(xx,zz,0),proj(xx,zz,h)],color,1.4);
 }else if(cue.tunnel){const t=cue.tunnel,local=Math.max(-1,Math.min(1,((cue.contactX??cue.x)-t.center)/t.radius)),angle=Math.acos(local),points=[];
  for(let i=0;i<=12;i++){const a=Math.max(0,Math.min(Math.PI,angle-.3+i*.05));points.push(proj(t.center+t.radius*Math.cos(a),cue.z,t.height*Math.sin(a)+.07))}releaseWorldLine(points,color,3);
 }else if(cue.kind==='fall'){
  const a=cue.support||cue,p=proj(a.x,a.z,a.y+.02),q=proj(cue.x,cue.z,cue.y-.28);
  ctx.setLineDash([3,4]);releaseWorldLine([p,q],'#bfdce8',1.6);ctx.setLineDash([]);ctx.strokeStyle='#e4f4fb';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(p[0],p[1],Math.max(3,proj(a.x,a.z)[2]*.15),Math.max(1,proj(a.x,a.z)[2]*.045),0,0,Math.PI*2);ctx.stroke();
 }else{const p=proj(cue.x,cue.z,cue.y+.12),radius=Math.max(4,Math.min(16,p[2]*.14));ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p[0],p[1],radius,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
}
const cueDraw=draw;draw=function(){cueDraw();drawFailureCause()};
