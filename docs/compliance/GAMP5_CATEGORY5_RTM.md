# GAMP 5 Category 5 Requirements Traceability Matrix (RTM)

**SYSTEM**: DaVinciA⁺ / Sovereign DNSL Governance Spine  
**SOFTWARE CATEGORY**: GAMP 5 Category 5 (Custom Customised Software)  
**APPLICABLE REGULATORY STANDARDS**:
* FDA 21 CFR Part 11 (Electronic Records & Electronic Signatures)
* EudraLex Vol 4 Annex 11 (Computerised Systems)
* WIPO Patent Application WO/2026/150385 (PCT/IE2025/050001)

---

## 1. Traceability Matrix Table

| URS ID | User Requirement | FS ID | Functional Specification | DS ID | Design Specification | Qualification Protocol | Automated Verification Suite |
|---|---|---|---|---|---|---|---|
| **URS-GOV-01** | Subordination to DNSL Policy Gate | **FS-GOV-01** | Pure policy verdict checks prior to transaction dispatch | **DS-GOV-01** | `src/governance/evaluate.js` | **OQ-GOV-01** | `tests/golf/patent-reference/governance-integration.test.mjs` |
| **URS-IP-01** | Sensorless Natural-Language Coaching | **FS-IP-01** | Semantic extraction without biometric reliance | **DS-IP-01** | `src/golf/nlp/input-processing.js` | **OQ-IP-01** | `tests/golf/patent-reference/claim-1-end-to-end.test.mjs` |
| **URS-IP-02** | Closed-Loop Tone State Machine | **FS-IP-02** | Baseline, Modulated, Decayed, Recovering state cycles | **DS-IP-02** | `src/golf/adaptation/tone-state-machine.js` | **OQ-IP-02** | `tests/golf/patent-reference/claim-8-tone-lifecycle.test.mjs` |
| **URS-MED-01** | Longitudinal Memory & Baseline Drift | **FS-MED-01** | Temporal rolling averages and drift alarms | **DS-MED-01** | `src/golf/governance/session-memory-schema.js` | **OQ-MED-01** | `tests/golf/patent-reference/claim-3-memory-schema.test.mjs` |
| **URS-COM-01** | GAMP 5 7-Step Product Refinery | **FS-COM-01** | 24-point card budget & fatigue guard invariant enforcement | **DS-COM-01** | `src/compiler/productCompiler.js` | **OQ-COM-01** | `tests/compiler/product-compiler.test.mjs` |
| **URS-DB-01** | Row-Level Dispute Freeze | **FS-DB-01** | Fail-Closed settlement freeze on contested assets | **DS-DB-01** | `src/db/postgres-adapter.js` | **OQ-DB-01** | `tests/db/postgres-scheduler.test.mjs` |
| **URS-SCH-01** | Automated Sunday Batch Clearing | **FS-SCH-01** | Sunday 16:20 batch settlement cycle & DPF receipt minting | **DS-SCH-01** | `src/scheduler/n8n-triggers.js` | **OQ-SCH-01** | `tests/db/postgres-scheduler.test.mjs` |
| **URS-SIG-01** | 21 CFR Part 11 Digital Signatures | **FS-SIG-01** | Manifest signing with identity, intent, and timestamp | **DS-SIG-01** | `src/compliance/part11-signatures.js` | **OQ-SIG-01** | `tests/db/cold-start-reconstruction.test.mjs` |
| **URS-REC-01** | Cold-Start Genesis Reconstruction | **FS-REC-01** | Rebuilding full relational state from cold evidence packages | **DS-REC-01** | `tests/db/cold-start-reconstruction.test.mjs` | **PQ-REC-01** | `tests/db/cold-start-reconstruction.test.mjs` |

---

## 2. Verification Protocol Summary
* **IQ (Installation Qualification)**: Node.js 22+, isomorphic environment validation, zero unpinned dependency errors.
* **OQ (Operational Qualification)**: 100% test pass rate across all 38+ unit & regression test suites.
* **PQ (Performance Qualification)**: Cold-start ledger rebuild across 447+ SHA-256 evidence packages with complete hash matching.
