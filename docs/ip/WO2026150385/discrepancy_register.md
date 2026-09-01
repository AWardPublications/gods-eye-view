# Discrepancy & Gap Register: WO/2026/150385

This register logs architectural discrepancies, boundary limitations, and roadmap parameters to ensure institutional honesty and prevent ungrounded claims.

---

## Active Discrepancies & Registered Gaps

| Item ID | Component Area | Discrepancy / Gap Description | Risk / Impact | Status | Resolution Pathway |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GAP-AW-001** | Biometric Elimination | Legacy sports-tech documentation referenced heart-rate or IMU sensors. The Article 19 invention explicitly eliminates all biometric dependencies. | High (IP fidelity) | `RESOLVED` | Reference engine operates purely on natural-language interaction data. |
| **GAP-AW-002** | Hardcoded Magic Numbers | Initial prototype used hardcoded thresholds (e.g. `0.4` sentiment drop, `0.6` compliance minimum). | Medium | `IN_PROGRESS` | Extracted into `src/golf/governance/threshold-config.json`. |
| **GAP-AW-003** | Sparse Athlete Baselines | For new or sparse athletes, rolling averages could divide by zero or create misleading baselines. | Medium | `RESOLVED` | Implemented explicit `INSUFFICIENT_HISTORY` signal and safe default fallbacks. |
| **GAP-AW-004** | LLM Compliance Classification | Reliance on free-form LLM outputs for compliance validation lacks auditability. | High (Auditability) | `RESOLVED` | Implemented replaceable `ComplianceClassifier` interface with deterministic rule-based classifiers and confidence scores. |
| **GAP-AW-005** | Supervisory Path Verification | Live on-course competition coaching (`COMPETE`) requires external coach presence. | High (Regulatory/Safety) | `RESOLVED` | Mechanically blocked via `human_supervision: false` trigger yielding `DENY (SUPERVISION_REQUIRED)`. |
