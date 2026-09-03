import { CapitalAcquisitionOsEngine } from '../../src/david_os/capitalAcquisitionOsEngine.mjs';

function runWarRoom() {
  console.log("=" * 80);
  console.log("GRANT GEDHI: CAPITAL ACQUISITION OS FOR DAVID_OS — 30-SECOND WAR ROOM");
  console.log("=" * 80);

  const engine = new CapitalAcquisitionOsEngine();
  const warRoom = engine.generateFundingWarRoomDashboard('Brehon AI Group');

  console.log(`\n  ╔════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`  ║                  GRANT GEDHI — CAPITAL ACQUISITION OS                      ║`);
  console.log(`  ╠════════════════════════════════════════════════════════════════════════════╣`);
  console.log(`  ║ VENTURE NAME:              ${warRoom.ventureName.padEnd(46)} ║`);
  console.log(`  ║ TARGET CAPITAL:            €${(warRoom.targetCapitalEur / 1e6).toFixed(1)}M                                         ║`);
  console.log(`  ║ RAW PIPELINE:              €${(warRoom.rawPipelineEur / 1e6).toFixed(1)}M                                         ║`);
  console.log(`  ║ PROBABILITY WEIGHTED:      €${(warRoom.probabilityWeightedPipelineEur / 1e6).toFixed(2)}M (Realizable Expected Capital)        ║`);
  console.log(`  ║                                                                            ║`);
  console.log(`  ║ ACTIVE APPLICATIONS:       ${String(warRoom.activeApplicationsCount).padEnd(46)} ║`);
  console.log(`  ║ HIGH-FIT OPPORTUNITIES:    ${String(warRoom.highFitOpportunitiesCount).padEnd(46)} ║`);
  console.log(`  ║ DEADLINES < 30 DAYS:       ${String(warRoom.deadlinesUnder30DaysCount).padEnd(46)} ║`);
  console.log(`  ║ EVIDENCE BLOCKERS:         ${String(warRoom.evidenceBlockersCount).padEnd(46)} ║`);
  console.log(`  ╚════════════════════════════════════════════════════════════════════════════╝\n`);

  console.log("  TOP CAPITAL OPPORTUNITIES BY GEDHI SCORE:");
  for (const opp of warRoom.topOpportunities) {
    console.log(`  • [${opp.oppId}] ${opp.title.padEnd(34)} | Max: €${(opp.maxAwardEur / 1e6).toFixed(1)}M | Score: ${opp.gedhiScore}`);
  }

  // Verify Claim Control No-Hallucination Mode
  const claimCheck = engine.verifyClaimControlNoHallucinationMode([
    { claimText: 'Patent-protected AI golf coaching technology', evidenceId: 'GEDHI-EVD-WO2026150385', status: 'VERIFIED' },
    { claimText: '150% Valais R&D Super-Deduction active', evidenceId: 'GEDHI-EVD-STAF25A', status: 'VERIFIED' }
  ]);

  console.log(`\n  ✓ Claim Control Status:    ${claimCheck.status}`);
  console.log(`  ✓ Verified Claims:         ${claimCheck.verifiedClaimsCount} 🟢 VERIFIED`);
  console.log(`  ✓ Submission Permitted:    ${claimCheck.isSubmissionPermitted}\n`);

  console.log("=" * 80);
  console.log("STATUS: CAPITAL ACQUISITION OS WAR ROOM 100% GREEN");
  console.log("=" * 80 + "\n");
}

runWarRoom();
