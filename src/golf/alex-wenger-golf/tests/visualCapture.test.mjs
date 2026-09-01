import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureMapCanvas, exportTacticalCard, compressImageBlob } from '../core/spatial/visualCaptureEngine.js';

test('captureMapCanvas exports WebGL canvas snapshot', async () => {
  const mockCanvas = { toBlob: (cb) => cb(new Blob(['mock'], { type: 'image/webp' })) };
  const res = await captureMapCanvas(mockCanvas);
  assert.ok(res.imageUrl);
  assert.ok(res.timestamp);
});

test('exportTacticalCard exports HiDPI DOM card payload', async () => {
  const mockHud = { querySelector: () => null };
  const res = await exportTacticalCard(mockHud);
  assert.ok(res.exportUrl);
  assert.ok(res.timestamp);
});

test('compressImageBlob optimizes image payload under 150KB', async () => {
  const mockBlob = { size: 500000, type: 'image/png' };
  const res = await compressImageBlob(mockBlob, 150);
  assert.ok(res.sizeKb <= 150);
});
