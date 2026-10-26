// Shared creator maps use server persistence; story/editor saves stay device-local.
let creatorActive=null,creatorSelected=null,creatorTrace=[],creatorRequest=0,creatorSubmitting=false,creatorPendingResult=null;
let creatorMineView=false;
Object.assign(uiWords,{'다시 불러오기':['Reload','再読み込み','重新加载'],'닉네임 설정':['Nickname settings','ニックネーム設定','昵称设置'],'← 맵 목록':['← Maps','← マップ一覧','← 地图列表'],'순위 확인':['View rankings','ランキングを見る','查看排名']});
Object.assign(uiWords,{'맵 정렬':['Sort maps','並び替え','地图排序'],'최신순':['Newest','新着順','最新'],'도전자 많은 순':['Most challengers','挑戦者数順','挑战人数'],'내가 미완주한 맵':['Not cleared by me','未クリア','我未完成的地图'],'맵 삭제':['Delete map','マップ削除','删除地图'],'삭제하기':['Delete','削除する','删除'],'취소':['Cancel','キャンセル','取消'],'창작모드':['Creator mode','クリエイト','创作模式'],'공개 맵':['Published maps','公開マップ','已发布地图'],'내 맵':['My maps','自分のマップ','我的地图'],'맵 제작':['Create map','マップ制作','制作地图'],'닉네임':['Nickname','ニックネーム','昵称'],'저장':['Save','保存','保存'],'창작모드에 업로드':['Upload to creator mode','クリエイトにアップロード','上传到创作模式'],'최고기록':['Leaderboard','ランキング','排行榜'],'도전하기 →':['Challenge →','挑戦 →','挑战 →']});
async function creatorAPI(path,options={}){
 if(starwayFilmingMode)throw Error('촬영 모드에서는 온라인 업로드·기록 등록을 사용할 수 없습니다. 일반 주소에서 이용하세요.');
 const controller=globalThis.AbortController?new AbortController():null;let timer;
 try{return await Promise.race([(async()=>{
  const response=await fetch('/api/creator/'+path,{credentials:'same-origin',...options,...(controller?{signal:controller.signal}:{}),headers:{'Content-Type':'application/json',...(options.headers||{})}});let result;try{result=await response.json()}catch{throw Error('서버 응답을 확인할 수 없습니다. 잠시 후 다시 시도하세요.')}
  if(!response.ok)throw Object.assign(Error(result.error||'요청에 실패했습니다.'),{status:response.status});return result;
 })(),new Promise((_,reject)=>{timer=setTimeout(()=>{reject(Error('연결 시간이 초과됐습니다. 연결 상태를 확인하고 다시 시도해 주세요.'));controller?.abort();},15000)})]);}
 catch(error){if(error.name==='TypeError')throw Error('서버에 연결하지 못했습니다. 연결 상태를 확인해 주세요.');throw error;}
 finally{clearTimeout(timer);}
}
let creatorReadJob=null,creatorRetryAction=null;
function creatorReadStart(key,retry){
 if(creatorReadJob?.key===key&&menuScreen==='creator')return null;
 const ticket=++creatorRequest;creatorReadJob={key,ticket};creatorRetryAction=retry;
 $('creatorPanel').setAttribute('aria-busy','true');$('creatorPanel').setAttribute('data-network','loading');$('creatorRetry').classList.add('hidden');$('creatorSignIn').classList.add('hidden');return ticket;
}
function creatorReadEnd(ticket,error=null){
 if(ticket!==creatorRequest||creatorReadJob?.ticket!==ticket||menuScreen!=='creator')return false;
 creatorReadJob=null;$('creatorPanel').setAttribute('aria-busy','false');$('creatorPanel').setAttribute('data-network',error?'error':'ready');$('creatorRetry').classList.toggle('hidden',!error);$('creatorSignIn').classList.toggle('hidden',error?.status!==401);
 if(error)creatorMessage(error.message);else creatorRetryAction=null;return true;
}
$('creatorRetry').onclick=()=>{if(!creatorReadJob)return creatorRetryAction?.()};

