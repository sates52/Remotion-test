#!/bin/bash
# NEW version: same window frames for the clip; strips at the same rule (40% + mute-test moment of THIS version).
set -e
SB=C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/seq-lab
SEQ=C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq
cd $SB
for slug in burn-of-the-everflame 15-secrets-successful-people-know-about-time-management; do
  FR=$(node -e '
const c=require("./books/'$slug'/config.antidote.json");const sel=require("C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/fidelity/audit/sequence-lab-2026-10-19/selection.json");
const ids=(sel.fiction.slug==="'$slug'"?sel.fiction:sel.nonfiction).beats;const sc=ids.map(id=>c.scenes.find(s=>s.id===id));
const mute=(u)=>{const t=u.texts||[];const last=t.reduce((m,x)=>Math.max(m,Number(x.at)||0),0);const settle=t.length?last+30:0;const at=Math.max(Math.round(u.durationFrames*0.7),settle);return Math.round(u.fromFrame+Math.min(at,u.durationFrames-4));};
const fr=[];sc.forEach((s,k)=>{fr.push({b:k+1,m:"a",id:s.id,f:Math.round(s.fromFrame+s.durationFrames*0.4)});fr.push({b:k+1,m:"b",id:s.id,f:mute(s)});});
require("fs").writeFileSync("'$SEQ'/'$slug'-frames-NEW.json",JSON.stringify(fr));
console.log(sc[0].fromFrame+"-"+(sc[sc.length-1].fromFrame+sc[sc.length-1].durationFrames-1)+"|"+fr.map(x=>x.id+":"+x.f).join(","));')
  RANGE=${FR%%|*}; LIST=${FR#*|}
  echo "$slug range $RANGE"
  npx remotion render Antidote-$slug $SEQ/clips/$slug-NEW.mp4 --frames=$RANGE --log=error --timeout=240000 --concurrency=2
  node scripts/render-sequence-stills.js --slug=$slug --frames=$LIST --out=.seq-stills/NEW > $SEQ/stills-NEW-$slug.log 2>&1
  mkdir -p $SEQ/strips/$slug-NEW
  node -e '
const fr=require("'$SEQ'/'$slug'-frames-NEW.json");const {execFileSync}=require("child_process");
for(const x of fr){const src=".seq-stills/NEW/'$slug'/"+x.id+"-f"+x.f+".png";const dst="'$SEQ'/strips/'$slug'-NEW/b"+String(x.b).padStart(2,"0")+x.m+".png";execFileSync("ffmpeg",["-y","-v","error","-i",src,"-vf","crop=iw:ih*0.76:0:0",dst]);}
console.log("strip",fr.length);'
  ffprobe -v error -show_entries format=duration -of csv=p=0 $SEQ/clips/$slug-NEW.mp4
done
echo RENDER-NEW-DONE
