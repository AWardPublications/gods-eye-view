import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MapDataProcessor } from '../core/spatial/mapDataProcessor.js';
import knowledgePayloadV5 from '../../data/alex_wenger_knowledge_v0_5.json' with { type: 'json' };

test('1. AWK-STEW-001 verifies Stewardship & Cross-Role Translation Doctrine', () => {
  assert.equal(knowledgePayloadV5.knowledge_version, 'AWK-v0.5');
  assert.equal(knowledgePayloadV5.blocks.length, 1);

  const block = knowledgePayloadV5.blocks[0];
  assert.equal(block.id, 'AWK-STEW-001');
  assert.equal(block.domain, 'Stewardship & Agronomy');
  assert.ok(block.content.dual_use_tools.includes('POGO_Turf_Pro_TDR_350_VWC_Moisture_Probe'));
  assert.ok(block.content.dual_use_tools.includes('USGA_Deacon_GS3_Ball_Drop_Profiler'));
});

test('2. MapDataProcessor.ingestDailyManifest ingests manifest and flags illegal pin slope warning', () => {
  const processor = new MapDataProcessor();

  const manifest = {
    course_uid: 'NL-BERN-01',
    course_conditions: {
      measured_stimpmeter: 11.8,
      soil_moisture_vwc_avg_pct: 16.4,
      bunker_condition: 'firm_compacted_morning_rain'
    },
    pin_sheet: [
      {
        hole: 14,
        quadrant: 'back_shelf',
        paces_on: 24,
        paces_from_edge: 5,
        relative_slope_pct: 3.5,
        architectural_intent: 'Severe runoff off back edge'
      }
    ]
  };

  const result = processor.ingestDailyManifest(manifest, { features: [] });

  assert.ok(result.updatedMapData !== undefined);
  assert.equal(result.updatedMapData.daily_conditions.measured_stimpmeter, 11.8);
  assert.equal(result.updatedMapData.daily_conditions.soil_moisture_vwc_avg_pct, 16.4);
  assert.equal(result.manifestAudit.warnings_flagged, 1);
  assert.equal(result.warnings[0].type, 'ILLEGAL_PIN_WARNING');
  assert.ok(result.warnings[0].message.includes('exceeds stopping threshold'));
});
