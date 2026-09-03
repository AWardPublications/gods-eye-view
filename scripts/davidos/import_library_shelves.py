import shutil
import os

src_file = r"C:\Users\David\PRESERVATION\2026-08-09T11-17-11_PRE_GATE_3B_DURABILITY_SNAPSHOT\working_tree\auth_gateway\library_shelves\library_shelves_demo.html"
dst_file = r"C:\Users\David\gods-eye-view\public\library_shelves.html"

if os.path.exists(src_file):
    shutil.copyfile(src_file, dst_file)
    print(f"  * Copied {src_file} -> {dst_file}")
else:
    print(f"  ❌ Source file missing: {src_file}")
