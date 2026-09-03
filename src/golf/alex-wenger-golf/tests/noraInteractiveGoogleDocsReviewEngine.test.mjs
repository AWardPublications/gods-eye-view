import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraInteractiveGoogleDocsReviewEngine } from '../../../publishing/noraInteractiveGoogleDocsReviewEngine.mjs';

test('1. NoraInteractiveGoogleDocsReviewEngine generates 7 personalized interactive Google Docs review templates for Nora across desktop export folders', () => {
  const engine = new NoraInteractiveGoogleDocsReviewEngine();
  const res = engine.generateAllNoraReviewDocs();

  assert.equal(res.status, 'NORA_INTERACTIVE_GOOGLE_DOCS_GENERATED_AND_EXPORTED');
  assert.equal(res.reviewer, 'Nora');
  assert.equal(res.totalDocsGenerated, 7);
  assert.equal(res.generatedFiles.length, 7);
  assert.ok(res.hash.length === 64);
});
