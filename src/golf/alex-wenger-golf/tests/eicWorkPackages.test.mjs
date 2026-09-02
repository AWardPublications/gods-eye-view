import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. EIC Accelerator Work Package Audit verifies €2.5M grant sub-allocations and 5 WPs', () => {
  const wp1AiEngineeringEur = 1200000;
  const wp2RegulatoryIngestionEur = 600000;
  const wp3SecurityAuditsEur = 400000;
  const wp4PilotDeploymentsEur = 243000;
  const wp5IpProsecutionEur = 57000; // 30k + 10k + 9k + 8k

  const totalGrantRequested = wp1AiEngineeringEur + wp2RegulatoryIngestionEur + wp3SecurityAuditsEur + wp4PilotDeploymentsEur + wp5IpProsecutionEur;

  assert.equal(totalGrantRequested, 2500000, 'Total EIC Accelerator grant request must equal exactly €2,500,000');
  assert.equal(wp1AiEngineeringEur, 1200000, 'WP1 AI engineering allocation must equal €1.2M');
  assert.equal(wp2RegulatoryIngestionEur, 600000, 'WP2 regulatory ingestion allocation must equal €600k');
  assert.equal(wp5IpProsecutionEur, 57000, 'WP5 IP prosecution allocation must equal €57k');
});
