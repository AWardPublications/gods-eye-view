import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseInvestorPitchSheetEngine } from '../../../publishing/triUniverseInvestorPitchSheetEngine.mjs';

test('1. TriUniverseInvestorPitchSheetEngine compiles institutional executive pitch sheet', () => {
  const engine = new TriUniverseInvestorPitchSheetEngine();
  const res = engine.compilePitchSheet();

  assert.equal(res.status, 'INVESTOR_PITCH_SHEET_COMPILED');
  assert.equal(res.arrProjections.year1Arr, '€1.85M ARR');
  assert.ok(res.hash.length === 64);
});
