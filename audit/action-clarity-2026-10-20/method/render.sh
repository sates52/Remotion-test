set -e
cd /c/Users/savas/Cursor/Remotion/test/.claude/worktrees/state-lab
X=C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/state-lab
for spec in "burn-of-the-everflame burn 217 219" "15-secrets-successful-people-know-about-time-management 15 73 76"; do set -- $spec
  cp $X/act/$2-config.json books/$1/config.antidote.json
  R=$(node -e 'const c=require("./books/'$1'/config.antidote.json");const a=c.scenes.find(s=>s.id==="scene-'$3'"),b=c.scenes.find(s=>s.id==="scene-'$4'");console.log(a.fromFrame+"-"+(b.fromFrame+b.durationFrames-1))')
  npx remotion render Antidote-$1 $X/act2/clips/$1-NEW.mp4 --frames=$R --log=error --timeout=240000 --concurrency=4
done
echo ACT2-RENDER-DONE
