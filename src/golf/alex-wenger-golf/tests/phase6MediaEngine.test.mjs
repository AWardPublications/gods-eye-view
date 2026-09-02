import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runRoyalPorthcawlHole18RecapSimulation } from '../../../../scripts/simulate_recap_royal_porthcawl_18.js';

test('1. Phase 6 Media Engine compiles Royal Porthcawl Hole 18 post-round 19th-hole recap', async () => {
  const result = await runRoyalPorthcawlHole18RecapSimulation();

  assert.equal(result.status, 'DEBUT_REEL_RENDERED');
  assert.ok(fs.existsSync(result.videoPath), 'Video asset should exist');
  assert.ok(fs.existsSync(result.voicePath), 'Voice WAV asset should exist');
  assert.ok(fs.existsSync(result.subtitlesPath), 'Subtitle SRT asset should exist');
});

test('2. Phase 6 Media Engine applies BREHON v1.0 and Ward Stone Watermark hallmarks', async () => {
  const result = await runRoyalPorthcawlHole18RecapSimulation();

  assert.equal(result.branding.standard, 'BREHON GROUP BRANDING STANDARD v1.0');
  assert.equal(result.branding.ward_stone_watermark, 'WARD STONE — BREHON GOVERNED');
  assert.equal(result.branding.dark_fairway, '#051009');
});