const creatorPost=(path,value)=>creatorAPI(path,{method:'POST',body:JSON.stringify(value)});
function creatorMessage(text){$('creatorStatus').textContent=text;}
function creatorRestore(){if(editorTesting)restoreEditorRun();creatorActive=null;creatorTrace=[];creatorPendingResult=null;}
async function openCreator(mine=false){
 const key='list:'+mine+':'+($('creatorSort').value||'latest');if(creatorReadJob?.key===key&&menuScreen==='creator')return;creatorMineView=mine;creatorSelected=null;creatorRestore();$('creatorBrowse').setAttribute('aria-pressed',String(!mine));$('creatorMine').setAttribute('aria-pressed',String(mine));$('creatorPanel').setAttribute('data-view','list');showMenu('creator');$('creatorSortWrap').classList.remove('hidden');$('creatorDetail').classList.add('hidden');$('creatorList').classList.remove('hidden');$('creatorList').innerHTML='';creatorMessage('맵을 불러오는 중…');const ticket=creatorReadStart(key,()=>openCreator(mine));
 try{const [me,list]=await Promise.all([creatorAPI('me'),creatorAPI('maps?mine='+(mine?'1':'0')+'&sort='+encodeURIComponent($('creatorSort').value||'latest'))]);if(ticket!==creatorRequest||menuScreen!=='creator')return;creatorReadEnd(ticket);$('creatorPanel').setAttribute('data-network',list.maps.length?'ready':'empty');$('creatorNickname').value=me.nickname;creatorMessage(list.maps.length?'맵을 선택해 도전하고 최고기록을 남기세요.':mine?'아직 올린 맵이 없습니다. 맵 제작에서 첫 맵을 만들어보세요.':'아직 게시된 맵이 없습니다. 첫 번째 항로를 만들어보세요.');for(const map of list.maps){const button=document.createElement('button');button.className='creator-map';const canvas=document.createElement('canvas');canvas.width=120;canvas.height=150;canvas.setAttribute('aria-hidden','true');creatorDrawPreview(canvas,map.preview);button.appendChild(canvas);const body=document.createElement('div');body.className='creator-map-body';const badge=document.createElement('span');badge.className='creator-clear-badge';badge.textContent=creatorBrowseLabel(map.status==='draft'?'draft':Number.isFinite(map.my_best_ms)?'cleared':'uncleared');body.appendChild(badge);const title=document.createElement('strong');title.textContent=map.title;body.appendChild(title);const meta=document.createElement('span');meta.textContent=map.length+'줄 · 중력 '+map.gravity+' · 연료 '+map.fuelDrainMultiplier+'×';body.appendChild(meta);const info=document.createElement('span');info.textContent=(map.nickname||'파일럿')+' · '+(map.status==='draft'?'제작자 완주 대기':map.challengers+'명 기록');body.appendChild(info);const record=document.createElement('span');record.textContent=creatorBrowseLabel('best')+' '+creatorRecordTime(map.best_ms)+' · '+creatorBrowseLabel('mine')+' '+creatorRecordTime(map.my_best_ms);body.appendChild(record);button.appendChild(body);button.onclick=()=>creatorShowMap(map.id);$('creatorList').appendChild(button)}}catch(error){creatorReadEnd(ticket,error)}
}
async function creatorShowMap(id){
 const ticket=creatorReadStart('detail:'+id,()=>creatorShowMap(id));if(ticket===null)return;creatorSelected=null;$('creatorChallenge').disabled=true;$('creatorDetail').classList.add('hidden');$('creatorList').classList.add('hidden');creatorMessage('맵과 기록을 불러오는 중…');
 try{const [map,ranks]=await Promise.all([creatorAPI('maps/'+id),creatorAPI('maps/'+id+'/records')]);if(ticket!==creatorRequest||menuScreen!=='creator')return;creatorReadEnd(ticket);creatorSelected=map;$('creatorChallenge').disabled=false;$('creatorPanel').setAttribute('data-view','detail');$('creatorSortWrap').classList.add('hidden');creatorDrawPreview($('creatorMapPreview'),creatorPreviewData(map.map));$('creatorPersonalBest').textContent=creatorBrowseLabel('overall')+' '+creatorRecordTime(ranks.best_ms??ranks.records[0]?.best_ms)+' · '+creatorBrowseLabel('personal')+' '+creatorRecordTime(ranks.my_best_ms);$('creatorDelete').classList.toggle('hidden',!map.owner);$('creatorDeleteConfirm').classList.add('hidden');$('creatorList').classList.add('hidden');$('creatorDetail').classList.remove('hidden');$('creatorMapTitle').textContent=map.title;$('creatorMapInfo').textContent=map.map.tiles.length+'줄 · 중력 '+gravityCoefficientFromLegacy(map.map.gravity??18)+' · 연료 소모 '+(map.map.fuelDrainMultiplier??1)+'× · '+(map.status==='draft'?'직접 완주하면 게시됩니다.':'수정 없이 고정된 맵으로 경쟁합니다.');$('creatorChallenge').textContent=map.status==='draft'?'제작자 검증 주행 →':'도전하기 →';$('creatorRecords').innerHTML='';for(const [i,record] of ranks.records.entries()){const li=document.createElement('li');li.className=record.is_me?'creator-rank-self':'';li.textContent=(i+1)+'. '+(record.nickname||'파일럿')+(record.is_me?' · 나':'')+' — '+(record.best_ms/1000).toFixed(2)+'초';$('creatorRecords').appendChild(li)}if(!ranks.records.length){const empty=document.createElement('li');empty.className='creator-rank-empty';empty.textContent=creatorBrowseLabel('first');$('creatorRecords').appendChild(empty);}creatorMessage(ranks.records.length?'각 플레이어의 가장 빠른 기록만 표시합니다.':'첫 완주 기록에 도전하세요.')}catch(error){if(creatorReadEnd(ticket,error))$('creatorPanel').setAttribute('data-view','list')}
}
async function creatorRun(map){
 if(creatorSubmitting)return;creatorSubmitting=true;$('creatorChallenge').disabled=true;creatorMessage('주행을 준비하는 중…');
 const ticket=++creatorRequest;try{const {runId}=await creatorPost('maps/'+map.id+'/runs',{});if(ticket!==creatorRequest)return;creatorRestore();const custom=normalizeEditorMap(map.map);editorOriginalCourse=STORY_COURSES[0];STORY_COURSES[0]=custom;editorTesting=true;editorTestProfile={...stageProfiles[0],gravity:custom.gravity};creatorActive={id:map.id,runId,title:map.title,map};creatorTrace=[];level=0;mode='story';$('mapEditor').classList.add('hidden');$('editorBackPlay').classList.add('hidden');$('creatorPanel').classList.add('hidden');beginRun();}catch(error){if(ticket===creatorRequest&&menuScreen==='creator')creatorMessage(error.message)}finally{creatorSubmitting=false;if(ticket===creatorRequest&&menuScreen==='creator')$('creatorChallenge').disabled=false}
}
function creatorSample(){if(!creatorActive||time<=0)return;const last=creatorTrace.at(-1);if(!last||time>last[0]){
 const rounded=[time,z,x,y,speed].map(n=>Math.round(n*1e6)/1e6);
 // Compression must not move a sample across a tile edge or turn airborne into grounded.
 if(Math.floor(rounded[1])!==Math.floor(z))rounded[1]=z;
 if(Math.floor(rounded[2]+3.5)!==Math.floor(x+3.5))rounded[2]=x;
 if(y>0&&rounded[3]===0)rounded[3]=y;
 creatorTrace.push(rounded);
}}
const creatorStep=step;step=function(dt){creatorStep(dt);if(creatorActive&&state==='play')creatorSample();if(creatorActive)$('sector').textContent='CUSTOM';};
const creatorGrid=drawEditorRoadGrid;drawEditorRoadGrid=function(r){if(!creatorActive)creatorGrid(r)};
const creatorDraw=draw;draw=function(){creatorDraw();if(creatorActive){$('sector').textContent='CUSTOM';$('segment').textContent=creatorActive.title;}};
async function submitCreatorResult(){
 const pending=creatorPendingResult,active=creatorActive;if(!pending||creatorSubmitting)return;creatorSubmitting=true;$('start').disabled=true;$('description').textContent=(pending.ms/1000).toFixed(2)+'초 · 완주 기록을 서버에 확인하고 있습니다…';
 try{const result=await creatorPost('maps/'+pending.id+'/records',{runId:pending.runId,ms:pending.ms,trace:pending.trace});if(creatorPendingResult!==pending||!creatorActive)return;creatorPendingResult=null;$('description').textContent=(pending.ms/1000).toFixed(2)+'초 · '+(result.published?'제작자 완주 확인! 맵이 게시되었습니다.':'최고기록이 등록되었습니다. 더 빠른 기록으로 갱신할 수 있습니다.');$('start').textContent='다시 도전 →';}catch(error){if(creatorPendingResult!==pending||!creatorActive)return;const retryable=!error.status||error.status>=500||error.status===429||error.status===401;
 if(retryable){$('description').textContent=(pending.ms/1000).toFixed(2)+'초 · '+error.message+(error.status===401?' 로그인 후 기록을 다시 전송해 주세요.':' 연결 상태를 확인한 뒤 기록을 다시 전송할 수 있습니다.');$('start').textContent='기록 다시 전송 →';}
 else{creatorPendingResult=null;$('description').textContent=(pending.ms/1000).toFixed(2)+'초 · 완주 기록을 등록하지 못했습니다. '+error.message+' 이번 기록은 순위에 반영되지 않았습니다.';$('start').textContent='다시 도전 →';}}finally{creatorSubmitting=false;if(creatorActive===active&&menuScreen==='creator-result'){$('start').disabled=false;$('creatorResultRanks').disabled=!!creatorPendingResult;}}
}
const creatorFinish=finish;
function creatorResult(win,reason){
 if(!creatorActive)return;
 creatorSample();clearTimeout(nextTimer);nextTimer=0;state=win?'win':'dead';menuScreen='creator-result';$('overlay').setAttribute('data-screen','creator-result');$('overlay').classList.remove('hidden');$('creatorPanel').classList.add('hidden');$('levels').innerHTML='';$('shopgrid').innerHTML='';$('revenue').innerHTML='';$('revenueStatus').textContent='';$('wallet').textContent='';$('eyebrow').textContent='CREATOR CHALLENGE';$('title').textContent=win?'항로 완주.':'다시 도전하세요.';$('description').textContent=reason||'';$('start').classList.remove('hidden');$('start').textContent='다시 도전 →';$('home').classList.remove('hidden');$('home').textContent='창작모드로';
 $('creatorResultRanks').classList.remove('hidden');$('creatorResultRanks').disabled=win;
 if(win){creatorPendingResult={id:creatorActive.id,runId:creatorActive.runId,ms:Math.round(time*1000),trace:creatorTrace.slice()};submitCreatorResult();}beep(win?900:80,.3);
}
const creatorEditorResult=editorRunResult;editorRunResult=function(win,reason){return creatorActive?creatorResult(win,reason):creatorEditorResult(win,reason)};
finish=function(win,reason){if(creatorActive&&win&&state==='play')return creatorResult(win,reason);return creatorFinish(win,reason)};result=finish;
const creatorShowMenu=showMenu;showMenu=function(tab='main'){
 if(creatorActive&&creatorPendingResult)$('start').disabled=false;creatorReadJob=null;creatorRetryAction=null;$('creatorPanel').setAttribute('aria-busy','false');$('creatorRetry').classList.add('hidden');$('creatorResultRanks').classList.add('hidden');if(tab!=='creator')creatorRequest++;if(creatorActive){creatorRestore();}const custom=tab==='creator';creatorShowMenu(custom?'modes':tab);if(custom){menuScreen='creator';$('overlay').setAttribute('data-screen','creator');$('title').textContent=tr('창작모드');$('eyebrow').textContent='COMMUNITY COURSES';$('description').textContent='직접 만들고, 완주하고, 기록으로 도전하세요.';}
 $('creatorPanel').classList.toggle('hidden',!custom);$('creatorOpen').setAttribute('data-subtitle',({ko:'직접 만든 항로로 함께 경쟁',en:'Create courses. Challenge records.',ja:'作った航路で記録に挑戦',zh:'创建航线，挑战纪录'})[settings.language]);$('creatorOpen').setAttribute('data-index','05');localizeUI();
};
const creatorStartClick=$('start').onclick;$('start').onclick=()=>{if(!creatorActive)return creatorStartClick();if(state==='pause'){pause();return;}if(creatorPendingResult){submitCreatorResult();return;}creatorRun(creatorActive.map);};
const creatorHomeClick=$('home').onclick;$('home').onclick=()=>creatorActive||menuScreen==='creator-result'?openCreator():menuScreen==='creator'?showMenu('modes'):creatorHomeClick();
$('creatorOpen').onclick=()=>openCreator();$('creatorBrowse').onclick=()=>openCreator();$('creatorMine').onclick=()=>openCreator(true);$('creatorEdit').onclick=()=>{creatorRestore();openMapEditor();};$('creatorChallenge').onclick=()=>creatorSelected&&creatorRun(creatorSelected);
$('creatorProfileSave').onclick=async()=>{if($('creatorProfileSave').disabled)return;$('creatorProfileSave').disabled=true;const ticket=creatorRequest;try{await creatorPost('profile',{nickname:$('creatorNickname').value});if(ticket===creatorRequest&&menuScreen==='creator')creatorMessage('닉네임이 저장되었습니다.')}catch(error){if(ticket===creatorRequest&&menuScreen==='creator')creatorMessage(error.message)}finally{$('creatorProfileSave').disabled=false}};
$('creatorUpload').onclick=async()=>{
 if(creatorSubmitting)return;const uploadTicket=creatorRequest,uploadState=state,uploadScreen=menuScreen;syncEditorName();creatorSubmitting=true;$('creatorUpload').disabled=true;
 try{const map=normalizeEditorMap(editorMap);if(map.gravity===undefined)map.gravity=100;const posted=await creatorPost('maps',{map});if(uploadTicket!==creatorRequest||uploadState!==state||uploadScreen!==menuScreen)return;$('mapEditor').classList.add('hidden');creatorRestore();showMenu('creator');await creatorShowMap(posted.id);}catch(error){if(uploadTicket===creatorRequest&&uploadState===state&&uploadScreen===menuScreen)$('editorStatus').textContent=error.message+(!error.status?' 업로드 결과가 불확실합니다. 다시 올리기 전에 내 맵 목록을 확인해 주세요.':'');}finally{creatorSubmitting=false;$('creatorUpload').disabled=false}
};

