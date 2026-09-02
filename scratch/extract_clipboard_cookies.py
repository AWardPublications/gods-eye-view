import json
import os
import win32clipboard

win32clipboard.OpenClipboard()
clip_text = win32clipboard.GetClipboardData(win32clipboard.CF_UNICODETEXT)
win32clipboard.CloseClipboard()

try:
    data = json.loads(clip_text)
    if isinstance(data, list):
        cookies_obj = {"cookies": data}
    elif isinstance(data, dict) and "cookies" in data:
        cookies_obj = data
    else:
        cookies_obj = {"cookies": [data]}

    target_dir = os.path.expanduser("~/.notebooklm")
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, "storage_state.json")

    with open(target_file, "w", encoding="utf-8") as f:
        json.dump(cookies_obj, f, indent=2)

    cookie_count = len(cookies_obj["cookies"])
    print(f"SUCCESS: Saved {cookie_count} cookies into {target_file}")
except Exception as e:
    print(f"ERROR parsing clipboard cookies: {e}")
