# DaVinciA⁺ & Governed AI Embassy: Core Project Learnings (v1.0.0)

This document captures the technical and architectural learnings discovered while building and validating the **DaVinciA⁺ Real Commerce Foundation (v0.6.0)**, **External Embassy Entry (v0.7.0)**, and the **Governed Knowledge Marketplace (v0.8.0)**.

---

## 1. Architectural Integrity & Decoupling

The Governed AI Embassy separates sovereign authority from down-stream transaction execution:
1. **DAVID_OS (Operator Layer)**: Every governed environment begins with human authority. Technical capability does not create authority. The operator delegates specific capabilities to agents via signed tokens.
2. **DaVinciA⁺ (Constitutional Layer)**: A frozen governance kernel that checks credentials, matches policy targets, and resolves ALLOW/DENY decisions. It remains completely independent of commercial payments.
3. **Governed AI Embassy (Commercial Layer)**: Transacts purely downstream of governance. Entitlement, metering, and sandbox payments can only execute if DaVinciA⁺ yields a valid, signed authorization token.

---

## 2. Key Learnings & Solved Issues

### Layer Serialization Registry Mismatch
* **Symptom**: The front-end fails to load in the browser with the error `Error: Layer serialization registry mismatch (missing: davincia; extra: none)`.
* **Cause**: In `main.js`, all data layers are registered on startup. The `DataLayerManager` enforces that all active layers must exist in the canonical serialization registry `LAYER_STATE_REGISTRY` defined in `src/data/layerState.js` to ensure URL state serialization works. The newly added `davincia` layer was missing.
* **Fix**: Added `{ id: 'davincia', token: 'v', disposition: 'enabled-only' }` to the registry, updated the registered layer count in `src/data/layerState.test.mjs` from `16` to `17`, and rebuilt the Vite bundle.

### Context Parameter Wrapping for Policy Engine
* **Learning**: The core policy evaluation engine (`src/governance/evaluate.js`) expects context attributes to be nested inside the `payload` property of the request envelope. In `src/marketplace/marketplace.js`, request parameters must be wrapped inside `payload: { ...context }` before calling the orchestrator.
* **Linguistic Matching**: Certain domain rules check targets like `language_lane`. Because raw database assets lack this field by default, they must be dynamically passed inside the request context payload to align policy targets correctly.

---

## 3. Conformance Scorecards

Three separate test scripts validate different aspects of the repository:
1. **Real Commerce Scorecard (`run-commercial-conformance.js`)**: Validates that entitlements cannot be issued without authorization, double settlements are blocked, and prices are zeroed on denial.
2. **Embassy Scorecard (`run-embassy-conformance.js`)**: Validates identity checking, discovery permissions, and metadata visibility.
3. **Marketplace Scorecard (`run-marketplace-conformance.js`)**: Validates cryptographically bound offers, pricing engines, and license validation rules.

All three scorecards yield a **100% conformant** status on the main branch.
