// Resource feedback is confined to the corresponding instrument, with no screen flash.
let fuelChargeTime=0,fuelChargeAmount=0;
Object.assign(uiWords,{'⚠ 연료':['⚠ Fuel','⚠ 燃料','⚠ 燃料'],'연료':['Fuel','燃料','燃料']});
const resourceBegin=beginRun;beginRun=function(...args){fuelChargeTime=0;fuelChargeAmount=0;return resourceBegin(...args)};
const resourceStep=step;step=function(dt){const playing=state==='play',before=fuel,previousCharge=charge;resourceStep(dt);if(playing){fuelChargeTime=Math.max(0,fuelChargeTime-dt);if(charge!==previousCharge&&fuel>=before){fuelChargeAmount=Math.max(0,Math.min(100,Math.ceil(fuel-before)));fuelChargeTime=.85;}}};
const resourceCockpit=syncCockpit;syncCockpit=function(){
 resourceCockpit();const playing=state==='play',danger=playing&&fuel<=10,low=playing&&fuel<=20;
 $('fuelGauge').setAttribute('data-alert',danger?'critical':low?'low':'none');
 $('fuelGauge').setAttribute('data-charging',String(playing&&fuelChargeTime>0));
 $('fuelLabel').textContent=tr(low?'⚠ 연료':'연료');
 const text=fuelChargeTime>0?'+'+fuelChargeAmount+'%':'';
 if($('fuelChargeCue').textContent!==text)$('fuelChargeCue').textContent=text;
 $('fuelChargeCue').setAttribute('data-visible',String(playing&&fuelChargeTime>0));
};

// Short world-space pickup cues freeze with simulation and respect world occlusion.
let pickupGlints=[],fuelChargeAnchor=null;
const pickupBegin=beginRun;beginRun=function(...args){pickupGlints=[];fuelChargeAnchor=null;return pickupBegin(...args)};start=beginRun;
const pickupStep=step;step=function(dt){
 const playing=state==='play',before=runCoins,oldCharge=charge;
 pickupStep(dt);if(!playing)return;
 pickupGlints=pickupGlints.map(v=>({...v,life:v.life-dt})).filter(v=>v.life>0);
 if(runCoins>before&&state==='play')pickupGlints.push({x,z,y:y+.35,life:.28});
 if(charge!==oldCharge&&fuelChargeTime>0)fuelChargeAnchor={x,z:charge+.5};
};
function drawPickupFeedback(){
 if(!releaseMaterialsActive()||state!=='play')return;
 for(const v of pickupGlints){
  const lane=Math.floor(v.x+roadOffset());if(coinBlockedByBox(Math.floor(v.z),lane,v.y))continue;
  const p=proj(v.x,v.z,v.y),fade=v.life/.28,reach=(1-fade)*10+3;
  ctx.save();ctx.globalAlpha=fade;ctx.strokeStyle='#ffe6a0';ctx.lineWidth=1.2;
  for(let i=0;i<4;i++){const angle=i*Math.PI/2+.4;ctx.beginPath();ctx.moveTo(p[0]+Math.cos(angle)*reach,p[1]+Math.sin(angle)*reach);ctx.lineTo(p[0]+Math.cos(angle)*(reach+4),p[1]+Math.sin(angle)*(reach+4));ctx.stroke();}ctx.restore();
 }
 if(fuelChargeAnchor&&fuelChargeTime>0){
  const v=fuelChargeAnchor;if(coinBlockedByBox(Math.floor(v.z),Math.floor(v.x+roadOffset()),.025))return;
  const phase=1-fuelChargeTime/.85,radius=.18+phase*.48,points=[];
  for(let i=0;i<=24;i++){const angle=i*Math.PI/12;points.push(proj(v.x+Math.cos(angle)*radius,v.z+Math.sin(angle)*radius,.025));}
  releaseWorldLine(points,'rgba(155,255,223,'+(fuelChargeTime/.85*.65)+')',1.5);
 }
}
