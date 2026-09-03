import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseWorldPlannerEngine } from '../../../davidos/triUniverseWorldPlannerEngine.mjs';

test('1. TriUniverseWorldPlannerEngine compiles full world blueprints for Embassy, Golf Resort, and Island', () => {
  const engine = new TriUniverseWorldPlannerEngine();
  const res = engine.compileWorldPlan();

  assert.equal(res.status, 'WORLD_PLAN_RATIFIED_AND_COMPILED');
  assert.equal(res.worldsCount, 3);
  assert.equal(res.masterWorldsPlan[0].worldId, 'WORLD_DAVID_OS_EMBASSY');
  assert.equal(res.masterWorldsPlan[1].worldId, 'WORLD_ALEX_WENGER_RESORT');
  assert.equal(res.masterWorldsPlan[2].worldId, 'WORLD_CORKONIAN_ISLAND');
  assert.ok(res.planHash.length === 64);
});
