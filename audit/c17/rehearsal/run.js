// c17 dress rehearsal (scratch copy, never a book): select + plan on a REAL full config, gates unchanged, cloud manifest
const fs=require("fs"),path=require("path");
const WT="C:/Users/savas/Cursor/Remotion/wt-cloud-stills",ROOT="C:/Users/savas/Cursor/Remotion/test",D=__dirname;
const RO=require(WT+"/scripts/single-relation-rollout");const {evaluateAuthorship}=require(WT+"/scripts/lib/authorship");const FW=require(WT+"/scripts/lib/narrative-visual-firewall");
const slug="under-the-dome",i=195,H="C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/f37e2696-0aa0-4f16-a50e-0dda44fb3528/scratchpad/c16/holdout/author/"+slug;
const res=JSON.parse(fs.readFileSync("C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/f37e2696-0aa0-4f16-a50e-0dda44fb3528/scratchpad/c16/holdout/result.json","utf8"));
const row=res.rows.find(r=>r.id===slug+"-"+i);
const sel=RO.select(H,{rows:[{sceneIndex:i,A:row.A,B:row.B,wiA:row.wiA,wiB:row.wiB,polB:row.polB,cwB:row.cwB}]});
console.log("select",sel.chosen.map(c=>c.sceneIndex),sel.kept);
const book=FW.loadBook(ROOT,slug);const cfg=book.config;
const p=RO.plan(cfg,sel,{tool:"rehearsal"});if(!p.ok)throw new Error(p.errors.join("; "));
console.log("diff",JSON.stringify(p.record.scenes[0].diff));
const a0=evaluateAuthorship(cfg,{engine:"antidote",slug}),a1=evaluateAuthorship(p.config,{engine:"antidote",slug});
const f0=FW.validateConfig({...book,slug}),f1=FW.validateConfig({...book,config:p.config,slug});
const hard=x=>(x.violations||[]).filter(v=>v.severity!=="diagnostic");
console.log("authorship",a0.status,"→",a1.status,"| firewall hard",hard(f0).length,"→",hard(f1).length,"; new at 195:",hard(f1).filter(v=>v.sceneId==="scene-195").length);
console.log("status",JSON.stringify(RO.status(p.config,p.record)));
fs.mkdirSync(path.join(D,"cloud","configs"),{recursive:true});
fs.writeFileSync(path.join(D,"cloud","configs","full-B.json"),JSON.stringify({...p.config,captions:[]}));
fs.writeFileSync(path.join(D,"active.json"),JSON.stringify(p.record,null,1));
const sc=p.config.scenes[i],fr=[0.3,0.6,0.9].map(x=>Math.round(sc.fromFrame+x*sc.durationFrames));
const extra=fs.readdirSync(path.join(ROOT,"public","sfx")).filter(f=>f.endsWith(".wav")).map(f=>"public/sfx/"+f);
fs.writeFileSync(path.join(D,"cloud","manifest.json"),JSON.stringify({schema:"stills/1",name:"c17 rehearsal: full config with a sealed single-relation scene",composition:"Antidote-lab",entry:"src/index.ts",silent:true,shards:1,extra,
 jobs:[{id:"full-B-s195",config:"configs/full-B.json",frames:fr,strip:true,clip:{from:p.config.scenes[i-1].fromFrame,to:sc.fromFrame+sc.durationFrames-1}}]},null,1));
console.log("frames",fr);
