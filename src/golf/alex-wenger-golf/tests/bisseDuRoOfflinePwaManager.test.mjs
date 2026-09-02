import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BisseDuRoOfflinePwaManager } from '../../../corkonian/bisseDuRoOfflinePwaManager.mjs';

test('1. BisseDuRoOfflinePwaManager verifies zero-cellular offline caching during Temps 1 classroom Wi-Fi sync', () => {
  const manager = new BisseDuRoOfflinePwaManager();
  const res = manager.synchronizeInClassroomWifi();

  assert.equal(res.status, 'OFFLINE_READY_ZERO_CELLULAR_REQUIRED');
  assert.equal(res.totalAssetsCount, 5);
  assert.equal(res.totalCachedSizeMb, 94);
  assert.ok(res.syncHash.length === 64);
});
