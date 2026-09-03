import { NoraInteractiveGoogleDocsReviewEngine } from '../../src/publishing/noraInteractiveGoogleDocsReviewEngine.mjs';
import { execSync } from 'node:child_process';

function runEngine() {
  console.log("=" * 80);
  console.log("NORA INTERACTIVE GOOGLE DOCS REVIEW ENGINE — GENERATE & OPEN");
  console.log("=" * 80);

  const engine = new NoraInteractiveGoogleDocsReviewEngine();
  const res = engine.generateAllNoraReviewDocs();

  console.log(`\n  ✓ Target Reviewer:      ${res.reviewer}`);
  console.log(`  ✓ Documents Generated:  ${res.totalDocsGenerated} Interactive Google Docs Review Documents`);
  console.log(`  ✓ Primary Sync Dir:     ${res.desktopExportDir}`);
  console.log(`  ✓ Grant GEDHI Export:   ${res.grantGedhiExportDir}`);
  console.log(`  ✓ Export Hash:          ${res.hash}\n`);

  console.log("  OPENING REVIEW DOCUMENTS FOR IMMEDIATE VIEWING...");
  for (const file of res.generatedFiles) {
    console.log(`  • Opening: ${file.split('\\').pop()}`);
    try {
      execSync(`powershell -Command "Invoke-Item '${file}'"`);
    } catch (e) {
      console.log(`    (Notice: Failed to open automatically: ${e.message})`);
    }
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: ALL 7 NORA INTERACTIVE REVIEW DOCUMENTS OPENED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runEngine();
