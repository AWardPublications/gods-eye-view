import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CapitalAcquisitionOsEngine } from '../../../david_os/capitalAcquisitionOsEngine.mjs';

test('1. CapitalAcquisitionOsEngine verifies Capital DNA, GEDHI Opportunity Score, Claim Control, and War Room Dashboard', () => {
  const engine = new CapitalAcquisitionOsEngine();
  const dna = engine.generateVentureCapitalDna({ name: 'Brehon AI Tech', targetCapitalEur: 15000000 });

  assert.equal(dna.venture.name, 'Brehon AI Tech');
  assert.equal(dna.capital.targetEur, 15000000);
  assert.ok(dna.assets.intellectualProperty.includes('WO/2026/150385'));

  const oppScore = engine.calculateGedhiOpportunityScore({ oppId: 'GEDHI-OPP-001', maxAwardEur: 5000000, winProbability: 0.65 });
  assert.ok(oppScore.gedhiScore > 0);

  const claimCheck = engine.verifyClaimControlNoHallucinationMode([
    { claimText: 'Patent active', evidenceId: 'EVD-001', status: 'VERIFIED' }
  ]);
  assert.equal(claimCheck.status, 'GREEN_SUBMISSION_PERMITTED');

  const warRoom = engine.generateFundingWarRoomDashboard('Brehon AI Group');
  assert.equal(warRoom.activeApplicationsCount, 17);
  assert.ok(warRoom.warRoomHash.length === 64);
});
