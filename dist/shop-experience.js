let shopSelection=0,shopPending=null,shopMessage='';
function shopWords(){return {
 ko:['장착 중','보유','미보유','기체별 기본 성능과 강화 단계가 주행에 반영됩니다.','보유 코인','구매·장착','장착하기','코인 부족','부족한 코인','구매 확인','취소','구매하고 장착','구매 후 잔액','구매·장착했습니다.','장착했습니다.','저장하지 못했습니다. 백업 또는 저장 공간을 확인해 주세요.'],
 en:['EQUIPPED','OWNED','NOT OWNED','Ships have individual stats and upgrades.','COINS','Buy & equip','Equip','Not enough coins','Coins needed','Confirm purchase','Cancel','Buy & equip','Balance after purchase','Purchased and equipped.','Equipped.','Could not save. Check storage or make a backup.'],
 ja:['装備中','所持済み','未所持','機体ごとに性能・強化段階が異なります。','所持コイン','購入・装備','装備する','コイン不足','不足コイン','購入確認','キャンセル','購入して装備','購入後の残高','購入・装備しました。','装備しました。','保存できませんでした。保存領域をご確認ください。'],
 zh:['已装备','已拥有','未拥有','飞船拥有独立属性与升级。','持有金币','购买并装备','装备','金币不足','还需金币','确认购买','取消','购买并装备','购买后余额','已购买并装备。','已装备。','保存失败，请检查存储空间或备份。']
 }[settings.language];}
function paintShopShip(canvas,id,large=false){const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);g.save();g.translate(canvas.width/2,canvas.height*.43);renderFlightShip(g,id,0,large?126:64,{foreshortening:.72,shear:0});g.restore();}
function renderShopInterface(){
 const w=shopWords(),id=shopSelection,s=skins[id],owned=data.owned.includes(id),equipped=data.skin===id,missing=Math.max(0,s[1]-data.coins);
 $('shopgrid').innerHTML='';$('shopName').textContent=tr(s[0]);$('shopState').textContent=equipped?w[0]:owned?w[1]:w[2];$('shopNote').textContent=skinNotes[id];$('shopFairness').textContent=w[3];$('shopBalance').textContent=w[4]+' ◈ '+data.coins+(!owned?' · ◈ '+s[1]:'');
 $('shopPreview').setAttribute('aria-label',s[0]);paintShopShip($('shopPreview'),id,true);
 $('shopAction').textContent=equipped?w[0]:owned?w[6]:missing?w[7]+' · '+w[8]+' '+missing:w[5]+' · ◈ '+s[1];$('shopAction').disabled=equipped||!!missing&&!owned;
 $('shopConfirm').classList.toggle('hidden',shopPending!==id);$('shopAction').classList.toggle('hidden',shopPending===id);$('shopCancel').textContent=w[10];$('shopAccept').textContent=w[11];
 $('shopConfirmSummary').textContent=w[9]+' · '+tr(s[0])+'\n◈ '+s[1]+' · '+w[12]+' ◈ '+Math.max(0,data.coins-s[1]);$('shopStatus').textContent=shopMessage;
 skins.forEach((skin,i)=>{const card=document.createElement('button');card.className='shop-choice';card.setAttribute('aria-pressed',String(i===id));const preview=document.createElement('canvas');preview.width=220;preview.height=155;paintShopShip(preview,i);card.appendChild(preview);const name=document.createElement('strong');name.textContent=tr(skin[0]);card.appendChild(name);const badge=document.createElement('span');badge.textContent=data.skin===i?w[0]:data.owned.includes(i)?w[1]:'◈ '+skin[1];card.appendChild(badge);card.onclick=()=>{shopSelection=i;shopPending=null;shopMessage='';renderShopInterface()};$('shopgrid').appendChild(card);});
}
function equipShopSelection(confirmPurchase=false){
 const id=shopSelection,owned=data.owned.includes(id),w=shopWords();
 if(menuScreen!=='shop'||data.skin===id)return;
 if(!owned&&(!confirmPurchase||shopPending!==id))return;
 shopPending=null;
 if(!buySkin(id))return renderShopInterface();
 shopMessage=storageOK?(owned?w[14]:w[13]):w[15];wallet();renderShopInterface();
}
$('shopAction').onclick=()=>{if(menuScreen!=='shop')return;if(data.owned.includes(shopSelection))equipShopSelection();else if(data.coins>=skins[shopSelection][1]){shopPending=shopSelection;renderShopInterface();}};
$('shopAccept').onclick=()=>equipShopSelection(true);
$('shopCancel').onclick=()=>{shopPending=null;renderShopInterface()};
const shopExperienceMenu=showMenu;showMenu=function(tab='main'){
 const entering=tab==='shop'&&menuScreen!=='shop';const out=shopExperienceMenu(...arguments);
 shopPending=null;shopMessage='';if(tab==='shop'&&menuScreen==='shop'){if(entering)shopSelection=data.skin;renderShopInterface();}
 return out;
};
