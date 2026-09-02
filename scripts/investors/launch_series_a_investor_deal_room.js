import { SeriesAInvestorDealRoomEngine } from '../../src/investors/seriesAInvestorDealRoomEngine.mjs';

function launchDealRoom() {
  console.log("=" * 80);
  console.log("LAUNCHING SERIES A INVESTOR DEAL ROOM & TERM SHEET PACKAGE");
  console.log("=" * 80);

  const engine = new SeriesAInvestorDealRoomEngine();
  const res = engine.generateDealRoomManifest();

  console.log(`\n  ✓ Target Raise:              €${(res.dealTerms.targetRaiseEur / 1e6).toFixed(1)}M Preferred Equity`);
  console.log(`  ✓ Pre-Money Valuation Floor:  €${(res.dealTerms.preMoneyValuationEur / 1e6).toFixed(1)}M`);
  console.log(`  ✓ Post-Money Valuation:       €${(res.dealTerms.postMoneyValuationEur / 1e6).toFixed(1)}M (${res.dealTerms.dilutionPercentage}% Dilution)`);
  console.log(`  ✓ Non-Dilutive Grant Leverage: €${(res.dealTerms.nonDilutiveGrantStackingEur / 1e6).toFixed(1)}M (${res.dealTerms.grantMatchingMultiplier})`);
  console.log(`  ✓ Corporate Entities:         ${res.totalCorporateEntities} Legal Vehicles`);
  console.log(`  ✓ VC Outreach Targets:        ${res.topVcTargetsCount} High-Priority VCs\n`);

  console.log("=" * 80);
  console.log("STATUS: INVESTOR DEAL ROOM PACKAGE GENERATED 100% GREEN");
  console.log("=" * 80 + "\n");
}

launchDealRoom();
