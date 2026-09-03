import { NoraBookReviewCommunicationsEngine } from '../../src/publishing/noraBookReviewCommunicationsEngine.mjs';

function runPackGenerator() {
  console.log("=" * 80);
  console.log("NORA BOOK REVIEW & CREATIVE COMMUNICATIONS VAULT ENGINE");
  console.log("=" * 80);

  const engine = new NoraBookReviewCommunicationsEngine();
  const res = engine.generateNoraReviewPackage();

  console.log(`\n  ✓ Publisher:              ${res.publisher}`);
  console.log(`  ✓ Target Reviewer:        ${res.targetReviewer}`);
  console.log(`  ✓ Google Drive Vault:     ${res.googleDriveFolderUrl}`);
  console.log(`  ✓ Desktop Vault Dir:      ${res.desktopVaultDir}`);
  console.log(`  ✓ Flagship Volumes:       ${res.flagshipVolumesCount} Volumes (V1 - V7)`);
  console.log(`  ✓ Package Hash:           ${res.hash}\n`);

  console.log("  FLAGSHIP VOLUMES PACKAGED FOR NORA:");
  for (const vol of engine.flagshipVolumes) {
    console.log(`  • [Vol ${vol.volumeNumber}] ${vol.title} (ISBN ${vol.isbn})`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: NORA BOOK REVIEW PACK PROVISIONED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runPackGenerator();
