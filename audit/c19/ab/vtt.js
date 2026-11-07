// the word-timed narration of each window (from the book's word-timed VTT, as in its config captions), in window
// seconds + frames — given to the evaluators only in the SECOND round
const fs=require("fs"),path=require("path");
for(const w of require("./windows.json")){const c=JSON.parse(fs.readFileSync(`C:/Users/savas/Cursor/Remotion/test/books/${w.slug}/config.antidote.json`,"utf8"));
 const words=(c.captions||[]).flatMap(x=>x.words||[]).filter(x=>x.s>=w.from&&x.s<w.from+w.frames).map(x=>({w:x.w,frame:x.s-w.from,sec:+((x.s-w.from)/30).toFixed(2)}));
 const lines=[];let cur=[];for(const x of words){cur.push(x);if(/[.?!]$/.test(x.w)||cur.length>=14){lines.push(`[${cur[0].sec.toFixed(2)}s · f${cur[0].frame}] `+cur.map(y=>`${y.w}<f${y.frame}>`).join(" "));cur=[]}}
 if(cur.length)lines.push(`[${cur[0].sec.toFixed(2)}s · f${cur[0].frame}] `+cur.map(y=>`${y.w}<f${y.frame}>`).join(" "));
 fs.writeFileSync(path.join(__dirname,`vtt-${w.slug}.txt`),lines.join("\n")+"\n");console.log(w.slug,words.length,"words");}
