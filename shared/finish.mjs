export const TUNNEL_PASSAGE_RADIUS=.49;
// Finish is metadata, independent of tile paint and geometry.
export function normalizeFinish(map){
 const f=map.finish;if(f==null)return undefined;
 if(!Number.isInteger(f.row)||f.row<4||f.row>=map.tiles.length||!Number.isInteger(f.lane)||f.lane<0||f.lane>6||!['road','tunnel'].includes(f.type))throw Error('FINISH 위치는 5번째 줄 이후의 도로 또는 터널에 지정하세요.');
 const t=map.tiles[f.row][f.lane],tunnel=map.ceilings?.[f.row]>0&&(map.tunnelCenters?.[f.row]||[]).includes(f.lane-3);
 if(![1,3,4,5].includes(t)||map.roadPaint?.[f.row]?.[f.lane]==='pink'||(f.type==='tunnel')!==!!tunnel)throw Error('FINISH의 도로·터널 종류와 배치가 일치하지 않습니다.');
 return {row:f.row,lane:f.lane,type:f.type};
}
export function mapFinishes(map){return Array.isArray(map.finishes)&&map.finishes.length?map.finishes:map.finish?[map.finish]:[];}
export function normalizeMapExtras(map,raw){
 const out={};
 if(raw.finishes!==undefined){if(!Array.isArray(raw.finishes)||raw.finishes.length>500)throw Error('FINISH는 최대 500개까지 배치하세요.');const used=new Set();out.finishes=raw.finishes.map(f=>normalizeFinish({...map,finish:f})).filter(f=>{const key=f.row+':'+f.lane;if(used.has(key))return false;used.add(key);return true;});}
 if(raw.medalTargets!==undefined){const {gold,silver}=raw.medalTargets||{};if(!Number.isFinite(gold)||!Number.isFinite(silver)||gold<.1||gold>=silver||silver>3600)throw Error('메달 조건은 0.1초 ≤ 금메달 < 은메달 ≤ 3600초로 입력하세요.');out.medalTargets={gold,silver};}
 if(raw.gravityGates!==undefined){if(!Array.isArray(raw.gravityGates)||raw.gravityGates.length>500)throw Error('중력 장치는 최대 500개까지 배치하세요.');const used=new Set();out.gravityGates=raw.gravityGates.map(g=>{if(!g||!Number.isInteger(g.row)||g.row<3||g.row>=map.tiles.length||!Number.isInteger(g.lane)||g.lane<0||g.lane>6||![50,100,150,200,300,500].includes(g.gravity)||![1,3,4,5].includes(map.tiles[g.row][g.lane])||map.roadPaint?.[g.row]?.[g.lane]==='pink')throw Error('중력 장치는 4번째 줄 이후 안전한 도로에 배치하고 50·100·150·200·300·500 중 선택하세요.');return {row:g.row,lane:g.lane,gravity:g.gravity};}).filter(g=>{const key=g.row+':'+g.lane;if(used.has(key))return false;used.add(key);return true;});}
 if(raw.speedPads!==undefined){if(!Array.isArray(raw.speedPads)||raw.speedPads.length>3500)throw Error('속도 패드는 최대 3500칸까지 지정하세요.');const used=new Set();out.speedPads=raw.speedPads.map(p=>{if(!p||!Number.isInteger(p.row)||p.row<0||p.row>=map.tiles.length||!Number.isInteger(p.lane)||p.lane<0||p.lane>6||![4,5].includes(map.tiles[p.row][p.lane])||!Number.isInteger(p.speedKmh)||p.speedKmh<(map.tiles[p.row][p.lane]===4?1:0)||p.speedKmh>1000)throw Error('가속은 1~1000, 감속은 0~1000km/h로 속도 패드 위에 지정하세요.');return {row:p.row,lane:p.lane,speedKmh:p.speedKmh};}).filter(p=>{const key=p.row+':'+p.lane;if(used.has(key))return false;used.add(key);return true;});}
 if(raw.noJumpZones!==undefined){if(!Array.isArray(raw.noJumpZones)||raw.noJumpZones.length>3500)throw Error('점프 불가 존은 최대 3500칸까지 지정하세요.');const used=new Set();out.noJumpZones=raw.noJumpZones.map(g=>{if(!g||!Number.isInteger(g.row)||g.row<0||g.row>=map.tiles.length||!Number.isInteger(g.lane)||g.lane<0||g.lane>6||![1,3,4,5].includes(map.tiles[g.row][g.lane])||map.roadPaint?.[g.row]?.[g.lane]==='pink')throw Error('점프 불가 존은 안전한 도로·터널·패드 위에 지정하세요.');return {row:g.row,lane:g.lane};}).filter(g=>{const key=g.row+':'+g.lane;if(used.has(key))return false;used.add(key);return true;});}
 if(raw.jumpAllowZones!==undefined){if(!Array.isArray(raw.jumpAllowZones)||raw.jumpAllowZones.length>3500)throw Error('점프 허용 존은 최대 3500칸까지 지정하세요.');const used=new Set();out.jumpAllowZones=raw.jumpAllowZones.map(g=>{if(!g||!Number.isInteger(g.row)||g.row<0||g.row>=map.tiles.length||!Number.isInteger(g.lane)||g.lane<0||g.lane>6||![1,3,4,5].includes(map.tiles[g.row][g.lane])||map.roadPaint?.[g.row]?.[g.lane]==='pink')throw Error('점프 허용 존은 안전한 도로·터널·패드 위에 지정하세요.');return {row:g.row,lane:g.lane};}).filter(g=>{const key=g.row+':'+g.lane;if(used.has(key))return false;used.add(key);return true;});}
 if(raw.hazardTunnels!==undefined){if(!Array.isArray(raw.hazardTunnels)||raw.hazardTunnels.length>3500)throw Error('위험 터널은 최대 3500칸까지 지정하세요.');const used=new Set();out.hazardTunnels=raw.hazardTunnels.map(g=>{if(!g||!Number.isInteger(g.row)||g.row<0||g.row>=map.tiles.length||!Number.isInteger(g.lane)||g.lane<0||g.lane>6||!map.ceilings?.[g.row]||!(map.tunnelCenters?.[g.row]||[]).includes(g.lane-3))throw Error('위험 터널은 터널이 설치된 칸에 지정하세요.');return {row:g.row,lane:g.lane};}).filter(g=>{const key=g.row+':'+g.lane;if(used.has(key))return false;used.add(key);return true;});}
 return out;
}
export function mapFinishZ(map){const fs=mapFinishes(map);return fs.length?Math.max(...fs.map(f=>f.row+.5)):map.tiles.length-2;}
export function mapFinishReached(map,oldZ,oldX,oldY,nextZ,nextX,nextY){
 const fs=mapFinishes(map);if(!fs.length)return nextZ>=mapFinishZ(map);
 return fs.some(f=>{
 const goal=f.row+.5;if(nextZ<goal||oldZ>=f.row+1)return false;
 const q=nextZ>oldZ?Math.max(0,Math.min(1,(goal-oldZ)/(nextZ-oldZ))):1,px=oldX+(nextX-oldX)*q,py=oldY+(nextY-oldY)*q;
 if(Math.floor(px+3.5)!==f.lane)return false;
 if(f.type==='road')return py>=-.03&&py<=.5;
 const dx=px-(f.lane-3),radius=TUNNEL_PASSAGE_RADIUS,ceiling=(map.ceilings?.[f.row]||1.15)*Math.sqrt(Math.max(0,1-(dx/radius)**2));
 return Math.abs(dx)<radius&&py>=-.03&&py+.35<ceiling+.02;
 });
}

