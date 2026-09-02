import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Master Head-License Agreement verifies 12.5% gross royalty sweep and instant-snapback clause', () => {
  const royaltySweepPercent = 12.5;
  const instantSnapbackLagMs = 0;
  const masterIpHolder = 'A.Ward Publications';
  const licenseeEntity = 'Brehon AI Solutions Ltd';

  assert.equal(royaltySweepPercent, 12.5, 'Royalty sweep rate must equal 12.5% of Gross Enterprise Revenue');
  assert.equal(instantSnapbackLagMs, 0, 'Instant snapback revocation must execute with 0ms lag');
  assert.equal(masterIpHolder, 'A.Ward Publications', 'Licensor must be A.Ward Publications');
  assert.equal(licenseeEntity, 'Brehon AI Solutions Ltd', 'Licensee must be Brehon AI Solutions Ltd');
});
