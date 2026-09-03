import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantReviewControlCenterEngine } from '../../../agents/grantReviewControlCenterEngine.mjs';

test('1. GrantReviewControlCenterEngine verifies 4 review categories and 15 key dossiers/templates', () => {
  const engine = new GrantReviewControlCenterEngine();
  const res = engine.generateReviewIndex();

  assert.equal(res.status, 'REVIEW_CONTROL_CENTER_ACTIVE');
  assert.equal(res.totalCategories, 4);
  assert.equal(res.totalFilesCount, 15);
  assert.ok(res.indexHash.length === 64);
});
