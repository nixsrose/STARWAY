// Story clear records are frozen at finish; no automatic stage advance.
let storyCompletion=null;
function hideCompletion(){storyCompletion=null;$('completionInfo').classList.add('hidden');$('completionRetry').classList.add('hidden');$('overlay').setAttribute('data-complete','false')}
function showCompletion(previous){
 const best=data.storyTimes[level]?.best??time,fresh=!previous||time<previous,final=level===STORY_VISIBLE_COUNT-1;
 storyCompletion={level,time,best,previous,fresh};clearTimeout(nextTimer);nextTimer=0;
 const w={ko:['항로 완주','최종 항로 완주','이번 완주 시간','개인 최고기록','신기록','첫 완주 기록','최고기록보다 ','초 단축','초 더 걸렸습니다','최고기록과 동일합니다','다음 스테이지로 →','다시 도전 →','같은 코스 다시 도전','스테이지 선택','21개 항로의 마지막 코스를 완주했습니다.'],en:['Course complete','Final course complete','CLEAR TIME','PERSONAL BEST','NEW BEST','FIRST CLEAR','Compared with best: ','s faster','s slower','Matched your best','Next stage →','Retry →','Retry this course','Select stage','You cleared the final course of 21.'],ja:['航路完走','最終航路完走','今回のタイム','自己ベスト','新記録','初完走記録','ベストより ','秒速い','秒遅い','自己ベストと同タイム','次のステージ →','リトライ →','同じコースに再挑戦','ステージ選択','全21航路の最終コースを完走。'],zh:['航线完成','最终航线完成','本次用时','个人最佳','新纪录','首次完成','比最佳纪录 ','秒更快','秒更慢','与最佳纪录相同','下一关 →','重试 →','重试本关','选择关卡','已完成21条航线中的最终关卡。']}[settings.language];
 $('overlay').setAttribute('data-screen','result');$('overlay').setAttribute('data-complete','true');$('overlay').setAttribute('data-failure','false');$('overlay').setAttribute('data-live-ads',String(hasAds()));menuScreen='result';
 $('completionInfo').classList.remove('hidden');$('completionRetry').classList.toggle('hidden',final);$('completionInfo').setAttribute('data-new-best',String(fresh));
 $('eyebrow').textContent=final?'STORY / FINAL COURSE':'FLIGHT REPORT';$('title').textContent=final?w[1]:w[0];$('description').textContent=final?w[14]:STORY_COURSES[level].title;
 $('completionTimeLabel').textContent=w[2];$('completionTime').textContent=time.toFixed(2)+' s';$('completionBestLabel').textContent=w[3];$('completionBest').textContent=best.toFixed(2)+' s';
 $('completionBadge').textContent=previous?(fresh?w[4]:''):w[5];
 const delta=previous?time-previous:0;$('completionDelta').textContent=!previous?w[5]:Math.abs(delta)<.005?w[9]:w[6]+Math.abs(delta).toFixed(2)+(delta<0?w[7]:w[8]);
 $('start').textContent=final?w[11]:w[10];$('completionRetry').textContent=w[12];$('home').textContent=w[13];
}
const completionFinish=finish;finish=function(win,reason){
 const eligible=win&&state==='play'&&mode==='story'&&!editorTesting,previous=eligible?data.storyTimes[level]?.best:null;
 const out=completionFinish(win,reason);if(eligible&&state==='win')showCompletion(previous);return out;
};result=finish;
const completionBegin=beginRun;beginRun=function(...args){hideCompletion();return completionBegin(...args)};
const completionMenu=showMenu;showMenu=function(...args){hideCompletion();return completionMenu(...args)};
$('completionRetry').onclick=()=>{if(!storyCompletion||state!=='win'||revenueBusy)return;level=storyCompletion.level;beginRun()};
// Consume rapid repeated result actions, including a second click after navigation.
let resultActionAt=-Infinity;
function guardResultAction(event){
 const now=performance.now();
 if(now-resultActionAt<350){event.preventDefault();event.stopImmediatePropagation();return;}
 if(state==='win'||state==='dead')resultActionAt=now;
}
for(const id of ['start','home','completionRetry'])$(id).addEventListener('click',guardResultAction,{capture:true});
