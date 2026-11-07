// two independent evaluators, each with its own seeded X/Y order per episode; pages + their frame numbers; no captions
const fs=require("fs"),path=require("path"),crypto=require("crypto");const D=__dirname;
const EP={burn:"burn-of-the-everflame",feel:"feel-good-productivity",thief:"the-lightning-thief"};
const key={};
for(const E of ["E1","E2"]){const dir=path.join(D,"eval",E);fs.mkdirSync(dir,{recursive:true});key[E]={};const index={};
 for(const [short,slug] of Object.entries(EP)){const f1=crypto.createHash("sha256").update(`c19|E1|${short}`).digest()[0]%2===1;const flip=E==="E1"?f1:!f1;key[E][short]={X:flip?"B":"A",Y:flip?"A":"B"};
  const frames=JSON.parse(fs.readFileSync(path.join(D,`frames-${slug}.json`))).frames;const pages=[];
  for(let p=0;p*12<frames.length;p++){const pg=String(p+1).padStart(2,"0");for(const v of ["X","Y"]){const arm=key[E][short][v];fs.copyFileSync(path.join(D,"out","grids",`${short}-${arm}-p${pg}.png`),path.join(dir,`${short}-${v}-p${pg}.png`));}
   pages.push({page:`p${pg}`,frames:frames.slice(p*12,p*12+12)});}
  index[short]={sequenceFiles:{X:`${short}-X-pNN.png`,Y:`${short}-Y-pNN.png`},fps:30,pages};}
 fs.writeFileSync(path.join(dir,"index.json"),JSON.stringify(index,null,1));}
fs.writeFileSync(path.join(D,"eval","key.private.json"),JSON.stringify(key,null,1));console.log(JSON.stringify(key));
