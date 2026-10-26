import {SafeArea,Screen,graniteEvent} from '@apps-in-toss/web-framework';
const cleanups:Array<()=>void>=[];
function insets(value:{top:number;bottom:number;left:number;right:number}){for(const side of ['top','bottom','left','right'] as const)document.documentElement.style.setProperty('--toss-safe-'+side,Math.max(0,value[side])+'px');window.dispatchEvent(new Event('resize'));}
try{insets(SafeArea.get());cleanups.push(SafeArea.subscribe({onEvent:insets}));}catch(error){console.warn('Native safe area unavailable',error);}
(window as any).StarwayToss={close:()=>Screen.close()};
for(const event of ['backEvent','homeEvent'] as const){try{cleanups.push(graniteEvent.addEventListener(event,{onEvent:()=>window.dispatchEvent(new Event(event==='backEvent'?'starway:toss-back':'starway:toss-home'))}));}catch(error){console.warn('Native navigation unavailable',error);}}
window.addEventListener('pagehide',()=>{for(const cleanup of cleanups)cleanup();},{once:true});
const game=document.createElement('script');game.src='/__GAME_BUNDLE__';game.onload=()=>{const adapter=document.createElement('script');adapter.src='/toss-runtime.js';document.body.appendChild(adapter);};game.onerror=()=>{document.getElementById('bootMessage')!.textContent='게임을 불러오지 못했습니다. 다시 실행해 주세요.';};document.body.appendChild(game);
