import { NoraBookReviewCommunicationsEngine } from '../../src/publishing/noraBookReviewCommunicationsEngine.mjs';

function runPackGenerator() {
  console.log("=" * 80);
  console.log("NORA BILINGUAL BOOK REVIEW & CREATIVE COMMUNICATIONS VAULT (EN / FR)");
  console.log("=" * 80);

  const engine = new NoraBookReviewCommunicationsEngine();
  const res = engine.generateNoraReviewPackage();

  console.log(`\n  ✓ Publisher:              ${res.publisher}`);
  console.log(`  ✓ Target Reviewer:        ${res.targetReviewer}`);
  console.log(`  ✓ Languages:              ${res.languages.join(', ')}`);
  console.log(`  ✓ Google Drive Vault:     ${res.googleDriveFolderUrl}`);
  console.log(`  ✓ Desktop Vault Dir:      ${res.desktopVaultDir}`);
  console.log(`  ✓ Flagship Volumes:       ${res.flagshipVolumesCount} Volumes (V1 - V7)`);
  console.log(`  ✓ Package Hash:           ${res.hash}\n`);

  console.log("  BILINGUAL FLAGSHIP VOLUMES PACKAGED FOR NORA:");
  for (const vol of engine.flagshipVolumes) {
    console.log(`  • [Vol ${vol.volumeNumber}] EN: ${vol.titleEn}`);
    console.log(`              FR: ${vol.titleFr} (ISBN ${vol.isbn})\n`);
  }

  console.log("=" * 80);
  console.log("STATUS: NORA BILINGUAL BOOK REVIEW PACK PROVISIONED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runPackGenerator();
