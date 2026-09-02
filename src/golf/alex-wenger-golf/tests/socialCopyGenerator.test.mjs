import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSocialCopyTemplates } from '../core/media/socialCopyGenerator.js';

test('1. generateSocialCopyTemplates generates Twitter copy under 280 character limit with Par 4 terminology & URL buffer', () => {
  const result = generateSocialCopyTemplates({
    courseName: "Royal Porthcawl Golf Club",
    hole: 18,
    par: 4,
    rawDistanceYards: 442,
    playsLikeYards: 482,
    carryYards: 242,
    windDetail: "25.4 mph gale",
    shortUrl: "https://aw.golf/r18"
  });

  assert.equal(result.twitter.isCompliant, true);
  assert.ok(result.twitter.charCount <= 280);
  assert.ok(result.twitter.text.includes('Par 4'));
  assert.ok(result.twitter.text.includes('Carried 242y into the gale'));
  assert.ok(result.twitter.text.includes('https://aw.golf/r18'));
});

test('2. generateSocialCopyTemplates generates technical LinkedIn copy with patent reference', () => {
  const result = generateSocialCopyTemplates({
    courseName: "Royal Porthcawl Golf Club",
    hole: 18,
    rawDistanceYards: 442,
    playsLikeYards: 482
  });

  assert.ok(result.linkedin.text.includes('Patent WO/2026/150385'));
  assert.ok(result.linkedin.text.includes('-12dB side-chain audio ducking'));
  assert.ok(result.linkedin.text.includes('WARD STONE — BREHON GOVERNED'));
  assert.equal(result.metadata.playsLikeDiffYards, 40);
});
