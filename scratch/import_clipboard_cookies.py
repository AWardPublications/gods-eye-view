import json
import os
import subprocess
from pathlib import Path

def main():
    # Read clipboard using powershell
    p = subprocess.run(["powershell", "-Command", "Get-Clipboard"], capture_output=True, text=True)
    raw_clip = p.stdout.strip()

    if not raw_clip.startswith("["):
        print("Clipboard does not contain JSON array")
        return

    clipboard_cookies = json.loads(raw_clip)
    print(f"Loaded {len(clipboard_cookies)} cookies from clipboard.")

    storage_path = Path.home() / ".notebooklm" / "storage_state.json"
    if not storage_path.parent.exists():
        storage_path.parent.mkdir(parents=True, exist_ok=True)

    # Convert extension cookie format (domain, name, value, etc.) into Playwright / NotebookLM storage_state format
    playwright_cookies = []
    for c in clipboard_cookies:
        name = c.get("name")
        val = c.get("value")
        domain = c.get("domain")
        path = c.get("path", "/")
        secure = c.get("secure", True)
        httpOnly = c.get("httpOnly", False)
        sameSite = c.get("sameSite", "Lax")

        if not name or not val or not domain:
            continue

        # Format sameSite for Playwright: Strict, Lax, or None
        ss = "Lax"
        if sameSite:
          ss_lower = str(sameSite).lower()
          if "no_restriction" in ss_lower or "none" in ss_lower:
            ss = "None"
          elif "strict" in ss_lower:
            ss = "Strict"

        playwright_cookies.append({
            "name": name,
            "value": val,
            "domain": domain,
            "path": path,
            "expires": c.get("expirationDate", 1819990990.0),
            "httpOnly": httpOnly,
            "secure": secure,
            "sameSite": ss
        })

    storage_state = {
        "cookies": playwright_cookies,
        "origins": []
    }

    with open(storage_path, "w", encoding="utf-8") as f:
        json.dump(storage_state, f, indent=2)

    print(f"Successfully saved {len(playwright_cookies)} cookies to {storage_path}")

if __name__ == "__main__":
    main()
