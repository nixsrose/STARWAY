// Persistent course selection. Only the course list scrolls.
const STORY_SELECTION_KEY='starway-story-selection-v1';let storySelectionMemory=null,storyScrollSave=null;
try{const raw=JSON.parse(localStorage.getItem(STORY_SELECTION_KEY)||'null');if(raw&&Number.isInteger(raw.level)&&raw.level>=0&&raw.level<STORY_TOTAL_COUNT&&Number.isFinite(raw.scroll)&&raw.scroll>=0)storySelectionMemory={level:raw.level,scroll:Math.min(1e7,raw.scroll)}}catch{}
function rememberStorySelection(){storySelectionMemory={level,scroll:Number($('levels').scrollTop)||0};try{localStorage.setItem(STORY_SELECTION_KEY,JSON.stringify(storySelectionMemory))}catch{}}
function nextUnclearedStory(){for(let i=0;i<Math.min(STORY_VISIBLE_COUNT,data.unlocked+1);i++)if(!data.cleared.includes(i))return i;return null}
const storySelectionWords={ko:['다음 미완주','전체 완주','완주','도전 가능','잠김','보유 메달','최고기록','구역','항로 선택'],en:['Next uncleared','All cleared','Cleared','Available','Locked','Medal','Best','Sectors','Select course'],ja:['次の未クリア','全クリア','クリア','挑戦可能','ロック','メダル','ベスト','エリア','航路選択'],zh:['下一未完成关卡','全部完成','已完成','可挑战','锁定','奖牌','最佳','区域','选择航线']};
const storyDetailWords={
 ko:['다음 목표','먼저 완주 기록을 남겨보세요.','최고 등급 달성','초 단축','이전 항로 완주 후 도전 가능','기록 없음','중력 변환','점프 불가 존','위험 구간','터널','점프 구간','높은 발판','좁은 항로','기본 조종'],
 en:['Next target','Set your first clear time.','Highest medal earned','s faster','Clear the previous course to unlock.','No record','Gravity changes','No-jump zones','Hazards','Tunnels','Jump gaps','Raised platforms','Narrow route','Basic handling'],
 ja:['次の目標','まず完走タイムを記録しましょう。','最高ランク獲得','秒短縮','前の航路をクリアすると解放。','未記録','重力変換','ジャンプ禁止','危険区間','トンネル','ジャンプ区間','高い足場','狭い航路','基本操作'],
 zh:['下一目标','先留下首次通关纪录。','已达最高等级','秒提升','完成上一航线后解锁。','无纪录','重力变化','禁止跳跃区','危险路段','隧道','跳跃间隙','高台','狭窄航线','基础操控']
};
const storyBriefingWords={
 ko:{ship:'장착 기체',upgrade:'강화',speed:'속도',jump:'점프',fuel:'연비',tips:['최고속도보다 감속과 착지 타이밍이 중요합니다.','중력 변환 뒤에는 점프 체공 시간이 달라집니다.','점프 불가 존에 들어가기 전에 착지하세요.','위험 바닥과 위험 터널의 지붕 접촉을 피하세요.','터널 진입 전 중앙에 맞추고 속도를 조절하세요.']},
 en:{ship:'Equipped',upgrade:'Upgrade',speed:'Speed',jump:'Jump',fuel:'Efficiency',tips:['Braking and landing timing matter more than top speed.','Gravity changes alter your jump airtime.','Land before entering a no-jump zone.','Avoid hazard floors and hazard tunnel roofs.','Align with the tunnel entrance and adjust speed.']},
 ja:{ship:'装着機体',upgrade:'強化',speed:'速度',jump:'ジャンプ',fuel:'燃費',tips:['最高速度より減速と着地のタイミングが重要です。','重力変換後はジャンプの滞空時間が変わります。','ジャンプ禁止区間に入る前に着地しましょう。','危険な床と危険トンネルの屋根を避けましょう。','トンネル入口に合わせて速度を調整しましょう。']},
 zh:{ship:'已装备',upgrade:'升级',speed:'速度',jump:'跳跃',fuel:'燃效',tips:['减速与着陆时机比最高速度更重要。','重力变化会改变跳跃滞空时间。','进入禁止跳跃区前请先着陆。','避开危险地面和危险隧道顶部。','对准隧道入口并调整速度。']}
};
function storyCourseTip(index){const map=STORY_COURSES[index],w=storyBriefingWords[settings.language]||storyBriefingWords.ko;return w.tips[map?.gravityGates?.length?1:map?.noJumpZones?.length?2:map?.hazardTunnels?.length||map?.roadPaint?.some(row=>row?.includes('pink'))?3:map?.ceilings?.some(h=>h>0)?4:0];}
function appendStoryShipBriefing(){
 const mapLabel=({ko:['수정 맵 적용 중','기본 맵'],en:['Edited map active','Built-in map'],ja:['編集マップ適用中','標準マップ'],zh:['正在使用修改地图','默认地图']})[settings.language]||['Edited map active','Built-in map'];const mapSource=document.createElement('span');mapSource.className='story-map-source';mapSource.textContent=mapLabel[editorStoryOverrides[level]?0:1];$('description').appendChild(mapSource);
 const w=storyBriefingWords[settings.language]||storyBriefingWords.ko,stats=shipStats(data.skin),line=document.createElement('span');line.className='story-ship-briefing';
 const copy=document.createElement('span');copy.textContent=w.ship+' · '+tr(skins[data.skin][0])+'\n'+w.speed+' '+speedKmh(stats.speed).toFixed(1)+' km/h · '+w.jump+' '+stats.jump.toFixed(2)+' · '+w.fuel+' '+Math.round(stats.fuel*100)+'%';line.appendChild(copy);
 const button=document.createElement('button');button.type='button';button.id='storyShipUpgrade';button.textContent=w.upgrade;button.onclick=()=>{rememberStorySelection();showMenu('main');openShipUpgrades();shipUpgradeReturnToStory=true;};line.appendChild(button);$('description').appendChild(line);
 if(!data.cleared.includes(level)){const tip=document.createElement('span');tip.className='story-course-tip';tip.textContent=storyCourseTip(level);$('description').appendChild(tip);}
}
function storyCourseFeatures(index){
 const map=STORY_COURSES[index],tiles=map?.tiles||[],w=storyDetailWords[settings.language]||storyDetailWords.ko,features=[];
 if(map?.gravityGates?.length)features.push(w[6]);
 if(map?.noJumpZones?.length)features.push(w[7]);
 if(map?.roadPaint?.some(row=>row?.includes('pink'))||map?.hazardTunnels?.length)features.push(w[8]);
 if(map?.ceilings?.some(height=>height>0))features.push(w[9]);
 if(tiles.some(row=>row.every(tile=>!tile)))features.push(w[10]);
 if(tiles.some(row=>row.some(tile=>boxHeight(tile)>0)))features.push(w[11]);
 if(tiles.some(row=>row.filter(Boolean).length===1))features.push(w[12]);
 return (features.length?features:[w[13]]).slice(0,2).join(' · ');
}
function storyNextMedalGoal(index){
 const w=storyDetailWords[settings.language]||storyDetailWords.ko,medals=medalWords(),tier=medalTier(index),best=data.storyTimes[index]?.best;
 if(index>data.unlocked)return w[4];
 if(tier==='gold')return w[2];
 if(!Number.isFinite(best)||best<=0)return w[1];
 const next=tier==='silver'?'gold':'silver',target=medalTargetFor(index)[next],gap=medalImprovementGap(best,target);
 return w[0]+' · '+medals[next]+' · '+formatMedalRequirement(target)+' · '+gap+(settings.language==='en'?' '+w[3]:w[3]);
}
function enhanceStorySelection(){if(menuScreen!=='story')return;const w=storySelectionWords[settings.language]||storySelectionWords.ko,next=nextUnclearedStory();$('title').textContent=w[8];$('eyebrow').textContent='STORY / '+new Set(data.cleared.filter(i=>i>=0&&i<STORY_VISIBLE_COUNT)).size+' / '+STORY_VISIBLE_COUNT;$('storyContinue').classList.remove('hidden');$('storyContinue').disabled=next===null;$('storyContinue').textContent=next===null?'✓ '+w[1]:w[0]+' · '+(Math.floor(next/3)+1)+'-'+(next%3+1)+' →';const best=data.storyTimes[level]?.best,tier=medalTier(level),details=storyDetailWords[settings.language]||storyDetailWords.ko;$('description').textContent=(Math.floor(level/3)+1)+'-'+(level%3+1)+' · '+STORY_COURSES[level].title+'\n'+w[6]+' '+(Number.isFinite(best)&&best>0?best.toFixed(2)+(settings.language==='ko'?'초':settings.language==='en'?' s':'秒'):details[5])+' · '+w[5]+' '+(tier?medalWords()[tier]:medalWords().none)+'\n'+storyNextMedalGoal(level)+'\n'+storyCourseFeatures(level);appendStoryShipBriefing();
 const buttons=Array.from($('levels').children||[]).slice(-STORY_VISIBLE_COUNT);buttons.forEach((button,i)=>{const locked=i>data.unlocked,cleared=data.cleared.includes(i),tier=medalTier(i),stage=(Math.floor(i/3)+1)+'-'+(i%3+1);if(i%3===0){const chapter=i/3,count=[i,i+1,i+2].filter(n=>data.cleared.includes(n)).length;button.setAttribute('data-chapter-name',String(chapter+1).padStart(2,'0')+' / '+releaseChapters[chapter]+' · '+count+'/3')}button.setAttribute('data-next',String(i===next));button.setAttribute('data-course-state',locked?'locked':cleared?'cleared':'open');button.setAttribute('aria-label',stage+' · '+(locked?w[4]:cleared?w[2]:w[3])+(tier?' · '+medalWords()[tier]:''));button.innerHTML='<span class="story-stage-number">'+stage+(locked?' <span aria-hidden="true">🔒</span>':'')+'</span><span class="story-stage-state">'+(tier?({gold:'🥇',silver:'🥈',bronze:'🥉'}[tier])+' ':cleared?'✓ ':'')+(locked?w[4]:cleared?w[2]:w[3])+'</span>';});
 const medalBox=$('medalSelection'),heading=medalBox.textContent.split('\n')[0],words=medalWords(),target=medalTargetFor(level);medalBox.innerHTML='<span class="story-medal-heading">'+heading+'</span><span class="story-medal-row"><span class="story-medal-cell"><b>🥇 '+words.gold+'</b><span>'+formatMedalRequirement(target.gold)+'</span></span><span class="story-medal-cell"><b>🥈 '+words.silver+'</b><span>'+formatMedalRequirement(target.silver)+'</span></span><span class="story-medal-cell"><b>🥉 '+words.bronze+'</b><span>'+words.clear+'</span></span></span>';rememberStorySelection();}
