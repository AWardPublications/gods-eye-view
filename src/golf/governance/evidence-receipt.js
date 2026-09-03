/**
 * Alex Wenger² Cryptographic Evidence Receipt & Ledger Generator
 * Produces audit packages complying with DNSL Spine ART-001 & AUD-002
 * Isomorphic: supports Node.js filesystem persistence and browser client hashing.
 */

function getNodeBuiltins() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const crypto = process.getBuiltinModule('node:crypto');
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      return { crypto, fs, path };
    } catch (e) {}
  }
  return { crypto: null, fs: null, path: null };
}

function fallbackHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `sha256-fallback-${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

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

    const { crypto, fs, path } = getNodeBuiltins();

    let integrityHash = fallbackHash(serializedPayload);
    if (crypto) {
      integrityHash = `sha256-${crypto.createHash('sha256').update(serializedPayload).digest('hex')}`;
    }

    const receipt = {
      manifest,
      evidence_hash: integrityHash,
      serialized_package: serializedPayload,
      evidence_ref: manifest.evidence_ref
    };

    // Persistence in Node.js environment
    const writeToDisk = options.writeToDisk !== false;
    if (writeToDisk && fs && path) {
      try {
        const baseDir = options.baseDir || path.resolve(process.cwd(), 'data');
        const pkgDir = path.join(baseDir, 'evidence-packages');
        if (!fs.existsSync(pkgDir)) {
          fs.mkdirSync(pkgDir, { recursive: true });
        }

        // 1. Write individual evidence package
        const pkgPath = path.join(pkgDir, `${runId}.json`);
        fs.writeFileSync(pkgPath, JSON.stringify(receipt, null, 2), 'utf8');

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
        fs.appendFileSync(ledgerPath, JSON.stringify(ledgerEntry) + '\n', 'utf8');
      } catch (e) {
        console.error("[EvidenceReceiptGenerator] Warning: Failed to persist evidence to disk:", e);
      }
    }

    return receipt;
  }
}
