import hashlib
import json
import time
from typing import List, Dict, Any

class IntelligenceElevatorRm05Simulator:
    """
    Intelligence Elevator (RM-05) & Independent Replay Verifier Simulator
    Maps 6 Personas (PUBLIC, CLIENT, CONTRACTOR, INVESTOR, BOARD_MEMBER, FOUNDER)
    across 8 Floors (FL-1 to FL-8), handling WebAuthn FIDO2 attestations,
    mechanical Decision Passport 1000mm AFFL print-head hashing, and analog safety isolation.
    """

    FLOORS = {
        1: {"name": "Floor 1: Ground Concourse & Public Gallery", "min_role": "PUBLIC"},
        2: {"name": "Floor 2: Client Lounge & Reception", "min_role": "CLIENT"},
        3: {"name": "Floor 3: Contractor Engineering Bay", "min_role": "CONTRACTOR"},
        4: {"name": "Floor 4: Investor Deal Room & Cap Table Deck", "min_role": "INVESTOR"},
        5: {"name": "Floor 5: Board Room & Corporate Governance", "min_role": "BOARD_MEMBER"},
        6: {"name": "Floor 6: Founder's Office & Sovereign Suite", "min_role": "FOUNDER"},
        7: {"name": "Floor 7: Authority Core & HITL Panel Chamber", "min_role": "FOUNDER"},
        8: {"name": "Floor 8: Secure Vault & GnuPG Key Enclave", "min_role": "FOUNDER"}
    }

    ROLE_CLEARANCE = {
        "PUBLIC": [1],
        "CLIENT": [1, 2],
        "CONTRACTOR": [1, 2, 3],
        "INVESTOR": [1, 2, 4],
        "BOARD_MEMBER": [1, 2, 4, 5],
        "FOUNDER": [1, 2, 3, 4, 5, 6, 7, 8]
    }

    def __init__(self):
        self.genesis_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        self.passport_entries = []

    def request_floor_transition(self, user_id: str, role: str, target_floor: int, fido2_touch: bool = True) -> Dict[str, Any]:
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # 1. Role-to-Floor Clearance Check
        cleared_floors = self.ROLE_CLEARANCE.get(role, [])
        if target_floor not in cleared_floors:
            return {
                "status": "TRANSITION_DENIED_UNAUTHORIZED_FLOOR",
                "role": role,
                "target_floor": target_floor,
                "reason": f"Role {role} is not cleared for Floor {target_floor}.",
                "rm10_routed": True
            }

        if not fido2_touch:
            return {
                "status": "TRANSITION_DENIED_MISSING_FIDO2_TOUCH",
                "reason": "WebAuthn/FIDO2 touch-scanner signal missing.",
                "rm10_routed": True
            }

        # 2. Decision Passport Dot-Matrix Impact Print Hash Calculation
        prev_hash = self.passport_entries[-1]["entry_hash"] if self.passport_entries else self.genesis_hash
        payload_str = f"{user_id}:{role}:{target_floor}:{timestamp}:{prev_hash}"
        entry_hash = hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
        qr_code_payload = f"RM05:FL{target_floor}:{entry_hash[:16]}"

        entry = {
            "seq": len(self.passport_entries) + 1,
            "user_id": user_id,
            "role": role,
            "target_floor": target_floor,
            "floor_name": self.FLOORS[target_floor]["name"],
            "timestamp": timestamp,
            "prev_hash": prev_hash,
            "entry_hash": entry_hash,
            "qr_code_payload": qr_code_payload
        }
        self.passport_entries.append(entry)

        return {
            "status": "ELEVATOR_CAR_DISPATCHED",
            "active_role_flap_display": f"ROLE: {role}",
            "floor_arrived": target_floor,
            "printed_entry": entry
        }

    def verify_scanned_passport(self, scanned_entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Independent Replay Verifier (RM-02 Flatbed Scanner Simulation)
        """
        prev_hash = self.genesis_hash
        for idx, entry in enumerate(scanned_entries):
            # Check Role Clearance for floor
            cleared = self.ROLE_CLEARANCE.get(entry["role"], [])
            if entry["target_floor"] not in cleared:
                return {
                    "verified": False,
                    "error_at_seq": entry["seq"],
                    "reason": f"UNAUTHORIZED TRANSITION DETECTED at Seq {entry['seq']}: {entry['role']} visited Floor {entry['target_floor']}"
                }

            # Check Spanning Hash Chain
            if entry["prev_hash"] != prev_hash:
                return {
                    "verified": False,
                    "error_at_seq": entry["seq"],
                    "reason": f"CHAIN SPLIT DETECTED at Seq {entry['seq']}: expected {prev_hash}, got {entry['prev_hash']}"
                }

            expected_hash = hashlib.sha256(f"{entry['user_id']}:{entry['role']}:{entry['target_floor']}:{entry['timestamp']}:{prev_hash}".encode("utf-8")).hexdigest()
            if entry["entry_hash"] != expected_hash:
                return {
                    "verified": False,
                    "error_at_seq": entry["seq"],
                    "reason": f"TAMPERED HASH DETECTED at Seq {entry['seq']}"
                }

            prev_hash = entry["entry_hash"]

        return {
            "verified": True,
            "scanned_count": len(scanned_entries),
            "status": "ALL_TRANSITIONS_RECONSTRUCTED_AND_AUTHENTICATED"
        }

def main():
    print("=" * 80)
    print("DAVINCIA INTELLIGENCE ELEVATOR (RM-05) & REPLAY VERIFIER SIMULATOR")
    print("=" * 80)

    sim = IntelligenceElevatorRm05Simulator()

    # Transition 1: Founder visits Floor 8 (Vault)
    t1 = sim.request_floor_transition("usr_david_001", "FOUNDER", 8, fido2_touch=True)
    print(f"Transition 1 (Founder -> Floor 8): {t1['status']} | Flap: {t1.get('active_role_flap_display')}")

    # Transition 2: Client visits Floor 2 (Client Lounge)
    t2 = sim.request_floor_transition("usr_client_99", "CLIENT", 2, fido2_touch=True)
    print(f"Transition 2 (Client -> Floor 2): {t2['status']}")

    # Transition 3: Client attempts Floor 6 (Founder's Floor - SHOULD DENY)
    t3 = sim.request_floor_transition("usr_client_99", "CLIENT", 6, fido2_touch=True)
    print(f"Transition 3 (Client -> Floor 6): {t3['status']} | Reason: {t3.get('reason')}")

    # Replay Verifier Check on Valid Passport Log
    replay_res = sim.verify_scanned_passport(sim.passport_entries)
    print(f"\nIndependent Replay Verifier Result: {replay_res['status']} (Verified: {replay_res['verified']})")

    # Adversarial Attack Simulation: Inject fake Floor 8 transition into Client's passport
    tampered_entries = [dict(e) for e in sim.passport_entries]
    tampered_entries.append({
        "seq": 3,
        "user_id": "usr_client_99",
        "role": "CLIENT",
        "target_floor": 8,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "prev_hash": sim.passport_entries[-1]["entry_hash"],
        "entry_hash": "f" * 64
    })

    attack_res = sim.verify_scanned_passport(tampered_entries)
    print(f"Adversarial Attack Verification (Fake Floor Insertion): {'REJECTED (SECURE)' if not attack_res['verified'] else 'FAIL'}")
    print(f"Attack Rejection Reason: {attack_res['reason']}")
    print("=" * 80)

if __name__ == "__main__":
    main()
