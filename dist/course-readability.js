// Pilot visual semantics on 1-1, 1-2, 1-3, 2-2 and 3-1. No map or collision changes.
function courseReadabilityActive(){return mode==='story'&&[0,1,2,4,6].includes(level)&&!editorTesting}
function roadEdgeCue(r,l,t){if(!courseReadabilityActive()||r<z-.5||r>z+28)return;const a=l-roadOffset(),hazard=activeRoadData().roadPaint?.[r]?.[l]==='pink';if(boxHeight(t)>0)return;
 if(!rows[r+1]?.[l]){releaseGroundQuad(a+.04,a+.96,r+.88,r+.97,.012,hazard?'#f4c6bf':'#c4dde5');releaseGroundQuad(a+.04,a+.96,r+.81,r+.86,.011,'#102738');}
 if(!rows[r-1]?.[l]){releaseGroundQuad(a+.04,a+.96,r+.025,r+.09,.012,hazard?'#f4c6bf':'#c4dde5');}
 if(hazard&&r%4===0)drawCourseDangerMark(r,l,.016);
 if(t===3){for(const [left,right,near,far]of [[.15,.22,.13,.36],[.78,.85,.13,.36],[.15,.22,.64,.87],[.78,.85,.64,.87]])releaseGroundQuad(a+left,a+right,r+near,r+far,.021,'#e1fff0');releaseGroundQuad(a+.4,a+.6,r+.86,r+.94,.022,'#d5ffed');}
}
function drawCourseDangerMark(r,l,height){const a=l-roadOffset();poly([proj(a+.5,r+.19,height),proj(a+.22,r+.76,height),proj(a+.78,r+.76,height)],'#f8cebb');poly([proj(a+.5,r+.29,height+.001),proj(a+.31,r+.69,height+.001),proj(a+.69,r+.69,height+.001)],'#642536');releaseGroundQuad(a+.475,a+.525,r+.41,r+.55,height+.002,'#ffe5ca');releaseGroundQuad(a+.475,a+.525,r+.60,r+.65,height+.002,'#ffe5ca');}
const readablePickup=drawRoadPickup;drawRoadPickup=function(r,l,t){const out=readablePickup(...arguments);roadEdgeCue(r,l,t);return out};
function drawIntroLandingEdge(r,l,start,h,f){
 if(mode!=='story'||level!==2||editorTesting||r<z-.5||r>=z+25||!f.front||start!==r||boxColorAt(r,l)==='hazard')return;
 const a=l-roadOffset(),top=h+.008;
 releaseGroundQuad(a+.07,a+.93,start+.035,start+.085,top,'#c4edf2');
 releaseGroundQuad(a+.07,a+.11,start+.085,start+.26,top,'#c4edf2');
 releaseGroundQuad(a+.89,a+.93,start+.085,start+.26,top,'#c4edf2');
}
const readableBoxDetail=drawReleaseBoxDetail;drawReleaseBoxDetail=function(r,l,start,end,h,f){const out=readableBoxDetail(...arguments);drawIntroLandingEdge(r,l,start,h,f);if(courseReadabilityActive()&&r>=z-.5&&r<z+25&&boxColorAt(r,l)==='hazard'&&r%4===0)drawCourseDangerMark(r,l,h+.019);return out};
const readableTunnelRim=drawReleaseTunnelRim;drawReleaseTunnelRim=function(xa,xb,ya,yb,r){const out=readableTunnelRim(...arguments);if(courseReadabilityActive()&&r>z+.15&&r<z+30){const points=[proj(xa,r,ya),proj(xb,r,yb)];releaseWorldLine(points,'#102534',3);releaseWorldLine(points,Math.min(ya,yb)<.45?'#d5fff0':'#b3d1dc',1.4);}return out};
