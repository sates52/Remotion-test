// c17 probe: does the (pinned = current) authorship gate accept an applied single-relation scene? in memory only
const fs=require("fs"),path=require("path");
const WT="C:/Users/savas/Cursor/Remotion/wt-cloud-stills",ROOT="C:/Users/savas/Cursor/Remotion/test";
const {evaluateAuthorship}=require(WT+"/scripts/lib/authorship");const {apply}=require(WT+"/scripts/apply-single-relation");
const H="C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/f37e2696-0aa0-4f16-a50e-0dda44fb3528/scratchpad/c16/holdout/author";
for(const [slug,i] of [["under-the-dome",195],["great-at-work",163],["unhinged",148]]){
 const cfg=JSON.parse(fs.readFileSync(path.join(ROOT,"books",slug,"config.antidote.json"),"utf8"));
 const c=JSON.parse(fs.readFileSync(path.join(H,slug,"contracts",i+".json"),"utf8"));
 const r=apply(cfg,{[i]:c});if(r.ok)r.config.scenes[i]=require(WT+"/scripts/lib/single-relation").sealAuthored(r.config.scenes[i],{contractHash:"x"});if(!r.ok){console.log(slug,"apply refused",r.errors);continue}
 const before=evaluateAuthorship(cfg,{engine:"antidote",slug}),after=evaluateAuthorship(r.config,{engine:"antidote",slug});
 const v=x=>(x.violations||[]).map(v=>v.code+"@"+(v.sceneId||"")).filter(s=>s.includes("scene-"+i)||!s.includes("@scene"));
 console.log(slug,i,"before",before.status,(before.violations||[]).length,"after",after.status,(after.violations||[]).length,"new:",(after.violations||[]).filter(a=>!(before.violations||[]).some(b=>b.code===a.code&&b.sceneId===a.sceneId&&b.message===a.message)).map(v=>v.code+" "+v.sceneId+" "+String(v.message).slice(0,140)));
}
// make-book's restore must keep the sealed scene
{const {restoreAuthoredStaging}=require(WT+"/scripts/lib/authorship");const slug="under-the-dome",i=195;
 const cfg=JSON.parse(fs.readFileSync(path.join(ROOT,"books",slug,"config.antidote.json"),"utf8"));const c=JSON.parse(fs.readFileSync(path.join(H,slug,"contracts",i+".json"),"utf8"));
 const r=apply(cfg,{[i]:c});r.config.scenes[i]=require(WT+"/scripts/lib/single-relation").sealAuthored(r.config.scenes[i],{contractHash:"x"});
 const snap=JSON.stringify(r.config.scenes[i]);const n=restoreAuthoredStaging(r.config);console.log("restore repaired",n,"scene unchanged",JSON.stringify(r.config.scenes[i])===snap);}
