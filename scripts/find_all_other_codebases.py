import os

search_roots = [
    r"C:\Users\David\Desktop",
    r"C:\Users\David\Documents",
    r"C:\Users\David\Downloads",
    r"C:\Users\David"
]

codebases = []

for root_dir in search_roots:
    if not os.path.exists(root_dir):
        continue
    for root, dirs, files in os.walk(root_dir):
        # Skip deep node_modules, .git subdirs, etc.
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        if ".git" in dirs or "package.json" in files or "Cargo.toml" in files or "pyproject.toml" in files or "go.mod" in files:
            # Check if this is a standalone codebase/repo
            has_git = ".git" in dirs
            has_pkg = "package.json" in files
            has_py = "pyproject.toml" in files or "requirements.txt" in files
            has_go = "go.mod" in files

            # Don't recurse infinitely into sub-src folders of an already found codebase
            rel = os.path.relpath(root, root_dir)
            codebases.append({
                "path": root,
                "has_git": has_git,
                "has_pkg": has_pkg,
                "has_py": has_py,
                "has_go": has_go
            })

            # Remove .git from dirs to prevent recursive scanning inside .git
            if ".git" in dirs:
                dirs.remove(".git")

print("================================================================================")
print(f"FOUND {len(codebases)} TOTAL OTHER CODEBASES & REPOSITORIES ACROSS SYSTEM")
print("================================================================================")

for c in codebases:
    if "gods-eye-view" in c['path'] and c['path'] != r"C:\Users\David\gods-eye-view":
        continue
    indicators = []
    if c['has_git']: indicators.append(".git")
    if c['has_pkg']: indicators.append("package.json")
    if c['has_py']: indicators.append("python")
    if c['has_go']: indicators.append("go.mod")
    
    print(f"  * [{', '.join(indicators)}] {c['path']}")

print("================================================================================")
