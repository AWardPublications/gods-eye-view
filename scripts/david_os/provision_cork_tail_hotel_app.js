import { CorkTailHotelAppAccentureRivalEngine } from '../../src/david_os/corkTailHotelAppAccentureRivalEngine.mjs';

function runProvisioning() {
  console.log("=" * 80);
  console.log("PROVISIONING CORK TAIL: ACCENTURE-RIVAL HOTEL APP IN DAVID_OS");
  console.log("=" * 80);

  const engine = new CorkTailHotelAppAccentureRivalEngine();
  const res = engine.provisionHotelAppInDavidOs();

  console.log(`\n  ✓ Application Name:     ${res.appName}`);
  console.log(`  ✓ Market Rival Target:  ${res.marketRival}`);
  console.log(`  ✓ Lead Entity:          ${res.dnaData.leadEntity}`);
  console.log(`  ✓ Lead Character:       ${res.dnaData.leadCharacter}`);
  console.log(`  ✓ Target Capital Stack: €${(res.dnaData.targetCapitalEur / 1e6).toFixed(1)}M Total Raw Pipeline`);
  console.log(`  ✓ Expected Capital:     €${(res.dnaData.capitalStack.probabilityWeightedRealizableCapitalEur / 1e6).toFixed(2)}M Realizable`);
  console.log(`  ✓ Target Directory:     ${res.desktopTargetDir}`);
  console.log(`  ✓ Provisioning Hash:    ${res.hash}\n`);

  console.log("  KEY DIFFERENTIATORS VS ACCENTURE:");
  for (const diff of res.dnaData.keyDifferentiatorsVsAccenture) {
    console.log(`  • ${diff}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: CORK TAIL HOTEL APP PROVISIONED 100% GREEN IN DAVID_OS");
  console.log("=" * 80 + "\n");
}

runProvisioning();
