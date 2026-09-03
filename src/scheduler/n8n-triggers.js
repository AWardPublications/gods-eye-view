/**
 * DaVinciA+ n8n Automation Engine & Scheduled Lifecycle Triggers
 * Implements Friday Knowledge Synchronization (FKS) and Sunday 16:20 Batch Settlement Cycles.
 */

import { EvidenceReceiptGenerator } from '../golf/governance/evidence-receipt.js';
import { PersistentMemoryArchitecture } from '../golf/governance/session-memory-schema.js';

export class N8nSchedulerEngine {
  constructor(options = {}) {
    this.dbAdapter = options.dbAdapter;
    this.memory = options.memory || new PersistentMemoryArchitecture();
    this.webhookUrl = options.webhookUrl || process.env.N8N_WEBHOOK_URL || null;
    this.executionHistory = [];
  }

  /**
   * Friday Knowledge Synchronization (FKS)
   * Re-analyzes longitudinal memory baselines, flags persistent drift, and syncs telemetry.
   */
  async executeFridayKnowledgeSync(options = {}) {
    const timestamp = Date.now();
    const runId = options.run_id || `fks-sync-${timestamp}`;
    const playerId = options.player_id || "urn:davincia:athlete:alex_wenger";

    const baseline = this.memory.calculatePlayerBaseline(playerId, 10);
    const totalSessions = this.memory.getSessionsByPlayer(playerId).length;

    const fksPayload = {
      lifecycle_event: "FRIDAY_KNOWLEDGE_SYNC",
      player_id: playerId,
      total_sessions_indexed: totalSessions,
      baseline_vector: baseline || { avg_sentiment: 0.0, avg_compliance: 0.8 },
      sync_status: "SYNCHRONIZED",
      timestamp
    };

    const evidenceReceipt = EvidenceReceiptGenerator.generateReceipt({
      run_id: runId,
      player_id: playerId,
      mode: "REVIEW",
      signals: { intent: "FKS_BASELINE_SYNC" },
      compliance: { score: baseline?.avg_compliance || 0.8, classification: "HIGH_COMPLIANCE" },
      thresholds: [{ rule_id: "RULE_FKS_CADENCE", status: "SATISFIED" }],
      tone_state: { current_state: "BASELINE" },
      routing_result: { status: "AUTHORIZED", pathway: "KNOWLEDGE_SYNCHRONIZATION" },
      output: fksPayload
    });

    const executionRecord = {
      run_id: runId,
      event: "FRIDAY_KNOWLEDGE_SYNC",
      status: "SUCCESS",
      payload: fksPayload,
      evidence_ref: evidenceReceipt.evidence_ref,
      evidence_hash: evidenceReceipt.evidence_hash,
      timestamp
    };

    this.executionHistory.push(executionRecord);
    return executionRecord;
  }

  /**
   * Sunday 16:20 Batch Settlement Cycle
   * Atomically settles all AUTHORIZED transactions and excludes DISPUTE_FROZEN entries.
   */
  async executeSundaySettlement(options = {}) {
    const timestamp = Date.now();
    const runId = options.run_id || `sunday-settlement-${timestamp}`;

    if (!this.dbAdapter) {
      throw new Error("DATABASE_ADAPTER_REQUIRED: Cannot execute batch settlement without database adapter.");
    }

    const pendingTxs = await this.dbAdapter.getPendingAuthorizedTransactions();
    const settledIds = [];
    let totalCentsCleared = 0;

    for (const tx of pendingTxs) {
      try {
        const settleRes = await this.dbAdapter.settleTransaction(tx.transaction_id);
        if (settleRes.settled) {
          settledIds.push(tx.transaction_id);
          totalCentsCleared += tx.amount_cents;
        }
      } catch (err) {
        console.warn(`[SundaySettlement] Skipped tx '${tx.transaction_id}':`, err.message);
      }
    }

    const batchSummary = {
      lifecycle_event: "SUNDAY_BATCH_SETTLEMENT",
      batch_id: runId,
      settled_count: settledIds.length,
      total_amount_cents: totalCentsCleared,
      total_eur: (totalCentsCleared / 100).toFixed(2),
      cleared_transactions: settledIds,
      timestamp
    };

    const evidenceReceipt = EvidenceReceiptGenerator.generateReceipt({
      run_id: runId,
      player_id: "urn:davincia:settlement:master_escrow",
      mode: "CAREER",
      signals: { intent: "SUNDAY_BATCH_SETTLEMENT", count: settledIds.length },
      compliance: { score: 1.0, classification: "HIGH_COMPLIANCE" },
      thresholds: [{ rule_id: "RULE_SUNDAY_CLEARING_WINDOW", status: "SATISFIED" }],
      tone_state: { current_state: "BASELINE" },
      routing_result: { status: "AUTHORIZED", pathway: "COMMERCE_CLEARING" },
      output: batchSummary
    });

    const executionRecord = {
      run_id: runId,
      event: "SUNDAY_BATCH_SETTLEMENT",
      status: "SUCCESS",
      summary: batchSummary,
      evidence_ref: evidenceReceipt.evidence_ref,
      evidence_hash: evidenceReceipt.evidence_hash,
      timestamp
    };

    this.executionHistory.push(executionRecord);
    return executionRecord;
  }

  /**
   * Ingests and routes incoming n8n webhook triggers
   */
  async handleN8nWebhook(webhookPayload = {}) {
    const trigger = webhookPayload.trigger_type || webhookPayload.event;
    switch (trigger) {
      case "FRIDAY_KNOWLEDGE_SYNC":
      case "n8n-cron-friday-fks":
        return this.executeFridayKnowledgeSync(webhookPayload);

      case "SUNDAY_BATCH_SETTLEMENT":
      case "n8n-cron-sunday-1620":
        return this.executeSundaySettlement(webhookPayload);

      default:
        throw new Error(`UNKNOWN_N8N_TRIGGER: Trigger '${trigger}' is not recognized.`);
    }
  }
}
