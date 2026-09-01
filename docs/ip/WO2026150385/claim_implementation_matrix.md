# Claim-to-Code Implementation Matrix: WO/2026/150385

**TAXONOMY DEFINITION**:
* `CODE`: Executable logic implemented in the codebase.
* `DEMO`: Simulated or interactive demonstration path available.
* `DOCUMENTED`: Formally specified in technical documentation.
* `GAP`: Known architectural delta requiring reference module implementation.
* `TBD`: Subject to external clinical/expert parameter calibration.

---

## Matrix: Claims 1–9 Traceability

| Claim | Element Description | Implementation Module | Source File | Unit Test ID | Evidence Artifact | Status | Version | Known Gap / Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1** | NL Semantic & Intent Extraction | `InputProcessingModule` | `src/golf/article19/signals.js` | `claim-1-end-to-end.test.mjs` | `signals.json` | `CODE` | 1.0.0 | None (sensorless) |
| **1.2** | Persistent Memory Architecture | `PersistentMemoryArchitecture` | `src/golf/governance/session-memory-schema.js` | `claim-3-memory-replay.test.mjs` | `memory_snapshot.json` | `CODE` | 1.0.0 | Multi-session replayable |
| **1.3** | Longitudinal Evaluation Module | `EvaluationModule` | `src/golf/governance/threshold-engine.js` | `claim-1-end-to-end.test.mjs` | `threshold_eval.json` | `CODE` | 1.0.0 | Statistical rolling windows |
| **1.4** | Deterministic Routing Module | `PolicyRouter` | `src/golf/governance/policy-router.js` | `claim-2-routing-boundaries.test.mjs` | `routing_decision.json` | `CODE` | 1.0.0 | Downstream of DNSL ROUTE-001 |
| **1.5** | Output Control Module | `OutputControlModule` | `src/golf/article19/output-control.js` | `claim-4-output-adaptation.test.mjs` | `execution_result.json` | `CODE` | 1.0.0 | Dynamic length & tone |
| **2.1** | Priority & Baseline Evaluation | `ThresholdEngine` | `src/golf/governance/threshold-engine.js` | `claim-2-routing-boundaries.test.mjs` | `threshold_eval.json` | `CODE` | 1.0.0 | Configuration-driven |
| **2.2** | Supervisory Pathway Routing | `PolicyRouter` | `src/golf/governance/policy-router.js` | `claim-2-routing-boundaries.test.mjs` | `routing_decision.json` | `CODE` | 1.0.0 | COMPETE mode human gate |
| **3.1** | Structured Session Schema | `SessionSchemaValidator` | `src/golf/governance/session-memory-schema.js` | `claim-3-memory-replay.test.mjs` | `memory_snapshot.json` | `CODE` | 1.0.0 | Mood vectors & compliance |
| **4.1** | Tone/Modality Adaptation | `OutputControlModule` | `src/golf/article19/output-control.js` | `claim-4-output-adaptation.test.mjs` | `execution_result.json` | `CODE` | 1.0.0 | Audio-only summary fallback |
| **5.1** | Engagement Drift Detection | `EngagementDriftAnalyzer` | `src/golf/article19/engagement-drift.js` | `claim-5-engagement-drift.test.mjs` | `signals.json` | `CODE` | 1.0.0 | INSUFFICIENT_HISTORY handling |
| **6.1** | Longitudinal NLP Adaptation | `OutputControlModule` | `src/golf/article19/output-control.js` | `claim-6-personalisation.test.mjs` | `execution_result.json` | `CODE` | 1.0.0 | Pacing & complexity tuning |
| **7.1** | Tone Modulation Gate | `ToneStateMachine` | `src/golf/governance/tone-state-machine.js` | `claim-7-tone-trigger-boundaries.test.mjs` | `tone_state.json` | `CODE` | 1.0.0 | Threshold-driven triggers |
| **8.1** | Tone Decay & Recovery Cycle | `ToneStateMachine` | `src/golf/governance/tone-state-machine.js` | `claim-8-tone-recovery-decay.test.mjs` | `tone_state.json` | `CODE` | 1.0.0 | Reversible state machine |
| **9.1** | Text-Only Compliance Classifier| `ComplianceClassifier` | `src/golf/article19/compliance-classifier.js` | `claim-9-text-only-compliance.test.mjs` | `classifier_result.json` | `CODE` | 1.0.0 | Adherence vs. avoidance model |
