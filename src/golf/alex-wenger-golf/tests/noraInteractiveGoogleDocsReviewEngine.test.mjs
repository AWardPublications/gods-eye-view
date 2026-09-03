import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraInteractiveGoogleDocsReviewEngine } from '../../../publishing/noraInteractiveGoogleDocsReviewEngine.mjs';

test('1. NoraInteractiveGoogleDocsReviewEngine generates 7 Natural Botanical (Sky/Flower/Vine/Earth) interactive review templates for Nora', () => {
  const engine = new NoraInteractiveGoogleDocsReviewEngine();
  const res = engine.generateAllNoraReviewDocs();

  assert.equal(res.status, 'NORA_NATURAL_BOTANICAL_REVIEW_DOCS_GENERATED_AND_EXPORTED');
  assert.equal(res.reviewer, 'Nora');
  assert.equal(res.themeName, 'Natural Botanical (Sky Blue, Flower Pink, Vine Green, Earth Brown)');
  assert.equal(res.totalDocsGenerated, 7);
  assert.equal(res.generatedFiles.length, 7);
  assert.ok(res.hash.length === 64);
});
