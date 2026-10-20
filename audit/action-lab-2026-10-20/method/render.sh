#!/bin/bash
# NEW clips (same windows/timings as the state-change lab OLD clips) rendered with 4 parallel workers, plus
# standalone frames (each its own seek) around the authored action moments, for the jump / multi-worker check.
set -e
LAB=C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/state-lab
X=C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/state-lab
A=$X/act
cd $LAB
mkdir -p $A/clips $A/jump
B=burn-of-the-everflame; F=15-secrets-successful-people-know-about-time-management
clip () { # slug lo hi config
  cp $4 books/$1/config.antidote.json
  local R=$(node -e 'const c=require("./books/'$1'/config.antidote.json");const a=c.scenes.find(s=>s.id==="scene-'$2'"),b=c.scenes.find(s=>s.id==="scene-'$3'");console.log(a.fromFrame+"-"+(b.fromFrame+b.durationFrames-1))')
  echo "$1 NEW frames $R"
  npx remotion render Antidote-$1 $A/clips/$1-NEW.mp4 --frames=$R --log=error --timeout=240000 --concurrency=4
}
clip $B 217 219 $A/burn-config.json
clip $F 73 76 $A/15-config.json
# standalone frames: burn 219 (approach start - 6, mid-approach, contact, contact + 30); 15 74 (cue - 6, cue + 10, cue + 40), 75 first frame
cp $A/burn-config.json books/$B/config.antidote.json
LB=$(node -e '
const c=require("./books/'$B'/config.antidote.json");const s=c.scenes.find(x=>x.id==="scene-219");const a=s.characters[0].actionAt;const f=s.fromFrame;
console.log([a-18-6,a-9,a,a+30].map(d=>"scene-219:"+(f+d)).join(","))')
echo "$LB" > $A/jump/burn-frames.txt
node scripts/render-sequence-stills.js --slug=$B --frames=$LB --out=.act-stills > $A/jump/burn-stills.log 2>&1
cp $A/15-config.json books/$F/config.antidote.json
LF=$(node -e '
const c=require("./books/'$F'/config.antidote.json");const s=c.scenes.find(x=>x.id==="scene-74"),n=c.scenes.find(x=>x.id==="scene-75");const a=s.characters[0].actionAt;const f=s.fromFrame;
console.log([a-6,a+10,a+40].map(d=>"scene-74:"+(f+d)).concat(["scene-75:"+n.fromFrame]).join(","))')
echo "$LF" > $A/jump/15-frames.txt
node scripts/render-sequence-stills.js --slug=$F --frames=$LF --out=.act-stills > $A/jump/15-stills.log 2>&1
echo RENDER-ACT-DONE
