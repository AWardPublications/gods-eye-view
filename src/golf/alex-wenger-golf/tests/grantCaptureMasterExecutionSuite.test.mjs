import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantCaptureMasterExecutionSuite } from '../../../agents/grantCaptureMasterExecutionSuite.mjs';

test('1. GrantCaptureMasterExecutionSuite executes 100% submission-ready grant packages across 4 corporate entities', () => {
  const suite = new GrantCaptureMasterExecutionSuite();
  const res = suite.executeGrantCaptureSwarm();

  assert.equal(res.status, 'GRANT_CAPTURE_EXECUTED_100_PERCENT_READY');
  assert.equal(res.totalActiveEntities, 4);
  assert.ok(res.totalVerifiedGrants >= 7);

  const innosuisse = res.grants.find(g => g.grantId === 'CH-INNOSUISSE-01');
  assert.equal(innosuisse.status, 'SUBMISSION_READY');
  assert.equal(innosuisse.amount, 'CHF 5,000,000');

  const eic = res.grants.find(g => g.grantId === 'IE-EIC-ACCELERATOR-01');
  assert.equal(eic.status, 'SUBMISSION_READY');
  assert.equal(eic.amount, '€17,500,000 (€2.5M Grant + €15M Equity)');
});
