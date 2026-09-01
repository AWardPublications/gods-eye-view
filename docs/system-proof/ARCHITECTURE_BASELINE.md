# DaVinciA⁺ System Integration Baseline

**BASELINE COMMIT**: `960a2e3` (origin/main)  
**STARTING AUDIT COMMIT**: `283dfe3`  
**RUNTIME ENVIRONMENT**: Node.js v24.15.0, npm 11.12.1  
**DATE**: 01 September 2026  
**STATUS**: FROZEN BASELINE  

---

## 1. Commit Trajectory (Audit Scope)

| Commit SHA | Commit Type | Description |
|---|---|---|
| `283dfe3` | `feat(golf)` | Promote Article 19 to first-class reference implementation subsystem |
| `690e3e5` | `feat(golf)` | Implement disk persistence, SHA-256 evidence ledger, and cross-process replay engine |
| `b2143f4` | `feat(voice)` | Integrate Alex Wenger live voice pipeline, dynamic cadence modulation, and Web Speech/Realtime bridge |
| `865fb47` | `feat(compiler)` | Implement GAMP 5 multi-format product compiler, studio HUD panel, and voice compilation actions |
| `1fdd0c2` | `feat(db)` | Implement production Postgres adapter, dispute locking, and n8n Friday/Sunday scheduler triggers |
| `3e777bc` | `feat(marketplace)` | Implement 3D Sovereign Embassy trade corridors, interactive catalog HUD, and voice commerce actions |
| `01cd0fa` | `feat(institutional)` | Implement institutional audit dossier generator, Alpine speedgolf simulator, and floating launch tray |
| `5dcd10d` | `feat(studio)` | Implement SVG vector product layout renderer, interactive HUD preview, and institutional audit viewer |
| `0ec145c` | `feat(corridors)` | Implement camera corridor animations, Corkonian registry ingestion, and live settlement telemetry stream |
| `68c1813` | `feat(qualification)` | Implement extended claims 10-13, GAMP 5 RTM, cold-start reconstruction, Part 11 signatures, concurrency locks, and domain linter |
| `960a2e3` | `feat(voice,replication)` | Add WebRTC streaming audio bridge with sub-200ms bounds and Wasabi S3 replication daemon |

---

## 2. Frozen Environment & Dependencies

* **Node Runtime**: `v24.15.0`
* **Package Manager**: `npm 11.12.1`
* **Core Dependencies**:
  * `cesium`: `^1.124.0` (3D geospatial globe)
  * `@mapbox/vector-tile`: `^3.0.0`
  * `egm96-universal`: `^1.1.1`
  * `mgrs`: `^2.1.0`
  * `pbf`: `^5.1.2`
  * `satellite.js`: `^6.0.2`
* **Development Dependencies**:
  * `vite`: `^6.0.0`
  * `vite-plugin-cesium`: `^1.2.23`
  * `puppeteer`: `^24.37.5`
  * `sharp`: `^0.34.5`
  * `ws`: `^8.21.0`

---

## 3. Build & Test Commands

* **Build Production Bundle**: `npm run build` (`vite build`)
* **Core Unit Tests**: `node scripts/run-unit-tests.mjs`
* **Specialized Governance & Patent Suites**:
  * `node tests/compiler/domain-collision.test.mjs`
  * `node tests/db/lock-contention.test.mjs`
  * `node tests/db/cold-start-reconstruction.test.mjs`
  * `node tests/golf/adversarial-fuzzing.test.mjs`
  * `node tests/golf/patent-reference/extended-claims.test.mjs`
  * `node tests/marketplace/embassy-trade.test.mjs`
  * `node tests/studio/product-renderer.test.mjs`
  * `node tests/ui/sovereign-tray.test.mjs`
  * `node tests/golf/speedgolf-sim.test.mjs`
  * `node tests/db/postgres-scheduler.test.mjs`
  * `node tests/compiler/product-compiler.test.mjs`
  * `node tests/voice/wenger-voice.test.mjs`
  * `node tests/voice/webrtc-audio-bridge.test.mjs`
  * `node tests/db/replication-daemon.test.mjs`
  * `node --test tests/golf/patent-reference/*.test.mjs`

---

## 4. Required Environment Variables & Fallbacks

| Variable Name | Production Purpose | Fallback Behavior When Unset |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | In-memory relational tables via `forceMemory: true` |
| `WASABI_BUCKET` | Wasabi S3 WORM archive bucket | Local tracking in `ReplicationDaemon` ledger |
| `WASABI_ACCESS_KEY` | Wasabi S3 auth | Local sha256 checksum ledgering |
| `WASABI_SECRET_KEY` | Wasabi S3 auth | Local sha256 checksum ledgering |
| `OPENAI_API_KEY` | WebRTC Realtime voice synthesis | Local Web Speech API synthesis (`window.speechSynthesis`) |
