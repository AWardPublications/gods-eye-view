# 🤝📜 **HUMAN–AGENT ROLE REGISTRY & SYMBIOSIS CONSTITUTION**

> **Canonical Human–Agent Authority Framework**  
> **Milestone:** `DAVINCIA-SYMBIOSIS-v1.0`  
> **Registry Data:** [`data/human-agent-registry.json`](file:///C:/Users/David/gods-eye-view/data/human-agent-registry.json)  
> **Invariant:** `AGENT CAPABILITY ≠ HUMAN AUTHORITY`  
> **Synergy:** `HUMAN AUTHORITY + AGENT CAPABILITY > EITHER ALONE`

---

## 1. **THE THREE CANONICAL AUTHORITY MODES**

Every material operation in the ecosystem MUST declare its authority mode:

```
==================================================================================================================================================
THE 3 OPERATING AUTHORITY MODES
==================================================================================================================================================
 ┌─────────┬─────────────────────────────┬───────────────────────────────┬──────────────────────────────────────────────────────────────┐
 │ Mode    │ Authority Pattern           │ Primary Operational Scope     │ Mandatory Governance Controls                                │
 ├─────────┼─────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ **MODE A**│ **HUMAN LED**               │ Strategic, High-Value, Novel, │ Human decides • Agent assists • Full human accountability    │
 │         │ (Human Decides $\to$ Agent) │ Legal & Board Approvals       │                                                              │
 ├─────────┼─────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ **MODE B**│ **AGENT ASSISTED**          │ Grant Preparation, Research,  │ Agent analyzes & proposes • Human approves • Agent executes   │
 │         │ (Agent Proposes $\to$ Human)│ Cataloguing, Analysis         │                                                              │
 ├─────────┼─────────────────────────────┼───────────────────────────────┼──────────────────────────────────────────────────────────────┤
 │ **MODE C**│ **DELEGATED AGENT**         │ Routine Monitoring, Ingestion,│ Human sets bounded authority • Agent executes • System audits│
 │         │ (Bounded Execution)         │ Telemetry, Low-Risk Workflows │ Continuous POL-003 compliance verification                   │
 └─────────┴─────────────────────────────┴───────────────────────────────┴──────────────────────────────────────────────────────────────┘
==================================================================================================================================================
```

⚠️ **NO MODE D EXISTS IN WHICH AN AGENT BECOMES SOVEREIGN AUTHORITY.**

---

## 2. **SYMBIOTIC WORK ITEM (`SymbioticWorkItem`)**

The fundamental unit of collaborative human–agent work:

```json
{
  "work_id": "work_2026_09_001",
  "human_intent": "Discover European funding calls for governed AI research",
  "agent_role": "GRANT GEDHI Capital Provisioning Agent",
  "agent_proposal": {
    "opportunity": "EIC Accelerator 2026 Work Package 4",
    "amountEur": 25000000,
    "confidenceScore": 0.94
  },
  "evidence": ["EIC_WORK_PROGRAMME_PDF_HASH", "TRL_PROGRESSION_MATRIX"],
  "governance_decision": {
    "status": "ALLOW_WITH_CONSTRAINTS",
    "constraint": "REQUIRES_HUMAN_BOARD_APPROVAL_FOR_EXPOSURE_GT_50000EUR"
  },
  "human_decision": {
    "status": "APPROVED",
    "decidedBy": "David Ward (0x80D0ADA1)",
    "timestamp": "2026-09-03T18:37:19Z"
  },
  "execution": { "status": "COMPLETED", "executionHash": "a1b2c3..." },
  "accountability": { "humanOwner": "human_david_ward", "agentExecutor": "agent_grant_gedhi_scout" }
}
```
