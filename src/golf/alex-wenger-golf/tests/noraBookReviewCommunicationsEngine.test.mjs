import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraBookReviewCommunicationsEngine } from '../../../publishing/noraBookReviewCommunicationsEngine.mjs';

test('1. NoraBookReviewCommunicationsEngine generates bilingual English & French master briefing and 7 volume rubrics for Nora', () => {
  const engine = new NoraBookReviewCommunicationsEngine();
  const res = engine.generateNoraReviewPackage();

  assert.equal(res.status, 'NORA_BILINGUAL_BOOK_REVIEW_VAULT_PROVISIONED');
  assert.equal(res.targetReviewer, 'Nora');
  assert.equal(res.languages.length, 2);
  assert.equal(res.flagshipVolumesCount, 7);
  assert.equal(engine.flagshipVolumes.length, 7);

  for (const vol of engine.flagshipVolumes) {
    assert.ok(vol.titleEn.length > 0);
    assert.ok(vol.titleFr.length > 0);
    assert.ok(vol.reviewFocusEn.length > 0);
    assert.ok(vol.reviewFocusFr.length > 0);
  }

  assert.ok(res.hash.length === 64);
});
