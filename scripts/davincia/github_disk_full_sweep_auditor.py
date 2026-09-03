import os
import subprocess
import json
import hashlib

USER_HOME = r"C:\Users\David"

def run_cmd(cmd, cwd=None):
    try:
        res = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=15)
        return res.stdout.strip()
    except Exception as e:
        return f"ERROR: {str(e)}"

def sweep_disk_repos():
    repos = []
    for root, dirs, files in os.walk(USER_HOME):
        if ".git" in dirs:
            repo_path = root
            # Avoid walking deep inside node_modules or recursive .git
            dirs.remove(".git")
            if "node_modules" in dirs:
                dirs.remove("node_modules")

            remote = run_cmd("git remote -v", cwd=repo_path)
            branch = run_cmd("git branch --show-current", cwd=repo_path)
            last_commit = run_cmd("git log -n 1 --oneline", cwd=repo_path)
            status = run_cmd("git status --short", cwd=repo_path)
            
            repo_name = os.path.basename(repo_path)
            
            repos.append({
                "repoName": repo_name,
                "path": repo_path,
                "branch": branch,
                "remote": remote,
                "lastCommit": last_commit,
                "uncommittedChanges": len(status.splitlines()) if status else 0
            })

    return repos

def main():
    print("=" * 80)
    print("DAVINCIA+ FULL GITHUB & DISK AUDIT SWEEP ENGINE")
    print("=" * 80)

    disk_repos = sweep_disk_repos()
    
    print(f"\nFound {len(disk_repos)} Git repositories on local disk:\n")
    for r in disk_repos:
        print(f"  • Repo: {r['repoName']}")
        print(f"    Path:   {r['path']}")
        print(f"    Branch: {r['branch']}")
        print(f"    Remote: {r['remote'].splitlines()[0] if r['remote'] else 'NO REMOTE'}")
        print(f"    Commit: {r['lastCommit']}")
        print(f"    Status: {r['uncommittedChanges']} uncommitted files\n")

    out_file = os.path.join(USER_HOME, "gods-eye-view", "scripts", "davincia", "github_disk_sweep_manifest.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(disk_repos, f, indent=2)

    print("=" * 80)
    print(f"SWEEP COMPLETE: Manifest saved to {out_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()
