import os

target_roots = [
    r"C:\Users\David\gods-eye-view",
    r"C:\Users\David\DAVID_OS_KERNEL",
    r"C:\Users\David\DAVID_OS_SITE",
    r"C:\Users\David\DAVID_OS_APP"
]

found_files = []

for root_dir in target_roots:
    if not os.path.exists(root_dir): continue
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in dirs: dirs.remove("node_modules")
        if ".next" in dirs: dirs.remove(".next")
        for f in files:
            if f.endswith(('.js', '.mjs', '.html', '.jsx', '.tsx', '.json')):
                p = os.path.join(root, f)
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                        content = file.read()
                        if "portal/business" in content or "portal\\business" in content:
                            found_files.append((p, root_dir))
                except Exception:
                    pass

print("================================================================================")
print(f"SEARCH RESULTS FOR '/portal/business' ACROSS REPOSITORIES ({len(found_files)} FOUND)")
print("================================================================================")

for path, r in found_files:
    print(f"  * [{os.path.basename(r)}] {path}")

print("================================================================================")
