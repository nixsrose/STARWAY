let customBackgroundImage=null,backgroundUploadTicket=0;
function syncEditorBackground(){const bg=editorMap.background||{kind:'auto',color:'#071423',dim:.35,image:''};$('editorBackgroundKind').value=bg.kind;$('editorBackgroundColor').value=bg.color;$('editorBackgroundDim').value=String(Math.round(bg.dim*100));$('editorBackgroundStatus').textContent=bg.image?'이미지 포함 · 저장 또는 JSON 내보내기로 함께 보관됩니다.':'배경 선택 후 시험 주행에서 확인하세요.';}
const backgroundGrid=renderEditorGrid;renderEditorGrid=function(...args){const result=backgroundGrid(...args);syncEditorBackground();return result;};
function changeEditorBackground(patch){try{const next=normalizeBackground({...editorMap.background,kind:$('editorBackgroundKind').value||'auto',color:$('editorBackgroundColor').value||'#071423',dim:Number($('editorBackgroundDim').value)/100,...patch});editorSnapshot();editorMap.background=next;syncEditorBackground();$('editorStatus').textContent='배경 변경 · 시험 주행으로 확인한 후 저장·적용하세요.';}catch(error){$('editorBackgroundStatus').textContent=error.message;}}
for(const id of ['editorBackgroundKind','editorBackgroundColor','editorBackgroundDim'])$(id).onchange=()=>changeEditorBackground({});
$('editorBackgroundClear').onclick=()=>{backgroundUploadTicket++;changeEditorBackground({kind:'auto',image:''});};
$('editorBackgroundFile').onchange=async event=>{
 const file=event.target.files?.[0],ticket=++backgroundUploadTicket,target=editorMap;event.target.value='';if(!file)return;
 try{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8000000)throw Error('8MB 이하 PNG·JPEG·WebP 이미지를 선택하세요.');
  const url=URL.createObjectURL(file),image=new Image();try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('이미지를 읽지 못했습니다.'));image.src=url;});}finally{URL.revokeObjectURL(url);}
  if(ticket!==backgroundUploadTicket||editorMap!==target)return;
  const canvas=document.createElement('canvas'),ratio=Math.min(1,1280/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const g=canvas.getContext('2d');g.fillStyle='#071423';g.fillRect(0,0,canvas.width,canvas.height);g.drawImage(image,0,0,canvas.width,canvas.height);
  let encoded='';for(const quality of [.82,.66,.5,.35]){encoded=canvas.toDataURL('image/jpeg',quality);if(encoded.length<=300000)break;}if(encoded.length>300000)throw Error('이미지가 복잡해 저장 크기를 초과했습니다. 더 작은 이미지를 선택하세요.');
  changeEditorBackground({kind:'image',image:encoded});
 }catch(error){$('editorBackgroundStatus').textContent=error.message;}
};
syncEditorBackground();
function drawCustomBackground(){
 const bg=typeof activeRoadData==='function'?activeRoadData().background:null;if(!bg||bg.kind==='auto')return false;
 ctx.fillStyle=bg.color;ctx.fillRect(0,0,W,H);
 if(bg.kind==='image'&&bg.image&&typeof Image!=='undefined'){
  if(customBackgroundImage?.src!==bg.image){const image=new Image();customBackgroundImage={src:bg.image,image,ready:false};image.onload=()=>{if(customBackgroundImage?.image===image)customBackgroundImage.ready=true;};image.src=bg.image;}
  const image=customBackgroundImage.image;if(customBackgroundImage.ready){const scale=Math.max(W/image.naturalWidth,H/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,(W-w)/2,(H-h)/2,w,h);}
 }else{
  drawDepthStars();if(bg.kind==='star'||bg.kind==='orbit'){const warm=bg.kind==='star',cx=W*.20,cy=H*.17,r=Math.min(W*.35,H*.26),g=ctx.createRadialGradient(cx-r*.3,cy-r*.3,0,cx,cy,r);g.addColorStop(0,warm?'#ffe8a8':'#bad7e5');g.addColorStop(.45,warm?'#ed8839':'#507e9b');g.addColorStop(1,warm?'#7a271c':'#081b30');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();}
 }
 ctx.fillStyle='rgba(0,0,0,'+bg.dim+')';ctx.fillRect(0,0,W,H);return true;
}
