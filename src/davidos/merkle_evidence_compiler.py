import hashlib
import json
import time
from typing import List, Dict, Any, Tuple

class MerkleEvidenceCompiler:
    """
    High-Throughput Merkle Evidence Compiler (DAVINCIA-SCALE-50K-v1.0)
    Batches thousands of concurrent user decision payloads into a dynamic Merkle Tree,
    generating a single Epoch Root Hash for append-only audit log storage
    and O(log N) cryptographic membership proofs for individual user verification.
    """

    def __init__(self):
        pass

    def _hash_leaf(self, payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True).encode('utf-8')
        return hashlib.sha256(serialized).hexdigest()

    def _hash_pair(self, left: str, right: str) -> str:
        combined = (left + right).encode('utf-8')
        return hashlib.sha256(combined).hexdigest()

    def build_merkle_tree(self, payloads: List[Dict[str, Any]]) -> Tuple[str, List[List[str]], List[str]]:
        if not payloads:
            raise ValueError("Payload list cannot be empty.")

        # Step 1: Hash all leaves
        leaves = [self._hash_leaf(p) for p in payloads]
        current_layer = list(leaves)
        tree_layers = [current_layer]

        # Step 2: Build tree upwards
        while len(current_layer) > 1:
            next_layer = []
            for i in range(0, len(current_layer), 2):
                left = current_layer[i]
                right = current_layer[i + 1] if i + 1 < len(current_layer) else left
                parent = self._hash_pair(left, right)
                next_layer.append(parent)
            current_layer = next_layer
            tree_layers.append(current_layer)

        root_hash = tree_layers[-1][0]
        return root_hash, tree_layers, leaves

    def generate_membership_proof(self, leaf_index: int, tree_layers: List[List[str]]) -> List[Dict[str, str]]:
        proof = []
        idx = leaf_index

        for layer in tree_layers[:-1]:
            is_right = (idx % 2 == 1)
            pair_idx = idx - 1 if is_right else idx + 1

            if pair_idx < len(layer):
                sibling_hash = layer[pair_idx]
            else:
                sibling_hash = layer[idx] # Duplicate last node if odd

            proof.append({
                "position": "left" if is_right else "right",
                "sibling": sibling_hash
            })
            idx = idx // 2

        return proof

    def verify_membership_proof(self, leaf_hash: str, proof: List[Dict[str, str]], expected_root: str) -> bool:
        current = leaf_hash
        for step in proof:
            sibling = step["sibling"]
            if step["position"] == "right":
                current = self._hash_pair(current, sibling)
            else:
                current = self._hash_pair(sibling, current)
        return current == expected_root


def main():
    print("=" * 80)
    print("DAVINCIA 50K SCALE: HIGH-THROUGHPUT MERKLE EVIDENCE COMPILER BENCHMARK")
    print("=" * 80)

    # Simulate 1,000 concurrent user decisions
    batch_size = 1000
    print(f"Generating {batch_size} concurrent Decision Passport transactions...")

    payloads = [
        {
            "user_id": f"user_50k_{i:04d}",
            "decision": "APPROVE_WORKFLOW",
            "action": "SUBMIT_EVIDENCE",
            "timestamp": time.time() + (i * 0.001)
        }
        for i in range(batch_size)
    ]

    compiler = MerkleEvidenceCompiler()
    start_time = time.time()
    root_hash, tree_layers, leaves = compiler.build_merkle_tree(payloads)
    duration = time.time() - start_time

    print(f"SUCCESS: Compiled Merkle Tree for {batch_size} transactions in {duration:.4f} seconds!")
    print(f"Epoch Root Hash: {root_hash}")
    print(f"Merkle Tree Height: {len(tree_layers)} layers")

    # Verify O(log N) proof for User #427
    target_idx = 427
    target_leaf_hash = leaves[target_idx]
    proof = compiler.generate_membership_proof(target_idx, tree_layers)

    print(f"\nVerifying membership proof for User #{target_idx} (Proof length: {len(proof)} steps)...")
    is_valid = compiler.verify_membership_proof(target_leaf_hash, proof, root_hash)

    print(f"Cryptographic Proof Result: {'VALID (MATCHES ROOT)' if is_valid else 'INVALID'}")
    assert is_valid, "Merkle membership proof verification failed!"
    print("=" * 80)

if __name__ == "__main__":
    main()
