import hashlib
import json
import time
from typing import Dict, Any

class RoomOfRefusalRm10Simulator:
    """
    Room of Refusal (RM-10) Physical-Digital Veto Engine Simulator
    Document ID: DVA-RM10-REFUSAL-2026
    Coordinates the 6-stage physical-digital lever execution sequence:
    1. NC-25 Silent Vestibule Arrival & Matte Slate Threshold
    2. 15N Patinated Bronze Typographic Press Lever Depressed
    3. Low-Voltage Voltage Drop Signal
    4. ARIOS Governor Intercept & FIDO2 Touch Signature
    5. PostgreSQL Append-Only Human Discard Commit
    6. Automation Token Revocation & Decision Passport Receipt Printing
    """

    def __init__(self):
        self.genesis_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        self.refusal_ledger = []
        self.dual_custody_active = True

    def execute_physical_veto(self,
                             steward_id: str,
                             role: str,
                             target_action_id: str,
                             lever_force_newtons: float = 15.0,
                             shield_lifted: bool = True,
                             fido2_signature: str = None) -> Dict[str, Any]:

        # 1. Two-Stage Safety Shield & Force Check
        if not shield_lifted:
            return {
                "status": "VETO_ABORTED_SAFETY_SHIELD_CLOSED",
                "reason": "Polycarbonate safety shield was not lifted."
            }

        if lever_force_newtons < 15.0:
            return {
                "status": "VETO_ABORTED_INSUFFICIENT_STROKE_FORCE",
                "force_applied": lever_force_newtons,
                "required_force": 15.0,
                "reason": f"Lever force of {lever_force_newtons}N is below required 15N mechanical threshold."
            }

        # 2. Cryptographic FIDO2 Touch Verification
        if not fido2_signature:
            return {
                "status": "VETO_ABORTED_MISSING_FIDO2_SIGNATURE",
                "reason": "ARIOS Governor intercepted signal but WebAuthn/FIDO2 touch signature is missing."
            }

        # 3. PostgreSQL Append-Only Ledger Commit
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        prev_hash = self.refusal_ledger[-1]["entry_hash"] if self.refusal_ledger else self.genesis_hash
        payload_str = f"{steward_id}:{role}:{target_action_id}:{timestamp}:{prev_hash}:{fido2_signature}"
        entry_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()

        record = {
            "seq": len(self.refusal_ledger) + 1,
            "steward_id": steward_id,
            "role": role,
            "target_action_id": target_action_id,
            "lever_snap_verified": True,
            "force_newtons": lever_force_newtons,
            "timestamp": timestamp,
            "fido2_signature": fido2_signature,
            "prev_hash": prev_hash,
            "entry_hash": entry_hash,
            "state": "HUMAN_DISCARD_TOKEN_REVOKED"
        }
        self.refusal_ledger.append(record)

        return {
            "status": "VETO_COMMITTED_AUTOMATION_FROZEN",
            "inscribed_mandate": "Should this decision have been automated at all?",
            "committed_record": record,
            "decision_passport_receipt": f"RM10-VETO-SEQ{record['seq']}:{entry_hash[:16]}"
        }

def main():
    print("=" * 80)
    print("ROOM OF REFUSAL (RM-10) PHYSICAL-DIGITAL VETO SIMULATOR")
    print("=" * 80)

    sim = RoomOfRefusalRm10Simulator()

    # Test 1: Veto attempted without lifting safety shield
    res1 = sim.execute_physical_veto("usr_david_001", "FOUNDER", "act_n8n_publish_99", shield_lifted=False)
    print(f"Test 1 (Shield Closed): {res1['status']} | Reason: {res1.get('reason')}")

    # Test 2: Veto attempted with weak force (< 15N)
    res2 = sim.execute_physical_veto("usr_david_001", "FOUNDER", "act_n8n_publish_99", shield_lifted=True, lever_force_newtons=8.5)
    print(f"Test 2 (8.5N Force): {res2['status']} | Force: {res2.get('force_applied')}N")

    # Test 3: Valid Veto Execution (15N Force + FIDO2 Touch Signature)
    res3 = sim.execute_physical_veto("usr_david_001", "FOUNDER", "act_n8n_publish_99", shield_lifted=True, lever_force_newtons=15.0, fido2_signature="SIG_FIDO2_DAVID_0x80D0ADA1")
    print(f"\nTest 3 (15N Force + FIDO2): {res3['status']}")
    print(f"Inscribed Mandate: '{res3.get('inscribed_mandate')}'")
    print(f"Receipt Issued: {res3.get('decision_passport_receipt')}")
    print(f"Entry Hash: {res3['committed_record']['entry_hash']}")
    print("=" * 80)

if __name__ == "__main__":
    main()
