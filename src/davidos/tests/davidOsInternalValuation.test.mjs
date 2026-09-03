import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavidOsInternalValuationEngine } from '../davidOsInternalValuationEngine.mjs';

test('133_Internal_Knowledge_Valuation: Evaluates metric-driven internal asset floor (€87.5M) and monopoly valuation (€481.25M-€743.75M)', () => {
  const engine = new DavidOsInternalValuationEngine();
  const res = engine.evaluateInternalValuation();

  assert.equal(res.status, 'INTERNAL_KNOWLEDGE_VALUATION_COMPLETE');
  assert.equal(res.document_id, 'DVA-INTERNAL-VALUATION-2026');
  assert.equal(res.metrics_evaluated.test_suites, 141);
  assert.equal(res.total_base_asset_floor_eur, 87500000);
  assert.equal(res.strategic_monopoly_range_eur.min_eur, 481250000);
  assert.equal(res.strategic_monopoly_range_eur.max_eur, 743750000);
  assert.ok(res.report_sha256_hash.length === 64);
});
