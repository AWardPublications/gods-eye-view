import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresGovernanceAdapter } from '../../src/db/postgres-adapter.js';
import { N8nSchedulerEngine } from '../../src/scheduler/n8n-triggers.js';
import { PersistentMemoryArchitecture } from '../../src/golf/governance/session-memory-schema.js';

test('Postgres Adapter: Transaction Recording and State Retrieval', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });

  const tx = await adapter.recordTransaction({
    transaction_id: 'tx-test-001',
    buyer_passport: 'urn:davincia:passport:buyer_alpine',
    asset_code: 'AWP-CRD-001-TCG',
    amount_cents: 2500 // €25.00
  });

  assert.equal(tx.transaction_id, 'tx-test-001');
  assert.equal(tx.status, 'AUTHORIZED');
  assert.equal(tx.amount_cents, 2500);

  const retrieved = await adapter.getTransaction('tx-test-001');
  assert.equal(retrieved.buyer_passport, 'urn:davincia:passport:buyer_alpine');
});

test('Postgres Adapter: Row-Level Dispute Freeze and Settlement Block (FAIL-CLOSED)', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });

  await adapter.recordTransaction({
    transaction_id: 'tx-dispute-001',
    buyer_passport: 'urn:davincia:passport:buyer_dispute',
    asset_code: 'AWP-BOK-001-STORY',
    amount_cents: 4500
  });

  // Freeze transaction
  const freezeRes = await adapter.freezeTransaction('tx-dispute-001', 'PROVENANCE_MISMATCH');
  assert.equal(freezeRes.frozen, true);
  assert.equal(freezeRes.status, 'DISPUTE_FROZEN');

  // Attempting settlement must fail closed
  await assert.rejects(
    async () => {
      await adapter.settleTransaction('tx-dispute-001');
    },
    /SETTLEMENT_BLOCKED/
  );
});

test('n8n Scheduler: Friday Knowledge Synchronization (FKS)', async () => {
  const memory = new PersistentMemoryArchitecture();
  const playerId = 'urn:davincia:athlete:alex_wenger';

  // Seed sessions
  memory.appendSessionRecord({ player_id: playerId, sentiment_state: 0.5, compliance_score: 0.9 });
  memory.appendSessionRecord({ player_id: playerId, sentiment_state: 0.6, compliance_score: 0.85 });

  const scheduler = new N8nSchedulerEngine({ memory });
  const fksRes = await scheduler.executeFridayKnowledgeSync({ player_id: playerId });

  assert.equal(fksRes.status, 'SUCCESS');
  assert.equal(fksRes.event, 'FRIDAY_KNOWLEDGE_SYNC');
  assert.equal(fksRes.payload.sync_status, 'SYNCHRONIZED');
  assert.ok(fksRes.payload.baseline_vector.avg_sentiment > 0.4);
  assert.ok(fksRes.evidence_hash.startsWith('sha256-'));
});

test('n8n Scheduler: Sunday 16:20 Batch Settlement Cycle with Dispute Exclusions', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });
  const scheduler = new N8nSchedulerEngine({ dbAdapter: adapter });

  // 1. Record 3 Valid Authorized Transactions
  await adapter.recordTransaction({ transaction_id: 'tx-sun-01', amount_cents: 2500, asset_code: 'AWP-CRD-001-TCG' });
  await adapter.recordTransaction({ transaction_id: 'tx-sun-02', amount_cents: 4000, asset_code: 'AWP-BOK-001-STORY' });
  await adapter.recordTransaction({ transaction_id: 'tx-sun-03', amount_cents: 1500, asset_code: 'AWP-BOK-002-COLOR' });

  // 2. Record 1 Frozen Dispute Transaction
  await adapter.recordTransaction({ transaction_id: 'tx-sun-04-frozen', amount_cents: 5000, asset_code: 'AWP-PST-001-ART' });
  await adapter.freezeTransaction('tx-sun-04-frozen', 'COUNTERFEIT_ALERT');

  // 3. Execute Sunday Batch Settlement
  const batchRes = await scheduler.executeSundaySettlement();

  assert.equal(batchRes.status, 'SUCCESS');
  assert.equal(batchRes.summary.settled_count, 3);
  assert.equal(batchRes.summary.total_amount_cents, 8000); // 2500 + 4000 + 1500 = 8000 cents (€80.00)
  assert.equal(batchRes.summary.total_eur, '80.00');
  assert.deepEqual(batchRes.summary.cleared_transactions, ['tx-sun-01', 'tx-sun-02', 'tx-sun-03']);
  assert.ok(batchRes.evidence_hash.startsWith('sha256-'));

  // Verify frozen transaction remained untouched
  const frozenTx = await adapter.getTransaction('tx-sun-04-frozen');
  assert.equal(frozenTx.status, 'DISPUTE_FROZEN');
  assert.equal(frozenTx.settled_at, null);
});

test('n8n Scheduler: Ingest Webhook Dispatcher', async () => {
  const adapter = new PostgresGovernanceAdapter({ forceMemory: true });
  const scheduler = new N8nSchedulerEngine({ dbAdapter: adapter });

  const webhookRes = await scheduler.handleN8nWebhook({
    trigger_type: 'n8n-cron-sunday-1620'
  });

  assert.equal(webhookRes.status, 'SUCCESS');
  assert.equal(webhookRes.event, 'SUNDAY_BATCH_SETTLEMENT');
});
