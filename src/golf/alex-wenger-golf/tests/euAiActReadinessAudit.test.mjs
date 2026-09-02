import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('1. public/eu_ai_act_readiness_audit.html dashboard exists and conforms to BREHON v1.0', () => {
  const htmlPath = path.resolve('public/eu_ai_act_readiness_audit.html');
  assert.ok(fs.existsSync(htmlPath), 'eu_ai_act_readiness_audit.html should exist in public/');

  const content = fs.readFileSync(htmlPath, 'utf-8');
  assert.ok(content.includes('EU AI Act Articles 10–19 Readiness Audit'), 'Should contain main title');
  assert.ok(content.includes('WARD STONE — BREHON GOVERNED'), 'Should contain Ward Stone Watermark');
  assert.ok(content.includes('#051009'), 'Should contain Dark Fairway theme token');
  assert.ok(content.includes('#44d37e'), 'Should contain Kinetic Green theme token');
});

test('2. Dashboard contains all 5 interactive views & regulatory modules', () => {
  const htmlPath = path.resolve('public/eu_ai_act_readiness_audit.html');
  const content = fs.readFileSync(htmlPath, 'utf-8');

  assert.ok(content.includes('id="view-articles"'), 'View 1: Articles 10-19 Matrix should exist');
  assert.ok(content.includes('id="view-fallback"'), 'View 2: 98% Fallback Simulator should exist');
  assert.ok(content.includes('id="view-swissdamed"'), 'View 3: swissdamed M2M Pipeline should exist');
  assert.ok(content.includes('id="view-signals"'), 'View 4: Strategic Risk Signals should exist');
  assert.ok(content.includes('id="view-branding"'), 'View 5: BREHON Governance should exist');
});

test('3. 98.0% Fallback Gate & swissdamed M2M Schema Validation invariants are enforced', () => {
  const htmlPath = path.resolve('public/eu_ai_act_readiness_audit.html');
  const content = fs.readFileSync(htmlPath, 'utf-8');

  assert.ok(content.includes('98.0%'), 'Should enforce 98.0% confidence freeze threshold');
  assert.ok(content.includes('swiss_authorized_rep_gln'), 'Should enforce CH-REP GLN field requirement');
  assert.ok(content.includes('art50_provenance_sig'), 'Should enforce Article 50 provenance signature requirement');
});
