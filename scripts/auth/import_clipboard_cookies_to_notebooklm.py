import sys
import json
import subprocess
import os

sys.stdout.reconfigure(encoding='utf-8')

def import_cookies():
    print("=" * 80)
    print("IMPORTING CLIPBOARD COOKIES TO NOTEBOOKLM STORAGE_STATE.JSON")
    print("=" * 80)

    # 1. Read clipboard via PowerShell
    cmd = ["powershell", "-NoProfile", "-Command", "Get-Clipboard"]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8')

    if res.returncode != 0 or not res.stdout.strip():
        print("Error: Failed to read clipboard or clipboard is empty.")
        return False

    raw_text = res.stdout.strip()

    try:
        raw_cookies = json.loads(raw_text)
    except Exception as e:
        print(f"Error parsing clipboard JSON: {e}")
        return False

    print(f"Loaded {len(raw_cookies)} raw cookies from clipboard.")

    # 2. Map cookies into Playwright storage_state cookie format
    formatted_cookies = []
    for c in raw_cookies:
        same_site = c.get("sameSite", "Lax")
        if same_site == "no_restriction" or same_site == "None":
            same_site = "None"
        elif same_site == "strict" or same_site == "Strict":
            same_site = "Strict"
        else:
            same_site = "Lax"

        formatted_cookies.append({
            "name": c.get("name"),
            "value": c.get("value"),
            "domain": c.get("domain"),
            "path": c.get("path", "/"),
            "expires": c.get("expirationDate", -1),
            "httpOnly": c.get("httpOnly", False),
            "secure": c.get("secure", False),
            "sameSite": same_site
        })

    storage_state = {
        "cookies": formatted_cookies,
        "origins": []
    }

    # 3. Save to C:\Users\David\.notebooklm\storage_state.json
    target_path = os.path.expanduser(r"~\.notebooklm\storage_state.json")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)

    with open(target_path, "w", encoding="utf-8") as f:
        json.dump(storage_state, f, indent=2)

    print(f"Successfully saved {len(formatted_cookies)} cookies to {target_path}")

    # 4. Verify auth test network call
    test_cmd = [sys.executable, "-m", "notebooklm", "auth", "check", "--test", "--json"]
    test_res = subprocess.run(test_cmd, capture_output=True, text=True, encoding='utf-8')
    print("\nAuthentication Check Result:")
    print(test_res.stdout)

    if "status\": \"ok\"" in test_res.stdout and "\"token_fetch\": true" in test_res.stdout:
        print("\n" + "=" * 80)
        print("NOTEBOOKLM AUTHENTICATION SUCCESSFUL & FULLY ONLINE!")
        print("=" * 80)
        return True
    else:
        print("\nAuth test output stderr:")
        print(test_res.stderr)
        return False

if __name__ == '__main__':
    import_cookies()
