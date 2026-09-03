with open(r"C:\Users\David\gods-eye-view\vite.config.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "<<<<<<<" in line or "=======" in line or ">>>>>>>" in line:
        print(f"Line {idx+1}: {line.strip()}")
