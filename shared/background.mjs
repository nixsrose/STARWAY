export function normalizeBackground(raw){
 if(raw===undefined||raw===null)return null;
 if(typeof raw!=='object'||Array.isArray(raw))throw Error('배경 설정이 올바르지 않습니다.');
 const kind=raw.kind??'auto';if(!['auto','star','orbit','deep','image'].includes(kind))throw Error('배경 종류가 올바르지 않습니다.');
 const color=raw.color??'#071423';if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('배경 색상이 올바르지 않습니다.');
 const dim=raw.dim??.35;if(!Number.isFinite(dim)||dim<0||dim>.8)throw Error('배경 어둡기는 0~80%로 설정하세요.');
 const image=raw.image??'';if(typeof image!=='string'||image.length>300000||image&&!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(image))throw Error('배경 이미지는 압축된 PNG·JPEG·WebP만 사용할 수 있습니다.');
 return {kind,color,dim,image};
}
