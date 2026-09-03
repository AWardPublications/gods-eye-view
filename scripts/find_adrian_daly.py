import os
import sys

search_paths = [
    r"C:\Users\David\Desktop",
    r"C:\Users\David\Downloads",
    r"C:\Users\David\Documents",
    r"C:\Users\David\.gemini\antigravity-cli\brain",
    r"C:\Users\David\gods-eye-view"
]

results = []

for root_dir in search_paths:
    if not os.path.exists(root_dir):
        continue
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules, .git, etc
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '.tempmediaStorage', '__pycache__']]
        for file in files:
            full_path = os.path.join(root, file)
            lower_name = file.lower()
            
            # Check filename match
            if 'adrian' in lower_name or 'daly' in lower_name:
                results.append((full_path, "FILENAME_MATCH", 0, file))
            
            # Check content match for text files
            ext = os.path.splitext(file)[1].lower()
            if ext in ['.txt', '.md', '.json', '.csv', '.html', '.py', '.js', '.mjs', '.ts', '.eml', '.doc', '.docx', '.pdf']:
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        for line_idx, line in enumerate(f, 1):
                            if 'adrian' in line.lower() or 'daly' in line.lower():
                                results.append((full_path, "CONTENT_MATCH", line_idx, line.strip()[:160]))
                                if len(results) > 200:
                                    break
                except Exception:
                    pass

print(f"=== FOUND {len(results)} MATCHES FOR ADRIAN DALY ===")
for path, match_type, line_num, text in results:
    print(f"[{match_type}] {path} (Line {line_num}): {text}")
