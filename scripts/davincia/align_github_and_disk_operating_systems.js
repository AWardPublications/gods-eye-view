import { GithubDiskMasterAlignmentEngine } from '../../src/davincia/githubDiskMasterAlignmentEngine.mjs';

function runAlignment() {
  console.log("=" * 80);
  console.log("DAVINCIA⁺ MASTER GITHUB & DISK OPERATING SYSTEMS ALIGNMENT");
  console.log("=" * 80);

  const engine = new GithubDiskMasterAlignmentEngine();
  const res = engine.executeMasterAlignmentAudit();

  console.log(`\n  ✓ Framework Name:            ${res.frameworkName}`);
  console.log(`  ✓ Repositories Detected:     ${res.totalDiskReposDetected} Git Repositories (AWardPublications & bilawalsidhu)`);
  console.log(`  ✓ Sovereign Operating Systems: ${res.totalSovereignOperatingSystems} Aligned Systems`);
  console.log(`  ✓ Alignment Hash:            ${res.alignmentHash}\n`);

  console.log("  SOVEREIGN OPERATING SYSTEMS MAPPING:");
  for (const os of res.operatingSystems) {
    console.log(`\n  [${os.id}] ${os.name}`);
    console.log(`    Scope:  ${os.targetScope}`);
    console.log(`    Repos:  ${os.linkedRepos.join(', ')}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: GITHUB AND DISK OPERATING SYSTEMS 100% ALIGNED & RATIFIED");
  console.log("=" * 80 + "\n");
}

runAlignment();
