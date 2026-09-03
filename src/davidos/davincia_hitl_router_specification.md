# DAVINCIA-HITL-ROUTER-v1.0

## TECHNICAL SPECIFICATION & REGISTRY SCHEMAS

**Document ID:** `DVA-SPEC-GXS-2026`  
**Status:** `LOCKED (Infrastructural)`  
**Ratified:** `2026-06-07 (Group CEO)`  
**Version:** `v1.0 (Master Release)`  
**Sole Proprietor:** `A.Ward Publications`  
**Strategic Partner:** `Brehon AI Solutions Ltd`  

---

# 1. The Executive Mandate: "Not Another Dashboard"

Standard artificial intelligence deployments frequently fall victim to "compliance theatre" and superficial UI overlays. The DaVinciA⁺ architecture rejects the paradigm of cosmetic monitoring surfaces. The core directive established by Founder David Ward is absolute: **"Not another agent. Not another character. Not another dashboard."** The immediate engineering priority is not visual representation, but the programmatic enforcement of back-end control gates directly inside the runtime execution path.

> **CRITICAL SYSTEM DIRECTIVE:** SaaS-style feature lists, gamification elements, and dynamic live-chat takeover models are strictly prohibited. The system is engineered as a *Sovereign Identity Surface* rather than a software commodity. Underlying schemas, telemetry, scoring models, and tool invocations must remain logically isolated from the consumer-facing clubhouse.

To transition from single-user localized sandboxes to high-concurrency environments supporting up to 50,000 active Human-in-the-Loop (HITL) professionals, the system must deploy the **Governance Execution Stack (GXS)**. Visual tracking is demoted; the back-end PostgreSQL transaction log serves as the single source of truth. The execution spine contains four load-bearing programmatic layers:

* **`DAVINCIA-HITL-CONSTITUTION-v1.0`**: The immutable moral and operational charter defining decision limits.
* **`DAVINCIA-HITL-REGISTRY-v1.0`**: The cryptographically bound, version-controlled database of qualified human experts.
* **`DAVINCIA-HITL-ROUTER-v1.0`**: The dynamic dispatcher that matches execution anomalies to the exact qualified panel.
* **`DAVINCIA-HITL-COVERAGE-ENGINE-v1.0`**: The audit engine calculating active oversight and concentration risks.

---

# 2. The Identity-Over-Features Doctrine

The *Spatial Separation Doctrine* enforces a clean structural bulkhead between the operational machinery and the educational interface. Under this model, the system is split into two mutually exclusive environments:

**The Clubhouse (Operational Core):** The domain of the *DAVID_OS* Agents (Governance, Audit, Finance, and Administration). This is where the machinery of the business operates and where raw data, schemas, and algorithmic weights are guarded under strict cryptographic access.

**The Golf Course (Educational Landscape):** The domain of coaching characters (e.g., Alex Wenger, Puttser, Statsy). This is a natural, immersive, and reflective environment designed to support human performance. It is strictly restricted to receiving record-only outcomes, validated insights, and glanceable debriefings.

This separation guarantees that technology supports the athlete or operator without introducing distracting complexities or exposing confidential trade secrets. Human authority is never ceded to an automated agent. Agents may possess high computational *capability*, but only human operators possess accountable *authority*. Consequently, the interface is designed as an operator cockpit that minimizes cognitive load under extreme tournament or industrial stress, prioritizing offline-first mobility and rapid, three-tap quick logs.

---

# 3. Programmatic Asynchronous Escalation Pipeline

Human-in-the-Loop (HITL) oversight in the DaVinciA⁺ architecture is not a reactive intervention where a human mechanically watches a dashboard and takes over live agent chats. Instead, it is structured as a tightly bounded, asynchronous **Authority Transfer Pipeline** executed in three discrete phases:

| Phase | Description |
| :--- | :--- |
| **Phase 1: System Halt** | When system execution encounters a confidence boundary violation (<0.85) or a predefined high-risk regulatory trigger (e.g., EU AI Act high-impact classifications, safety anomalies), the active workflow immediately freezes. Autonomous downstream API calls and external communications are blocked. |
| **Phase 2: Review Package** | The system programmatically serializes the entire state of the frozen execution. It compiles all normalized inputs, active system configurations, prompt signatures, model uncertainty metrics, and active policy references into a single, static *Asynchronous Review Package*. |
| **Phase 3: Evidence Sealing** | The qualified human expert evaluates the static package asynchronously. To conclude the review and release the system hold, the reviewer must author and cryptographically sign two mandatory, trace-logged files: `hitl_decision.json` and `hitl_rationale.md`. |

### Asynchronous Decision Schema: `hitl_decision.json`

Every human oversight event must generate a structured JSON object to preserve data integrity and satisfy ALCOA++ GxP standards. The schema must conform exactly to the following specification:

