// C19 render manifest: per book × arm — grid pages (every 45 f + dense critical frames), a silent clip, seek stills
const fs=require("fs"),path=require("path");const D=__dirname;
const CRIT={
 "burn-of-the-everflame":[1170,1300,1355,1362,1368,1373,1375,1377,1380,1385,1392,1397,1400,1403,1408,1415,1430,1500,1600,1700],
 "feel-good-productivity":[420,470,500,560,1200,1300,1318,1328,1335,1342,1360,1370,1376,1385,1400,1412,1420,1440,1460,1465,1467,1470,1475,1485,1500,1520,1540],
 "the-lightning-thief":[60,100,130,140,149,155,165,200,236,240,245,248,252,258,266,300,350,420,520]};
const SEEK={"burn-of-the-everflame":[1373,1377,1397,1403,1430,1600],"feel-good-productivity":[1328,1376,1412,1467,1475,1520],"the-lightning-thief":[149,245,252,400]};
const jobs=[];
for(const slug of Object.keys(CRIT)){const total=JSON.parse(fs.readFileSync(path.join(D,"configs",slug+"-A.json"))).totalFrames;
 const frames=[...new Set([...Array.from({length:Math.floor(total/45)},(_,k)=>k*45),...CRIT[slug]])].filter(f=>f<total).sort((a,b)=>a-b);
 for(const arm of ["A","B"]){const cfg=`configs/${slug}-${arm}.json`,short=slug.split("-")[slug.startsWith("the-")?2:0];
  for(let p=0;p*12<frames.length;p++) jobs.push({id:`${short}-${arm}-p${String(p+1).padStart(2,"0")}`,config:cfg,frames:frames.slice(p*12,p*12+12),grid:{cols:4,width:480}});
  jobs.push({id:`${short}-${arm}-seek`,config:cfg,frames:SEEK[slug],strip:true});
  jobs.push({id:`${short}-${arm}-clip`,config:cfg,frames:[0],clip:{from:0,to:total-1}});}
 fs.writeFileSync(path.join(D,`frames-${slug}.json`),JSON.stringify({frames,seek:SEEK[slug]}));}
fs.writeFileSync(path.join(D,"manifest.json"),JSON.stringify({schema:"stills/1",name:"c19 A/B episodes (silent): burn #17-25, feel-good #219-227, lightning #149-150",composition:"Antidote-lab",entry:"src/index.ts",silent:true,shards:10,extra:fs.readdirSync("C:/Users/savas/Cursor/Remotion/test/public/sfx").filter(x=>x.endsWith(".wav")).map(x=>"public/sfx/"+x),jobs},null,1));
console.log(jobs.length,"jobs");
