const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
function inspect(reference=false){
 const roots={},walked=[];let visits=0;
 function root(id,n,hidden){return roots[id]={id,nodes:Array.from({length:n},()=>({nodeValue:'설정'})),hidden,classList:{contains(key){return key==='hidden'&&roots[id].hidden}},querySelectorAll:()=>[]};}
 root('overlay',1000,true);root('mapEditor',5000,true);for(const id of ['header','cockpit','note','segment','flight-strip'])root(id,2,false);
 for(const id of ['shipUpgradePanel','questPanel','notificationPanel','challengePanel','editorPickerOverlay','gravityDeviceDialog','editorRangeGravityDialog'])root(id,100,true);
 const b={settings:{language:'en'},state:'play',pauseControl:{setAttribute(){}},syncPauseControl(){},fxPaused:false,$:id=>roots[id],document:{documentElement:{},getElementById:id=>roots[id],querySelector:q=>roots[q.replace('.','')],createTreeWalker(r){walked.push(r.id);let i=0;return {nextNode(){const node=r.nodes[i++];if(node)visits++;return node}}}},translateDynamic:t=>t==='설정'?({en:'Settings',ja:'設定',ko:'설정'})[b.settings.language]:t,tr:t=>t};
 vm.createContext(b);const editor=fs.readFileSync('dist/editor.js','utf8');let base=editor.slice(editor.indexOf('const localizedText='),editor.indexOf('function persistSettings()'));
 if(reference)base=base.replace("if(!root||root.classList?.contains?.('hidden'))continue;","if(!root)continue;");
 vm.runInContext(base,b);
 const hangar=fs.readFileSync('dist/hangar-localization.js','utf8');vm.runInContext(hangar.slice(hangar.indexOf('const hangarLocalizeUI='),hangar.indexOf('const localizedHangarRender=')),b);
 for(let i=0;i<60;i++)vm.runInContext('localizeUI()',b);
 const flightVisits=visits;
 if(!reference){assert.ok(!walked.includes('overlay')&&!walked.includes('mapEditor'));b.state='ready';walked.length=0;vm.runInContext('localizeUI()',b);assert.ok(!walked.includes('questPanel'));b.settings.language='ja';vm.runInContext('localizeUI()',b);assert.equal(roots.mapEditor.nodes[0].nodeValue,'설정');roots.mapEditor.hidden=false;vm.runInContext('localizeUI()',b);assert.equal(roots.mapEditor.nodes[0].nodeValue,'設定','newly opened editor must translate');roots.overlay.hidden=false;b.state='pause';vm.runInContext('localizeUI()',b);assert.equal(roots.overlay.nodes[0].nodeValue,'設定');}
 return flightVisits;
}
const before=inspect(true),after=inspect();assert.ok(after<before/100);console.log(JSON.stringify({check:'60 UI refreshes with populated hidden editor/menu',beforeTextVisits:before,afterTextVisits:after,reductionPercent:+((1-after/before)*100).toFixed(2),note:'Deterministic work-count fixture; not device FPS.'}));
console.log('PASS visible flight labels, hidden panel omission, ready state and fresh editor/pause translation');
