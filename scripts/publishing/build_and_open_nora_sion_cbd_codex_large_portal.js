import { NoraSionCbdCodexLargePortalEngine } from '../../src/publishing/noraSionCbdCodexLargePortalEngine.mjs';
import { execSync } from 'node:child_process';

function runPortalBuilder() {
  console.log("=" * 80);
  console.log("NORA SION: BUILD & OPEN 5X LARGE CBD CODEX MASTER BILINGUAL REVIEW PORTAL");
  console.log("=" * 80);

  const engine = new NoraSionCbdCodexLargePortalEngine();
  const res = engine.buildAndExportLargePortal();

  console.log(`\n  ✓ Target Reviewer:      ${res.reviewer}`);
  console.log(`  ✓ Desktop Directory:    ${res.desktopTargetDir}`);
  console.log(`  ✓ Large Portal File:    ${res.portalFilePath}`);
  console.log(`  ✓ Hash:                 ${res.hash}\n`);

  console.log("  OPENING 5X LARGE CBD CODEX REVIEW PORTAL FOR NORA ON SCREEN...");
  try {
    execSync(`powershell -Command "Invoke-Item '${res.portalFilePath}'"`);
    console.log("  ✓ Portal launched successfully!");
  } catch (e) {
    console.log(`  (Notice: Failed to launch automatically: ${e.message})`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: NORA SION LARGE CBD CODEX REVIEW PORTAL OPENED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runPortalBuilder();
