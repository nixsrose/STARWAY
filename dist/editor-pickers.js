// Native selects remain as internal values for existing paint/test/save paths.
let editorPickerKind=null,editorBrushBeforeErase='1';
function editorPickerOptions(kind){const select=$(kind==='color'?'editorColor':'editorBrush');return Array.from(select.options||select.children||[]).filter(o=>o.value!==undefined&&!o.hidden&&!o.disabled&&(kind!=='brush'||o.value!=='0'));}
function editorPickerLabel(kind,value){const option=editorPickerOptions(kind).find(o=>o.value===value);return option?.label||option?.textContent||(kind==='color'?EDITOR_COLOR_NAMES[value]:{'1':'도로','2':'블록','8':'높은 블록','3':'연료','4':'가속','5':'감속',tunnel:'터널',hazard:'위험 바닥',hazardBlock:'위험 블록'}[value])||value;}
function syncEditorPickerButtons(){const brush=$('editorBrush').value||'1',color=$('editorColor').value||'gray',erasing=brush==='0';if(!erasing)editorBrushBeforeErase=brush;$('editorErase').textContent=erasing?'틈/지우기 ON':'틈/지우기 OFF';$('editorErase').setAttribute('aria-label',erasing?'틈/지우기 켜짐 · 누르면 이전 도구로 복귀':'틈/지우기 꺼짐 · 누르면 켜기');$('editorBrushCurrent').textContent=erasing?'배치 도구':editorPickerLabel('brush',brush).split(' · ')[0];$('editorBrushOpen').setAttribute('aria-label','배치 도구 선택 · '+(erasing?'지우기 사용 중':editorPickerLabel('brush',brush)));$('editorErase').setAttribute('aria-pressed',String(erasing));$('editorColorCurrent').textContent=EDITOR_COLOR_NAMES[color]||editorPickerLabel('color',color);$('editorColorOpen').setAttribute('aria-label','색상 선택 · '+$('editorColorCurrent').textContent);}
function closeEditorPicker(restoreFocus=true){const kind=editorPickerKind;editorPickerKind=null;$('editorPickerOverlay').classList.add('hidden');$('editorBrushOpen').setAttribute('aria-expanded','false');$('editorColorOpen').setAttribute('aria-expanded','false');if(restoreFocus&&kind)$(kind==='color'?'editorColorOpen':'editorBrushOpen').focus?.({preventScroll:true});}
function chooseEditorPickerValue(kind,value){
 if(kind!=='brush'&&kind!=='color')return false;
 if(!(kind==='brush'&&value==='0')&&!editorPickerOptions(kind).some(o=>o.value===value))return false;
 const select=$(kind==='color'?'editorColor':'editorBrush');select.value=value;select.onchange?.({target:select});syncEditorPickerButtons();closeEditorPicker();
 const label=value==='0'?'틈/지우기':editorPickerLabel(kind,value);$('editorStatus').textContent=label+' 선택 · '+(rectangleBounds()?'선택 적용을 누르면 선택 구간에 적용됩니다.':editorRectangleMode?'시작 칸과 끝 칸을 선택하세요.':'맵의 칸을 눌러 적용하세요.');return true;
}
function openEditorPicker(kind){
 finishEditorPaint();closeEditorSheets();editorPickerKind=kind;const color=kind==='color',select=$(color?'editorColor':'editorBrush'),grid=$('editorPickerGrid');grid.innerHTML='';grid.className=color?'editor-picker-colors':'editor-picker-brushes';$('editorPickerTitle').textContent=color?'색상 선택':'배치 도구';
 for(const option of editorPickerOptions(kind)){
  const button=document.createElement('button');button.type='button';button.className='editor-picker-option';button.setAttribute('aria-pressed',String(select.value===option.value));button.setAttribute('data-picker-value',option.value);const label=option.label||option.textContent||option.value;
  if(color){const swatch=document.createElement('i');swatch.className='editor-picker-swatch';swatch.style.background=ROAD_PAINT_COLORS[option.value]||'#7c9aaa';swatch.setAttribute('aria-hidden','true');button.appendChild(swatch);}
  const title=document.createElement('span'),parts=label.split(' · ');title.textContent=color?(EDITOR_COLOR_NAMES[option.value]||label):parts[0];button.appendChild(title);
  if(!color&&parts.length>1){const hint=document.createElement('small');hint.textContent=parts.slice(1).join(' · ');button.appendChild(hint);}
  button.setAttribute('aria-label',label+(select.value===option.value?' · 선택됨':''));button.onclick=()=>chooseEditorPickerValue(kind,option.value);grid.appendChild(button);
 }
 $('editorPickerOverlay').classList.remove('hidden');$('editorBrushOpen').setAttribute('aria-expanded',String(!color));$('editorColorOpen').setAttribute('aria-expanded',String(color));
 const focus=grid.querySelector?.('[aria-pressed="true"]')||grid.querySelector?.('button');focus?.focus?.({preventScroll:true});
}
$('editorBrushOpen').onclick=()=>openEditorPicker('brush');$('editorColorOpen').onclick=()=>openEditorPicker('color');$('editorErase').onclick=()=>{finishEditorPaint();const erasing=$('editorBrush').value==='0';if(!erasing)editorBrushBeforeErase=$('editorBrush').value||'1';const previous=editorPickerOptions('brush').some(o=>o.value===editorBrushBeforeErase)?editorBrushBeforeErase:'1';chooseEditorPickerValue('brush',erasing?previous:'0');};$('editorPickerClose').onclick=()=>closeEditorPicker();
$('editorPickerOverlay').onclick=event=>{if(event.target===$('editorPickerOverlay'))closeEditorPicker();};
document.addEventListener('keydown',event=>{if(!editorPickerKind)return;if(event.key==='Escape'||event.code==='Escape'){event.preventDefault();event.stopPropagation();closeEditorPicker();return;}if(event.key!=='Tab')return;const buttons=Array.from($('editorPickerOverlay').querySelectorAll?.('button:not(:disabled)')||[]);if(!buttons.length)return;const first=buttons[0],last=buttons.at(-1),active=document.activeElement;if(event.shiftKey&&active===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&active===last){event.preventDefault();first.focus();}});
for(const id of ['editorBrush','editorColor']){const before=$(id).onchange;$(id).onchange=(...args)=>{const out=before?.(...args);syncEditorPickerButtons();return out;};}
const pickerGrid=renderEditorGrid;renderEditorGrid=function(...args){const out=pickerGrid(...args);syncEditorPickerButtons();return out;};
const pickerCloseSheets=closeEditorSheets;closeEditorSheets=function(){pickerCloseSheets();closeEditorPicker(false);};
syncEditorPickerButtons();
