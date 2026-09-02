import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRO_COACHING_TOOLS_MATRIX } from '../core/architecture/proCoachingToolsMatrix.js';

test('1. PRO_COACHING_TOOLS_MATRIX registers all 8 essential pro coaching tool categories', () => {
  const keys = Object.keys(PRO_COACHING_TOOLS_MATRIX);
  assert.equal(keys.length, 8);
  assert.equal(PRO_COACHING_TOOLS_MATRIX[1].category, 'Launch & Ballistics Telemetry');
  assert.equal(PRO_COACHING_TOOLS_MATRIX[2].category, '3D Kinematic Pose Tracking & Biomechanics');
  assert.equal(PRO_COACHING_TOOLS_MATRIX[4].category, 'Performance Analytics & Shot Tracking');
  assert.equal(PRO_COACHING_TOOLS_MATRIX[7].category, 'Hands-Free Voice Earpiece HUD');
});

test('2. Every coaching tool category maps to an open-source equivalent and is wired into the system', () => {
  for (const [id, tool] of Object.entries(PRO_COACHING_TOOLS_MATRIX)) {
    assert.ok(tool.open_source_equivalent.length > 0, `Tool ${id} must have an open-source equivalent`);
    assert.ok(tool.integration_status.startsWith('WIRED'), `Tool ${id} integration status must start with WIRED`);
  }
});
