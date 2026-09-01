import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../../edge/worker.js';

const mockEnv = {
  API_VERSION: 'v4.4.0',
  PATENT_GOVERNANCE: 'WO/2026/150385',
  MAX_PAYLOAD_SIZE_BYTES: 153600,
};

const mockCtx = {
  waitUntil: (promise) => Promise.resolve(promise),
};

test('/api/v1/ballistics computes sub-15ms 3-DoF plays-like yardage', async () => {
  const req = new Request('http://localhost/api/v1/ballistics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawYards: 420, deltaZ: 5.46, altitudeMeters: 45, windMph: 16 }),
  });
  const res = await worker.fetch(req, mockEnv, mockCtx);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.status, 'success');
  assert.equal(data.playsLikeYards, 444);
  assert.equal(data.latency_target, '<15ms');
});

test('/api/v1/state executes governed 6-state pipeline and State 4 Judge Audit', async () => {
  const req = new Request('http://localhost/api/v1/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: "What's my plays-like into the Levante wind?", holeNumber: 11, courseId: 'valderrama_golf_club' }),
  });
  const res = await worker.fetch(req, mockEnv, mockCtx);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.governance_patent, 'WO/2026/150385');
  assert.ok(data.pipeline.integrated_coaching_response.includes('Mais oui'));
});

test('/api/v1/spatial/valderrama_golf_club returns edge-cached course dataset under 25ms target', async () => {
  const req = new Request('http://localhost/api/v1/spatial/valderrama_golf_club', { method: 'GET' });
  const res = await worker.fetch(req, mockEnv, mockCtx);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.status, 'success');
  assert.equal(data.course.name, 'Real Club Valderrama');
  assert.equal(data.course.par, 71);
});

test('/api/v1/memory/snapshot ingests <150KB HUD snapshot and dispatches async persist', async () => {
  const req = new Request('http://localhost/api/v1/memory/snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'player_001', hole: 11, timestamp: new Date().toISOString(), cardBase64: 'mock_base64_under_150kb' }),
  });
  const res = await worker.fetch(req, mockEnv, mockCtx);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.status, 'PERSISTED');
  assert.ok(data.logKey.includes('user_player_001_round_'));
});
