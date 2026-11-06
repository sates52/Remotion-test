// c16 holdout: build judge tasks (cycle-13 pilot instructions verbatim, via the c15 file) from descriptions + key
const fs=require("fs"),path=require("path");
const S=__dirname,R=path.join(S,"rating");
const instr=fs.readFileSync(path.join(S,"../../c15/pilot/rating/judge-instructions.txt"),"utf8").trim();
const key=JSON.parse(fs.readFileSync(path.join(S,"answer-key.json"))).items;const byId=Object.fromEntries(key.map(k=>[k.id,k]));
const narr=Object.fromEntries(JSON.parse(fs.readFileSync(path.join(S,"key-input.json"))).scenes.map(s=>[s.id,s.narration]));
const bk=JSON.parse(fs.readFileSync(path.join(R,"blind-key.json"))).key;
const desc={};for(const f of fs.readdirSync(path.join(R,"desc")))for(const d of JSON.parse(fs.readFileSync(path.join(R,"desc",f))))desc[d.img]=d;
const G=JSON.parse(fs.readFileSync(path.join(R,"judge-groups.json")));
const missing=Object.keys(bk).filter(i=>!desc[i]);if(missing.length)throw new Error("missing descriptions "+missing);
for(const p of ["p1","p2"])G[p].forEach((g,k)=>{const items=g.map(img=>{const K=byId[bk[img].id];return{img,narration:narr[bk[img].id],
 answerKey:{understanding:K.understanding,cause:K.cause,effect:K.effect,keyFacts:K.keyFacts,wrongInferences:K.wrong,supportsCausality:K.supportsCausality,asserted:K.asserted,notAsserted:K.notAsserted},description:desc[img]}});
 fs.writeFileSync(path.join(R,"judge-in",`${p}-J${k+1}.task.json`),JSON.stringify({instructions:instr,items},null,1))});
console.log("tasks",fs.readdirSync(path.join(R,"judge-in")));
