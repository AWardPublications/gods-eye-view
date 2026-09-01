import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureMapCanvas, captureTacticalHUD, compressPhotoForMemory } from './visualCaptureEngine.js';

test('captureMapCanvas generates WebGL canvas snapshot object', async () => {
  const mockCanvas = { width: 800, height: 600, toBlob: (cb) => cb(new Blob(['mock'], { type: 'image/webp' })) };
  const snapshot = await captureMapCanvas(mockCanvas);
  assert.ok(snapshot.blob);
  assert.equal(snapshot.width, 800);
  assert.equal(snapshot.height, 600);
  assert.ok(snapshot.timestamp);
});

test('captureTacticalHUD exports HiDPI DOM card payload', async () => {
  const mockHud = { querySelector: () => null };
  const card = await captureTacticalHUD(mockHud);
  assert.ok(card.blob);
  assert.ok(card.exportUrl);
  assert.ok(card.sizeBytes > 0);
  assert.ok(card.timestamp);
});

test('compressPhotoForMemory compresses photo to under 150KB', async () => {
  const mockFile = { size: 500000, type: 'image/png' };
  const compressed = await compressPhotoForMemory(mockFile, 1280, 0.8);
  assert.ok(compressed.blob);
  assert.ok(compressed.sizeBytes <= 150000);
});
