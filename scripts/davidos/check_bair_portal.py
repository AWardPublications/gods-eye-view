import os

files_to_check = [
    r"C:\Users\David\gods-eye-view\bair_recruitment_portal.html",
    r"C:\Users\David\gods-eye-view\public\bair_recruitment_portal.html"
]

for f in files_to_check:
    print(f"Checking {f}: {os.path.exists(f)}")
