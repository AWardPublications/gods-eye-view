#!/usr/bin/env node
/**
 * Alex Wenger² Standalone Evidence Replay Engine
 * Reconstructs longitudinal coaching states solely from on-disk evidence packages.
 */

import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

export function replayEvidencePackage(pkgPath) {
  if (!existsSync(pkgPath)) {
    throw new Error(`FILE_NOT_FOUND: Evidence package not found at '${pkgPath}'`);
  }

  const rawJson = readFileSync(pkgPath, 'utf8');
  const receipt = JSON.parse(rawJson);

  // 1. Verify Cryptographic Integrity
  const calculatedHash = `sha256-${createHash('sha256').update(receipt.serialized_package).digest('hex')}`;
  const isIntegrityValid = (calculatedHash === receipt.evidence_hash);

  if (!isIntegrityValid) {
    throw new Error(`INTEGRITY_COMPROMISED: Hash mismatch on '${pkgPath}'. Expected ${receipt.evidence_hash}, calculated ${calculatedHash}`);
  }

  // 2. Unpack Serialized State
  const state = JSON.parse(receipt.serialized_package);

  return {
    verified: true,
    run_id: receipt.manifest.run_id,
    player_id: receipt.manifest.player_id,
    timestamp: receipt.manifest.timestamp,
    iso_time: receipt.manifest.iso_time,
    evidence_hash: receipt.evidence_hash,
    evidence_ref: receipt.evidence_ref,
    mode: receipt.manifest.mode,
    signals: state.signals,
    compliance: state.compliance,
    thresholds: state.thresholds,
    tone_state: state.tone_state,
    routing: state.routing,
    output: state.output
  };
}

// CLI Execution Support
if (process.argv[1] && process.argv[1].endsWith('replay-session.mjs')) {
  const targetPath = process.argv[2];
  if (!targetPath) {
    console.error("Usage: node scripts/replay-session.mjs <path-to-evidence-package.json>");
    process.exit(1);
  }

  try {
    const replayResult = replayEvidencePackage(path.resolve(process.cwd(), targetPath));
    console.log("================================================================================");
    console.log("              ALEX WENGER² EVIDENCE REPLAY VERIFICATION PASSED                  ");
    console.log("================================================================================");
    console.log(`Run ID:        ${replayResult.run_id}`);
    console.log(`Player ID:     ${replayResult.player_id}`);
    console.log(`Evidence Ref:  ${replayResult.evidence_ref}`);
    console.log(`SHA-256 Hash:  ${replayResult.evidence_hash}`);
    console.log(`Tone State:    ${replayResult.tone_state.current_state}`);
    console.log(`Pathway:       ${replayResult.routing.pathway}`);
    console.log(`Modality:      ${replayResult.output.delivery_modality}`);
    console.log(`Coaching Text: "${replayResult.output.text}"`);
    console.log("================================================================================");
  } catch (err) {
    console.error("REPLAY ERROR:", err.message);
    process.exit(1);
  }
}
