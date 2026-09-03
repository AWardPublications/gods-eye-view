with open(r"C:\Users\David\gods-eye-view\style.css", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = [l for l in lines if not l.startswith("<<<<<<<") and not l.startswith("=======") and not l.startswith(">>>>>>>")]

with open(r"C:\Users\David\gods-eye-view\style.css", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("  * Cleaned style.css merge markers successfully.")
