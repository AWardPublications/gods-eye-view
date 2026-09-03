import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantGedhiOperatingSystemEngine } from '../../../agents/grantGedhiOperatingSystemEngine.mjs';

test('1. GrantGedhiOperatingSystemEngine verifies 15 architecture subdirs, 10-step pipeline with Human Authorisation Gate, and probability-weighted capital stack', () => {
  const engine = new GrantGedhiOperatingSystemEngine();
  const res = engine.deployGovernedOperatingSystem();

  assert.equal(res.status, 'GRANT_GEDHI_V1_OPERATING_SYSTEM_DEPLOYED');
  assert.equal(res.totalArchitectureSubdirs, 15);
  assert.equal(res.pipelineStepsCount, 10);
  assert.ok(res.capitalStack.totalRawPipeline >= 75000000);
  assert.ok(res.capitalStack.totalProbabilityWeightedValue > 0);
  assert.ok(res.osHash.length === 64);

  const sampleGraph = engine.buildGrantKnowledgeGraphEntry({ grantId: 'CH-INNOSUISSE-01', funder: 'Innosuisse' });
  assert.equal(sampleGraph.graphEntry.humanApprovalRequired, true);
  assert.equal(sampleGraph.graphEntry.submissionStatus, 'PENDING_HUMAN_AUTHORISATION_GATE');
});
