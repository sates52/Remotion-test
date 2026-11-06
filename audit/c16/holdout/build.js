// c16 holdout: build isolated A/B per accepted book, merge into one manifest, write key input
const fs=require("fs"),path=require("path"),cp=require("child_process");
const S=__dirname, WT="C:/Users/savas/Cursor/Remotion/wt-cloud-stills", ROOT="C:/Users/savas/Cursor/Remotion/test";
const A=path.join(S,"author"), AB=path.join(S,"ab"), ALL=path.join(AB,"all");
fs.mkdirSync(path.join(ALL,"configs"),{recursive:true});
const jobs=[],keyIn=[],beats=[];let extra=[];
for(const slug of fs.readdirSync(A)){const rec=path.join(A,slug,"contracts.json");if(!fs.existsSync(rec))continue;
 const r=JSON.parse(fs.readFileSync(rec,"utf8"));if(!(r.valid||[]).length)continue;
 const out=path.join(AB,slug);
 cp.execFileSync("node",[path.join(WT,"scripts/single-relation-preview.js"),"build","--slug="+slug,"--book-root="+ROOT,"--contracts="+path.join(A,slug),"--out="+out],{stdio:"inherit"});
 const m=JSON.parse(fs.readFileSync(path.join(out,"manifest.json"),"utf8"));extra=m.extra||extra;
 const p=JSON.parse(fs.readFileSync(path.join(out,"pairs.json"),"utf8"));
 for(const j of m.jobs){const id=slug.slice(0,24)+"-"+j.id;fs.copyFileSync(path.join(out,j.config),path.join(ALL,"configs",id+".json"));jobs.push({...j,id,config:"configs/"+id+".json"});}
 const cfg=JSON.parse(fs.readFileSync(path.join(ROOT,"books",slug,"config.antidote.json"),"utf8"));
 const bk=JSON.parse(fs.readFileSync(path.join(ROOT,"books",slug,"book.json"),"utf8"));
 for(const pr of p.pairs){const i=pr.sceneIndex,sc=cfg.scenes;
  keyIn.push({id:slug+"-"+i,book:bk.title||slug,narration:sc[i]._narration,previousNarration:(sc[i-1]||{})._narration||"",nextNarration:(sc[i+1]||{})._narration||""});
  beats.push({slug,sceneIndex:i,idPrefix:slug.slice(0,24)});}
}
fs.writeFileSync(path.join(ALL,"manifest.json"),JSON.stringify({schema:"stills/1",name:"c16 holdout v2 A/B",composition:"Antidote-lab",entry:"src/index.ts",silent:true,shards:Math.min(10,Math.ceil(jobs.length/3)),extra,jobs},null,1));
fs.writeFileSync(path.join(S,"key-input.json"),JSON.stringify({scenes:keyIn},null,1));
fs.writeFileSync(path.join(S,"beats.json"),JSON.stringify(beats,null,1));
console.log("jobs",jobs.length,"beats",beats.length);
