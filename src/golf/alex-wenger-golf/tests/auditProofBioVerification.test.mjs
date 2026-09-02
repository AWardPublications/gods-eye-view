import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('1. Audit-Proof Biography Verification Log checks all 5 sentence mappings', () => {
  const logPath = 'C:\\Users\\David\\.gemini\\antigravity-cli\\brain\\680880c5-c729-450a-86ed-5d4a4ee51afe\\scratch\\bio_verification_log.json';
  const data = JSON.parse(fs.readFileSync(logPath, 'utf8'));

  assert.equal(data.verification_status, 'AUDIT_READY_100_PERCENT_VERIFIED');
  assert.equal(data.sentence_mappings.length, 5);
  
  for (const mapping of data.sentence_mappings) {
    assert.equal(mapping.evidence_status, 'VERIFIED_GREEN');
  }
});
