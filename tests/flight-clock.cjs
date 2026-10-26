const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('dist/index.html','utf8'),ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
const noop=()=>{},ctx=new Proxy({createLinearGradient:()=>({addColorStop:noop}),createRadialGradient:()=>({addColorStop:noop})},{get:(o,k)=>o[k]||noop});
const saved={};
function boot(){const els={};function el(){const classes=new Set(),handlers={};return {style:{setProperty:noop},children:[],handlers,attrs:{},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),toggle(k,on){if(on===undefined)on=!classes.has(k);on?classes.add(k):classes.delete(k)},contains:k=>classes.has(k)},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){(handlers[k]??=[]).push(fn)},appendChild(e){this.children.push(e)},getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:160,height:160}),setPointerCapture:noop};}
 const b={document:{getElementById:id=>ids.has(id)?els[id]??(els[id]=el()):null,querySelectorAll:()=>[],createElement:el,addEventListener:noop},innerWidth:390,innerHeight:844,devicePixelRatio:2,addEventListener:noop,localStorage:{getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v},requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,performance:{now:()=>100},Path2D:function(){},console};vm.createContext(b);for(const f of ['stages','game','story-data','expansion','visuals','monetization','cockpit','surfaces','patterns','endless','editor','gravity'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),b);return {b,els,run:s=>vm.runInContext(s,b)};}
const {els,run}=boot();
run("mode='story';level=0;beginRun();step(1);syncRunClock()");assert.equal(els.runClock.textContent,'0.00');
run('launchFromRest();step(.02);syncRunClock()');assert.equal(els.runClock.textContent,'0.02');
run('pause();step(1);syncRunClock()');assert.equal(els.runClock.textContent,'0.02');
run('pause();step(.03);syncRunClock()');assert.equal(els.runClock.textContent,'0.05');
run('time=12.34;finish(true);syncRunClock();step(1);syncRunClock()');assert.equal(els.runClock.textContent,'12.34');assert.equal(run('data.storyTimes[0].best'),12.34);
run('beginRun();syncRunClock()');assert.equal(els.runClock.textContent,'0.00');
run("settings.language='en';syncRunClock()");assert.equal(els.clockLabel.textContent,'Time');assert.equal(els.clockUnit.textContent,'s');
assert.ok(html.includes('class="hidden" aria-hidden="true"><span id="difficultyBadge"'));
console.log('PASS: clock waits for launch, measures flight, excludes pause, freezes at finish, matches saved record, resets on retry and supports language settings');
