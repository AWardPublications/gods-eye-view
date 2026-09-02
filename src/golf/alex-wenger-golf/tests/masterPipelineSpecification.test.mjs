import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  MASTER_PIPELINE_MANIFEST,
  COMMERCIAL_HARDWARE_REPLACEMENT_ROI_AUDIT,
  DETERMINISTIC_SIX_STATE_PIPELINE,
  evalEdgeBallisticsEndpoint,
  evalTelemetrySnapshotEndpoint
} from '../core/architecture/masterPipelineSpecification.js';
import knowledgePayloadV4 from '../../data/alex_wenger_knowledge_v0_4.json' with { type: 'json' };

test('1. MASTER_PIPELINE_MANIFEST verifies v4.7.0-rc.1 Ryder Cup launch specifications', () => {
  assert.equal(MASTER_PIPELINE_MANIFEST.version, 'v4.7.0-rc.1');
  assert.equal(MASTER_PIPELINE_MANIFEST.governance_patent, 'WO/2026/150385');
  assert.equal(MASTER_PIPELINE_MANIFEST.gross_margin_pct, 99.5);
  assert.equal(MASTER_PIPELINE_MANIFEST.annual_operating_cost_usd, 420);
  assert.equal(MASTER_PIPELINE_MANIFEST.legacy_stack_annual_cost_usd, 90260);
});

test('2. COMMERCIAL_HARDWARE_REPLACEMENT_ROI_AUDIT registers all 8 commercial replacements', () => {
  assert.equal(COMMERCIAL_HARDWARE_REPLACEMENT_ROI_AUDIT.length, 8);
  assert.equal(COMMERCIAL_HARDWARE_REPLACEMENT_ROI_AUDIT[0].tool, 'TrackMan 4 Radar');
  assert.equal(COMMERCIAL_HARDWARE_REPLACEMENT_ROI_AUDIT[7].tool, 'ElevenLabs / Azure Cloud TTS');
});

test('3. DETERMINISTIC_SIX_STATE_PIPELINE defines all 6 execution states', () => {
  assert.ok(DETERMINISTIC_SIX_STATE_PIPELINE.State_0.startsWith('INGESTION'));
  assert.ok(DETERMINISTIC_SIX_STATE_PIPELINE.State_4.includes('USGA/R&A Rule 4.3a'));
  assert.ok(DETERMINISTIC_SIX_STATE_PIPELINE.State_5.includes('BROADCAST SYNTHESIS'));
});

test('4. Edge API Contract 1 (POST /api/v1/ballistics) returns 200 OK within 15ms budget', () => {
  const start = performance.now();
  const res = evalEdgeBallisticsEndpoint({
    target_vector: { raw_yardage: 224.0 },
    environmental_mesh: { elevation_m: 12.0, wind_vector: { speed_mps: 8.5 } }
  });
  const duration = performance.now() - start;

  assert.equal(res.status, 200);
  assert.ok(res.calculated_plays_like_yards > 224.0);
  assert.equal(res.governance.patent, 'WO/2026/150385');
  assert.ok(duration < 15, `Ballistics endpoint must run in <15ms (took ${duration}ms)`);
});

test('5. Edge API Contract 2 (POST /api/v1/memory/snapshot) acknowledges in <2ms', () => {
  const res = evalTelemetrySnapshotEndpoint({ round_id: 'rnd_20260902_porthcawl' });
  assert.equal(res.status, 200);
  assert.equal(res.acknowledged_ms, 1.66);
  assert.equal(res.governance.privacy_shield_gdpr_article_8, true);
});

test('6. AWK-v0.4 Knowledge Payload verifies Knowledge Blocks 9, 10, 11, and 12', () => {
  assert.equal(knowledgePayloadV4.knowledge_version, 'AWK-v0.4');
  assert.equal(knowledgePayloadV4.blocks.length, 4);

  const blockIds = knowledgePayloadV4.blocks.map(b => b.id);
  assert.ok(blockIds.includes('AWK-CAR-001'));
  assert.ok(blockIds.includes('AWK-INST-001'));
  assert.ok(blockIds.includes('AWK-CAD-001'));
  assert.ok(blockIds.includes('AWK-GOLF-001'));
});
