import { createHash } from 'node:crypto';

/**
 * MERKLE EVIDENCE COMPILER (DAVINCIA-SCALE-50K-v1.0)
 * Batches thousands of concurrent user decision payloads into a dynamic Merkle Tree,
 * returning the Epoch Root Hash and O(log N) membership proofs.
 */
export class MerkleEvidenceCompiler {
  hashPayload(payload) {
    const serialized = JSON.stringify(payload, Object.keys(payload).sort());
    return createHash('sha256').update(serialized).digest('hex');
  }

  combineHashes(left, right) {
    return createHash('sha256').update(left + right).digest('hex');
  }

  buildMerkleTree(payloads) {
    if (!payloads || payloads.length === 0) {
      throw new Error('Payload array cannot be empty');
    }

    const leaves = payloads.map(p => this.hashPayload(p));
    let currentLayer = [...leaves];
    const treeLayers = [currentLayer];

    while (currentLayer.length > 1) {
      const nextLayer = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = (i + 1 < currentLayer.length) ? currentLayer[i + 1] : left;
        const parent = this.combineHashes(left, right);
        nextLayer.push(parent);
      }
      currentLayer = nextLayer;
      treeLayers.push(currentLayer);
    }

    const rootHash = treeLayers[treeLayers.length - 1][0];
    return { rootHash, treeLayers, leaves };
  }

  generateProof(leafIndex, treeLayers) {
    const proof = [];
    let idx = leafIndex;

    for (let l = 0; l < treeLayers.length - 1; l++) {
      const layer = treeLayers[l];
      const isRight = (idx % 2 === 1);
      const pairIdx = isRight ? idx - 1 : idx + 1;
      const siblingHash = (pairIdx < layer.length) ? layer[pairIdx] : layer[idx];

      proof.push({
        position: isRight ? 'left' : 'right',
        sibling: siblingHash
      });
      idx = Math.floor(idx / 2);
    }

    return proof;
  }

  verifyProof(leafHash, proof, expectedRoot) {
    let current = leafHash;
    for (const step of proof) {
      if (step.position === 'right') {
        current = this.combineHashes(current, step.sibling);
      } else {
        current = this.combineHashes(step.sibling, current);
      }
    }
    return current === expectedRoot;
  }
}
