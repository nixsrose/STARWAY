// Ready-only, local retry briefing. Never changes simulation or saved progress.
let retryRouteFailure=null,retryRouteVisible=false;
const retryRouteWords={
 ko:['직전 실패 구간','닫기','줄','칸','진행 방향 ↑','도로','블록','터널','위험','항로 밖'],
 en:['Last failure area','Close','Row','Lane','Forward ↑','Road','Block','Tunnel','Hazard','Off course'],
 ja:['直前の失敗区間','閉じる','行','列','進行方向 ↑','道路','ブロック','トンネル','危険','航路外'],
 zh:['上次失败区域','关闭','行','列','前进方向 ↑','道路','方块','隧道','危险','航线外']
};
function retryRouteEligible(){return mode==='story'&&!editorTesting&&!creatorActive&&!challengeActive;}
function hideRetryRoute(){retryRouteVisible=false;$('retryRoutePreview').classList.add('hidden');}
function retryRouteHint(failure){return failureContactAdvice(failure.reason)||thirdFlightFailureHint(failure.reason,failure.z)||secondFlightFailureHint(failure.reason,failure.z)||failureWords[failureKind(failure.reason)][2+Math.max(0,['ko','en','ja','zh'].indexOf(settings.language))*2];}
function retryRouteSVG(failure){
 const map=failure.map,tiles=map.tiles,center=Math.max(0,Math.min(tiles.length-1,Math.floor(failure.z))),start=Math.max(0,Math.min(center-5,tiles.length-11)),end=Math.min(tiles.length-1,start+10),cellW=20,cellH=7,left=28,top=5;
 let svg='<svg viewBox="0 0 200 90" role="img" aria-labelledby="retryMapTitle"><title id="retryMapTitle">'+$('retryRouteLocation').textContent+'</title><rect width="200" height="90" rx="5" fill="#07131f"/>';
 for(let row=start;row<=end;row++){const yy=top+(end-row)*cellH;for(let lane=0;lane<7;lane++){
  const tile=tiles[row]?.[lane]||0,box=boxHeight(tile)>0,hazard=tile&&map.roadPaint?.[row]?.[lane]==='pink',tunnel=!!map.ceilings?.[row]&&map.tunnelCenters?.[row]?.includes(lane-3),roofHazard=tunnel&&map.hazardTunnels?.some(g=>g.row===row&&g.lane===lane),xx=left+lane*cellW;
  svg+='<rect x="'+xx+'" y="'+yy+'" width="18" height="5" rx="1" fill="'+(hazard?'#e5787e':box?'#ae86cf':tile===3?'#71d7b4':tile?'#60879b':'#14212c')+'"/>';
  if(tunnel)svg+='<path d="M'+xx+' '+(yy+5)+'V'+yy+'H'+(xx+18)+'V'+(yy+5)+'" fill="none" stroke="'+(roofHazard?'#f18a91':'#7fe3df')+'" stroke-width="1.5"/>';
 }if(row===start||row===end||row===center)svg+='<text x="24" y="'+(yy+5)+'" text-anchor="end" font-size="6" fill="#9cb8ca">'+(row+1)+'</text>';}
 const xx=left+Math.max(-.25,Math.min(7.1,failure.x+3.5))*cellW,yy=top+(end-center)*cellH+2.5;
 svg+='<circle cx="'+xx+'" cy="'+yy+'" r="4" fill="#ffe39a" stroke="#172735"/><path d="M'+(xx-2)+' '+(yy-2)+'l4 4m0-4l-4 4" stroke="#6d2836" stroke-width="1.2"/></svg>';return svg;
}
function showRetryRoute(failure){
 if(state!=='ready'||!failure||!retryRouteEligible()||failure.level!==level||failure.map!==activeRoadData())return hideRetryRoute();
 const w=retryRouteWords[settings.language]||retryRouteWords.ko,lane=Math.floor(failure.x+3.5),kind=failureKind(failure.reason),offset=1+Math.max(0,['ko','en','ja','zh'].indexOf(settings.language))*2;
 $('retryRouteTitle').textContent=w[0];$('retryRouteDismiss').textContent='×';$('retryRouteDismiss').setAttribute('aria-label',w[1]);
 $('retryRouteLocation').textContent=(Math.floor(level/3)+1)+'-'+(level%3+1)+' · '+w[2]+' '+(Math.floor(failure.z)+1)+' · '+(lane<0||lane>6?w[9]:w[3]+' '+(lane+1));
 $('retryRouteCause').textContent=tr(failure.reason)||failureWords[kind][offset];$('retryRouteHint').textContent=retryRouteHint(failure);
 $('retryRouteMap').innerHTML=retryRouteSVG(failure);$('retryRouteDirection').textContent=w[4];
 $('retryRouteLegend').innerHTML=w.slice(5,9).map((label,i)=>'<span style="color:'+['#8bafc0','#c49be4','#7fe3df','#f18a91'][i]+'">'+label+'</span>').join(' · ');$('retryRoutePreview').setAttribute('aria-label',w[0]);$('retryRoutePreview').classList.remove('hidden');retryRouteVisible=true;
}
$('retryRouteDismiss').onclick=hideRetryRoute;
const retryRouteFinish=finish;finish=function(win,reason){
 const capture=state==='play'&&retryRouteEligible()?{level,map:activeRoadData(),z,x,reason}:null;
 const out=retryRouteFinish(...arguments);if(win)retryRouteFailure=null;else if(capture)retryRouteFailure={...capture,reason:failureCue?.label||reason};hideRetryRoute();return out;
};result=finish;
const retryRouteBegin=beginRun;beginRun=function(...args){const previous=retryRouteFailure;hideRetryRoute();const out=retryRouteBegin(...args);retryRouteFailure=null;showRetryRoute(previous);return out;};start=beginRun;
const retryRouteLaunch=launchFromRest;launchFromRest=function(...args){const out=retryRouteLaunch(...args);if(state!=='ready')hideRetryRoute();return out;};
const retryRouteMenu=showMenu;showMenu=function(...args){retryRouteFailure=null;hideRetryRoute();return retryRouteMenu(...args);};
const retryRouteStep=step;step=function(...args){const out=retryRouteStep(...args);if(retryRouteVisible&&state!=='ready')hideRetryRoute();return out;};
