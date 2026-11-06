const WT="C:/Users/savas/Cursor/Remotion/wt-cloud-stills",ROOT="C:/Users/savas/Cursor/Remotion/test",fs=require("fs"),path=require("path");
const {validateConfig,loadBook}=require(WT+"/scripts/lib/narrative-visual-firewall");const {apply}=require(WT+"/scripts/apply-single-relation");const SR=require(WT+"/scripts/lib/single-relation");
const H="C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/f37e2696-0aa0-4f16-a50e-0dda44fb3528/scratchpad/c16/holdout/author";
for(const [slug,i] of [["under-the-dome",195],["great-at-work",163],["unhinged",148]]){
 let b;try{b=loadBook(ROOT,slug)}catch(e){console.log(slug,"loadBook",e.message.slice(0,100));continue}
 const c=JSON.parse(fs.readFileSync(path.join(H,slug,"contracts",i+".json"),"utf8"));
 const r=apply(b.config,{[i]:c});r.config.scenes[i]=SR.sealAuthored(r.config.scenes[i],{contractHash:"x"});
 const sum=x=>{const v=(x.violations||x.findings||x.issues||[]);return {status:x.status||x.verdict,n:v.length,codes:[...new Set(v.map(q=>q.code||q.rule))].slice(0,8)}};
 const A=validateConfig({...b,slug}),B=validateConfig({...b,config:r.config,slug});
 const at=x=>(x.violations||x.findings||x.issues||[]).filter(q=>String(q.sceneId||q.scene||q.beat||"").includes(String(i)));
 console.log(slug,i,JSON.stringify(sum(A)),"→",JSON.stringify(sum(B)),"atScene",JSON.stringify(at(B).map(q=>(q.code||q.rule)+": "+String(q.message||"").slice(0,90))));
}
