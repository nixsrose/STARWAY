// User-facing coefficient: 100 equals the original default acceleration18.
function gravityCoefficientFromLegacy(g){return g>=50?g:Math.max(50,Math.min(200,Math.round(g/18*2)*50));}
const coefficientProfile=stageProfile;stageProfile=function(){const p=coefficientProfile();return {...p,gravity:gravityCoefficientFromLegacy(p.gravity)};};
gravityValue=function(){return mode==='story'?stageProfile().gravity:gravityCoefficientFromLegacy(endlessGravity);};
