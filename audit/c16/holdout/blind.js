// c16 holdout: blind names, describer groups (4 strips of 4 different beats), judge tasks (<= 8 items of different beats, 2 passes)
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const S=__dirname,OUT=path.join(S,"out","strips"),R=path.join(S,"rating");
for(const d of ["blind","desc","judge-in","judge-out-p1","judge-out-p2"])fs.mkdirSync(path.join(R,d),{recursive:true});
const beats=JSON.parse(fs.readFileSync(path.join(S,"beats.json")));
const seed="c16-holdout-rating";let ctr=0;const rnd=()=>{const h=crypto.createHash("sha256").update(seed+"|"+(ctr++)).digest();return h.readUInt32BE(0)/2**32};
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const items=[];
for(const b of beats)for(const arm of ["A","B"]){const f=path.join(OUT,`${b.idPrefix}-s${b.sceneIndex}-${arm}.png`);if(!fs.existsSync(f))throw new Error("missing "+f);
 const img=crypto.createHash("sha256").update(seed+f).digest("hex").slice(0,10);fs.copyFileSync(f,path.join(R,"blind",img+".png"));items.push({img,id:`${b.slug}-${b.sceneIndex}`,arm})}
const key={};for(const it of items)key[it.img]={id:it.id,arm:it.arm};
fs.writeFileSync(path.join(R,"blind-key.json"),JSON.stringify({seed,key},null,1));
// describers: groups of 4, all different beats; arm A and B of a beat in different groups (all-different-beats implies it)
function groups(list,size){for(let tries=0;tries<500;tries++){const sh=shuffle(list),gs=[];let ok=true;
 for(const it of sh){let g=gs.find(g=>g.length<size&&!g.some(x=>x.id===it.id));if(!g){if(gs.length*size>=list.length+size){ok=false;break}g=[];gs.push(g)}g.push(it)}
 if(ok&&gs.every(g=>g.length>=Math.min(size,2)))return gs}throw new Error("no grouping")}
const D=groups(items,4);
fs.writeFileSync(path.join(R,"describers.json"),JSON.stringify(D.map((g,i)=>({d:"D"+(i+1),imgs:g.map(x=>x.img)})),null,1));
fs.writeFileSync(path.join(R,"judge-groups.json"),JSON.stringify({p1:groups(items,8).map(g=>g.map(x=>x.img)),p2:groups(items,8).map(g=>g.map(x=>x.img))},null,1));
console.log("items",items.length,"describers",D.length,D.map(g=>g.length).join(","));
