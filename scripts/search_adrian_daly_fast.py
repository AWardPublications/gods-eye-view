import os

roots = [
    r"C:\Users\David\Desktop",
    r"C:\Users\David\Downloads",
    r"C:\Users\David\Documents",
    r"C:\Users\David\gods-eye-view"
]

matches = []

for root_dir in roots:
    if not os.path.exists(root_dir):
        continue
    for item in os.listdir(root_dir):
        full_path = os.path.join(root_dir, item)
        if os.path.isfile(full_path):
            name_lower = item.lower()
            if "adrian" in name_lower or "daly" in name_lower:
                matches.append((full_path, "FILENAME_MATCH"))
            elif name_lower.endswith(('.txt', '.md', '.html', '.json', '.csv')):
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if "adrian" in content.lower() or "daly" in content.lower():
                            matches.append((full_path, "CONTENT_MATCH"))
                except Exception:
                    pass

print("=== FAST TOP-LEVEL ADRIAN DALY MATCHES ===")
for m in matches:
    print(m)
