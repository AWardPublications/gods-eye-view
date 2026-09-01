# Alex Wenger Ecosystem — Next Validation Program Plan

**Target Release:** `v4.7.0` (Post-V4.6.0 Release Candidate)
**Audited Status Baseline:** **DEMONSTRATION READY — V4.6.0 RELEASE CANDIDATE**

---

## The 4 Outstanding Validation Workstreams

### Workstream A: Production Infrastructure
- **Objective:** Transition from configured edge router script to live production network verification.
- **Milestones:**
  1. Authenticate Wrangler CLI with production Cloudflare account (`npx wrangler login`).
  2. Provision production R2 bucket (`golf-spatial-engine-assets`) and KV namespaces (`USER_MEMORY`, `COURSE_INDEX`).
  3. Execute production edge deployment (`npx wrangler deploy --env production`).
  4. Perform live network ping smoke test against `/api/v1/ballistics`, `/api/v1/state`, and `/api/v1/spatial/valderrama_golf_club`.
  5. Configure automated latency monitoring and rollback alerts.

### Workstream B: Physics & Aerodynamic Calibration
- **Objective:** Validate 3-DoF aerodynamic engine against dual-radar launch monitor reference data.
- **Milestones:**
  1. Collect benchmark launch monitor dataset (TrackMan / Foresight GCQuad ball flight telemetry across 500 shots).
  2. Compare 3-DoF solver plays-like predictions against empirical carry & drift data.
  3. Perform error analysis for headwind resistance, crosswind Magnus lift, and high-altitude air density adjustments.
  4. Calibrate aerodynamic drag coefficients ($\beta$) and density multipliers ($k_{\text{alt}}$).

### Workstream C: Physical & Biometric Sensor Integration
- **Objective:** Move from mathematical heuristics to verified biometric sensor inputs.
- **Milestones:**
  1. Define hardware API integration for wearable sensors (e.g. WHOOP, Garmin, Apple Watch HRV & IMU torso sensors).
  2. Implement live rotational load and heart-rate variability ingest handlers in `Alieve` and `Fitty`.
  3. Conduct controlled athletic strain test dataset with sports physio review.
  4. Validate safety escalation triggers for acute physical load thresholds.

### Workstream D: Global Course Data Expansion
- **Objective:** Expand course database from 27 verified benchmark tracks to full regional and global coverage.
- **Milestones:**
  1. Execute Tier 1 batch ingestion for Top 100 & PGA/DP World Tour venues (~1,500 flagships).
  2. Execute Tier 2 batch ingestion for 7 micro-nation territories (~500 tracks).
  3. Trigger Cloudflare Scheduled Cron Workers for Tier 3 mass regional Overpass processing (~36,800 tracks).
  4. Run automated `validate_ingested_manifest.js` audit gate after each batch ingestion.
