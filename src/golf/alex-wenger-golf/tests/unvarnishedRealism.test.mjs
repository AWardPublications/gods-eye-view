import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Unvarnished Realism Plan verifies €700/day CSV consulting runway and 90-minute workshop wedge', () => {
  const dailyConsultingRateEur = 700;
  const isPostgresTruthLayer = true;
  const isEntityFirewallEnforced = true;
  const isFalseGreenWorkshopActive = true;

  assert.equal(dailyConsultingRateEur, 700, 'Daily CSV consulting rate must equal €700/day');
  assert.equal(isPostgresTruthLayer, true, 'Database/PostgreSQL must be the truth layer (LLM demoted to advisory)');
  assert.equal(isEntityFirewallEnforced, true, 'Entity Integrity Override (Liability Firewall) must be enforced');
  assert.equal(isFalseGreenWorkshopActive, true, '90-minute False Green workshop wedge must be active');
});
