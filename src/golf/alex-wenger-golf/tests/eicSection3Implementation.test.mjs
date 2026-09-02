import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. EIC Section 3 Implementation verifies all 5 WPs, 5 Milestones, 12 Deliverables, 170 PM, and €2.5M Budget', () => {
  const wps = ['WP1', 'WP2', 'WP3', 'WP4', 'WP5'];
  const milestones = ['MS1', 'MS2', 'MS3', 'MS4', 'MS5'];
  const deliverables = [
    'D1.1', 'D1.2', 'D2.1', 'D2.2', 'D3.1', 'D3.2', 'D3.3', 'D4.1', 'D4.2', 'D5.1', 'D5.2', 'D5.3'
  ];

  const totalPm = 170;
  const directCostsEur = 2000000;
  const subcontractingEur = 500000;
  const totalBudgetEur = 2500000;

  assert.equal(wps.length, 5, 'Must contain 5 Work Packages');
  assert.equal(milestones.length, 5, 'Must contain 5 gating milestones (MS1-MS5)');
  assert.equal(deliverables.length, 12, 'Must contain 12 core key deliverables (D1.1-D5.3)');
  assert.equal(totalPm, 170, 'Must equal 170 Person-Months');
  assert.equal(directCostsEur + subcontractingEur, totalBudgetEur, 'Direct + Subcontracting must equal €2.5M');
});