// Deletion is confirmed in the map detail, and ownership is enforced by the server.
$('creatorDelete').onclick=()=>{
 if(!creatorSelected?.owner)return;
 $('creatorDeleteWarning').textContent='“'+creatorSelected.title+'” 맵을 삭제할까요? 공개 목록과 모든 도전 기록이 삭제되며 복구할 수 없습니다. 에디터 원본은 유지됩니다.';
 $('creatorDeleteConfirm').classList.remove('hidden');
};
$('creatorDeleteCancel').onclick=()=>$('creatorDeleteConfirm').classList.add('hidden');
$('creatorDeleteAccept').onclick=async()=>{
 const map=creatorSelected;if(!map?.owner||creatorSubmitting)return;
 creatorSubmitting=true;$('creatorDeleteAccept').disabled=true;$('creatorDeleteCancel').disabled=true;
 try{
  await creatorAPI('maps/'+map.id,{method:'DELETE'});
  if(creatorSelected===map&&menuScreen==='creator'){creatorSelected=null;if(menuScreen==='creator'){await openCreator(true);creatorMessage('맵이 삭제되었습니다.');}}
 }catch(error){if(creatorSelected===map&&menuScreen==='creator')creatorMessage(error.message)}finally{creatorSubmitting=false;$('creatorDeleteAccept').disabled=false;$('creatorDeleteCancel').disabled=false;}
};

