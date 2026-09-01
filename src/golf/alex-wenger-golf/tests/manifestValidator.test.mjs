import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateIngestedManifest } from '../../../../scripts/validate_ingested_manifest.js';

test('validateIngestedManifest audits all 27 courses in geographic_memory_engine.json and exits cleanly', () => {
  const result = validateIngestedManifest();
  assert.equal(result, true);
});
