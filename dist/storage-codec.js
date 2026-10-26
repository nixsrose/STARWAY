// Lossless JSON-array compaction. Game APIs and exported backups still read ordinary JSON.
const STARWAY_STORAGE_PREFIX='STARWAY-COMPACT-1\n';
function starwayPackValue(value){
 if(Array.isArray(value)){
  const primitive=v=>v===null||['string','number','boolean'].includes(typeof v);
  if(value.length>=8&&value.every(row=>Array.isArray(row)&&row.every(primitive))){
   const dictionary=[],indices=[],seen=new Map();for(const row of value){const key=JSON.stringify(row);if(!seen.has(key)){seen.set(key,dictionary.length);dictionary.push(row);}indices.push(seen.get(key));}
   const runs=[];for(const index of indices){const last=runs.at(-1);if(last&&last[0]===index)last[1]++;else runs.push([index,1]);}
   const packed={__swRows:[dictionary,runs]};if(JSON.stringify(packed).length<JSON.stringify(value).length*.9)return packed;
  }
  if(value.length>=16&&value.every(primitive)){
   const runs=[];for(const item of value){const last=runs.at(-1);if(last&&last[0]===item)last[1]++;else runs.push([item,1]);}
   const packed={__swRun:runs};if(JSON.stringify(packed).length<JSON.stringify(value).length*.9)return packed;
  }
  return value.map(starwayPackValue);
 }
 if(typeof value==='string'&&value.length>=1024)try{const parsed=JSON.parse(value);if(JSON.stringify(parsed)===value){const nested={__swJson:starwayPackValue(parsed)};if(JSON.stringify(nested).length<JSON.stringify(value).length*.9)return nested;}}catch{}
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,starwayPackValue(item)]));return value;
}
function starwayUnpackValue(value){
 if(Array.isArray(value))return value.map(starwayUnpackValue);
 if(value&&typeof value==='object'){
  if(Object.keys(value).length===1&&Object.hasOwn(value,'__swJson'))return JSON.stringify(starwayUnpackValue(value.__swJson));
  if(Object.keys(value).length===1&&Array.isArray(value.__swRows)){
   const [dictionary,runs]=value.__swRows,out=[];if(!Array.isArray(dictionary)||!Array.isArray(runs))throw Error('압축된 맵 데이터가 올바르지 않습니다.');
   for(const [index,count]of runs){if(!Number.isInteger(index)||!Array.isArray(dictionary[index])||!Number.isInteger(count)||count<1||out.length+count>1000000)throw Error('압축된 맵 배열이 올바르지 않습니다.');for(let i=0;i<count;i++)out.push(dictionary[index].slice());}return out;
  }
  if(Object.keys(value).length===1&&Array.isArray(value.__swRun)){
   const out=[];for(const [item,count]of value.__swRun){if(!Number.isInteger(count)||count<1||out.length+count>1000000)throw Error('압축된 배열이 올바르지 않습니다.');for(let i=0;i<count;i++)out.push(item);}return out;
  }
  return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,starwayUnpackValue(item)]));
 }
 return value;
}
function starwayDecodeStored(value){return typeof value==='string'&&value.startsWith(STARWAY_STORAGE_PREFIX)?JSON.stringify(starwayUnpackValue(JSON.parse(value.slice(STARWAY_STORAGE_PREFIX.length)))):value;}
function starwayEncodeStored(value){
 const text=String(value);if(text.length<1024||text.startsWith(STARWAY_STORAGE_PREFIX))return text;
 try{const parsed=JSON.parse(text);if(JSON.stringify(parsed)!==text||text.includes('"__swRows"')||text.includes('"__swRun"')||text.includes('"__swJson"'))return text;
  const packed=STARWAY_STORAGE_PREFIX+JSON.stringify(starwayPackValue(parsed));
  return packed.length<text.length*.9&&starwayDecodeStored(packed)===text?packed:text;
 }catch{return text;}
}
function starwayCreateStorage(native){
 const ours=key=>/^starway(?:[.-]|$)/.test(String(key));
 const wrapper={getItem(key){const value=native.getItem(key);return ours(key)?starwayDecodeStored(value):value;},setItem(key,value){native.setItem(key,ours(key)?starwayEncodeStored(value):String(value));},removeItem(key){native.removeItem(key);},key(index){return native.key(index);},get length(){return native.length;}};
 // Replacing a value with a smaller encoding is atomic; failures keep the original bytes.
 const keys=new Set(['starway-v2','starway-story-maps-v1','starway-map-backups-v1','starway-editor-v1','starway-restore-backup-v1','starway-challenge-restore-backup-v1']);
 try{for(let i=0;i<native.length;i++)if(ours(native.key(i)))keys.add(native.key(i));}catch{}
 for(const key of keys)try{const raw=native.getItem(key);if(raw!==null){const packed=starwayEncodeStored(raw);if(packed!==raw)native.setItem(key,packed);}}catch{}
 return wrapper;
}
const starwayFilmingMode=typeof location!=='undefined'&&new URLSearchParams(location.search).get('filming')==='1';
function starwayFilmingStorage(native){
 const entries=new Map();for(let i=0;i<native.length;i++){const key=native.key(i);entries.set(key,native.getItem(key));}
 return {getItem(key){return entries.get(String(key))??null;},setItem(key,value){entries.set(String(key),String(value));},removeItem(key){entries.delete(String(key));},key(index){return [...entries.keys()][index]??null;},get length(){return entries.size;}};
}
function starwayOpenStorage(){try{return starwayCreateStorage(starwayFilmingMode?starwayFilmingStorage(globalThis.localStorage):globalThis.localStorage);}catch(error){return {getItem(){throw error;},setItem(){throw error;},removeItem(){throw error;},key(){return null;},length:0};}}
const localStorage=starwayOpenStorage();
