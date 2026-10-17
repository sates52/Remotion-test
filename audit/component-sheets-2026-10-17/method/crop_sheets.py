import json, os, random, sys
from PIL import Image, ImageChops

S = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(S, "sheets", "icon")
os.makedirs(OUT, exist_ok=True)
BG = (243, 242, 237)
items = [("game", "before", os.path.join(S, "raw-before", "zz-icon-sheet", "s-game-f60.png")),
         ("game", "after", os.path.join(S, "raw-after", "zz-icon-sheet", "s-game-f60.png"))]
for i, ic in enumerate(["trophy", "star", "target", "shield", "balance", "door", "chains", "fire"]):
    items.append((ic, "current", os.path.join(S, "raw-before", "zz-icon-sheet", f"s-{ic}-f{(i + 1) * 90 + 60}.png")))

def bbox(im):
    # pixels clearly different from the paper (ignores the soft vignette)
    g = im.convert("RGB")
    diff = ImageChops.difference(g, Image.new("RGB", g.size, BG)).convert("L")
    mask = diff.point(lambda v: 255 if v > 60 else 0)
    return mask.getbbox()

random.seed(20261017)
order = list(range(len(items)))
random.shuffle(order)
key = {}
for n, idx in enumerate(order, 1):
    icon, ver, p = items[idx]
    im = Image.open(p).convert("RGB")
    bb = bbox(im)
    if not bb:
        print("EMPTY", icon, ver, p); sys.exit(1)
    cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2
    side = max(bb[2] - bb[0], bb[3] - bb[1]) * 1.25
    crop = im.crop((int(cx - side / 2), int(cy - side / 2), int(cx + side / 2), int(cy + side / 2)))
    canvas = Image.new("RGB", crop.size, BG)
    canvas.paste(crop)
    canvas = canvas.resize((600, 600), Image.LANCZOS)
    iid = f"i-{n:02d}"
    canvas.save(os.path.join(OUT, iid + ".png"))
    key[iid] = {"icon": icon, "version": ver}
    print(iid, "bbox", bb)
json.dump(key, open(os.path.join(S, "sheets", "icon-key.json"), "w"), indent=2)
print("wrote", len(key))
