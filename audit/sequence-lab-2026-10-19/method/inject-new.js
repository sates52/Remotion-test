// Put the NEW sequence beats into the sandbox's authored-K.json (the real storyboard input), keeping i and
// narration; the previous authored files are saved once as *.OLD.json for the record.
const fs = require("fs"), path = require("path");
const SB = "C:/Users/savas/Cursor/Remotion/test/.claude/worktrees/seq-lab";
const SEQ = "C:/Users/savas/AppData/Local/Temp/claude/c--Users-savas-Cursor-Remotion-test/5051cf5e-39b0-4597-acc6-9a7a22981c38/scratchpad/seq";
for (const slug of ["burn-of-the-everflame", "15-secrets-successful-people-know-about-time-management"]) {
  const NEW = JSON.parse(fs.readFileSync(path.join(SEQ, `${slug}-authoredNEW.json`), "utf8"));
  const dir = path.join(SB, "books", slug, "storyboard");
  const files = fs.readdirSync(dir).filter((f) => /^authored-\d+\.json$/.test(f));
  let n = 0;
  for (const f of files) {
    const p = path.join(dir, f);
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    const arr = Array.isArray(raw) ? raw : raw.beats;
    let touched = false;
    for (const b of NEW) {
      const k = arr.findIndex((x) => x.i === b.i);
      if (k < 0) continue;
      if (arr[k].narration && b.narration !== arr[k].narration) throw new Error(`${slug} ${b.i}: narration differs`);
      const save = path.join(SEQ, `${slug}-${f.replace(".json", "")}.OLD.json`);
      if (!fs.existsSync(save)) fs.writeFileSync(save, JSON.stringify(raw, null, 2));
      arr[k] = { ...b, i: arr[k].i, ...(arr[k].narration ? { narration: arr[k].narration } : {}) };
      touched = true; n++;
    }
    if (touched) fs.writeFileSync(p, JSON.stringify(Array.isArray(raw) ? arr : { ...raw, beats: arr }, null, 2));
  }
  console.log(`${slug}: ${n}/${NEW.length} beats placed into authored-K.json`);
}
