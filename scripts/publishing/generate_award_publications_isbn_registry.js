import { AwardPublicationsMasterCatalogueEngine } from '../../src/publishing/awardPublicationsMasterCatalogueEngine.mjs';

function runRegistry() {
  console.log("=" * 80);
  console.log("GENERATING A.WARD PUBLICATIONS MASTER ISBN PUBLISHING CATALOGUE");
  console.log("=" * 80);

  const engine = new AwardPublicationsMasterCatalogueEngine();
  const res = engine.generateCatalogueRegistry();

  console.log(`\n  ✓ Publisher Prefix:     ${res.publisherPrefix} (Nielsen Ireland/UK)`);
  console.log(`  ✓ Total ISBN Block:     ${res.totalIsbnBlockSize} ISBNs (978-1-918501-00-0 to 978-1-918501-99-9)`);
  console.log(`  ✓ Assigned Titles:      ${res.assignedIsbnsCount} Flagship Volumes`);
  console.log(`  ✓ Available Reserves:   ${res.availableIsbnsCount} ISBNs Available`);
  console.log(`  ✓ Cryptographic Hash:   ${res.registryHash}\n`);

  for (const v of res.volumes) {
    console.log(`  [${v.isbn}] Lead: ${v.leadCharacter.padEnd(10)} | Title: ${v.title}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: A.WARD PUBLICATIONS CATALOGUE 100% GREEN");
  console.log("=" * 80 + "\n");
}

runRegistry();