// Identical core footprint for every cosmetic hull. Floor support uses overlap,
// rather than changing to a void solely because the center crossed a cell edge.
export function flightContacts(map,tiles,x,z,previousY,nextY,verticalSpeed){
 const halfX=.28,halfZ=.22,minSupport=.06,cells=[];
 for(let r=Math.max(0,Math.floor(z-halfZ));r<=Math.floor(z+halfZ);r++)for(let l=Math.max(0,Math.floor(x-halfX+3.5));l<=Math.min(6,Math.floor(x+halfX+3.5));l++){
  const tile=tiles[r]?.[l]||0;if(!tile)continue;
  const overlapX=Math.min(x+halfX,l-2.5)-Math.max(x-halfX,l-3.5),overlapZ=Math.min(z+halfZ,r+1)-Math.max(z-halfZ,r);
  if(overlapX<=.008||overlapZ<=.008)continue;
  cells.push({row:r,lane:l,height:tile===2?.85:tile===8?2.2:0,box:tile===2||tile===8,hazard:map.roadPaint?.[r]?.[l]==='pink',support:overlapX>=minSupport&&overlapZ>=minSupport});
 }
 for(const b of map.bridges||[]){const ox=Math.min(x+halfX,b.right)-Math.max(x-halfX,b.left),oz=Math.min(z+halfZ,b.end)-Math.max(z-halfZ,b.start);if(ox>=minSupport&&oz>=minSupport)cells.push({height:b.height+b.thickness,support:true,box:false,hazard:false})}
 const landings=verticalSpeed<=0?cells.filter(c=>c.support&&previousY>=c.height-.03&&nextY<=c.height+.02):[];
 const landing=landings.sort((a,b)=>b.height-a.height||Number(b.hazard)-Number(a.hazard))[0]||null;
 const collision=cells.find(c=>c.box&&nextY<c.height-.025&&(!landing||landing.height<c.height-.025))||null;
 return {landing,collision};
}

const hazardTunnelCaches=new WeakMap();
export function hazardTunnelAt(map,row,center){const cells=map?.hazardTunnels;if(!cells)return false;let set=hazardTunnelCaches.get(cells);if(!set){set=new Set(cells.map(g=>g.row+':'+(g.lane-3)));hazardTunnelCaches.set(cells,set);}return set.has(row+':'+center);}
export function hazardTunnelRoofAt(map,row,xx){const h=map.ceilings?.[row]||0;if(!h)return 0;const radius=map.tunnelRadius?.[row]||.65;let roof=0;for(const center of map.tunnelCenters?.[row]||[]){if(!hazardTunnelAt(map,row,center))continue;const dx=Math.abs(xx-center);if(dx<=radius)roof=Math.max(roof,h*Math.sqrt(Math.max(0,1-(dx/radius)**2))+.12);}return roof;}
