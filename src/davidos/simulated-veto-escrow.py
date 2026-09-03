#!/usr/bin/env python3
"""
================================================================================
🌍🟦 DAVID_OS | SYSTEM COMPLIANCE GATEWAY (RM-10 / RM-15)
Decoupled Emergency Veto & Refusal Escrow Simulation Engine
================================================================================
Core Principle: "Nothing is trusted because it happened. Everything is trusted
                 because it can be reconstructed."
================================================================================
"""

import sys
import json
import hashlib
import time
import os
from datetime import datetime

# UTF-8 stdout configuration for Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Define standard room codes from RM-01 to RM-20
ROOMS = {
    "RM-04": "Human Approval Room",
    "RM-05": "Intelligence Elevator",
    "RM-10": "Room of Refusal",
    "RM-15": "AV Compute Backbone"
}

class MerkleChainLog:
    """An append-only cryptographic ledger representing the ARIOS Truth Layer."""
    def __init__(self, output_path):
        self.output_path = output_path
        self.last_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        self.entry_id = 0
        
        # Ensure parent directory exists
        parent_dir = os.path.dirname(self.output_path)
        if parent_dir and not os.path.exists(parent_dir):
            os.makedirs(parent_dir, exist_ok=True)

        # Clear/initialize the log file
        with open(self.output_path, "w", encoding="utf-8") as f:
            f.write("")

    def commit(self, tenant_id, principal_id, room_code, event_type, payload):
        """Commits a block to the immutable audit log, calculating the spanning chain hash."""
        self.entry_id += 1
        timestamp = datetime.now().isoformat() + "Z"
        
        # Calculate SHA-256 spanning hash: concat(tenant, principal, room, event, payload, prev_hash, timestamp)
        raw_payload_str = json.dumps(payload, sort_keys=True)
        hash_input = f"{tenant_id}{principal_id}{room_code}{event_type}{raw_payload_str}{self.last_hash}{timestamp}"
        entry_hash = hashlib.sha256(hash_input.encode("utf-8")).hexdigest()
        
        log_entry = {
            "tenant_id": tenant_id,
            "entry_id": self.entry_id,
            "principal_id": principal_id,
            "room_code": room_code,
            "event_type": event_type,
            "payload": payload,
            "prev_hash": self.last_hash,
            "entry_hash": entry_hash,
            "timestamp": timestamp
        }
        
        with open(self.output_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
            
        self.last_hash = entry_hash
        return entry_hash


class DecoupledVetoEscrow:
    """Simulates the physical-digital decoupling loop of the Room of Refusal (RM-10)."""
    def __init__(self, ledger_path):
        self.ledger = MerkleChainLog(ledger_path)
        self.tenant_id = "TENANT-BAIS-SOCIETY"
        self.system_state = "HEALTHY"
        self.spatial_zones = {"RM-05": "ACTIVE", "RM-10": "READY"}
        self.process_velocity = 1.0  # Normalized speed
        
        # Define mock principals matching the AGR (Agent-Group-Role) model
        self.principals = {
            "DP_WARD_001": {
                "display_name": "David Ward",
                "role": "FOUNDER",
                "scopes": ["RM-01", "RM-02", "RM-04", "RM-05", "RM-10", "RM-15"],
                "gpg_key": "0x80D0ADA1_WARD"
            },
            "ST_MILLS_002": {
                "display_name": "Gary Mills",
                "role": "BOARD_MEMBER",
                "scopes": ["RM-04", "RM-10"],
                "gpg_key": "0x44B0FDE2_MILLS",
                "group": "COORDINATOR"
            },
            "ST_DALY_003": {
                "display_name": "Adrian Daly",
                "role": "BOARD_MEMBER",
                "scopes": ["RM-04", "RM-10"],
                "gpg_key": "0x80D0ADA1_DALY",
                "group": "CORK_BAN"  # Fairness / Ethics
            },
            "ST_MCCARTHY_004": {
                "display_name": "David McCarthy",
                "role": "BOARD_MEMBER",
                "scopes": ["RM-04", "RM-10"],
                "gpg_key": "0x55E9FBA3_MCCARTHY",
                "group": "CORK_RI"   # Strategy / Context
            },
            "ST_SAMMY_005": {
                "display_name": "Sammy D",
                "role": "CONTRACTOR",
                "scopes": ["RM-04", "RM-10", "RM-15"],
                "gpg_key": "0xAA44B8C1_SAMMY",
                "group": "SAMMY_D"   # Audit / Receipts
            }
        }
        
    def check_conflicts(self, proposed_asset_owner, stewards):
        """Enforces that court stewards hold no conflicts of interest with the affected asset."""
        for steward_id in stewards:
            if steward_id == proposed_asset_owner:
                return steward_id
        return None

    def trigger_physical_lever(self, target_zone, asset_owner, target_asset_id):
        """Step 1: Simulates the physical lever being depressed in RM-10."""
        print(f"\n================================================================================")
        print(f"🏛️ SYSTEM ALERT: PHYSICAL LEVER DEPRESSED IN THE ROOM OF REFUSAL (RM-10)")
        print(f"================================================================================")
        print(f"⚡ [DECOUPLED TRIGGER] Physical circuit de-energized via micro-switches (Voltage: 0.0V).")
        print(f"🛑 [IMMEDIATE FAIL-CLOSED] Locking physical zone: {target_zone}")
        
        # Decouple immediately from software logic and freeze the zone
        self.spatial_zones[target_zone] = "LOCKED_FAIL_CLOSED"
        self.process_velocity = 0.0
        self.system_state = "EMERGENCY_HALTED"
        
        print(f"  └─ Spatial Zone Status: {self.spatial_zones[target_zone]}")
        print(f"  └─ Mechanical Process Velocity dropped to: {self.process_velocity} m/s")
        
        # Log the raw physical trigger event to the spanning chain
        payload = {
            "target_zone": target_zone,
            "target_asset_id": target_asset_id,
            "mechanical_braking_engaged": True,
            "initial_system_voltage": "0.0V"
        }
        self.ledger.commit(self.tenant_id, "SYSTEM_HARDWARE_LOOP", "RM-10", "PHYSICAL_LEVER_TRIPPED", payload)

        # Step 2: Assemble the Federated Brehon Court
        print(f"\n⚖️  Step 2: Programmatically assembling local Brehon Court stewards...")
        
        # Elect un-conflicted members representing Cork Rí, Cork Ban, and Sammy D
        stewards_pool = ["ST_DALY_003", "ST_MCCARTHY_004", "ST_SAMMY_005"]
        conflict_check = self.check_conflicts(asset_owner, stewards_pool)
        
        if conflict_check:
            print(f"❌ CONFLICT DETECTED: Elected Steward '{conflict_check}' is the owner/author of target asset '{target_asset_id}'.")
            print(f"🔄 Re-allocating independent backup steward...")
            # Fallback to independent coordinator
            stewards_pool.remove(conflict_check)
            stewards_pool.append("ST_MILLS_002")
            
        print(f"  ✔ Brehon Court Assembled with Zero Conflicts:")
        for idx, sid in enumerate(stewards_pool, 1):
            steward = self.principals[sid]
            print(f"     └─ Steward {idx}: {steward['display_name']} | Role: {steward['role']} | Group: {steward.get('group', 'COORDINATOR')}")
            
        # Log the court assembly
        self.ledger.commit(self.tenant_id, "SYSTEM_GOVERNOR", "RM-10", "BREHON_COURT_ASSEMBLED", {
            "stewards": stewards_pool,
            "conflict_status": "CLEARED"
        })
        
        return stewards_pool

    def run_escrow_chamber(self, stewards, simulated_votes, elapsed_minutes):
        """Step 3 & 4: Launches the isolated dispute escrow chamber and collects cryptographic votes."""
        print(f"\n🔐 Step 3: Launching isolated Veto Escrow Chamber...")
        print(f"🕒 SLA Configured: 15-Minute Response Window. Simulated Time Elapsed: {elapsed_minutes} minutes.")
        
        # Log the initiation of the escrow session
        self.ledger.commit(self.tenant_id, "SYSTEM_GOVERNOR", "RM-10", "ESCROW_CHAMBER_INITIALIZED", {
            "sla_limit_minutes": 15,
            "elapsed_minutes": elapsed_minutes
        })

        if elapsed_minutes > 15:
            # Step 5A: SLA Timeout Branch
            print(f"\n❌ FAIL-CLOSED TRIGGERED: SLA Response window expired (Time: {elapsed_minutes} mins > 15 mins).")
            print(f"⚠️  EMERGENCY LOCK INVARIANT ACTIVATED: Escalating dispute to Global Tribunal.")
            
            # Lock spatial zones permanently
            self.spatial_zones["RM-05"] = "PERMANENT_ISOLATED"
            self.system_state = "PERMANENT_FAIL_CLOSED_TIMEOUT"
            
            payload = {
                "sla_violated": True,
                "elapsed_minutes": elapsed_minutes,
                "system_status": "PERMANENT_FAIL_CLOSED",
                "escalation_target": "GLOBAL_BREHON_TRIBUNAL"
            }
            self.ledger.commit(self.tenant_id, "SYSTEM_GOVERNOR", "RM-10", "ESCROW_SLA_TIMEOUT", payload)
            return "TIMEOUT_FAIL_CLOSED"

        # Step 5B: Gather and cryptographically verify signatures
        print(f"\n✍  Step 4: Requesting WebAuthn/FIDO2 hardware-backed signatures from stewards...")
        votes_cast = {}
        for sid in stewards:
            steward = self.principals[sid]
            vote = simulated_votes.get(sid, "VETO")  # Default to conservative veto if silent
            
            # Simulate a secure GPG/FIDO2 signature verification
            sig_input = f"{sid}{vote}{self.ledger.last_hash}"
            simulated_sig = hashlib.sha256(sig_input.encode("utf-8")).hexdigest()[:16]
            
            # Register vote payload
            votes_cast[sid] = {
                "steward_name": steward["display_name"],
                "vote": vote,
                "signature": f"sig-{steward['gpg_key'][-8:]}-{simulated_sig}"
            }
            print(f"   ✔ Verified: {steward['display_name']} ({steward.get('group', 'COORDINATOR')}) -> VOTE: {vote} | Key Signed: {votes_cast[sid]['signature']}")

        # Log complete vote matrix to ledger
        self.ledger.commit(self.tenant_id, "SYSTEM_GOVERNOR", "RM-10", "ESCROW_VOTES_REGISTERED", votes_cast)

        # Step 6: Evaluate Verdict and Trigger Decoupled Actuation
        print(f"\n⚖️  Step 5: Evaluating court verdict...")
        is_vetoed = any(v["vote"] == "VETO" for v in votes_cast.values())
        
        if is_vetoed:
            print(f"🚫 VERDICT: VETO CARRIED. (At least one steward voted VETO to protect system integrity).")
            print(f"🛑 [DECOUPLED ACTION] Hard-stopping all automation pipelines permanently.")
            print(f"🔒 [IMMUTABLE LOCK] Committing HUMAN_DISCARD row to append-only ledger...")
            
            self.system_state = "SYSTEM_HALTED_BY_HUMAN_VETO"
            self.spatial_zones["RM-05"] = "HARD_HALTED_BY_VETO"
            
            # Print physical Decision Passport Ticket
            receipt_hash = self.ledger.commit(self.tenant_id, "DP_WARD_001", "RM-10", "HUMAN_DISCARD", {
                "verdict": "VETO",
                "veto_source": "BREHON_COURT",
                "automation_disabled": True,
                "process_velocity": 0.0
            })
            
            print(f"\n🎟️  [DECISION PASSPORT PRINTED]")
            print(f"   ┌──────────────────────────────────────────────────────────┐")
            print(f"   │           BREHON AI EVIDENCE RECONSTRUCTION TICKET       │")
            print(f"   │  Event: HUMAN_DISCARD (VETO IN RM-10)                    │")
            print(f"   │  Tenant: {self.tenant_id}                            │")
            print(f"   │  Receipt Hash: {receipt_hash[:32]}... │")
            print(f"   │  Status: SYSTEM LOCKOUT / FAIL-CLOSED ACTIVE             │")
            print(f"   └──────────────────────────────────────────────────────────┘")
            
            return "VETO_SUCCESSFUL"
        else:
            # Unanimous Consent to override the warning and proceed
            print(f"🟢 VERDICT: RESOLUTION UNANIMOUSLY APPROVED (Zero Vetoes). Anomalies resolved.")
            print(f"✅ [DECOUPLED ACTION] Restoring safe system velocity.")
            
            self.system_state = "HEALTHY"
            self.spatial_zones["RM-05"] = "ACTIVE"
            self.process_velocity = 1.0
            
            self.ledger.commit(self.tenant_id, "DP_WARD_001", "RM-10", "SYSTEM_RESTORE_APPROVED", {
                "verdict": "PROCEED",
                "restored_velocity": 1.0
            })
            
            return "SYSTEM_RESTORED"


def run_scenarios():
    print("================================================================================")
    print("🌲 INITIALIZING DECOUPLED EMERGENCY VETO & ESCROW ENGINES")
    print("🕒 Location: Room of Refusal (RM-10)")
    print("================================================================================\n")

    ledger_path = os.path.join("data", "scratch", "veto_ledger.jsonl")

    # TEST SCENARIO A: Healthy Flow -> Accelerometer Anomaly -> Physical Veto Triggered
    print(">>> RUNNING SCENARIO A: STEWARD DEMANDS PHYSICAL VETO (LEVER ENGAGED) <<<")
    escrow_engine = DecoupledVetoEscrow(ledger_path)
    
    # Let's say Adrian Daly triggers the veto on his own draft (conflict-free)
    stewards = escrow_engine.trigger_physical_lever(
        target_zone="RM-05", 
        asset_owner="ST_MCCARTHY_004",  # McCarthy owned the failing elevator routine
        target_asset_id="ELEV-LIFT-ROUTINE-v1.0"
    )
    
    # Simulating votes: Daly votes VETO to protect life-safety, McCathy and Sammy concur or vote veto
    votes = {
        "ST_DALY_003": "VETO",
        "ST_MCCARTHY_004": "VETO",
        "ST_SAMMY_005": "VETO"
    }
    
    # Running under safe 5-minute response window
    escrow_engine.run_escrow_chamber(stewards, votes, elapsed_minutes=5)

    # TEST SCENARIO B: Stewards resolve the warning and unanimously vote to override and restore
    print("\n\n>>> RUNNING SCENARIO B: UNANIMOUS RESOLUTION & RESTORE APPROVED <<<")
    escrow_engine_b = DecoupledVetoEscrow(ledger_path)
    stewards_b = escrow_engine_b.trigger_physical_lever(
        target_zone="RM-05", 
        asset_owner="ST_DALY_003", 
        target_asset_id="ELEV-TEMP-GLITCH-v1.0"
    )
    
    # All stewards vote to proceed (override the anomaly flag after human double-check)
    votes_b = {
        "ST_MCCARTHY_004": "PROCEED",
        "ST_SAMMY_005": "PROCEED",
        "ST_MILLS_002": "PROCEED"  # Mills replaced conflict Daly
    }
    escrow_engine_b.run_escrow_chamber(stewards_b, votes_b, elapsed_minutes=8)

    # TEST SCENARIO C: SLA Timeout (Stewards fail to respond within 15 minutes)
    print("\n\n>>> RUNNING SCENARIO C: STEWARDS FAIL TO RESPOND (SLA TIMEOUT) <<<")
    escrow_engine_c = DecoupledVetoEscrow(ledger_path)
    stewards_c = escrow_engine_c.trigger_physical_lever(
        target_zone="RM-05", 
        asset_owner="ST_MCCARTHY_004", 
        target_asset_id="ELEV-LIFT-CRITICAL-v1.0"
    )
    # Simulator attempts to vote after 20 minutes (exceeding SLA)
    votes_c = {}
    escrow_engine_c.run_escrow_chamber(stewards_c, votes_c, elapsed_minutes=20)


if __name__ == "__main__":
    run_scenarios()
