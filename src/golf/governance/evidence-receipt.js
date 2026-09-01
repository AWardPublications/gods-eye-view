/**
 * Alex Wenger² Cryptographic Evidence Receipt & Ledger Generator
 * Produces audit packages complying with DNSL Spine ART-001 & AUD-002
 */

import { createHash } from 'node:crypto';
import { existsSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export class EvidenceReceiptGenerator {
  static generateReceipt(executionPackage, options = {}) {
    const runId = executionPackage.run_id || `run-${Date.now()}`;
    const timestamp = Date.now();
    const isoTime = new Date(timestamp).toISOString();

    const manifest = {
      project_id: "ALEX_WENGER",
      patent_reference: "PCT/IE2025/050001",
      workflow_id: "WENGER_ADAPTIVE_COACHING_v1",
      run_id: runId,
      player_id: executionPackage.player_id || "urn:davincia:athlete:alex_wenger",
      mode: executionPackage.mode || "TRAIN",
      timestamp,
      iso_time: isoTime,
      status: executionPackage.routing_result?.status || "UNKNOWN",
      evidence_ref: `urn:davincia:evidence:wenger:${runId}`
    };

    const serializedPayload = JSON.stringify({
      manifest,
      signals: executionPackage.signals,
      compliance: executionPackage.compliance,
      thresholds: executionPackage.thresholds,
      tone_state: executionPackage.tone_state,
      routing: executionPackage.routing_result,
      output: executionPackage.output
    });

    // Standard Cryptographic SHA-256 Hash
    const integrityHash = `sha256-${createHash('sha256').update(serializedPayload).digest('hex')}`;

    const receipt = {
      manifest,
      evidence_hash: integrityHash,
      serialized_package: serializedPayload,
      evidence_ref: manifest.evidence_ref
    };

    // Persistence to Disk (Ledger & Individual Package)
    const writeToDisk = options.writeToDisk !== false;
    const baseDir = options.baseDir || path.resolve(process.cwd(), 'data');

    if (writeToDisk) {
      try {
        const pkgDir = path.join(baseDir, 'evidence-packages');
        if (!existsSync(pkgDir)) {
          mkdirSync(pkgDir, { recursive: true });
        }

        // 1. Write individual evidence package
        const pkgPath = path.join(pkgDir, `${runId}.json`);
        writeFileSync(pkgPath, JSON.stringify(receipt, null, 2), 'utf8');

        // 2. Append entry to evidence-ledger.jsonl
        const ledgerPath = path.join(baseDir, 'evidence-ledger.jsonl');
        const ledgerEntry = {
          event_id: `urn:davincia:event:${runId}`,
          evidence_ref: manifest.evidence_ref,
          run_id: runId,
          timestamp,
          iso_time: isoTime,
          project_id: "ALEX_WENGER",
          mode: manifest.mode,
          status: manifest.status,
          evidence_hash: integrityHash
        };
        appendFileSync(ledgerPath, JSON.stringify(ledgerEntry) + '\n', 'utf8');
      } catch (e) {
        console.error("[EvidenceReceiptGenerator] Warning: Failed to persist evidence to disk:", e);
      }
    }

    return receipt;
  }
}