function creatorBrowseLabel(key){return ({ko:{draft:'게시 대기',cleared:'완주 ✓',uncleared:'미완주',first:'첫 완주 기록을 남겨보세요.',best:'1위',mine:'내 기록',overall:'전체 1위',personal:'내 최고기록',empty:'미기록'},en:{draft:'DRAFT',cleared:'CLEARED ✓',uncleared:'NOT CLEARED',first:'Set the first clear time.',best:'Best',mine:'Me',overall:'Overall best',personal:'Personal best',empty:'No record'},ja:{draft:'公開待ち',cleared:'クリア ✓',uncleared:'未クリア',first:'最初のクリア記録に挑戦。',best:'1位',mine:'自分',overall:'全体1位',personal:'自己ベスト',empty:'未記録'},zh:{draft:'待发布',cleared:'已完成 ✓',uncleared:'未完成',first:'留下首个通关纪录。',best:'第一名',mine:'我的纪录',overall:'全站最佳',personal:'个人最佳',empty:'无纪录'}}[settings.language]||{})[key]||key;}
function creatorRecordTime(ms){return Number.isFinite(ms)?(ms/1000).toFixed(2)+({ko:'초',en:'s',ja:'秒',zh:'秒'}[settings.language]):creatorBrowseLabel('empty')}
function creatorPreviewData(map){return {rows:map.tiles.length,cells:map.tiles.map((row,r)=>row.map((t,l)=>!t?'0':map.roadPaint?.[r]?.[l]==='pink'?(boxHeight(t)?'x':'h'):boxHeight(t)?'b':map.ceilings?.[r]&&(map.tunnelCenters?.[r]||[]).some(c=>Math.abs(l-3-c)<=(map.tunnelRadius?.[r]||.65))?'t':t===3?'f':t===4?'u':t===5?'s':'r').join('')).join('')}}
function creatorDrawPreview(canvas,preview){
 const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height;g.fillStyle='#071522';g.fillRect(0,0,w,h);if(!preview?.rows)return;
 const pad=14,cellW=(w-2*pad)/7,cellH=(h-2*pad)/preview.rows,colors={r:'#91a5b5',b:'#d4a260',t:'#71d2bb',h:'#c52c49',x:'#c52c49',f:'#a0f5d9',u:'#829fff',s:'#b4a7dc'};
 for(let r=0;r<preview.rows;r++)for(let l=0;l<7;l++){const color=colors[preview.cells[r*7+l]];if(!color)continue;g.fillStyle=color;g.fillRect(pad+l*cellW,h-pad-(r+1)*cellH,Math.max(1,cellW-1),Math.max(.6,cellH));}
 g.strokeStyle='#e4f6fc';g.lineWidth=1;g.beginPath();g.moveTo(pad,h-pad);g.lineTo(w-pad,h-pad);g.stroke();g.fillStyle='#f6db8b';const y=h-pad-Math.max(3,2*cellH);g.beginPath();g.moveTo(w/2,y-6);g.lineTo(w/2-4,y+2);g.lineTo(w/2+4,y+2);g.closePath();g.fill();
}
$('creatorDetailBack').onclick=()=>openCreator(creatorMineView);
$('creatorResultRanks').onclick=async()=>{if(!creatorActive||creatorPendingResult||creatorSubmitting)return;const id=creatorActive.id;creatorRestore();showMenu('creator');await creatorShowMap(id);};
$('creatorSort').onchange=()=>openCreator(creatorMineView);
