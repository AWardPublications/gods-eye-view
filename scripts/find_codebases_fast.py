import os

scan_roots = [
    r"C:\Users\David\Desktop",
    r"C:\Users\David\Documents",
    r"C:\Users\David\Downloads",
    r"C:\Users\David"
]

codebases = []

def check_dir(dir_path):
    if not os.path.exists(dir_path): return
    try:
        items = os.listdir(dir_path)
        has_git = ".git" in items
        has_pkg = "package.json" in items
        has_py = "pyproject.toml" in items or "requirements.txt" in items
        has_go = "go.mod" in items

        if has_git or has_pkg or has_py or has_go:
            indicators = []
            if has_git: indicators.append(".git")
            if has_pkg: indicators.append("package.json")
            if has_py: indicators.append("python")
            if has_go: indicators.append("go.mod")
            codebases.append((dir_path, ", ".join(indicators)))
    except Exception:
        pass

for root in scan_roots:
    check_dir(root)
    try:
        subdirs = [os.path.join(root, d) for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))]
        for sub in subdirs:
            if sub.endswith(('node_modules', '.git', 'AppData', 'Application Data', 'Local Settings')): continue
            check_dir(sub)
            try:
                subsubdirs = [os.path.join(sub, d) for d in os.listdir(sub) if os.path.isdir(os.path.join(sub, d))]
                for sub2 in subsubdirs:
                    if sub2.endswith(('node_modules', '.git')): continue
                    check_dir(sub2)
            except Exception:
                pass
    except Exception:
        pass

# Deduplicate
unique_codebases = {}
for path, ind in codebases:
    if "gods-eye-view" in path and path != r"C:\Users\David\gods-eye-view":
        continue
    unique_codebases[path] = ind

print("================================================================================")
print(f"FOUND {len(unique_codebases)} CODEBASES & REPOSITORIES ACROSS SYSTEM")
print("================================================================================")

for path, ind in unique_codebases.items():
    print(f"  * [{ind}] {path}")

print("================================================================================")
