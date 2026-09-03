import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OvernightValuationPipelineEngine } from '../overnight_valuation_and_ip_registration_pipeline.mjs';

test('129_Overnight_Pipeline_Full_Execution: Runs full overnight audit, certifies 5 master AWPUB IP assets, and verifies 0.00% link rot', () => {
  const engine = new OvernightValuationPipelineEngine();
  const res = engine.runFullOvernightAudit('ba909612205c466338b41ac6975826005707befa');

  assert.equal(res.dossier_id, 'DVA-OVERNIGHT-PIPELINE-2026');
  assert.equal(res.signatory_key, '0x80D0ADA1 (David Ward)');
  assert.equal(res.spatial_rooms_count, 20);
  assert.equal(res.link_rot_audit.link_rot_percentage, 0.0);
  assert.equal(res.registered_ip_assets.length, 5);
  assert.ok(res.package_hash.length === 64);
});
