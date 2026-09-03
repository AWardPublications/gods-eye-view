import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantGedhiDavidOsProductEngine } from '../../../david_os/grantGedhiDavidOsProductEngine.mjs';

test('1. GrantGedhiDavidOsProductEngine provisions a new company in DAVID_OS with complete 15-folder GRANT GEDHI OS in seconds', () => {
  const engine = new GrantGedhiDavidOsProductEngine();
  const res = engine.provisionCompanyInDavidOs({
    companyName: 'Test Venturer',
    jurisdiction: 'Belfast, UK',
    sector: 'Talent Acquisition OS',
    targetCapitalEur: 5000000
  });

  assert.equal(res.status, 'COMPANY_GRANT_GEDHI_PROVISIONED_IN_DAVID_OS');
  assert.equal(res.companyName, 'Test Venturer');
  assert.equal(res.totalSubdirsGenerated, 15);
  assert.equal(res.manifestData.hitlGateState, 'PAUSED_WAITING_HUMAN_AUTHORISATION');
  assert.ok(res.provisioningHash.length === 64);
});
