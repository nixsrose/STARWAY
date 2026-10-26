// Cache one static scenery layer. Dynamic asteroid scenery is deliberately excluded.
let sceneryCache=null,sceneryBuilds=0,renderInProgress=false,tunnelFrameCache=null;
function cachedScenery(key,paint){
 const profile=stageProfile(),signature=key+'|'+mode+'|'+level+'|'+Math.floor((floor-1)/3)%6+'|'+W+'|'+H+'|'+dpr+'|'+profile.colors.join(',')+'|'+profile.planet.join(',');
 if(!sceneryCache||sceneryCache.key!==signature){
  const canvas=sceneryCache?.canvas||document.createElement('canvas');canvas.width=Math.max(1,Math.round(W*dpr));canvas.height=Math.max(1,Math.round(H*dpr));const g=canvas.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);paint(g);sceneryCache={key:signature,canvas};sceneryBuilds++;
 }
 ctx.drawImage(sceneryCache.canvas,0,0,W,H);
}
const uncachedSun=drawRedHeatSun;drawRedHeatSun=function(targetCtx){if(targetCtx)return uncachedSun(targetCtx);cachedScenery('sun',uncachedSun)};
const uncachedScenery=drawStageScenery;drawStageScenery=function(targetCtx){if(targetCtx)return uncachedScenery(targetCtx);if(mode==='story'&&level>=15&&level<=17)return uncachedScenery();cachedScenery('scenery',uncachedScenery)};
let storyTunnelCache=null;
const uncachedTunnelMeshes=collectTunnelMeshes;collectTunnelMeshes=function(){
 if(mode==='story'&&!editorTesting){const row=Math.floor(z),map=activeRoadData();if(!storyTunnelCache||storyTunnelCache.rows!==rows||storyTunnelCache.map!==map||storyTunnelCache.row!==row)storyTunnelCache={rows,map,row,value:uncachedTunnelMeshes()};return storyTunnelCache.value;}
 if(!renderInProgress)return uncachedTunnelMeshes();return tunnelFrameCache??(tunnelFrameCache=uncachedTunnelMeshes());
};
// Reuse the depth transform within one render pass. Camera and viewport values
// are captured afresh each frame; physics and out-of-frame callers use proj as before.
let projectionFrame=null;
const uncachedProjection=proj;proj=function(xx,zz,yy=0){
 const frame=projectionFrame;if(!frame)return uncachedProjection(xx,zz,yy);
 let scale=frame.scales.get(zz);if(scale===undefined){scale=frame.unit/Math.max(WORLD_NEAR_DEPTH,zz-frame.z+4);frame.scales.set(zz,scale);}
 return [frame.cx+(xx-frame.x)*scale,frame.cy+(frame.height-yy)*scale,scale];
};
const performanceDraw=draw;draw=function(){
 const previous=projectionFrame;projectionFrame={scales:new Map(),unit:Math.min(W*.6,H*.8),cx:W*.5,cy:W/H>1.5?H*.30:H*.43,height:2.6+cameraDrop,x:x*.28,z};
 renderInProgress=true;tunnelFrameCache=null;solidStructureFramePlan=null;
 try{return performanceDraw()}finally{projectionFrame=previous;renderInProgress=false;tunnelFrameCache=null;solidStructureFramePlan=null}
};
function clearFlightInput(){for(const k in keys)keys[k]=false;clearTouchControls();resetJoystick();leverPointer=null;}
// A fold/unfold can cancel native pointer captures. Keep progress and pause for safe resumption.
let lastViewportWidth=innerWidth,lastViewportHeight=innerHeight;
addEventListener('resize',()=>{const major=Math.abs(innerWidth-lastViewportWidth)>80||Math.abs(innerHeight-lastViewportHeight)>180;lastViewportWidth=innerWidth;lastViewportHeight=innerHeight;sceneryCache=null;if(major){frameWasHidden=true;clearFlightInput();if(state==='play'||state==='ready')pause();else if(state==='falling'||state==='exploding')fxPaused=true;updateMusic();}});
// Lifecycle events may arrive in either order; suspension is idempotent.
function suspendFlightSession(){
 globalThis.flightLifecycleSuspended=true;clearFlightInput();frameWasHidden=true;sceneryCache=null;
 if(state==='play'||state==='ready')pause();
 else if(state==='falling'||state==='exploding')fxPaused=true;
 stopMusic();updateFlightAudio();
 const c=flightAudio.context;if(c&&c.state!=='closed')c.suspend().catch(()=>{});
}
function restoreFlightSession(){
 if(document.hidden)return;
 globalThis.flightLifecycleSuspended=false;clearFlightInput();frameWasHidden=true;last=performance.now();
 // The run remains paused. Only the player's Continue action resumes simulation.
 flightAudioUnlock();updateMusic();
}
for(const event of ['blur','pagehide'])addEventListener(event,suspendFlightSession);
for(const event of ['focus','pageshow'])addEventListener(event,restoreFlightSession);
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendFlightSession();else restoreFlightSession()});
document.addEventListener('freeze',suspendFlightSession);
document.addEventListener('resume',restoreFlightSession);
