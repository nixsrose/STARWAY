(function(){
 async function closeToss(){clearFlightInput();if(!window.confirm('STARWAY를 종료할까요?'))return;try{await window.StarwayToss.close();}catch{window.alert('종료하지 못했습니다. 토스의 닫기 버튼을 이용해 주세요.');}}
 $('menuExit').onclick=closeToss;
 window.addEventListener('starway:toss-home',()=>{suspendFlightSession();closeToss();});
 window.addEventListener('starway:toss-back',()=>{clearFlightInput();if(state==='play'||state==='ready'){pause();return;}if(state==='falling'||state==='exploding'){suspendFlightSession();showMenu(mode==='endless'?'endless':'story');return;}if(menuScreen==='main'){closeToss();return;}$('home').click();});
 creatorAPI=async function(){throw Error('토스용 창작모드는 서버 계정 연동 준비 중입니다. 스토리·무한모드·맵 제작은 이용할 수 있습니다.');};
 $('creatorSignIn').onclick=()=>creatorMessage('토스용 계정 연동을 준비 중입니다.');
})();
