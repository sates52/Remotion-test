#!/usr/bin/env node
// Human Video Study v2 (cycle 15) — sequential, locked, balanced; the v1 package (cycle 13) is not touched.
//   node audit/c15/human-study-v2.js --clips=<dir with Pnn-X.mp4 / Pnn-Y.mp4> --out=<dir> [--scenes=10]
// Writes <out>/send/ (index.html + README.txt + clips/) — the ONLY folder that goes to participants. The answer key and
// the X / Y → version map stay in the cycle-13 private folder (never copied here).
// Flow per scene: video 1 alone (muted) → its questions → LOCK → video 2 alone → its questions → LOCK → which was better
// made + why. Scene order and which video comes first are drawn per participant from a seed (the anonymous participant
// id), so presentation order is balanced across participants; seed and order go into the JSON. A form with a required
// answer missing exports as status "incomplete" (never "complete").
"use strict";
const fs = require("fs");
const path = require("path");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ""), true]; }));
const CL = path.resolve(args.clips), OUT = path.resolve(args.out);
const N = Number(args.scenes || 10);
const STUDY_ID = String(args.study || "c15-muted-video-v2").replace(/[^a-z0-9-]/gi, ""); // also the browser-storage key: one per package
const SEND = path.join(OUT, "send");
fs.mkdirSync(path.join(SEND, "clips"), { recursive: true });
const scenes = [];
for (let i = 1; i <= N; i++) {
  const id = `P${String(i).padStart(2, "0")}`;
  for (const v of ["X", "Y"]) { const f = path.join(CL, `${id}-${v}.mp4`); if (!fs.existsSync(f)) throw new Error(`missing ${f}`); fs.copyFileSync(f, path.join(SEND, "clips", `${id}-${v}.mp4`)); }
  scenes.push(id);
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Muted Video Study</title>
<style>
:root{--bg:#fff;--fg:#1d1d1f;--mut:#6b6b70;--line:#d9d9de;--acc:#2f5bd3;--warn:#b3261e;--ok:#1b7f3b}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141416;--fg:#f2f2f4;--mut:#a0a0a8;--line:#34343a;--acc:#7d9bff;--warn:#ff8a80;--ok:#7ddc95}}
:root[data-theme="dark"]{--bg:#141416;--fg:#f2f2f4;--mut:#a0a0a8;--line:#34343a;--acc:#7d9bff;--warn:#ff8a80;--ok:#7ddc95}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px}
video{width:100%;border-radius:8px;background:#000;display:block}
textarea{display:block;width:100%;min-height:3.4em;margin:4px 0 12px;background:transparent;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:8px;box-sizing:border-box;font:inherit}
textarea:disabled,input:disabled{opacity:.65}
.card{border:1px solid var(--line);border-radius:10px;padding:16px;margin:16px 0}
.mut{color:var(--mut)} .warn{color:var(--warn)} .ok{color:var(--ok)}
button{background:var(--acc);color:#fff;border:0;border-radius:8px;padding:10px 18px;font:inherit;cursor:pointer}
button:disabled{opacity:.5;cursor:default}
.hidden{display:none}
.progress{height:6px;background:var(--line);border-radius:3px;overflow:hidden}.progress>div{height:100%;background:var(--acc)}
label{display:block}
</style></head><body>
<h1>Muted video study</h1>
<div id="intro" class="card">
<p>You will watch short scenes from animated videos that explain books. <b>There is no sound on purpose.</b> Each scene comes in two versions. You see <b>one version at a time</b>: watch it, answer its questions, lock your answers, then watch the other version. At the end of each scene you say which version you found better made, and why.</p>
<p class="mut">About 3–4 minutes per scene, ${N} scenes. Your answers stay in this browser until you press “Download my answers”. Please do not look anything up.</p>
<button id="start">Start</button>
<p class="mut" id="pid"></p>
</div>
<div id="study" class="hidden">
<div class="progress"><div id="bar" style="width:0%"></div></div>
<p class="mut" id="where"></p>
<div id="stage" class="card"></div>
</div>
<div id="done" class="card hidden"><p><b>Thank you.</b> Press the button to save your answers and send the downloaded file back.</p>
<button id="dl">Download my answers</button> <span id="msg" class="mut"></span></div>
<script>
"use strict";
const STUDY = ${JSON.stringify(STUDY_ID)}, SCENES = ${JSON.stringify(scenes)};
const QS = [["seen","What happened on screen?"],["changed","What changed, and who or what made it change?"],["message","In one sentence: what point is this video making?"],["unclear","Was anything confusing, or could it mislead a viewer? (write “nothing” if not)"]];
let S;
// deterministic PRNG from the participant id (mulberry32 over a string hash)
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=h<<13|h>>>19}return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);let t=(h^=h>>>16)>>>0;t+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function newState(){const pid="P-"+Array.from(crypto.getRandomValues(new Uint8Array(5)),b=>b.toString(16).padStart(2,"0")).join("");const r=rng(pid);
 const order=SCENES.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
 const scenes=order.map(id=>({sceneId:id,presentation:r()<0.5?["X","Y"]:["Y","X"],videos:[{answers:{},locked:false,watchedSeconds:0},{answers:{},locked:false,watchedSeconds:0}],preference:null,preferenceReason:"",confidence:null,done:false}));
 return {study:STUDY,version:2,participantId:pid,randomizationSeed:pid,sceneOrder:order,startedAt:new Date().toISOString(),pos:0,step:0,scenes}}
function save(){try{localStorage.setItem(STUDY,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(STUDY)||"null");if(s&&s.study===STUDY)return s}catch(e){}return null}
function missing(){const m=[];S.scenes.forEach((sc,k)=>{sc.videos.forEach((v,n)=>QS.forEach(([q])=>{if(!String(v.answers[q]||"").trim())m.push(sc.sceneId+".video"+(n+1)+"."+q)}));if(!sc.preference)m.push(sc.sceneId+".preference");if(!String(sc.preferenceReason||"").trim())m.push(sc.sceneId+".preferenceReason")});return m}
function el(t,a,c){const e=document.createElement(t);if(a)for(const[k,v]of Object.entries(a))e.setAttribute(k,v);if(c!=null)e.textContent=c;return e}
function render(){
 const st=document.getElementById("stage");st.innerHTML="";const sc=S.scenes[S.pos];
 document.getElementById("bar").style.width=Math.round(100*S.pos/S.scenes.length)+"%";
 document.getElementById("where").textContent="Scene "+(S.pos+1)+" of "+S.scenes.length;
 if(S.step<2){const n=S.step,v=sc.videos[n],file=sc.sceneId+"-"+sc.presentation[n]+".mp4";
  st.appendChild(el("h2",null,"Video "+(n+1)+" of 2"));
  const vid=el("video",{src:"clips/"+file,controls:"",muted:"",playsinline:"",preload:"auto","data-file":file});vid.muted=true;
  let last=0;vid.addEventListener("timeupdate",()=>{if(vid.currentTime>last){v.watchedSeconds=Math.max(v.watchedSeconds,vid.currentTime);last=vid.currentTime;save()}});
  st.appendChild(vid);
  for(const[q,txt]of QS){const l=el("label",null,txt);const ta=el("textarea",{"data-q":q});ta.value=v.answers[q]||"";ta.addEventListener("input",()=>{v.answers[q]=ta.value;save();chk()});l.appendChild(ta);st.appendChild(l)}
  const b=el("button",{id:"lock"},"Lock these answers and continue");const w=el("p",{class:"warn"},"");
  function chk(){const ok=QS.every(([q])=>String(v.answers[q]||"").trim());b.disabled=!ok;w.textContent=ok?"":"Answer all four questions to continue. Locked answers cannot be changed."}
  b.onclick=()=>{v.locked=true;v.lockedAt=new Date().toISOString();S.step++;save();render()};st.appendChild(b);st.appendChild(w);chk();return}
 st.appendChild(el("h2",null,"Which version was better made?"));
 st.appendChild(el("p",{class:"mut"},"Your answers about each video are locked. You may replay either video before choosing."));
 sc.presentation.forEach((x,n)=>{const d=el("details");d.appendChild(el("summary",null,"Replay video "+(n+1)));const vv=el("video",{src:"clips/"+sc.sceneId+"-"+x+".mp4",controls:"",muted:"",playsinline:"",preload:"none"});vv.muted=true;d.appendChild(vv);st.appendChild(d)});
 const f=el("div");[["1","Video 1"],["2","Video 2"],["same","About the same"]].forEach(([val,t])=>{const l=el("label");const r=el("input",{type:"radio",name:"pref",value:val});if(sc.preference===val)r.checked=true;r.onchange=()=>{sc.preference=val;save();chk()};l.appendChild(r);l.appendChild(document.createTextNode(" "+t));f.appendChild(l)});st.appendChild(f);
 const lr=el("label",null,"Why? What made it better (or why are they the same)?");const ta=el("textarea",{"data-q":"preferenceReason"});ta.value=sc.preferenceReason||"";ta.oninput=()=>{sc.preferenceReason=ta.value;save();chk()};lr.appendChild(ta);st.appendChild(lr);
 const lc=el("label",null,"How sure are you? (1 = not sure, 5 = very sure)");const ci=el("input",{type:"number",min:"1",max:"5"});if(sc.confidence)ci.value=sc.confidence;ci.oninput=()=>{sc.confidence=Number(ci.value)||null;save()};lc.appendChild(ci);st.appendChild(lc);
 const b=el("button",{id:"next"},S.pos+1<S.scenes.length?"Next scene":"Finish");const w=el("p",{class:"warn"},"");
 function chk(){const ok=!!sc.preference&&String(sc.preferenceReason||"").trim();b.disabled=!ok;w.textContent=ok?"":"Choose a version and say why."}
 b.onclick=()=>{sc.done=true;S.pos++;S.step=0;save();if(S.pos>=S.scenes.length){finish()}else render()};st.appendChild(b);st.appendChild(w);chk()}
function finish(){document.getElementById("study").classList.add("hidden");document.getElementById("done").classList.remove("hidden");save()}
function exportJSON(){const m=missing();const out={studyVersion:S.version,study:S.study,anonymousParticipantId:S.participantId,randomizationSeed:S.randomizationSeed,startedAt:S.startedAt,exportedAt:new Date().toISOString(),
 completionStatus:m.length?"incomplete":"complete",missingRequired:m,userAgent:navigator.userAgent,h264Playable:!!document.createElement("video").canPlayType('video/mp4; codecs="avc1.42E01E"'),
 scenes:S.scenes.map((sc,k)=>({sceneId:sc.sceneId,position:k+1,videoPresentationOrder:sc.presentation.map((x,n)=>({slot:n+1,file:sc.sceneId+"-"+x+".mp4"})),
  comprehension:sc.videos.map((v,n)=>({slot:n+1,file:sc.sceneId+"-"+sc.presentation[n]+".mp4",seen:v.answers.seen||"",changed:v.answers.changed||"",message:v.answers.message||"",wrongInferenceOrUncertainty:v.answers.unclear||"",locked:v.locked,lockedAt:v.lockedAt||null,watchedSeconds:Math.round(v.watchedSeconds*10)/10})),
  visualPreference:sc.preference?(sc.preference==="same"?"same":{slot:Number(sc.preference),file:sc.sceneId+"-"+sc.presentation[Number(sc.preference)-1]+".mp4"}):null,preferenceReason:sc.preferenceReason,confidence:sc.confidence}))};
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(out,null,1)],{type:"application/json"}));a.download="answers-"+S.participantId+".json";document.body.appendChild(a);a.click();a.remove();
 document.getElementById("msg").textContent=m.length?("Saved as INCOMPLETE — "+m.length+" required answers are missing."):"Saved. Please send the downloaded file back.";return out}
S=load();document.getElementById("pid").textContent=S?("Resuming — participant "+S.participantId):"";
document.getElementById("start").onclick=()=>{if(!S){S=newState();save()}document.getElementById("intro").classList.add("hidden");if(S.pos>=S.scenes.length){finish();return}document.getElementById("study").classList.remove("hidden");render()};
document.getElementById("dl").onclick=exportJSON;
window.__study={state:()=>S,exportJSON,missing};
</script></body></html>`;
fs.writeFileSync(path.join(SEND, "index.html"), html);
fs.writeFileSync(path.join(SEND, "README.txt"), `Muted video study (v2) — for the participant

1. Unzip this folder anywhere. Keep index.html and the clips folder together.
2. Open index.html in Chrome (or Edge / Firefox). Press Start.
3. Each scene: watch video 1 (no sound on purpose), answer, lock; then video 2, answer, lock; then say which was better made and why.
4. At the end press "Download my answers" and send the downloaded answers-P-xxxx.json file back.
Please do not discuss the videos with other participants until everyone has finished.
`);
console.log(`v2 study: ${scenes.length} scenes → ${SEND}`);
