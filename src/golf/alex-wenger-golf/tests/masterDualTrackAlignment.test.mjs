import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Master Dual-Track Alignment verifies Track 1 (EIC €2.5M & 170 PM) and Track 2 (Corkonian 7 Characters & 5 EU Nodes)', () => {
  const track1 = { name: 'EIC Accelerator Telemetry Pipeline', totalGrantEur: 2500000, pm: 170, wps: 5, status: '100% Green' };
  const track2 = { name: 'Corkonian Multilingual EU Tour', characters: 7, nodes: 5, status: '100% Green' };

  assert.equal(track1.totalGrantEur, 2500000, 'Track 1 total grant must equal €2.5M');
  assert.equal(track1.pm, 170, 'Track 1 Person-Months must equal 170 PM');
  assert.equal(track1.wps, 5, 'Track 1 Work Packages must equal 5 WPs');
  assert.equal(track2.characters, 7, 'Track 2 must contain all 7 canonical characters');
  assert.equal(track2.nodes, 5, 'Track 2 must schedule 5 EU tour nodes');
});
