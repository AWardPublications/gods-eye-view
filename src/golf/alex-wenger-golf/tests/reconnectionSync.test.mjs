import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReconnectionSyncEngine } from '../core/data/reconnectionSyncEngine.js';
import workerModule from '../../../edge/worker.js';

test('1. ReconnectionSyncEngine enqueues offline snapshots cleanly', () => {
  const syncEngine = new ReconnectionSyncEngine();
  syncEngine.clearQueue();

  const item1 = syncEngine.enqueueOfflineSnapshot({
    userId: 'user_valderrama_01',
    hole: 5,
    timestamp: new Date().toISOString(),
    strokesGained: { total: 0.85, tee: 0.45, approach: 0.40 }
  });

  const item2 = syncEngine.enqueueOfflineSnapshot({
    userId: 'user_valderrama_01',
    hole: 6,
    timestamp: new Date().toISOString(),
    strokesGained: { total: -0.15, putting: -0.15 }
  });

  assert.equal(syncEngine.getPendingCount(), 2);
  assert.equal(item1.payload.hole, 5);
  assert.equal(item2.payload.hole, 6);
});

test('2. ReconnectionSyncEngine flushes queued snapshots on reconnection signal', async () => {
  const syncEngine = new ReconnectionSyncEngine();
  syncEngine.clearQueue();

  syncEngine.enqueueOfflineSnapshot({
    userId: 'user_camiral_11',
    hole: 11,
    timestamp: new Date().toISOString(),
    strokesGained: { total: 1.20 }
  });

  const res = await syncEngine.triggerReconnectionSync();
  assert.equal(res.status, 'SYNC_COMPLETE');
  assert.equal(res.flushedCount, 1);
  assert.equal(syncEngine.getPendingCount(), 0);
});

test('3. Edge worker /api/v1/memory/snapshot handles snapshot ingestion with ctx.waitUntil', async () => {
  let kvPutCalled = false;
  let kvKey = null;

  const mockEnv = {
    USER_MEMORY: {
      put: async (key, val) => {
        kvPutCalled = true;
        kvKey = key;
      }
    },
    PATENT_GOVERNANCE: 'WO/2026/150385',
    API_VERSION: 'v4.6.0'
  };

  const mockCtx = {
    waitUntil: (promise) => {
      promise.catch(() => {});
    }
  };

  const request = new Request('https://edge.alexwenger.golf/api/v1/memory/snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'test_golfer_77',
      hole: 17,
      timestamp: new Date().toISOString(),
      strokesGained: { total: 0.50 }
    })
  });

  const response = await workerModule.fetch(request, mockEnv, mockCtx);
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.status, 'PERSISTED');
  assert.ok(data.logKey.includes('user_test_golfer_77'));
});

test('4. Flushed USER_MEMORY offline snapshot triggers automated 19th-Hole recap reel', async () => {
  const { trigger19thHoleAutoRecapFromSnapshot } = await import('../../../../scripts/media/renderDemoTacticalReel.js');
  const recapRes = await trigger19thHoleAutoRecapFromSnapshot({
    userId: 'user_reconnection_test',
    courseId: 'camiral_stadium_course',
    hole: 11,
    strokesGained: { total: 1.45 }
  });

  assert.equal(recapRes.status, 'DEBUT_REEL_RENDERED');
  assert.ok(recapRes.videoPath.includes('recap_user_reconnection_test_h11.mp4'));
});
