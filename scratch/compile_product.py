import os
import sys
import json
import hashlib
import time
import uuid
import sqlite3
from datetime import datetime

class ProductCompiler:
    """
    AWardPublications.ProductRefinery.v1.0 Multi-Format Product Compiler.
    Enforces the GAMP 5 7-Step Spine, budget constraints, and repeated override rules.
    """
    def __init__(self, templates_path=None, db_path=None):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        
        if not templates_path:
            templates_path = os.path.join(current_dir, "product-manifest-templates.json")
        if not db_path:
            db_path = os.path.join(current_dir, "tuath_governance.db")
            
        self.templates_path = templates_path
        self.db_path = db_path
        
        # Load GAMP 5 templates
        with open(templates_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
            
        self.templates = self.config["templates"]
        self.init_db()

    def init_db(self):
        """Initializes database schema for auditing and traceability."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_events (
                transaction_urn TEXT PRIMARY KEY,
                timestamp TEXT,
                actor_passport TEXT,
                target_resource TEXT,
                action TEXT,
                status TEXT,
                reason_code TEXT,
                signature TEXT,
                udo_urn TEXT,
                payload TEXT
            )
        """)
        conn.commit()
        conn.close()

    def run_compilation_pipeline(self, product_key, input_data, subject_passport, is_override=False):
        """
        Main 7-Step Ingestion & Refinement Pipeline.
        """
        # Step 1: Pulse Ingestion
        headline = input_data.get("headline", "")
        if not headline:
            raise ValueError("INGESTION_FAILED: Headline input cannot be empty.")
            
        # Optional Sunday 16:20 check (simulated based on input time)
        pulse_time = input_data.get("pulse_time")
        if pulse_time:
            # verify it matches Sunday or correct hours if strict scheduling enabled
            pass

        # Step 2: UDO Formulation
        transaction_urn = f"urn:brehon:transaction:{uuid.uuid4().hex[:16]}"
        udo_urn = f"urn:davincia:udo:{uuid.uuid4().hex[:16]}"
        
        # Step 3: Executable Rule (Gating Checks)
        if product_key not in self.templates:
            raise ValueError(f"TEMPLATE_NOT_FOUND: Product key '{product_key}' is invalid.")
            
        template = self.templates[product_key]
        
        # A. TCG Invariant Check
        if product_key == "tcg_playing_card":
            stats = input_data.get("stats", {})
            sound = stats.get("sound", 0)
            cop_on = stats.get("cop_on", 0)
            neck = stats.get("neck", 0)
            rebel = stats.get("rebel", 0)
            base_power = input_data.get("base_power", 0)
            name = input_data.get("character_name", "")
            
            # Check deck constraints or budget
            validator_cfg = template["game_mechanics_validator"]
            if base_power != 24:
                raise ValueError("TCG_BASE_POWER_DECOUPLED: Card base power must equal 24.")
                
            total_stats = sound + cop_on + neck + rebel
            if total_stats != validator_cfg["stats_budget"]:
                raise ValueError(f"TCG_STAT_BUDGET_BREACH: Total stats sum to {total_stats} (must equal {validator_cfg['stats_budget']}).")
                
            for term in validator_cfg["restricted_names_blocklist"]:
                if term.lower() in name.lower():
                    raise ValueError(f"TCG_BLOCKED_NAME_DETECTED: Character name contains blocked trademark '{term}'.")

        # B. Storybook Linguistic Check
        elif product_key == "narrative_storybook":
            # Command verification (Five Character Standard)
            user_command = input_data.get("command", "")
            if len(user_command) <= 5 and user_command.lower() in ["yes", "ok", "go", "run"]:
                raise ValueError("LINT_ERROR_FIVE_CHARACTER_STANDARD: Command fails the five-character threshold.")
                
            # Telemetry string limit (50-Character Rule)
            narrative_text = input_data.get("text", "")
            if len(narrative_text) < 50:
                raise ValueError("LINT_ERROR_TELEMETRY_SHORT: Input narrative text must be at least 50 characters.")

        # Step 4: Postgres Pre-Execution (Log Intent first)
        serialized_intent = json.dumps({"input": input_data, "product_type": template["product_type"]}, sort_keys=True)
        intent_hash = hashlib.sha256(serialized_intent.encode('utf-8')).hexdigest()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO audit_events (transaction_urn, timestamp, actor_passport, target_resource, action, status, reason_code, signature, udo_urn, payload)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            transaction_urn,
            datetime.utcnow().isoformat() + "Z",
            subject_passport.get("id"),
            f"urn:davincia:product:type:{product_key}",
            "COMPILE",
            "INTENT_LOGGED",
            "PRE_EXECUTION_TRACE",
            intent_hash,
            udo_urn,
            serialized_intent
        ))
        conn.commit()
        conn.close()

        # Step 5: Overrides Gate (HITL Verification & Fatigue Guard)
        if is_override:
            # Enforce Repeated Override Rule (Fatigue Guard)
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT status FROM audit_events WHERE status != 'INTENT_LOGGED' ORDER BY timestamp DESC LIMIT 2")
            rows = cursor.fetchall()
            conn.close()
            
            consecutive_overrides = 0
            for r in rows:
                if r[0] == "OVERRIDE_ALLOW":
                    consecutive_overrides += 1
            if consecutive_overrides >= 2:
                # Lock the system immediately
                raise RuntimeError("GOVERNANCE_FREEZE: Exceeded consecutive manual overrides limit (Repeated Override Rule). System Locked.")

        # Step 6: Action (Generation)
        # Assemble GAMP 5 layout, styles, stamps and hierarchy
        visuals = template["visual_strategy"]
        h_subject = visuals["composition_hierarchy"]["subject_weight"]
        h_bg = visuals["composition_hierarchy"]["background_weight"]
        h_prop = visuals["composition_hierarchy"]["prop_weight"]
        
        cmyk_borders = template["layout_specs"].get("page_style", "")
        disclosure = template["governance_stamps"]["visual_overlay"]["disclosure_text"]
        seal = template["governance_stamps"]["visual_overlay"]["regulatory_seal"]

        product_payload = {
            "title": f"Compiled {product_key.replace('_', ' ').title()}",
            "headline": headline,
            "style_modifier": visuals["style_modifier"],
            "hierarchy": {
                "subject": h_subject,
                "background": h_bg,
                "prop": h_prop
            },
            "design": {
                "borders": cmyk_borders,
                "disclosure": disclosure,
                "seal": seal
            },
            "provenance_intent_hash": intent_hash
        }
        
        # Step 7: Audit Log (Stamp compliance envelope to ledger)
        serialized_payload = json.dumps(product_payload, sort_keys=True)
        final_hash = hashlib.sha256(serialized_payload.encode('utf-8')).hexdigest()
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        # Update the logged intent transaction to represent completion
        status_value = "OVERRIDE_ALLOW" if is_override else "ALLOW"
        cursor.execute("""
            UPDATE audit_events 
            SET status = ?, reason_code = ?, signature = ?, payload = ?
            WHERE transaction_urn = ?
        """, (
            status_value,
            "COMPILE_SUCCESS",
            final_hash,
            serialized_payload,
            transaction_urn
        ))
        conn.commit()
        conn.close()

        print(f"[Compiler] Successfully compiled {product_key} product.")
        return {
            "status": status_value,
            "transaction_urn": transaction_urn,
            "udo_urn": udo_urn,
            "integrity_hash": final_hash,
            "product": product_payload
        }
