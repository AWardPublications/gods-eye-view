import subprocess
import json

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=r"C:\Users\David\gods-eye-view")
        return res.stdout.strip()
    except Exception as e:
        return str(e)

print("================================================================================")
print("GITHUB REPOSITORY & DAVID_OS REMOTE ALIGNMENT AUDIT")
print("================================================================================")

current_remote = run_cmd("git remote -v")
git_user = run_cmd("git config user.name")
git_email = run_cmd("git config user.email")
commit_count = run_cmd("git rev-list --count HEAD")
last_commit = run_cmd("git log -1 --oneline")

print(f"  * Local Commit Count:   {commit_count} Commits")
print(f"  * Last Commit:          {last_commit}")
print(f"  * Configured Git User:  {git_user} <{git_email}>")
print(f"  * Current Remotes:\n{current_remote}\n")

# Check if awardpublications remote is present
if "awardpublications" not in current_remote:
    print("Adding candidate David OS / A.Ward Publications GitHub remotes...")
    run_cmd("git remote add david-os https://github.com/awardpublications/gods-eye-view.git")
    print("  * Added remote 'david-os': https://github.com/awardpublications/gods-eye-view.git")

updated_remotes = run_cmd("git remote -v")
print(f"\nUpdated Remotes:\n{updated_remotes}")
print("\n================================================================================")
