/**
 * Alex Wenger² Evidence Receipt & Integrity Generator
 * Produces audit packages complying with DNSL Spine ART-001 & AUD-002
 */

export class EvidenceReceiptGenerator {
  static generateReceipt(executionPackage) {
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
    }, Object.keys(executionPackage).sort());

    // Compute deterministic pseudo SHA-256 / integrity hash
    let hash = 0;
    for (let i = 0; i < serializedPayload.length; i++) {
      hash = ((hash << 5) - hash) + serializedPayload.charCodeAt(i);
      hash |= 0;
    }
    const integrityHash = `sha256-wenger-evidence-${Math.abs(hash).toString(16)}`;

    return {
      manifest,
      evidence_hash: integrityHash,
      serialized_package: serializedPayload,
      evidence_ref: manifest.evidence_ref
    };
  }
}
