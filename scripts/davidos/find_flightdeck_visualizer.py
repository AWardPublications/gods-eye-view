import os

target_files = ['gods_eye_3d_flight_deck.html', 'course_map_visualizer.html']
search_dirs = [r"C:\Users\David\gods-eye-view", r"C:\Users\David\Desktop", r"C:\Users\David\Documents"]

found = {}

for target in target_files:
    for sdir in search_dirs:
        if not os.path.exists(sdir): continue
        for root, dirs, files in os.walk(sdir):
            if "node_modules" in dirs: dirs.remove("node_modules")
            if target in files:
                found[target] = os.path.join(root, target)
                break

print("================================================================================")
print("FLIGHT DECK & COURSE MAP VISUALIZER DISCOVERY RESULTS")
print("================================================================================")

for target, path in found.items():
    print(f"  * {target} -> {path}")

print("================================================================================")
