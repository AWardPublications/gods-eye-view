# Evidence Register & Schema Definition: WO/2026/150385

This register defines the required evidence artifacts generated during every execution of the Alex Wenger² Article 19 Adaptive Coaching Subsystem under the DNSL Governance Spine.

---

## 1. Mandatory Core Evidence Pack

Every execution run generates a discrete evidence directory under `data/evidence-packages/<run_id>/` containing:

| Artifact Name | Schema / Content | Required Metadata Fields |
| :--- | :--- | :--- |
| `manifest.json` | Top-level execution envelope | `project_id=ALEX_WENGER`, `run_id`, `workflow_id`, `timestamp`, `policy_version`, `status` |
| `audit_log.jsonl` | Append-only chronologically ordered event stream | `event_id`, `timestamp`, `phase`, `action`, `status`, `actor`, `evidence_hash` |
| `player_snapshot.json` | Human authority & consent status | `player_id`, `athlete_consent`, `career_opt_in`, `human_supervision`, `passport_urn` |
| `signals.json` | Extracted natural-language signal vector | `raw_text_hash`, `topics`, `intent`, `sentiment_polarity`, `compliance_score`, `word_count` |
| `threshold_eval.json` | Detailed deterministic threshold evaluations | `threshold_id`, `threshold_version`, `computed_value`, `baseline`, `comparison`, `result` |
| `routing_decision.json` | Selected execution pathway and mode | `mode`, `pathway_type` (`DEFAULT` vs `SUPERVISORY`), `policy_decision`, `reason_code` |
| `execution_result.json` | Final adaptive output and modulation state | `text`, `delivery_modality`, `complexity`, `tone_state`, `tone_framing`, `latency_ms` |

---

## 2. Dynamic State & Failover Artifacts (When Applicable)

* `memory_snapshot.json`: Exported state of persistent longitudinal memory before and after turn execution.
* `tone_state.json`: Complete state transition history (`prev_state`, `target_state`, `trigger_threshold`, `consecutive_divergence_count`).
* `classifier_result.json`: Specific outputs from `ComplianceClassifier` (`score`, `confidence`, `classification`, `classifier_version`).
* `failover_event.json`: Emitted whenever an edge or error condition triggers a safe fallback (`failover_code`, `trigger_reason`, `fallback_state_adopted`).
