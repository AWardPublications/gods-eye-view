import hashlib
import json
import time
from typing import List, Dict, Any, Tuple

class SimulatedDocumentPipeline:
    """
    HITL Document Promotion Pipeline FSM Simulator (DVA-DOC-FSM-2026)
    Enforces Gates 1-4 State Machine:
    Gate 1: Draft Gate (Narrative allowed with placeholders)
    Gate 2: Editorial Gate (Zero CRITICAL/IMPORTANT placeholders allowed)
    Gate 3: Governance Gate (Zero open placeholders of any priority, claims hashed)
    Gate 4: Press Gate (Cryptographic GPG/WebAuthn Human Release Seal required)
    """

    def __init__(self):
        self.genesis_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        self.audit_log = []

    def log_audit_event(self, doc_id: str, gate_name: str, state: str, payload: Dict[str, Any]) -> str:
        prev_hash = self.audit_log[-1]["entry_hash"] if self.audit_log else self.genesis_hash
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        serialized = f"{doc_id}:{gate_name}:{state}:{json.dumps(payload, sort_keys=True)}:{prev_hash}:{timestamp}"
        entry_hash = hashlib.sha256(serialized.encode("utf-8")).hexdigest()

        log_entry = {
            "entry_id": len(self.audit_log) + 1,
            "doc_id": doc_id,
            "gate": gate_name,
            "state": state,
            "payload": payload,
            "prev_hash": prev_hash,
            "entry_hash": entry_hash,
            "timestamp": timestamp
        }
        self.audit_log.append(log_entry)
        return entry_hash

    def evaluate_draft(self, manuscript: Dict[str, Any], release_signature: str = None) -> Dict[str, Any]:
        doc_id = manuscript.get("doc_id", "DOC-UNKNOWN")

        # --- GATE 1: DRAFT GATE ---
        self.log_audit_event(doc_id, "GATE_1_DRAFT", "PASSED", {"title": manuscript["title"]})

        # --- GATE 2: EDITORIAL GATE ---
        placeholders = manuscript.get("placeholders", [])
        critical_or_important = [p for p in placeholders if p.get("priority") in ["CRITICAL", "IMPORTANT"] and p.get("status") == "OPEN"]
        if critical_or_important:
            self.log_audit_event(doc_id, "GATE_2_EDITORIAL", "REFUSE", {"open_high_priority_placeholders": len(critical_or_important)})
            return {"status": "BLOCKED_AT_GATE_2", "reason": "CRITICAL/IMPORTANT placeholders open", "rm10_routed": True}
        
        self.log_audit_event(doc_id, "GATE_2_EDITORIAL", "PASSED", {"open_placeholders": len(placeholders)})

        # --- GATE 3: GOVERNANCE GATE ---
        any_open = [p for p in placeholders if p.get("status") == "OPEN"]
        if any_open:
            self.log_audit_event(doc_id, "GATE_3_GOVERNANCE", "REFUSE", {"open_optional_placeholders": len(any_open)})
            return {"status": "BLOCKED_AT_GATE_3", "reason": "Optional placeholders remaining", "rm10_routed": True}

        self.log_audit_event(doc_id, "GATE_3_GOVERNANCE", "PASSED", {"all_placeholders_resolved": True})

        # --- GATE 4: PRESS GATE ---
        if not release_signature or "APPROVED" not in release_signature:
            self.log_audit_event(doc_id, "GATE_4_PRESS", "REFUSE", {"missing_release_signature": True})
            return {"status": "BLOCKED_AT_GATE_4", "reason": "Missing or invalid Human Release Authority signature", "rm10_routed": True}

        self.log_audit_event(doc_id, "GATE_4_PRESS", "PUBLISHED", {"signature": release_signature, "gpg": "0x80D0ADA1"})

        return {
            "status": "PROMOTED_AND_PUBLISHED",
            "doc_id": doc_id,
            "title": manuscript["title"],
            "release_seal": release_signature,
            "audit_trail_length": len(self.audit_log)
        }

def main():
    print("=" * 80)
    print("DAVINCIA HITL DOCUMENT PROMOTION PIPELINE SIMULATOR")
    print("=" * 80)

    pipeline = SimulatedDocumentPipeline()

    # Draft 1: Open Critical Placeholder (Should fail at Gate 2)
    draft1 = {
        "doc_id": "DOC-2026-001",
        "title": "Swiss Alpine Aerodynamics & Telemetry Draft",
        "placeholders": [{"id": "P1", "priority": "CRITICAL", "status": "OPEN"}]
    }
    res1 = pipeline.evaluate_draft(draft1)
    print(f"Draft 1 Result: {res1['status']} (Reason: {res1.get('reason')})")

    # Draft 2: Open Optional Placeholder (Should fail at Gate 3)
    draft2 = {
        "doc_id": "DOC-2026-002",
        "title": "CorkMan Folklore Archive Translation",
        "placeholders": [{"id": "P2", "priority": "LOW", "status": "OPEN"}]
    }
    res2 = pipeline.evaluate_draft(draft2)
    print(f"Draft 2 Result: {res2['status']} (Reason: {res2.get('reason')})")

    # Draft 3 Run 1: All Placeholders Resolved, No Release Signature (Should fail at Gate 4)
    draft3 = {
        "doc_id": "DOC-2026-003",
        "title": "A.Ward Publications Master ISBN Catalogue 2026",
        "placeholders": [{"id": "P3", "priority": "CRITICAL", "status": "CLOSED"}]
    }
    res3_run1 = pipeline.evaluate_draft(draft3, release_signature=None)
    print(f"Draft 3 (Run 1) Result: {res3_run1['status']} (Reason: {res3_run1.get('reason')})")

    # Draft 3 Run 2: Valid Human Release Signature Supplied (Should PROOTE & PUBLISH!)
    res3_run2 = pipeline.evaluate_draft(draft3, release_signature="APPROVED by DP Ward 001 (0x80D0ADA1)")
    print(f"Draft 3 (Run 2) Result: {res3_run2['status']} (Published with Seal: {res3_run2.get('release_seal')})")

    print("=" * 80)

if __name__ == "__main__":
    main()
