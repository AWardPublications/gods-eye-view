import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantRequirementsIntelligenceEngine } from '../../../agents/grantRequirementsIntelligenceEngine.mjs';

test('1. GrantRequirementsIntelligenceEngine maps submission requirements across 4 corporate entities', () => {
  const engine = new GrantRequirementsIntelligenceEngine();
  const res = engine.analyzeRequirements();

  assert.equal(res.status, 'REQUIREMENTS_INTELLIGENCE_LOCKED');
  assert.equal(res.totalEntitiesMapped, 4, 'Must map all 4 corporate entities');
  assert.ok(res.totalGrantsAnalyzed >= 7, 'Must deeply analyze at least 7 major target grants');

  const innosuisse = res.grants.find(g => g.grantId === 'CH-INNOSUISSE-01');
  assert.equal(innosuisse.maxAward, 'CHF 5,000,000');
  assert.equal(innosuisse.portal, 'Innosuisse Innoprocess Portal');

  const eic = res.grants.find(g => g.grantId === 'IE-EIC-ACCELERATOR-01');
  assert.equal(eic.maxAward, '€17,500,000 (€2.5M Grant + €15M Equity)');
  assert.equal(eic.portal, 'EU Funding & Tenders Portal (e-Grant)');
});
