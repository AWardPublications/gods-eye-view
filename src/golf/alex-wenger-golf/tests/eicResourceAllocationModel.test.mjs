import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. EIC Accelerator Resource Allocation Model verifies 170 PM, €2.0M Direct, €500k Subcontracting, and 5 WPs', () => {
  const wp1Budget = { pm: 34, direct: 380000, sub: 70000, total: 450000 };
  const wp2Budget = { pm: 48, direct: 540000, sub: 80000, total: 620000 };
  const wp3Budget = { pm: 26, direct: 310000, sub: 90000, total: 400000 };
  const wp4Budget = { pm: 38, direct: 410000, sub: 120000, total: 530000 };
  const wp5Budget = { pm: 24, direct: 360000, sub: 140000, total: 500000 };

  const totalPm = wp1Budget.pm + wp2Budget.pm + wp3Budget.pm + wp4Budget.pm + wp5Budget.pm;
  const totalDirect = wp1Budget.direct + wp2Budget.direct + wp3Budget.direct + wp4Budget.direct + wp5Budget.direct;
  const totalSub = wp1Budget.sub + wp2Budget.sub + wp3Budget.sub + wp4Budget.sub + wp5Budget.sub;
  const totalBudget = wp1Budget.total + wp2Budget.total + wp3Budget.total + wp4Budget.total + wp5Budget.total;

  assert.equal(totalPm, 170, 'Total Person-Months across 5 Work Packages must equal 170 PM');
  assert.equal(totalDirect, 2000000, 'Total Direct Costs must equal €2,000,000');
  assert.equal(totalSub, 500000, 'Total Subcontracting Costs must equal €500,000');
  assert.equal(totalBudget, 2500000, 'Total Budget must equal €2,500,000');

  // Verify Role PM allocation
  const roles = {
    leadArchitect: 6 + 8 + 6 + 2 + 8, // 30 PM
    seniorTelemetryEngineer: 18 + 8 + 2 + 6 + 2, // 36 PM
    principalMlScientist: 4 + 24 + 4 + 6 + 2, // 40 PM
    regulatoryOfficer: 2 + 2 + 14 + 4 + 6, // 28 PM
    fieldTrialsLead: 4 + 6 + 0 + 20 + 6 // 36 PM
  };

  const totalRolePm = roles.leadArchitect + roles.seniorTelemetryEngineer + roles.principalMlScientist + roles.regulatoryOfficer + roles.fieldTrialsLead;
  assert.equal(totalRolePm, 170, 'Sum of role PM allocations must equal 170 PM');
});
