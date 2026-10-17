// usage: node recon-vtt.js <sandbox>
const fs=require("fs"),path=require("path");
const S=process.argv[2];
const ref=require(path.join(S,"books/the-art-of-saying-no/config.antidote.json"));
const {parseWords,buildCaptions}=require(path.join(S,"scripts/lib/vtt.js"));
const FPS=30;
const fmt=(t)=>{const ms=Math.round(t*1000);const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60,r=ms%1000;return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(r).padStart(3,"0")}`;};
// flat word list with frame starts; offsets in ms (within ±15 ms keeps the frame)
const W=[];ref.captions.forEach((c,ci)=>c.words.forEach((w,wi)=>W.push({w:w.w,s:w.s,e:w.e,ci})));
const off=new Array(W.length).fill(0);
function build(){
  const lines=["WEBVTT","Kind: captions","Language: en",""];
  let i=0;
  for(const c of ref.captions){
    const ws=c.words.map(()=>W[i++]);const base=i-ws.length;
    const t=(k)=>(ws[k].s/FPS)+off[base+k]/1000;
    lines.push(`${fmt(t(0))} --> ${fmt(c.endFrame/FPS)} align:start position:0%`);
    let l=ws[0].w;for(let k=1;k<ws.length;k++)l+=`<${fmt(t(k))}><c> ${ws[k].w}</c>`;
    if(ws.length===1)l+=`<${fmt(t(0)+0.0005)}><c></c>`; // force a <c> so the line is parsed
    lines.push(l,"");
  }
  return lines.join("\n");
}
function compare(txt){
  const caps=buildCaptions(parseWords(txt),FPS);
  const diffs=[];
  const n=Math.max(caps.length,ref.captions.length);
  for(let k=0;k<n;k++){const a=caps[k],b=ref.captions[k];if(JSON.stringify(a)!==JSON.stringify(b)){diffs.push(k);}}
  return {caps,diffs};
}
let txt=build(),r=compare(txt);
for(let it=0;it<5&&r.diffs.length;it++){
  const got=r.caps.flatMap(c=>c.words);
  for(let i=0;i<W.length;i++){ if(!got[i]||got[i].e===W[i].e) continue;
    const nxt=W[i+1]; if(nxt&&W[i].e===nxt.s) off[i]+=12; else off[i]-=12; }
  txt=build();r=compare(txt);console.log("iter",it,"diffs",r.diffs.length);
}
console.log("captions",r.caps.length,"ref",ref.captions.length,"diff caps",r.diffs.length,r.diffs.slice(0,10));
for(const k of r.diffs.slice(0,5)){console.log("GOT",JSON.stringify(r.caps[k]));console.log("REF",JSON.stringify(ref.captions[k]));}
fs.writeFileSync(path.join(S,"public/captions/the-art-of-saying-no.vtt"),txt);
