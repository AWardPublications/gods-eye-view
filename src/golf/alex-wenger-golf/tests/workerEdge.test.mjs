import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../../worker.js';

const mockEnv = {
  ENGINE_VERSION: 'v4.3.0',
  PATENT_GOVERNANCE: 'WO/2026/150385',
};

test('Cloudflare Worker GET /api/courses returns ingested courses summary', async () => {
  const req = new Request('http://localhost/api/courses', { method: 'GET' });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.status, 'success');
  assert.equal(data.version, 'v4.3.0');
  assert.ok(data.count >= 19);
});

test('Cloudflare Worker GET /api/courses/valderrama_golf_club returns Valderrama 18-hole dataset', async () => {
  const req = new Request('http://localhost/api/courses/valderrama_golf_club', { method: 'GET' });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.course.name, 'Real Club Valderrama');
  assert.equal(data.course.cohort, 'Andalusia & Sotogrande');
});

test('Cloudflare Worker POST /api/ballistics/3dof computes plays-like yards', async () => {
  const req = new Request('http://localhost/api/ballistics/3dof', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawYards: 215, deltaZ: 4.37, altitudeMeters: 660, windMph: 12 }),
  });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.playsLikeYards, 232);
});

test('Cloudflare Worker POST /api/pipeline/execute executes 6-state pipeline', async () => {
  const req = new Request('http://localhost/api/pipeline/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What is the penalty for out of bounds?' }),
  });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.ok(data.pipeline.integrated_coaching_response.includes('Mais oui'));
});