```json
{
  "run_id": "RUN-20260903-08F1",
  "decision_id": "DEC-98327-01",
  "timestamp": "2026-09-03T10:58:15Z",
  "hitl_id": "HITL-CYBER-03A",
  "domain": "CYBERSECURITY_DIGITAL_TRUST",
  "resolution": "REJECT",
  "evidence_references": ["E-104", "E-109", "E-117"],
  "risk_rating": "CRITICAL",
  "override_remediation_action": "QUARANTINE_WORKFLOW",
  "cryptographic_signature": "sha256:8f2a1b9c..."
}
```

---

# 4. The 50-Seat Human Authority Corps & Registry

To manage systemic dependencies and eradicate concentration risks, the human oversight structure is modeled as an institutional hierarchy. The system establishes **12 specialized domains**, each containing **4 complementary expert seats**. This produces a highly structured 48-member expert panel, supervised by Adrian Daly (Level 1, HITL Master) and anchored constitutionally by David Ward (Level 0, Sovereign Authority).

### Canonical Domain Registry (12 Domains, 48 Seats)

| Domain ID | Expert Specialty Domain | Core Oversight Responsibilities & Review Areas |
| :--- | :--- | :--- |
| **01 - GOV** | AI Governance & Agent Authority | Reviews agent delegation, authority, failure modes, and constitutional compliance. |
| **02 - SYMB** | Human-Agent Symbiosis | Monitors automation bias, human-agent interaction, and collaboration metrics. |
| **03 - DATA** | Data, Evidence & Provenance | Verifies dataset statement provenance, metadata standards, and ALCOA++ compliance. |
| **04 - TRUST** | Cybersecurity & Digital Trust | Evaluates adversarial injection, secure orchestration, and cryptographic keys. |
| **05 - ARCH** | Systems Architecture | Oversees PostgreSQL truth-layer synchronization and Docker runtime environment metrics. |
| **06 - REG** | Legal / Regulatory | Analyzes EU AI Act conformity assessment documentation and jurisdictional changes. |
| **07 - CAP** | Finance / Capital Authority | Controls transactional boundaries, financial commits, and licensing contracts. |
| **08 - DIPL** | Institutional / Diplomatic | Manages external diplomatic interactions, ecosystem routing, and partner trust. |
| **09 - HERIT** | Culture / Heritage | Ensures narrative preservation, Gaeilge/dialect integrity, and archive standards. |
| **10 - SCI** | Science / Research | Audits scientific telemetry, bioprocessing data, and validation models. |
| **11 - SPEC** | Domain Specialists | Integrates highly specialized external expert perspectives when triggered. |
| **12 - ETH** | Ethics / Society | Evaluates fundamental rights, social impacts, and bias metrics (Fairlearn). |

### The 4-Per-Domain Complementary Model
Within each domain, the four specialist seats are not redundant clones. They are structured with deliberate, adversarial tension:
* **HITL-A (Domain Authority):** The deepest qualified subject-matter expert in the field.
* **HITL-B (AI/Systems Reviewer):** Evaluates machine behavior and model limitations within the domain.
* **HITL-C (Risk/Governance Reviewer):** Checks compliance, decision rights, and systemic risk boundaries.
* **HITL-D (Adversarial Reviewer):** Dedicated red-teamer tasked with finding hidden failures and challenging decisions.

---

# 5. The Programmatic Routing Engine: `DAVINCIA-HITL-ROUTER-v1.0`

The *HITL Routing Engine*, managed by Adrian Daly, ensures that the system automatically assigns anomalies to the correct specialized panel based on risk classification. No general-purpose LLM is allowed to bypass this routing or authorize decisions autonomously.

Every assigned human operator is verified against **7 Qualification Layers** before accepting a routing:
1. **Domain Expertise:** Demonstrated professional competence to challenge automated outputs.
2. **AI System Literacy:** Deep understanding of LLM boundaries, hallucination, and model uncertainty.
3. **Governance Competence:** Fluency in DaVinciA⁺ compliance models, audit logs, and risk classes.
4. **Review & Challenge Skill:** Empirically measured challenge and error detection rates.
5. **Authority Profile:** Defined scope controls, financial ceilings, and override boundaries.
6. **Evidence Competence:** Technical ability to produce a structured, audit-grade rationale.
7. **Human Judgement:** Uncompromised independence and the courage to activate the system stop.

### Deterministic Routing Logic (Conceptual Blueprint)

```python
class HitlRouter:
    def __init__(self, registry, db_connection):
        self.registry = registry  # DAVINCIA-HITL-REGISTRY-v1.0
        self.db = db_connection  # PostgreSQL Truth Layer

    def route_anomaly(self, run_id, risk_score, domain_tag):
        if risk_score < 0.85:
            # Enforce System Halt
            self.db.log_event(run_id, "SYSTEM_HALT", f"Risk trigger: {risk_score}")

            # Fetch Complementary Panel
            panel = self.registry.get_panel(domain_tag)

            # Programmatically Dispatch Asynchronous Review Package
            review_pkg = self.db.compile_state_package(run_id)
            for hitl in panel:
                self.dispatch_package(hitl.id, review_pkg)

            return {"status": "PAUSED", "target_panel": domain_tag}

        return {"status": "CONTINUE"}
```
