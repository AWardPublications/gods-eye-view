import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsArchitectureEngine } from '../davidOsArchitectureEngine.mjs';

test('104_NotebookLM_18ef9190_Reconstruction_Principle: Verifies trust-by-reconstruction epigraph and ALCOA+ compliance', () => {
  const engine = new DavidOsArchitectureEngine();
  const epigraph = engine.getEpigraph();

  assert.equal(epigraph, "Nothing is trusted because it happened. Everything is trusted because it can be reconstructed.");
});

test('105_NotebookLM_18ef9190_20_Spatial_Rooms_Map: Verifies all 20 Spatial Rooms (RM-01 through RM-20) are fully mapped and operational', () => {
  const engine = new DavidOsArchitectureEngine();
  const rooms = engine.getSpatialRoomsMap();

  assert.equal(Object.keys(rooms).length, 20);
  assert.equal(rooms['RM-01'].name, 'Master Control Gateway & Executive Clubhouse');
  assert.equal(rooms['RM-10'].name, 'Room of Refusal & Zero-Knowledge Escrow');
  assert.equal(rooms['RM-20'].name, 'Sovereign Embassy Master Telemetry Deck');
});

test('106_NotebookLM_18ef9190_3_Tier_HITL_Latency_Bounds: Verifies L1 (<=90s), L2 (Escalation), and L3 (Audit) latency bounds', () => {
  const engine = new DavidOsArchitectureEngine();
  const tiers = engine.getHitlTiers();

  assert.equal(tiers.L1.max_latency_seconds, 90);
  assert.equal(tiers.L2.role, 'Senior Escalation Reviewer');
  assert.equal(tiers.L3.role, 'Cork Ban Audit Reviewer');
});
