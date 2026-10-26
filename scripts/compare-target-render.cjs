const cp=require('child_process'),fs=require('fs');
const baseline=process.argv[2];if(!baseline)throw Error('Pass baseline bundle path');
const result=[];
for(let repeat=0;repeat<3;repeat++)for(const stage of [4,14])for(const variant of repeat%2?['after','before']:['before','after']){
 const env={...process.env,STARWAY_BENCH_STAGE:String(stage)};if(variant==='before')env.STARWAY_BENCH_BUNDLE=baseline;else delete env.STARWAY_BENCH_BUNDLE;
 const r=cp.spawnSync(process.execPath,['tests/all-stage-render-benchmark.cjs'],{env,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr);result.push({repeat,variant,stage,rows:JSON.parse(r.stdout)});
}
fs.writeFileSync('docs/qa/render-20261023/target-pairs.json',JSON.stringify(result,null,2));
for(const stage of [4,14]){const median=xs=>xs.sort((a,b)=>a-b)[Math.floor(xs.length/2)];const scores={};for(const variant of ['before','after'])scores[variant]=median(result.filter(r=>r.stage===stage&&r.variant===variant).map(r=>r.rows.reduce((s,v)=>s+v.ms,0)/r.rows.length));console.log(JSON.stringify({stage:stage===4?'2-1':'5-2',...scores,improvementPercent:(1-scores.after/scores.before)*100}));}
