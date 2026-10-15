// Focused tests for the control-by-narrative staging experiment (flag ANTIDOTE_EXPERIMENT_RELATIONSHIP_STAGING).
const fs=require("fs"),crypto=require("crypto");const S=process.argv[2];const D=S+"/stage2";
const sha=(p)=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const canon=(x)=>JSON.stringify(x,(k,v)=>v&&typeof v==="object"&&!Array.isArray(v)?Object.keys(v).sort().reduce((o,kk)=>(o[kk]=v[kk],o),{}):v);
const J=(p)=>JSON.parse(fs.readFileSync(p));const R=[];const t=(name,ok,detail)=>R.push({name,ok:!!ok,detail});
// T1 planner, flag off: new code byte-identical to pre-change code on identical inputs
t("T1 planner flag-off byte-identical to pre-change code (same inputs)",sha(D+"/flagoff-check/plan-pre.json")===sha(D+"/flagoff-check/plan-post-off.json"),{pre:sha(D+"/flagoff-check/plan-pre.json"),postOff:sha(D+"/flagoff-check/plan-post-off.json")});
const off=J(D+"/chain-off/final-config.json"),on=J(D+"/chain-on/final-config.json");const bible=J(S+"/rr-chain/books/red-rising/story-bible.json");const art=J(S+"/rr-chain/books/red-rising/art.json");
// T2 staging only where a relationship record uses it
const withStaging=on.scenes.filter(s=>s.relationshipStaging).map(s=>s.id);
const usesIt=art.beats.filter(b=>b.relationship&&b.relationship.source&&b.relationship.source.group&&b.relationship.rejectedMethod&&b.relationship.rejectedMethod.icon).map(b=>"scene-"+String(b.i).padStart(2,"0"));
t("T2 staging present only on scenes whose relationship record uses it",canon(withStaging)===canon(usesIt)&&off.scenes.every(s=>!s.relationshipStaging),{withStaging,usesIt,flagOffHasStaging:off.scenes.filter(s=>s.relationshipStaging).length});
// T3 no named character stands in for a group
const castKeys=Object.keys(bible.cast||{});const castNames=Object.values(bible.cast||{}).map(c=>String(c.name).toLowerCase());
const subst=on.scenes.filter(s=>s.relationshipStaging).flatMap(s=>[s.relationshipStaging.rulingGroup,s.relationshipStaging.ruledGroup]).filter(g=>castKeys.includes(g.key)||castNames.includes(String(g.label).toLowerCase()));
t("T3 no named character substituted for a group",subst.length===0&&withStaging.every(id=>{const s=on.scenes.find(x=>x.id===id);return s.relationshipStaging.rulingGroup.count>1&&s.relationshipStaging.ruledGroup.count>1;}),{substitutions:subst});
// T4 flag on vs flag off final configs differ only on the staged scene(s), and only by the staging field
const diffScenes=on.scenes.filter((s,i)=>canon(s)!==canon(off.scenes[i])).map(s=>s.id);
const onlyField=diffScenes.every(id=>{const a=off.scenes.find(x=>x.id===id),b=on.scenes.find(x=>x.id===id);const k=Object.keys({...a,...b}).filter(x=>canon(a[x])!==canon(b[x]));return k.length===1&&k[0]==="relationshipStaging";});
const top=(x)=>{const y={...x};delete y.scenes;return canon(y);};
t("T4 flag-on vs flag-off final configs differ only by relationshipStaging on staged scenes",canon(diffScenes)===canon(withStaging)&&onlyField&&top(on)===top(off),{diffScenes,onlyField,topLevelEqual:top(on)===top(off)});
// T5 staging and relationship survive every chain stage (flag on)
const steps=fs.readdirSync(D+"/chain-on").filter(f=>/^cfg-\d+\.json$/.test(f)).sort();
const lost=steps.filter(f=>{const s=J(D+"/chain-on/"+f).scenes.find(x=>x.id==="scene-17");return !s.relationshipStaging||!s.relationship;});
t("T5 relationship and staging present after every chain stage (flag on)",lost.length===0,{stages:steps.length,lost});
const out={label:"RED RISING EXPLORATORY EVALUATION — control-by-narrative staging tests (engine change; flag-gated; sandbox)",result:R.every(r=>r.ok)?"PASS":"FAIL",tests:R,
 hashes:{flagOffFinal:sha(D+"/chain-off/final-config.json"),flagOnFinal:sha(D+"/chain-on/final-config.json")}};
fs.writeFileSync(D+"/tests-v2-result.json",JSON.stringify(out,null,1));console.log(JSON.stringify({result:out.result,tests:R.map(r=>[r.name.slice(0,2),r.ok])}));process.exitCode=out.result==="PASS"?0:1;
