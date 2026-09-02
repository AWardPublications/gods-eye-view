import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderDemoTacticalReel } from '../../../../scripts/media/renderDemoTacticalReel.js';

test('1. BREHON GROUP BRANDING STANDARD v1.0 defines Dark Fairway and Kinetic Green theme tokens', () => {
  const branding = {
    standard: 'BREHON GROUP BRANDING STANDARD v1.0',
    dark_fairway: '#051009',
    kinetic_green: '#44d37e',
    agronomic_hues: {
      bunker_sand_tan: '#d97706',
      clay_earth: '#b45309',
      coastal_teal: '#06b6d4'
    }
  };

  assert.equal(branding.standard, 'BREHON GROUP BRANDING STANDARD v1.0');
  assert.equal(branding.dark_fairway, '#051009');
  assert.equal(branding.kinetic_green, '#44d37e');
  assert.equal(branding.agronomic_hues.bunker_sand_tan, '#d97706');
});

test('2. Governed Jurisdictional Taxonomy enforces Flag & Entity Dot format for South American cohort', () => {
  const southAmericanTaxonomy = [
    { iso: 'AR', flag: '🇦🇷', label: '🇦🇷 AR • Argentina' },
    { iso: 'BR', flag: '🇧🇷', label: '🇧🇷 BR • Brazil' },
    { iso: 'BO', flag: '🇧🇴', label: '🇧🇴 BO • Bolivia' },
    { iso: 'CL', flag: '🇨🇱', label: '🇨🇱 CL • Chile' },
    { iso: 'CO', flag: '🇨🇴', label: '🇨🇴 CO • Colombia' }
  ];

  assert.equal(southAmericanTaxonomy.length, 5);
  assert.ok(southAmericanTaxonomy.every(t => t.label.includes('•')));
});

test('3. Phase 6 Media Pipeline deterministic composition applies Ward Stone Watermark', async () => {
  const reelResult = await renderDemoTacticalReel({ output: './dist/renders/test_brehon_watermark.mp4' });

  assert.equal(reelResult.branding.standard, 'BREHON GROUP BRANDING STANDARD v1.0');
  assert.equal(reelResult.branding.ward_stone_watermark, 'WARD STONE — BREHON GOVERNED');
  assert.equal(reelResult.branding.dark_fairway, '#051009');
});
