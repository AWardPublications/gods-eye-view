import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MasterAgentCensusEngine } from '../../../davidos/masterAgentCensusEngine.mjs';

test('1. MasterAgentCensusEngine audits 64-Agent Master Swarm and character constellations', () => {
  const engine = new MasterAgentCensusEngine();
  const res = engine.compileCensus();

  assert.equal(res.status, 'MASTER_AGENT_CENSUS_COMPILED');
  assert.equal(res.masterSwarmCount, 64);
  assert.equal(res.davinciaConstellationCount, 15);
  assert.equal(res.grantBuilderSwarmCount, 14);
  assert.equal(res.namedCharacterCount, 16);
  assert.equal(res.agentCategories.length, 6);
  assert.ok(res.censusHash.length === 64);
});
