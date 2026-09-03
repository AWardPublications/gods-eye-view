import test from 'node:test';
import assert from 'node:assert/strict';
import { MultiFormatProductCompiler } from '../../src/compiler/productCompiler.js';
import { createGevActionRunner } from '../../src/voice/gevActions.js';

test('Product Compiler: Phygital TCG Card (AWP-CRD-001-TCG) Invariant Enforcement', () => {
  const compiler = new MultiFormatProductCompiler();

  // 1. Successful Golden Path Compilation
  const res = compiler.compileProduct('tcg_playing_card', {
    headline: 'CorkMan (The Alpine Guardian)',
    character_name: 'CorkMan',
    stats: { sound: 7, cop_on: 7, neck: 5, rebel: 5 },
    base_power: 24
  });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.product_code, 'AWP-CRD-001-TCG');
  assert.equal(res.artifact.dimensions, '2.5x3.5 inches (Poker Standard)');
  assert.ok(res.evidence.evidence_hash.startsWith('sha256-'));

  // 2. Stat Budget Breach Violation
  assert.throws(() => {
    compiler.compileProduct('tcg_playing_card', {
      headline: 'Overpowered Character',
      stats: { sound: 10, cop_on: 10, neck: 5, rebel: 5 } // Sum = 30 != 24
    });
  }, /TCG_STAT_BUDGET_BREACH/);

  // 3. Blocked Trademark Violation
  assert.throws(() => {
    compiler.compileProduct('tcg_playing_card', {
      headline: 'Pokemon Master Clone',
      character_name: 'Pokemon Fighter',
      stats: { sound: 6, cop_on: 6, neck: 6, rebel: 6 }
    });
  }, /TCG_BLOCKED_NAME_DETECTED/);
});

test('Product Compiler: Storybook (AWP-BOK-001-STORY) Telemetry Linting', () => {
  const compiler = new MultiFormatProductCompiler();

  // 1. Short Telemetry Lint Failure (< 50 chars)
  assert.throws(() => {
    compiler.compileProduct('narrative_storybook', {
      headline: 'Too Short Story',
      text: 'Only a few words here.'
    });
  }, /LINT_ERROR_TELEMETRY_SHORT/);

  // 2. Valid Storybook Compilation
  const validStory = "Across the misty high ridges of Sion, the alpine legend prepared for the final approach on the eighteenth fairway.";
  const res = compiler.compileProduct('narrative_storybook', {
    headline: 'Legend of the High Valais',
    text: validStory
  });

  assert.equal(res.status, 'SUCCESS');
  assert.equal(res.product_code, 'AWP-BOK-001-STORY');
  assert.equal(res.artifact.stamps.visual_overlay.regulatory_seal, 'DVA-VERIFIED-STORY-v1');
});

test('Product Compiler: Coloring Book (AWP-BOK-002-COLOR) & Fine Art Poster (AWP-PST-001-ART)', () => {
  const compiler = new MultiFormatProductCompiler();

  // 1. Coloring Book
  const colorRes = compiler.compileProduct('coloring_book', {
    headline: 'Matterhorn Alpine Speedgolf Outline'
  });
  assert.equal(colorRes.status, 'SUCCESS');
  assert.equal(colorRes.product_code, 'AWP-BOK-002-COLOR');
  assert.ok(colorRes.artifact.style_modifier.includes('black and white line art'));

  // 2. Fine Art Poster
  const artRes = compiler.compileProduct('fine_art_poster', {
    headline: 'Dawn Over Valais Fairways'
  });
  assert.equal(artRes.status, 'SUCCESS');
  assert.equal(artRes.product_code, 'AWP-PST-001-ART');
  assert.equal(artRes.artifact.dpi, 300);
});

test('Product Compiler: Fatigue Guard & Consecutive Overrides Rule', () => {
  const compiler = new MultiFormatProductCompiler();

  // 1st manual override
  compiler.compileProduct('coloring_book', { headline: 'Item 1' }, {}, { is_override: true });
  // 2nd manual override
  compiler.compileProduct('coloring_book', { headline: 'Item 2' }, {}, { is_override: true });

  // 3rd consecutive override must trip fatigue guard
  assert.throws(() => {
    compiler.compileProduct('coloring_book', { headline: 'Item 3' }, {}, { is_override: true });
  }, /GOVERNANCE_FREEZE/);
});

test('Product Compiler: Realtime GEV Action Runner Integration', async () => {
  const mockViewer = {
    camera: { moveEnd: { addEventListener() {} }, positionWC: { x: 0, y: 0, z: 0 } },
    trackedEntity: null,
    clock: { onTick: { addEventListener: () => () => {} } },
    scene: {
      canvas: { clientWidth: 1200, clientHeight: 800, addEventListener() {}, removeEventListener() {} },
      globe: { getHeight: () => 0 },
      camera: { moveStart: { addEventListener() {} } },
      postRender: { addEventListener() {} }
    }
  };

  const runner = createGevActionRunner({
    viewer: mockViewer,
    styleManager: {},
    dataManager: { layers: new Map() }
  });

  const res = await runner('compile_product_format', {
    format: 'tcg_playing_card',
    headline: 'Alex Wenger (Alpine Pro)',
    character_name: 'Alex Wenger',
    stats: { sound: 6, cop_on: 6, neck: 6, rebel: 6 }
  });

  assert.equal(res.ok, true);
  assert.equal(res.product_code, 'AWP-CRD-001-TCG');
  assert.ok(res.evidence_hash.startsWith('sha256-'));
});
