// c16 holdout v2 tally — estimands + decision exactly as audit/c16/preregistration-level2-v2.json
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const S=__dirname,R=path.join(S,"rating");
const bk=JSON.parse(fs.readFileSync(path.join(R,"blind-key.json"))).key;
const beats=JSON.parse(fs.readFileSync(path.join(S,"beats.json")));
const A=path.join(S,"author");
const meta={};for(const b of beats){const rec=JSON.parse(fs.readFileSync(path.join(A,b.slug,"contracts.json"))).contracts[b.sceneIndex];const c=JSON.parse(fs.readFileSync(path.join(A,b.slug,"contracts",b.sceneIndex+".json")));meta[`${b.slug}-${b.sceneIndex}`]={review:rec.review.verdict,mechanism:c.mechanism||"-"}}
const ce=v=>v==="CORRECT"?1:0,ms=v=>v==="MATCH"?1:v==="PARTIAL"?0.5:0;
const per={};// id|arm -> {scores:[], wi, pol, causeWrong, passes}
for(const p of ["p1","p2"]){const dir=path.join(R,"judge-out-"+p);for(const f of fs.readdirSync(dir)){for(const j of JSON.parse(fs.readFileSync(path.join(dir,f)))){const k=bk[j.img];const id=`${k.id}|${k.arm}`;const o=per[id]||(per[id]={scores:[],wi:0,pol:0,causeWrong:0,passes:[]});
 o.scores.push((ce(j.cause)+ce(j.effect)+ms(j.message))/3);o.wi+=j.wrongInference==="YES"?1:0;o.pol+=j.polarityError==="YES"?1:0;o.causeWrong+=j.cause==="WRONG"?1:0;o.passes.push(`${j.cause},${j.effect},${j.message},WI:${j.wrongInference},POL:${j.polarityError},chg:${j.whatChanged},fin:${j.finalConsequence}`)}}}
const ids=[...new Set(Object.keys(per).map(k=>k.split("|")[0]))].sort();
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const rows=ids.map(id=>{const a=per[id+"|A"],b=per[id+"|B"];return{id,A:+(100*mean(a.scores)).toFixed(1),B:+(100*mean(b.scores)).toFixed(1),d:+(100*(mean(b.scores)-mean(a.scores))).toFixed(1),wiA:a.wi,wiB:b.wi,polA:a.pol,polB:b.pol,cwA:a.causeWrong,cwB:b.causeWrong,nPass:a.scores.length+"/"+b.scores.length,...meta[id],passA:a.passes,passB:b.passes}});
const ds=rows.map(r=>r.d);let ctr=0;const rnd=()=>crypto.createHash("sha256").update("c16-boot|"+(ctr++)).digest().readUInt32BE(0)/2**32;
const boots=[];for(let i=0;i<10000;i++){let s=0;for(let j=0;j<ds.length;j++)s+=ds[Math.floor(rnd()*ds.length)];boots.push(s/ds.length)}boots.sort((x,y)=>x-y);
const pt=mean(ds),lo=boots[249],hi=boots[9749];
const sum=k=>rows.reduce((s,r)=>s+r[k],0);
const accepted=16,failed=2,n=rows.length;
const safety={wiA:sum("wiA"),wiB:sum("wiB"),polA:sum("polA"),polB:sum("polB"),causeWrongA:sum("cwA"),causeWrongB:sum("cwB")};
const safetyOk=safety.wiB<=safety.wiA&&safety.polB<=safety.polA&&safety.causeWrongB<=safety.causeWrongA;
const valFailRate=failed/accepted;
let decision;
if(pt<0||!safetyOk)decision="NO_SHIP";
else if(n>=15&&lo>0&&pt>=10&&valFailRate<=0.10)decision="SELECTIVE_SHIP";
else decision="INCONCLUSIVE";
const byGroup=k=>{const g={};for(const r of rows)(g[r[k]]=g[r[k]]||[]).push(r.d);return Object.fromEntries(Object.entries(g).map(([x,v])=>[x,{n:v.length,meanDelta:+mean(v).toFixed(1)}]))};
const out={schema:"single-relation-level2-result/2",prereg:"audit/c16/preregistration-level2-v2.json",n,conditional:{meanA:+mean(rows.map(r=>r.A)).toFixed(1),meanB:+mean(rows.map(r=>r.B)).toFixed(1),delta:+pt.toFixed(1),ci95:[+lo.toFixed(1),+hi.toFixed(1)]},
 safety,safetyOk,validationFailures:{failed,accepted,rate:+(100*valFailRate).toFixed(1)},beatsBplusOneElement:rows.filter(r=>r.d>=100/6-0.01).length,beatsBworse:rows.filter(r=>r.d<0).length,
 secondary:{review:byGroup("review"),mechanism:byGroup("mechanism")},decision,rows};
fs.writeFileSync(path.join(S,"result.json"),JSON.stringify(out,null,1));
console.log(JSON.stringify({...out,rows:rows.map(r=>`${r.id.slice(0,34).padEnd(34)} A ${r.A} B ${r.B} Δ ${r.d} WI ${r.wiA}/${r.wiB} POL ${r.polA}/${r.polB} cw ${r.cwA}/${r.cwB} ${r.review} ${r.mechanism}`)},null,1));
