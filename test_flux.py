import requests
import base64
import os
import json

API_KEY = os.environ.get("NVIDIA_API_KEY")
if not API_KEY:
    from dotenv import load_dotenv
    load_dotenv()
    API_KEY = os.environ.get("NVIDIA_API_KEY")

if not API_KEY:
    raise ValueError("NVIDIA_API_KEY not found in environment or .env")

INVOKE_URL = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.2-klein-4b"

payload = {
    "prompt": "a macro wildlife photo of a green frog in a rainforest pond, highly detailed, eye-level shot",
    "width": 1024,
    "height": 1024,
    "steps": 4
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
}

print(f"Calling NVIDIA Flux API...")
print(f"  URL: {INVOKE_URL}")
print(f"  Prompt: {payload['prompt']}")
print(f"  Steps: {payload['steps']}")
print()

response = requests.post(INVOKE_URL, headers=headers, json=payload)

print(f"HTTP Status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print("Response keys:", list(data.keys()))
    
    if "image" in data and data["image"]:
        # Image is base64-encoded
        img_data = base64.b64decode(data["image"])
        out_path = "test_flux_output.png"
        with open(out_path, "wb") as f:
            f.write(img_data)
        print(f"Image saved: {out_path} ({len(img_data)/1024:.0f} KB)")
    elif "images" in data and data["images"]:
        img_data = base64.b64decode(data["images"][0])
        out_path = "test_flux_output.png"
        with open(out_path, "wb") as f:
            f.write(img_data)
        print(f"Image saved: {out_path} ({len(img_data)/1024:.0f} KB)")
    else:
        print(f"Full response:\n{json.dumps(data, indent=2)[:2000]}")
else:
    print(f"Error body: {response.text[:2000]}")