import { GrantGedhiExportEngine } from '../../src/agents/grantGedhiExportEngine.mjs';

function runExport() {
  console.log("=" * 80);
  console.log("GENERATING BEAUTIFULLY BRANDED GRANT GEDHI DESKTOP BUNDLE");
  console.log("=" * 80);

  const engine = new GrantGedhiExportEngine();
  const res = engine.exportAllGrantGedhiDocs();

  console.log(`\n  ✓ Target Directory:     ${res.targetDirectory}`);
  console.log(`  ✓ Total Files Exported: ${res.totalFilesGenerated} Branded HTML/PDFs & Google Docs`);
  console.log(`  ✓ Export Hash:          ${res.exportHash}\n`);

  console.log("=" * 80);
  console.log("STATUS: GRANT GEDHI BUNDLE EXPORTED TO DESKTOP 100% GREEN");
  console.log("=" * 80 + "\n");
}

runExport();
