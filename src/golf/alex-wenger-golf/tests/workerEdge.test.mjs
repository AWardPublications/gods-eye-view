import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../../../worker.js';

const mockEnv = {
  ENGINE_VERSION: 'v4.4.1',
  PATENT_GOVERNANCE: 'WO/2026/150385',
};

test('Cloudflare Worker GET /api/v1/spatial returns ingested courses summary', async () => {
  const req = new Request('http://localhost/api/v1/spatial', { method: 'GET' });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.status, 'success');
  assert.equal(data.version, 'v4.4.1');
  assert.ok(data.count >= 19);
});

test('Cloudflare Worker GET /api/v1/spatial?courseId=valderrama_golf_club returns Valderrama 18-hole dataset', async () => {
  const req = new Request('http://localhost/api/v1/spatial?courseId=valderrama_golf_club', { method: 'GET' });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.course.name, 'Real Club Valderrama');
  assert.equal(data.course.cohort, 'Andalusia & Sotogrande');
});

test('Cloudflare Worker POST /api/v1/ballistics computes sub-100ms plays-like yards', async () => {
  const req = new Request('http://localhost/api/v1/ballistics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawYards: 215, deltaZ: 4.37, altitudeMeters: 660, windMph: 12 }),
  });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.telemetry.plays_like_yards, 232);
  assert.equal(data.latency_target, 'sub-100ms');
});

test('Cloudflare Worker POST /api/v1/state executes 6-state pipeline with State 4 Judge Audit', async () => {
  const req = new Request('http://localhost/api/v1/state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What is the penalty for out of bounds?' }),
  });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.governance_patent, 'WO/2026/150385');
  assert.equal(data.state_4_judge_filter.audit_passed, true);
  assert.ok(data.state_5_handoff.integrated_coaching_response.includes('Mais oui'));
});

test('Cloudflare Worker POST /api/v1/visual/upload validates <150KB upload limit', async () => {
  const req = new Request('http://localhost/api/v1/visual/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sizeBytes: 120000 }),
  });
  const res = await worker.fetch(req, mockEnv);
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.bandwidth_compliant, true);
  assert.equal(data.size_kb, 117.2);
});
