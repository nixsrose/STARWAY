import {normalizeFinish,mapFinishZ,mapFinishReached,flightContacts,normalizeMapExtras,hazardTunnelRoofAt} from '../shared/finish.mjs';
import {normalizeBackground} from '../shared/background.mjs';
import {ASSETS} from './assets.mjs';
const json=(v,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const palette=new Set(['gray','mint','indigo','ochre','electricBlue','amber','rose','rust','moonGray','lime','electricPurple','white','lavender','peach','sand','slate','violet','aqua','lemon','magenta','pink']);
export function creatorMapSummary(map){
 const cells=map.tiles.map((row,r)=>row.map((t,l)=>{
  if(!t)return '0';if(map.roadPaint?.[r]?.[l]==='pink')return t===2||t===8?'x':'h';
  if(t===2||t===8)return 'b';if(map.ceilings?.[r]&&(map.tunnelCenters?.[r]||[]).some(c=>Math.abs(l-3-c)<=(map.tunnelRadius?.[r]||.65)))return 't';return t===3?'f':t===4?'u':t===5?'s':'r';
 }).join('')).join('');
 const g=map.gravity??18;return {length:map.tiles.length,gravity:map.gravityUnit==='coefficient'?g:Math.max(50,Math.min(200,Math.round(g/18*2)*50)),fuelDrainMultiplier:map.fuelDrainMultiplier??1,preview:{rows:map.tiles.length,cells}};
}
export function validateMap(raw){
 if(!raw||!Array.isArray(raw.tiles)||raw.tiles.length<16||raw.tiles.length>500||raw.tiles.some(r=>!Array.isArray(r)||r.length!==7||r.some(v=>![0,1,2,3,4,5,8].includes(v))))fail('맵은 16~500줄, 각 줄은 7칸이어야 합니다.');
 const n=raw.tiles.length,title=String(raw.title||'').trim().slice(0,60);let gravity=raw.gravity??100;if(!title)fail('맵 이름을 입력하세요.');if(raw.gravityUnit==='coefficient'||raw.gravity===undefined){if(![50,100,150,200,300,500].includes(gravity))fail('중력 계수는 50·100·150·200·300·500 중 선택하세요.');}else{if(!Number.isInteger(gravity)||gravity<8||gravity>30)fail('이전 중력 값이 올바르지 않습니다.');gravity=Math.max(50,Math.min(200,Math.round(gravity/18*2)*50));}
 const fuelDrainMultiplier=raw.fuelDrainMultiplier??1;if(!Number.isFinite(fuelDrainMultiplier)||fuelDrainMultiplier<.25||fuelDrainMultiplier>3||!Number.isInteger(fuelDrainMultiplier*4))fail('연료 소모 배율은 0.25~3.00 사이 0.25 단위로 설정하세요.');
 let background;try{background=normalizeBackground(raw.background)}catch(error){fail(error.message)}
 const m={background,title,fuelDrainMultiplier,gravity,gravityUnit:'coefficient',tiles:raw.tiles.map(r=>r.slice()),roadPaint:[],boxPaint:[],boxColors:[],tunnelColors:[],ceilings:[],tunnelCenters:{},tunnelRadius:{},coins:[],bridges:[],sections:[{start:0,end:n,type:'custom',name:title,side:3}],startSpeed:18};
 for(let r=0;r<n;r++){
  m.roadPaint[r]=Array.from({length:7},(_,l)=>palette.has(raw.roadPaint?.[r]?.[l])?raw.roadPaint[r][l]:'gray');m.boxPaint[r]=Array.from({length:7},(_,l)=>palette.has(raw.boxPaint?.[r]?.[l])&&raw.boxPaint[r][l]!=='pink'?raw.boxPaint[r][l]:null);m.boxColors[r]=palette.has(raw.boxColors?.[r])?raw.boxColors[r]:'violet';m.tunnelColors[r]=['peach','rose','lavender','aqua','blue','green','red','gold','ice','mint'].includes(raw.tunnelColors?.[r])?raw.tunnelColors[r]:'aqua';
  m.ceilings[r]=0;const cs=raw.tunnelCenters?.[r];if(Array.isArray(cs)&&cs.length&&cs.length<=7&&cs.every(c=>Number.isInteger(c)&&Math.abs(c)<=3)){
   m.tunnelCenters[r]=[...new Set(cs)];m.tunnelRadius[r]=.65;m.ceilings[r]=1.15;
   if(r&&m.ceilings[r-1]&&JSON.stringify(m.tunnelCenters[r-1])!==JSON.stringify(m.tunnelCenters[r]))fail('연속 터널은 일자로 배치하세요.');
  }
 }
 if(![1,3].includes(m.tiles[2][3])||m.roadPaint[2][3]==='pink'||m.ceilings[2])fail('시작 위치는 터널과 위험칸이 없는 도로나 연료칸이어야 합니다.');
 m.finish=normalizeFinish({...m,finish:raw.finish});Object.assign(m,normalizeMapExtras(m,raw));
 return m;
}
export function validateTrace(map,trace,ms,elapsed){
 if(!Number.isInteger(ms)||ms<100||ms>600000||ms>elapsed+1500||!Array.isArray(trace)||trace.length<2||trace.length>40000)fail('주행 기록을 확인할 수 없습니다. 다시 도전하세요.');
 const maxTraceSpeed=Math.max(24,...(map.speedPads||[]).filter(p=>map.tiles[p.row]?.[p.lane]===4).map(p=>p.speedKmh/36));
 const noJumpCells=new Set((map.noJumpZones||[]).map(g=>g.row+':'+g.lane));
 let gravity=map.gravityUnit==='coefficient'?(map.gravity||100)*.18:map.gravity||18;let prev=[0,2,0,0,0],airStart=null;
 for(const s of trace){
  if(!Array.isArray(s)||s.length!==5||s.some(v=>!Number.isFinite(v)))fail('잘못된 주행 데이터입니다.');
  const [t,z,x,y,v]=s,dt=t-prev[0];if(dt<=0||dt>.105||v<0||v>maxTraceSpeed+.1||Math.abs(x)>4||y<-.05||y>6)fail('주행 범위를 벗어났습니다.');
  if(Math.abs((z-prev[1])-v*dt)>.055||Math.abs(x-prev[2])>7.2*dt+.025||Math.abs(y-prev[3])>12*dt+.12)fail('이동 기록이 일치하지 않습니다.');
  const r=Math.floor(z),l=Math.floor(x+3.5),tile=map.tiles[r]?.[l]||0,box=tile===2?.85:tile===8?2.2:0;
  let roof=0,ceiling=0;const radius=map.tunnelRadius?.[r]||.65;if(map.ceilings[r])for(const c of map.tunnelCenters[r]||[])if(Math.abs(x-c)<=radius){const inner=map.ceilings[r]*Math.sqrt(Math.max(0,1-((x-c)/radius)**2));roof=Math.max(roof,inner+.12);ceiling=Math.max(ceiling,inner);}
  const hazardRoof=hazardTunnelRoofAt(map,r,x);if(hazardRoof&&Math.abs(y-hazardRoof)<.06)fail('위험 터널 지붕 접촉 기록입니다.');
  const contact=flightContacts(map,map.tiles,x,z,Math.max(prev[3],y),y,y>prev[3]+.005?1:0);
  if(z<mapFinishZ(map)||map.finish){
   if(contact.landing?.hazard&&Math.abs(y-contact.landing.height)<.04)fail('위험칸 기록이 발견됐습니다.');
   if(contact.collision)fail('장애물 충돌 기록이 발견됐습니다.');
   if(!tile&&!contact.landing&&y<=0)fail('도로 이탈 기록이 발견됐습니다.');
   if(tile&&map.roadPaint[r][l]==='pink'&&y<=box+.04&&y<roof-.04)fail('위험칸 기록이 발견됐습니다.');
   if(tile&&map.roadPaint[r][l]==='pink'&&roof===0&&y<=box+.04)fail('위험칸 기록이 발견됐습니다.');
   if(roof&&y<roof-.04&&y+.35>ceiling)fail('터널 충돌 기록이 발견됐습니다.');
  }
  if(prev[3]===0&&y>.001&&noJumpCells.has(Math.floor(prev[1])+':'+Math.floor(prev[2]+3.5)))fail('점프 불가 존에서의 점프 기록입니다.');
  const supported=contact.landing&&Math.abs(y-contact.landing.height)<.06||roof&&Math.abs(y-roof)<.06;
  if(supported)airStart=null;else if(airStart===null)airStart=t;
  if(airStart!==null&&t-airStart>2*7.8/gravity+1.05)fail('체공 시간이 일치하지 않습니다.');
  for(const gate of map.gravityGates||[]){const goal=gate.row+.5;if(prev[1]<goal&&z>=goal){const q=(goal-prev[1])/(z-prev[1]),gx=prev[2]+(x-prev[2])*q,gy=prev[3]+(y-prev[3])*q;if(Math.floor(gx+3.5)===gate.lane&&gy>=-.03&&gy<=.5)gravity=gate.gravity*.18;}}
  prev=s;
 }
 if(!mapFinishReached(map,trace.length>1?trace[trace.length-2][1]:2,trace.length>1?trace[trace.length-2][2]:0,trace.length>1?trace[trace.length-2][3]:0,prev[1],prev[2],prev[3])||Math.abs(prev[0]*1000-ms)>120||ms<(prev[1]-2)/maxTraceSpeed*1000)fail('완주 지점과 기록이 일치하지 않습니다.');
 return true;
}
async function api(request,env,url){
 const user=request.headers.get('oai-authenticated-user-id');if(!user)return json({error:'로그인 후 이용할 수 있습니다.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);
 if(!env.DB)fail('창작모드 서버를 준비하고 있습니다.',503);
 if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==url.origin)fail('잘못된 요청 출처입니다.',403);
 const db=env.DB,now=Date.now(),path=url.pathname;
 async function body(){if(Number(request.headers.get('content-length'))>3000000)fail('업로드 용량을 초과했습니다.',413);const text=await request.text();if(text.length>3000000)fail('업로드 용량을 초과했습니다.',413);try{return JSON.parse(text)}catch{fail('잘못된 요청입니다.')}}
 const nickname=async()=>{const p=await db.prepare('SELECT nickname FROM creator_profiles WHERE user_id=?').bind(user).first();return p?.nickname||'파일럿'};
 if(path==='/api/creator/me'&&request.method==='GET')return json({nickname:await nickname()});
 if(path==='/api/creator/profile'&&request.method==='POST'){
  const b=await body(),name=String(b.nickname||'').trim();if(name.length<2||name.length>20||/[<>\x00-\x1f]/.test(name))fail('닉네임은 2~20자로 입력하세요.');await db.prepare('INSERT INTO creator_profiles(user_id,nickname) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET nickname=excluded.nickname').bind(user,name).run();return json({nickname:name});
 }
 if(path==='/api/creator/maps'&&request.method==='GET'){
  const mine=url.searchParams.get('mine')==='1',sort=url.searchParams.get('sort')||'latest',unplayed=sort==='unplayed';
  const list=await db.prepare(`SELECT m.id,m.title,m.payload,m.status,m.created_at,p.nickname,(SELECT MIN(best_ms) FROM creator_records WHERE map_id=m.id) best_ms,(SELECT best_ms FROM creator_records WHERE map_id=m.id AND user_id=?) my_best_ms,(SELECT COUNT(*) FROM creator_records WHERE map_id=m.id) challengers FROM creator_maps m LEFT JOIN creator_profiles p ON p.user_id=m.owner_id WHERE ${mine?'m.owner_id=?':"m.status='published'"} ${unplayed?'AND NOT EXISTS(SELECT 1 FROM creator_records WHERE map_id=m.id AND user_id=?)':''} ORDER BY ${sort==='popular'?'challengers DESC,':''} m.created_at DESC,m.id DESC LIMIT 60`).bind(user,...(mine?[user]:[]),...(unplayed?[user]:[])).all();
  return json({maps:list.results.map(({payload,...row})=>({...row,...creatorMapSummary(JSON.parse(payload))}))});
 }
 if(path==='/api/creator/maps'&&request.method==='POST'){
  const rate=await db.prepare('SELECT COUNT(*) n FROM creator_maps WHERE owner_id=? AND created_at>?').bind(user,now-86400000).first();if(rate.n>=20)fail('하루에 최대 20개 맵을 올릴 수 있습니다.',429);
  const b=await body(),m=validateMap(b.map),id=crypto.randomUUID();await db.prepare('INSERT INTO creator_maps(id,owner_id,title,payload,created_at) VALUES(?,?,?,?,?)').bind(id,user,m.title,JSON.stringify(m),now).run();return json({id,title:m.title,status:'draft'},201);
 }
 const match=path.match(/^\/api\/creator\/maps\/([a-f0-9-]{36})(?:\/(runs|records))?$/);if(!match)fail('경로를 찾을 수 없습니다.',404);
 const id=match[1],action=match[2],map=await db.prepare('SELECT * FROM creator_maps WHERE id=?').bind(id).first();if(!map||map.status!=='published'&&map.owner_id!==user)fail('맵을 찾을 수 없습니다.',404);
 if(!action&&request.method==='DELETE'){
  if(map.owner_id!==user)fail('본인이 만든 맵만 삭제할 수 있습니다.',403);
  await db.batch([
   db.prepare('DELETE FROM creator_records WHERE map_id=?').bind(id),
   db.prepare('DELETE FROM creator_runs WHERE map_id=?').bind(id),
   db.prepare('DELETE FROM creator_maps WHERE id=? AND owner_id=?').bind(id,user)
  ]);return json({deleted:true});
 }
 if(!action&&request.method==='GET')return json({id,title:map.title,map:JSON.parse(map.payload),status:map.status,owner:map.owner_id===user});
 if(action==='records'&&request.method==='GET'){
  const records=await db.prepare('SELECT p.nickname,r.best_ms,r.created_at,(r.user_id=?) is_me FROM creator_records r LEFT JOIN creator_profiles p ON p.user_id=r.user_id WHERE r.map_id=? ORDER BY r.best_ms ASC,r.created_at ASC LIMIT 50').bind(user,id).all();
  const mine=await db.prepare('SELECT best_ms FROM creator_records WHERE map_id=? AND user_id=?').bind(id,user).first();return json({records:records.results,my_best_ms:mine?.best_ms??null,best_ms:records.results[0]?.best_ms??null});
 }
 if(action==='runs'&&request.method==='POST'){
  const rate=await db.prepare('SELECT COUNT(*) n FROM creator_runs WHERE user_id=? AND created_at>?').bind(user,now-3600000).first();if(rate.n>=120)fail('잠시 후 다시 도전하세요.',429);
  const runId=crypto.randomUUID();await db.prepare('INSERT INTO creator_runs(id,map_id,user_id,created_at) VALUES(?,?,?,?)').bind(runId,id,user,now).run();return json({runId});
 }
 if(action==='records'&&request.method==='POST'){
  const b=await body(),run=await db.prepare('SELECT * FROM creator_runs WHERE id=? AND user_id=? AND map_id=?').bind(String(b.runId||''),user,id).first();if(!run||now-run.created_at>900000)fail('주행 세션이 만료됐습니다. 다시 도전하세요.');if(run.consumed){const existing=await db.prepare('SELECT best_ms FROM creator_records WHERE map_id=? AND user_id=?').bind(id,user).first();if(existing&&existing.best_ms<=b.ms)return json({saved:true,published:map.status==='published'&&map.owner_id===user});fail('이미 등록한 주행입니다.',409);}
  validateTrace(JSON.parse(map.payload),b.trace,b.ms,now-run.created_at);
  // A run can be submitted once; the conditional write makes retries idempotent.
  const consumed=await db.prepare('UPDATE creator_runs SET consumed=1 WHERE id=? AND consumed=0').bind(run.id).run();if(consumed.meta.changes!==1)fail('이미 등록한 주행입니다.',409);
  const statements=[db.prepare('INSERT INTO creator_records(map_id,user_id,best_ms,created_at) VALUES(?,?,?,?) ON CONFLICT(map_id,user_id) DO UPDATE SET best_ms=excluded.best_ms,created_at=excluded.created_at WHERE excluded.best_ms<creator_records.best_ms').bind(id,user,b.ms,now)];
  if(map.owner_id===user&&map.status==='draft')statements.push(db.prepare("UPDATE creator_maps SET status='published' WHERE id=?").bind(id));await db.batch(statements);return json({saved:true,published:map.owner_id===user&&map.status==='draft'});
 }
 fail('지원하지 않는 요청입니다.',405);
}
export default {async fetch(request,env){try{const url=new URL(request.url);if(url.pathname.startsWith('/api/creator/'))return await api(request,env,url);const a=ASSETS[url.pathname==='/'?'/index.html':url.pathname];if(!a)return new Response('Not found',{status:404});if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});return new Response(request.method==='HEAD'?null:a.base64?Uint8Array.from(atob(a.base64),c=>c.charCodeAt(0)):a.text,{headers:{'content-type':a.type,'cache-control':(url.pathname.endsWith('.js')||url.pathname.startsWith('/audio/'))?'public,max-age=31536000,immutable':'no-cache','x-content-type-options':'nosniff'}})}catch(e){return json({error:e.status?e.message:'서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.'},e.status||500)}}};
