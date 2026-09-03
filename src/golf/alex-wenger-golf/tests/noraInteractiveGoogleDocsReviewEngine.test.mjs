import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraInteractiveGoogleDocsReviewEngine } from '../../../publishing/noraInteractiveGoogleDocsReviewEngine.mjs';

test('1. NoraInteractiveGoogleDocsReviewEngine highlights THE CBD CODEX for Nora review across desktop export folders', () => {
  const engine = new NoraInteractiveGoogleDocsReviewEngine();
  const res = engine.generateAllNoraReviewDocs();

  assert.equal(res.status, 'NORA_CBD_CODEX_REVIEW_DOCS_GENERATED_AND_EXPORTED');
  assert.equal(res.reviewer, 'Nora');
  assert.equal(res.spotlightCodex, 'THE CBD CODEX: Cannabis, Botanical & Science Review');
  assert.equal(res.totalDocsGenerated, 8);
  assert.equal(res.generatedFiles.length, 8);
  assert.ok(res.hash.length === 64);
});
