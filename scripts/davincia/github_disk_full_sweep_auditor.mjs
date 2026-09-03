import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const USER_HOME = 'C:\\Users\\David';

function scanRepos(dir, depth = 0) {
  if (depth > 3) return [];
  const results = [];

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    // Check if current dir is a git repo
    const isGit = entries.some(e => e.isDirectory() && e.name === '.git');
    if (isGit) {
      let remote = 'NO_REMOTE';
      let branch = 'unknown';
      let lastCommit = 'none';

      try {
        remote = execSync('git remote -v', { cwd: dir, timeout: 3000, encoding: 'utf-8' }).trim().split('\n')[0] || 'NO_REMOTE';
      } catch (e) {}

      try {
        branch = execSync('git branch --show-current', { cwd: dir, timeout: 3000, encoding: 'utf-8' }).trim() || 'main';
      } catch (e) {}

      try {
        lastCommit = execSync('git log -n 1 --oneline', { cwd: dir, timeout: 3000, encoding: 'utf-8' }).trim() || 'none';
      } catch (e) {}

      results.push({
        name: dir.split('\\').pop(),
        path: dir,
        remote,
        branch,
        lastCommit
      });

      return results;
    }

    // Traverse subdirectories if not node_modules or system folders
    for (const e of entries) {
      if (e.isDirectory() && !['node_modules', '.git', 'AppData', '$RECYCLE.BIN', 'System Volume Information'].includes(e.name)) {
        results.push(...scanRepos(join(dir, e.name), depth + 1));
      }
    }
  } catch (err) {}

  return results;
}

console.log("=" * 80);
console.log("DAVINCIA+ DISK & GITHUB FULL SWEEP AUDITOR (FAST NODE ENGINE)");
console.log("=" * 80);

const repos = scanRepos(USER_HOME);

console.log(`\nFound ${repos.length} Git Repositories across C:\\Users\\David:\n`);
for (const r of repos) {
  console.log(`  • REPO: ${r.name}`);
  console.log(`    Path:   ${r.path}`);
  console.log(`    Remote: ${r.remote}`);
  console.log(`    Branch: ${r.branch}`);
  console.log(`    Commit: ${r.lastCommit}\n`);
}

const outPath = 'C:\\Users\\David\\gods-eye-view\\scripts\\davincia\\github_disk_sweep_manifest.json';
writeFileSync(outPath, JSON.stringify(repos, null, 2), 'utf-8');

console.log("=" * 80);
console.log(`MANIFEST WRITTEN TO: ${outPath}`);
console.log("=" * 80 + "\n");
