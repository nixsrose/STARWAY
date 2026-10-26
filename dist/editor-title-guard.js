// User-authored map titles must bypass every phrase-replacement layer.
const editorTitleBaseTranslate=translateDynamic;
translateDynamic=function(text){
 if(settings.language==='ko')return text;
 const n={en:0,ja:1,zh:2}[settings.language];let m;
 if(text.includes('\n'))return text.split('\n').map(translateDynamic).join('\n');
 if((m=text.match(/^(기존 맵|새 맵): (.*?)( \(\d+줄[^)]*\))?$/)))return (m[1]==='기존 맵'?['Previous map: ','前のマップ: ','上一地图：']:['New map: ','新マップ: ','新地图：'])[n]+m[2]+(m[3]?editorUnits(m[3]):'');
 return editorTitleBaseTranslate(text);
};
