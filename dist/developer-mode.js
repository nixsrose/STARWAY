// Local release UI gate only. No persistent unlock and no server-authentication claim.
let developerModeEnabled=false;
function syncDeveloperMode(){
 $('storyEditorOpen').textContent=tr('맵 에디터');
 $('overlay').setAttribute('data-developer-mode',developerModeEnabled?'on':'off');
 $('developerModeToggle').textContent=developerModeEnabled?'개발자모드 끄기':'개발자모드 켜기';
 $('developerModeToggle').setAttribute('aria-pressed',String(developerModeEnabled));
}
const developerMenu=showMenu;showMenu=function(...args){const result=developerMenu(...args);$('developerPasswordPanel').classList.add('hidden');$('developerPassword').value='';$('developerModeStatus').textContent='';syncDeveloperMode();return result;};
const developerEditorClick=$('editorOpen').onclick;$('editorOpen').onclick=()=>{if(developerModeEnabled)developerEditorClick();};
$('developerModeToggle').onclick=()=>{
 if(developerModeEnabled){developerModeEnabled=false;$('developerPasswordPanel').classList.add('hidden');$('developerPassword').value='';$('developerModeStatus').textContent='개발자 모드를 껐습니다. 메인 메뉴의 맵 에디터를 숨깁니다.';syncDeveloperMode();return;}
 $('developerPasswordPanel').classList.remove('hidden');$('developerPassword').value='';$('developerModeStatus').textContent='개발자 비밀번호를 입력하세요.';$('developerPassword').focus?.();
};
function unlockDeveloperMode(){
 if($('developerPassword').value!=='ODDLEAF2026!'){$('developerModeStatus').textContent='비밀번호가 올바르지 않습니다.';$('developerPassword').value='';return;}
 developerModeEnabled=true;$('developerPassword').value='';$('developerPasswordPanel').classList.add('hidden');$('developerModeStatus').textContent='개발자 모드가 켜졌습니다. 메인 메뉴에 맵 에디터가 표시됩니다.';syncDeveloperMode();
}
$('developerPasswordConfirm').onclick=unlockDeveloperMode;
$('developerPassword').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();unlockDeveloperMode();}});
$('developerPasswordCancel').onclick=()=>{$('developerPasswordPanel').classList.add('hidden');$('developerPassword').value='';$('developerModeStatus').textContent='';};
syncDeveloperMode();

let developerStoryEditorReturn=false;
$('storyEditorOpen').onclick=()=>{
 if(!developerModeEnabled||menuScreen!=='main')return;
 $('editorTemplate').value=String(level);
 $('editorLoadTemplate').onclick();
 developerStoryEditorReturn=true;
 openMapEditor();
};
const developerEditorClose=$('editorClose').onclick;
$('editorClose').onclick=()=>{
 if(!developerStoryEditorReturn)return developerEditorClose();
 developerStoryEditorReturn=false;$('mapEditor').classList.add('hidden');showMenu('main');
};
