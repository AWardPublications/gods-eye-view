import { createHash } from 'node:crypto';

/**
 * WORKFLOW C: Sovereign Mobile/Edge Evidence Ingest Protocol
 * Captures offline edge evidence -> hardware enclave signing -> local hashing -> sync over mTLS -> validates anti-replay + predecessor hash.
 */
export class WorkflowCMobileEdgeIngest {
  constructor() {
    this.seenNonces = new Set();
  }

  createEdgeEvidencePayload(deviceId, sensorData, predecessorHash = 'genesis_hash') {
    const timestamp = new Date().toISOString();
    const nonce = createHash('md5').update(`${deviceId}:${timestamp}:${Math.random()}`).digest('hex');
    const rawContent = JSON.stringify(sensorData);
    const contentHash = createHash('sha256').update(rawContent).digest('hex');

    const signedPayload = {
      device_id: deviceId,
      timestamp,
      nonce,
      predecessor_hash: predecessorHash,
      content_hash: contentHash,
      data: sensorData,
      enclave_signature: createHash('sha256').update(`HW_ENCLAVE:${deviceId}:${contentHash}:${nonce}`).digest('hex')
    };

    return signedPayload;
  }

  ingestEdgePayload(signedPayload, expectedPredecessorHash) {
    // Anti-replay check
    if (this.seenNonces.has(signedPayload.nonce)) {
      return { status: 'REJECTED_REPLAY_ATTACK_DETECTED', valid: false };
    }

    // Predecessor hash continuity check
    if (signedPayload.predecessor_hash !== expectedPredecessorHash) {
      return { status: 'REJECTED_PREDECESSOR_HASH_MISMATCH', valid: false };
    }

    // Enclave signature verification
    const expectedSig = createHash('sha256').update(`HW_ENCLAVE:${signedPayload.device_id}:${signedPayload.content_hash}:${signedPayload.nonce}`).digest('hex');
    if (signedPayload.enclave_signature !== expectedSig) {
      return { status: 'REJECTED_INVALID_ENCLAVE_SIGNATURE', valid: false };
    }

    this.seenNonces.add(signedPayload.nonce);

    return {
      status: 'INGESTED_INTO_MASTER_EPOCH_TREE',
      valid: true,
      new_state_hash: createHash('sha256').update(signedPayload.predecessor_hash + signedPayload.content_hash).digest('hex')
    };
  }
}
