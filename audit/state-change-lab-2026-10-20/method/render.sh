#!/bin/bash
# OLD and NEW clips of the same window (same narration/timing), an 8-frame strip from each clip (motion check),
# and the jump test (a frame rendered on its own vs the same frame inside a rendered PNG sequence).
set -e
LAB=C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/state-lab
X=C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/state-lab
cd $LAB
mkdir -p $X/clips $X/strips $X/jump
render_window () { # slug lo hi version configfile
  local slug=$1 lo=$2 hi=$3 ver=$4 cfg=$5
  cp $cfg books/$slug/config.antidote.json
  local R=$(node -e 'const c=require("./books/'$slug'/config.antidote.json");const a=c.scenes.find(s=>s.id==="scene-'$lo'"),b=c.scenes.find(s=>s.id==="scene-'$hi'");console.log(a.fromFrame+"-"+(b.fromFrame+b.durationFrames-1))')
  echo "$slug $ver frames $R"
  npx remotion render Antidote-$slug $X/clips/$slug-$ver.mp4 --frames=$R --log=error --timeout=240000 --concurrency=2
  local A=${R%-*} B=${R#*-}
  mkdir -p $X/strips/$slug-$ver
  for k in 0 1 2 3 4 5 6 7; do
    local t=$(node -e 'console.log(((('$B'-'$A')*('$k'+0.5)/8)/30).toFixed(3))')
    ffmpeg -y -v error -ss $t -i $X/clips/$slug-$ver.mp4 -frames:v 1 -vf "scale=960:-1" $X/strips/$slug-$ver/f$k.png
  done
}
B=burn-of-the-everflame; F=15-secrets-successful-people-know-about-time-management
render_window $B 217 219 OLD $X/$B-config-BASE.json
render_window $B 217 219 NEW $X/$B-config-NEW.json
render_window $F 73 76 OLD $X/$F-config-BASE.json
render_window $F 73 76 NEW $X/$F-config-NEW.json
# jump test on the NEW configs: frames 6 before / 20 after the state-change cue, each rendered ON ITS OWN
# (render-sequence-stills: one bundle, every frame a separate seek), compared with the same frame of the clip
for slug in $B $F; do
  cp $X/$slug-config-NEW.json books/$slug/config.antidote.json
  LIST=$(node -e '
const c=require("./books/'$slug'/config.antidote.json");const s=c.scenes.find(x=>(x.props||[]).some(p=>p.motion==="break"||p.motion==="light"));
const p=s.props.find(p=>p.motion);const cue=s.fromFrame+p.motionAt;console.log(s.id+":"+(cue-6)+","+s.id+":"+(cue+20))')
  echo "$slug jump $LIST"
  node scripts/render-sequence-stills.js --slug=$slug --frames=$LIST --out=.state-stills > $X/jump/$slug-stills.log 2>&1
  echo "$LIST" > $X/jump/$slug-frames.txt
done
echo RENDER-DONE
