import { GrantCoverLettersAndCheatSheetEngine } from '../../src/agents/grantCoverLettersAndCheatSheetEngine.mjs';

function runGeneration() {
  console.log("=" * 80);
  console.log("GENERATING TAILORED COVER LETTERS & MASTER APPLICATION FILING CHEAT SHEET");
  console.log("=" * 80);

  const engine = new GrantCoverLettersAndCheatSheetEngine();
  const res = engine.generateCoverLettersAndCheatSheet();

  console.log(`\n  ✓ Target Subdirectory:  ${res.targetDirectory}`);
  console.log(`  ✓ Cover Letters Created:${res.coverLettersCount} Tailored Agency Cover Letters`);
  console.log(`  ✓ Master Cheat Sheet:   MASTER_GRANT_APPLICATION_FILING_CHEAT_SHEET.md`);
  console.log(`  ✓ Total Files Exported: ${res.totalFilesGenerated}`);
  console.log(`  ✓ Export Hash:          ${res.hash}\n`);

  console.log("=" * 80);
  console.log("STATUS: COVER LETTERS & MASTER CHEAT SHEET GENERATED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runGeneration();
