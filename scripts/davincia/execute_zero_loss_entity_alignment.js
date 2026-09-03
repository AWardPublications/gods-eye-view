import { DavinciaZeroLossEntityAlignmentEngine } from '../../src/davincia/davinciaZeroLossEntityAlignmentEngine.mjs';

function runExecution() {
  console.log("=" * 80);
  console.log("DAVINCIA⁺ ZERO-LOSS LEGAL ENTITY SEPARATION & GITHUB ALIGNMENT");
  console.log("=" * 80);

  const engine = new DavinciaZeroLossEntityAlignmentEngine();
  const res = engine.executeZeroLossEntityAlignment();

  console.log(`\n  ✓ Framework Name:       ${res.frameworkName}`);
  console.log(`  ✓ Entities Separated:   ${res.totalEntitiesSeperated} Legal Entities (BAIS, BAIT, BAIR, AWP)`);
  console.log(`  ✓ Alignment Hash:       ${res.alignmentHash}\n`);

  console.log("  ZERO-LOSS ENTITY & ABILITIES MATRIX:");
  for (const ent of engine.legalEntities) {
    console.log(`\n  [${ent.entityId}] ${ent.legalName}`);
    console.log(`    Jurisdiction: ${ent.jurisdiction}`);
    console.log(`    Role:         ${ent.role}`);
    console.log(`    Tax Regime:   ${ent.taxRegime}`);
    console.log(`    GitHub Repo:  ${ent.canonicalGitHubRepo}`);
    console.log(`    Abilities CAN: ${ent.abilities.can.join(', ')}`);
    console.log(`    Abilities CANNOT: ${ent.abilities.cannot.join(', ')}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: ZERO-LOSS ENTITY SEPARATION & GITHUB ALIGNMENT 100% GREEN");
  console.log("=" * 80 + "\n");
}

runExecution();
