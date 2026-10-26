// Randomize only the run's collectibles; never rewrite authored or saved maps.
function randomStoryCoins(map,tiles,random=Math.random){
 const finish=Math.min(tiles.length-3,...mapFinishes(map).map(f=>f.row));
 const safe=(r,l)=>[1,3,4,5].includes(tiles[r]?.[l])&&map.roadPaint?.[r]?.[l]!=='pink';
 const candidates=[];
 for(let r=8;r<finish;r++){
  const lanes=Array.from({length:7},(_,l)=>l).filter(l=>safe(r-1,l)&&safe(r,l)&&safe(r+1,l));
  if(lanes.length)candidates.push({row:r,lanes});
 }
 const target=Math.min(candidates.length,map.coins?.length||Math.min(16,Math.max(6,Math.round(finish/28))));
 const result=[];
 // Stratified selection keeps coins spread over the course, with random row/lane.
 for(let i=0;i<target;i++){
  const first=Math.floor(i*candidates.length/target),last=Math.floor((i+1)*candidates.length/target);
  const candidate=candidates[first+Math.floor(random()*(last-first))];
  result.push([candidate.row,candidate.lanes[Math.floor(random()*candidate.lanes.length)]]);
 }
 return result;
}
const randomCoinBuildTrack=buildTrack;buildTrack=function(...args){
 const out=randomCoinBuildTrack(...args);
 if(mode!=='story'||challengeActive||STORY_COURSES[level]?.challengeId)return out;
 const course=STORY_COURSES[level];coins.clear();
 for(const [row,lane] of randomStoryCoins(course,rows))coins.set(row,{lane,height:.4});
 return out;
};
