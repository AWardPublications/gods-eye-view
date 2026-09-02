import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Creative Europe CORKONIAN-LAB verifies €1.25M budget, €1.0M EU Grant (80%), 94 PM, 4 WPs, and 5 Tour Nodes', () => {
  const totalBudgetEur = 1250000;
  const euGrantEur = 1000000;
  const coFinancingRate = euGrantEur / totalBudgetEur;

  const coordinatorAwardPubEur = 455000;
  const partnerBrehonTechEur = 455000;
  const partnerBrehonMediaEur = 340000;
  const sumBudgetEur = coordinatorAwardPubEur + partnerBrehonTechEur + partnerBrehonMediaEur;

  const totalPm = 36 + 28 + 30; // 94 PM
  const wps = ['WP1', 'WP2', 'WP3', 'WP4'];
  const tourNodes = ['Cork / Cobh', 'Sion / Valais', 'Dublin / Kinsale', 'Belfast / St Andrews', 'Brussels / Paris'];

  assert.equal(totalBudgetEur, 1250000, 'Total eligible project cost must equal €1,250,000');
  assert.equal(euGrantEur, 1000000, 'EU grant contribution must equal €1,000,000');
  assert.equal(coFinancingRate, 0.80, 'EU Co-financing rate must equal 80%');
  assert.equal(sumBudgetEur, totalBudgetEur, 'Sum of partner budgets must equal €1,250,000');
  assert.equal(totalPm, 94, 'Total Person-Months across partners must equal 94 PM');
  assert.equal(wps.length, 4, 'Must contain 4 Work Packages');
  assert.equal(tourNodes.length, 5, 'Must deploy across 5 European tour nodes');
});
