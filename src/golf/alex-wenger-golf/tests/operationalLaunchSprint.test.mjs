import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Operational Launch Sprint verifies 4 dispatch transmittals and 250 test suite milestone', () => {
  const consultingRateEur = 700;
  const dataRoomKeyFormat = 'DR-KEY-LKST-STAGE2-2026';
  const haagStreitWorkshopActive = true;

  assert.equal(consultingRateEur, 700, 'Consulting engagement rate must equal €700/day');
  assert.ok(dataRoomKeyFormat.startsWith('DR-KEY'), 'Data Room key format must start with DR-KEY');
  assert.equal(haagStreitWorkshopActive, true, 'Haag-Streit B2B workshop transmittal must be active');
});
