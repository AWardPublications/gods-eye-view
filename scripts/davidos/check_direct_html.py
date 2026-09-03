import os

files_to_check = [
    r"C:\Users\David\gods-eye-view\gods_eye_3d_flight_deck.html",
    r"C:\Users\David\gods-eye-view\public\gods_eye_3d_flight_deck.html",
    r"C:\Users\David\gods-eye-view\course_map_visualizer.html",
    r"C:\Users\David\gods-eye-view\public\course_map_visualizer.html"
]

for f in files_to_check:
    print(f"Checking {f}: {os.path.exists(f)}")
