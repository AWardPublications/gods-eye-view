import test from 'node:test';
import assert from 'node:assert/strict';
import { createSovereignTray } from '../../src/ui/sovereign-tray.js';

test('UI Sovereign Tray: Subsystem Composition & Component Wiring', () => {
  const tray = createSovereignTray();

  assert.ok(tray.wengerHud);
  assert.ok(tray.factoryHud);
  assert.ok(tray.marketHud);
  assert.ok(tray.speedgolfSim);
});