$('storyContinue').onclick=()=>{const next=nextUnclearedStory();if(next===null)return;level=next;showMenu('story');const button=Array.from($('levels').children||[]).slice(-STORY_VISIBLE_COUNT)[next];if(button&&Number.isFinite(button.offsetTop))$('levels').scrollTop=Math.max(0,button.offsetTop-$('levels').offsetTop-32);rememberStorySelection()};
$('levels').addEventListener('scroll',()=>{if(menuScreen!=='story')return;clearTimeout(storyScrollSave);storyScrollSave=setTimeout(()=>{if(menuScreen==='story')rememberStorySelection()},120)},{passive:true});
const storySelectionMenu=showMenu;showMenu=function(tab='main'){const previous=menuScreen,scroll=previous==='story'?Number($('levels').scrollTop)||0:null;if(previous==='story'){clearTimeout(storyScrollSave);rememberStorySelection()}const restore=tab==='story'&&['main','modes'].includes(previous)&&storySelectionMemory;if(restore)level=Math.min(storySelectionMemory.level,data.unlocked,STORY_VISIBLE_COUNT-1);const desiredScroll=tab==='story'&&previous!=='story'&&storySelectionMemory?storySelectionMemory.scroll:scroll;const out=storySelectionMenu(...arguments);if(tab==='story'&&menuScreen==='story'){enhanceStorySelection();if(desiredScroll!==null&&desiredScroll!==undefined){const selected=level;$('levels').scrollTop=desiredScroll;rememberStorySelection();requestAnimationFrame(()=>{if(menuScreen==='story'&&level===selected){$('levels').scrollTop=desiredScroll;rememberStorySelection()}})}}else $('storyContinue').classList.add('hidden');return out};
const storySelectionBegin=beginRun;beginRun=function(...args){if(menuScreen==='story')rememberStorySelection();$('storyContinue').classList.add('hidden');return storySelectionBegin(...args)};
