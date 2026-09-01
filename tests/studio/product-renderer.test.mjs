import test from 'node:test';
import assert from 'node:assert/strict';
import { ProductLayoutRenderer } from '../../src/studio/product-renderer.js';

test('Product Renderer: Phygital TCG Card SVG Layout', () => {
  const artifact = {
    product_type: 'tcg_playing_card',
    product_code: 'AWP-CRD-001-TCG',
    character_name: 'CorkMan',
    stats: { sound: 7, cop_on: 7, neck: 5, rebel: 5 }
  };

  const svg = ProductLayoutRenderer.renderSvg(artifact);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('CorkMan'));
  assert.ok(svg.includes('PWR 24'));
  assert.ok(svg.includes('COP ON'));
  assert.ok(svg.includes('AWP-CRD-001-TCG'));
});

test('Product Renderer: Storybook SVG Layout', () => {
  const artifact = {
    product_type: 'narrative_storybook',
    product_code: 'AWP-BOK-001-STORY',
    headline: 'Legend of the High Valais',
    narrative_text: 'Across the misty high ridges of Sion, the alpine legend prepared for the final approach on the eighteenth fairway.'
  };

  const svg = ProductLayoutRenderer.renderSvg(artifact);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('Legend of the High Valais'));
  assert.ok(svg.includes('AWP-BOK-001-STORY'));
});

test('Product Renderer: Coloring Book & Fine Art Poster SVG Layouts', () => {
  // Coloring Book
  const colorSvg = ProductLayoutRenderer.renderSvg({
    product_type: 'coloring_book',
    product_code: 'AWP-BOK-002-COLOR',
    headline: 'Matterhorn Coloring Odyssey'
  });
  assert.ok(colorSvg.includes('MATTERHORN COLORING ODYSSEY'));
  assert.ok(colorSvg.includes('ZERO GRAYSCALE'));

  // Fine Art Poster
  const posterSvg = ProductLayoutRenderer.renderSvg({
    product_type: 'fine_art_poster',
    product_code: 'AWP-PST-001-ART',
    headline: 'Dawn Over Valais Fairways'
  });
  assert.ok(posterSvg.includes('Dawn Over Valais Fairways'));
  assert.ok(posterSvg.includes('ARCHIVAL PRINT'));
});
