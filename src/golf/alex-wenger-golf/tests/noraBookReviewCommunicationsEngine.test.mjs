import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraBookReviewCommunicationsEngine } from '../../../publishing/noraBookReviewCommunicationsEngine.mjs';

test('1. NoraBookReviewCommunicationsEngine generates master briefing and 7 volume opinion feedback rubrics for Nora', () => {
  const engine = new NoraBookReviewCommunicationsEngine();
  const res = engine.generateNoraReviewPackage();

  assert.equal(res.status, 'NORA_BOOK_REVIEW_VAULT_PROVISIONED_AND_PACKAGED');
  assert.equal(res.targetReviewer, 'Nora');
  assert.equal(res.flagshipVolumesCount, 7);
  assert.equal(engine.flagshipVolumes.length, 7);
  assert.ok(res.hash.length === 64);
});
