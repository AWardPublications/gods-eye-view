import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsHospitalitySiteOutreachEngine } from '../../../david_os/davidOsHospitalitySiteOutreachEngine.mjs';

test('1. DavidOsHospitalitySiteOutreachEngine links GitHub DAVID_OS_SITE Zone 2 Hospitality surface with hotel email campaign and €20.0M capital stack', () => {
  const engine = new DavidOsHospitalitySiteOutreachEngine();
  const res = engine.generateHotelOutreachCampaign();

  assert.equal(res.status, 'HOTEL_OUTREACH_CAMPAIGN_GOVERNED_AND_PROVISIONED');
  assert.equal(res.zoneName, 'Zone 2: Hospitality (Stag & Bear Wing)');
  assert.equal(res.campaignData.targetAudience.length, 3);
  assert.equal(res.campaignData.capitalStackEur, 20000000);
  assert.ok(res.hash.length === 64);
});
