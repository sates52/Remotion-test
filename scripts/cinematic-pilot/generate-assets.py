"""
generate-assets.py - cinematic pilot (2026-11-24): the book's art-locked Flux scenes + isolated objects (rembg cut-outs)
+ a contact sheet. Reads scripts/cinematic-pilot/prompts.json. NVIDIA key read in place from the main checkout's .env
(never copied, never printed). Cache: an image whose prompt hash is unchanged is never generated again.
  python scripts/cinematic-pilot/generate-assets.py [--sheet=<png>] [--only=a1,b2]
"""
import os, sys, json, time, base64, hashlib, subprocess
import requests
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
args = dict(a[2:].split("=", 1) for a in sys.argv[1:] if a.startswith("--") and "=" in a)
ONLY = set(args["only"].split(",")) if args.get("only") else None
P = json.load(open(os.path.join(HERE, "prompts.json"), encoding="utf-8"))
OUT = os.path.join(ROOT, "public", P["outDir"]); os.makedirs(OUT, exist_ok=True)
REP = os.path.join(OUT, "assets.report.json")
rep = json.load(open(REP, encoding="utf-8")) if os.path.exists(REP) else {"images": {}}

if not os.environ.get("NVIDIA_API_KEY"):
    common = subprocess.check_output(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"], cwd=ROOT, text=True).strip()
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(common), ".env"), override=False)
KEY = os.environ.get("NVIDIA_API_KEY")
if not KEY: print("ERROR: NVIDIA_API_KEY not found (operator provides it)"); sys.exit(1)
URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"
NO_TEXT = ", no text, no letters, no signature, no watermark"

def full_prompt(s, obj=False):
    p = s["prompt"]
    for k, v in P["characters"].items(): p = p.replace("{" + k + "}", v)
    # NVIDIA's filter refuses harmless words (measured 2026-11-24); they are swapped before the call, never sent
    for bad, good in (P.get("filterBlacklist") or {}).items():
        if bad.lower() in p.lower():
            import re as _re; p = _re.sub(_re.escape(bad), good, p, flags=_re.IGNORECASE); print(f"  [blacklist] {bad!r} -> {good!r}")
    out = p + ". Drawn as a hand-inked pen-and-gouache storybook illustration, not a photograph: " + P["artLock"] + NO_TEXT
    if len(out) > 800: raise SystemExit(f"prompt too long ({len(out)} > 800, NVIDIA's limit): shorten the scene text of {s.get('id')}")
    return p + ". Drawn as a hand-inked pen-and-gouache storybook illustration, not a photograph: " + P["artLock"] + NO_TEXT

def call(prompt, w, h):
    t0 = time.time()
    r = requests.post(URL, headers={"Authorization": f"Bearer {KEY}", "Accept": "application/json"},
                      json={"prompt": prompt, "width": w, "height": h, "steps": 4}, timeout=180)
    dt = time.time() - t0
    if r.status_code == 200:
        a = (r.json().get("artifacts") or [{}])[0]
        if a.get("base64"): return base64.b64decode(a["base64"]), dt, "ok"
        return None, dt, a.get("finishReason") or "empty"
    return None, dt, f"HTTP {r.status_code}: {r.text[:160]}"

SIZES = [(1344, 768), (1024, 576), (1024, 1024)]
jobs = [(s["id"], full_prompt(s), True) for s in P["scenes"]] + [(o["id"], full_prompt(o), False) for o in P["objects"]]
t_all = time.time(); calls = 0
for jid, prompt, wide in jobs:
    if ONLY and jid not in ONLY: continue
    sha = hashlib.sha256(prompt.encode()).hexdigest()[:16]
    out = os.path.join(OUT, f"{jid}.png"); prev = rep["images"].get(jid) or {}
    if os.path.exists(out) and prev.get("sha") == sha: print(f"[CACHE] {jid}"); continue
    rec = {"sha": sha, "attempts": [], "prompt": prompt}
    for w, h in (SIZES if wide else [(1024, 1024)]):
        data, dt, why = call(prompt, w, h); calls += 1
        rec["attempts"].append({"size": f"{w}x{h}", "seconds": round(dt, 1), "result": why})
        print(f"[{jid}] {w}x{h} {why} {dt:.1f}s", flush=True)
        if data:
            open(out, "wb").write(data); rec["size"] = f"{w}x{h}"; rec["outcome"] = "ok"; break
        if why == "CONTENT_FILTERED":
            rec["outcome"] = "filtered"
            for _ in range(2):  # the filter is not deterministic: two more tries at the same size
                data, dt, why = call(prompt, w, h); calls += 1
                rec["attempts"].append({"size": f"{w}x{h}", "seconds": round(dt, 1), "result": why}); print(f"[{jid}] retry {why} {dt:.1f}s", flush=True)
                if data: break
            if data: open(out, "wb").write(data); rec["size"] = f"{w}x{h}"; rec["outcome"] = "ok"
            break
        time.sleep(4)
    rep["images"][jid] = rec
    json.dump(rep, open(REP, "w", encoding="utf-8"), indent=2)
    time.sleep(2)
rep["lastRun"] = {"calls": calls, "seconds": round(time.time() - t_all, 1)}
json.dump(rep, open(REP, "w", encoding="utf-8"), indent=2)

# cut-outs of the isolated objects
from PIL import Image, ImageDraw
from rembg import remove, new_session
sess = None
for o in P["objects"]:
    src = os.path.join(OUT, f"{o['id']}.png"); dst = os.path.join(OUT, f"{o['id']}.cut.png")
    if not os.path.exists(src) or (os.path.exists(dst) and os.path.getmtime(dst) > os.path.getmtime(src)): continue
    sess = sess or new_session("u2net")
    im = remove(Image.open(src).convert("RGBA"), session=sess)
    bb = im.split()[3].point(lambda a: 255 if a > 10 else 0).getbbox()
    (im.crop(bb) if bb else im).save(dst); print(f"[CUT] {o['id']}")

# contact sheet
if args.get("sheet"):
    tiles = [(s["id"], f"{s['id']}.png", s.get("mode")) for s in P["scenes"]] + [(o["id"], f"{o['id']}.cut.png", "cut-out") for o in P["objects"]]
    TW, TH, cols = 480, 270, 4; rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * TW, rows * (TH + 28)), (235, 230, 220)); d = ImageDraw.Draw(sheet)
    for i, (jid, fn, mode) in enumerate(tiles):
        x, y = (i % cols) * TW, (i // cols) * (TH + 28); p = os.path.join(OUT, fn)
        if os.path.exists(p):
            im = Image.open(p).convert("RGBA"); im.thumbnail((TW - 8, TH - 8))
            bg = Image.new("RGBA", (TW - 8, TH - 8), (200, 196, 188, 255)); bg.alpha_composite(im, ((TW - 8 - im.width) // 2, (TH - 8 - im.height) // 2))
            sheet.paste(bg.convert("RGB"), (x + 4, y + 4))
        else: d.rectangle([x + 4, y + 4, x + TW - 4, y + TH - 4], outline=(160, 40, 30), width=3); d.text((x + 20, y + 120), "MISSING", fill=(160, 40, 30))
        d.text((x + 8, y + TH + 6), f"{jid} · {mode}", fill=(20, 20, 20))
    sheet.save(args["sheet"]); print("sheet:", args["sheet"])
print("calls:", calls, "seconds:", rep["lastRun"]["seconds"])
