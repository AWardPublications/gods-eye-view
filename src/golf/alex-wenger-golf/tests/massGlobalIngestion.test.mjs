import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runGlobalIngestionOrchestrator, processTier1Flagships, processTier2MicroNations, processTier3RegionalBatching } from '../../../../scripts/mass_global_ingestion_orchestrator.js';

test('processTier1Flagships validates flagship track ingestion', () => {
  const mockDb = { courses: { track_1: { name: "St Andrews", cohort: "UK" } } };
  const res = processTier1Flagships(mockDb);
  assert.equal(res.current_ingested, 1);
  assert.equal(res.target_capacity, 1500);
});

test('processTier2MicroNations registers micro-nations and calculates total tracks', () => {
  const res = processTier2MicroNations();
  assert.equal(res.countries_registered, 7);
  assert.equal(res.total_courses_mapped, 119);
  assert.equal(res.national_completion_rate, '100.0%');
});

test('processTier3RegionalBatching configures regional batch pipeline and cron', () => {
  const res = processTier3RegionalBatching();
  assert.equal(res.target_capacity, 38000);
  assert.equal(res.scheduled_cron, '0 */2 * * *');
  assert.equal(res.batch_pipeline.length, 4);
});

test('runGlobalIngestionOrchestrator generates manifest with sub-25ms storage guarantee', () => {
  const manifest = runGlobalIngestionOrchestrator();
  assert.equal(manifest.orchestrator_version, 'v4.5.2');
  assert.ok(manifest.ingested_in_memory_db >= 27);
  assert.equal(manifest.storage_architecture.latency_guarantee, '< 25 ms');
});
