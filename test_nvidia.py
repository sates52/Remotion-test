import requests
import base64
import os
import json
from dotenv import load_dotenv
import sys

load_dotenv()
API_KEY = os.environ.get("NVIDIA_API_KEY") or os.environ.get("NVIDIA_API_KEY")
if not API_KEY:
    print("ERROR: NVIDIA_API_KEY not found")
    sys.exit(1)

INVOKE_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"

prompts = [
    "a macro wildlife photo of a green frog in a rainforest pond, highly detailed, eye-level shot"
]

for i, prompt in enumerate(prompts):
    print(f"\n=== Generating image {i} ===")
    print(f"Prompt: {prompt}")

    payload = {
        "prompt": prompt,
        "width": 1024,
        "height": 1024,
        "steps": 4
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "application/json",
    }

    try:
        resp = requests.post(INVOKE_URL, headers=headers, json=payload, timeout=120)
        print(f"HTTP {resp.status_code}")
        if resp.status_code != 200:
            print(f"Error: {resp.text[:500]}")
            continue

        data = resp.json()
        artifacts = data.get("artifacts", data.get("images", []))
        if not artifacts:
            print(f"No artifacts found. Keys: {list(data.keys())}")
            print(json.dumps(data, indent=2)[:1000])
            continue

        art = artifacts[0]
        b64 = art.get("base64") or art.get("image") or ""
        if not b64:
            print(f"No base64 in artifact. Keys: {list(art.keys())}")
            continue

        img_bytes = base64.b64decode(b64)
        out_name = f"nvidia_test_output.png"
        with open(out_name, "wb") as f:
            f.write(img_bytes)
        print(f"Saved: {out_name} ({len(img_bytes)/1024:.0f} KB)")
    except Exception as e:
        print(f"Exception: {e}")