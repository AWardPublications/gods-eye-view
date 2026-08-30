# DaVinciA⁺ & Governed AI Embassy: Technical Architecture Reference (v1.0.0)

This document provides a deep technical reference of the codebase structure, component interfaces, and boundaries.

---

## 1. System Topology & Component Interactions

```
 +-------------------------------------------------------------------------+
 |                                DAVID_OS                                 |
 |  - Issues user/agent passports                                          |
 |  - Delegates scopes via Delegation Tokens                               |
 +-------------------------------------------------------------------------+
                                      |
                                      v (Passports & Tokens)
 +-------------------------------------------------------------------------+
 |                                DaVinciA⁺                                |
 |  - intercepts requests at the gateway                                   |
 |  - evaluatePolicy() matches rules in /data/GOVERNED/                    |
 |  - Returns ALLOW/DENY Decision Object                                   |
 +-------------------------------------------------------------------------+
                                      |
                                      v (Decision Object)
 +-------------------------------------------------------------------------+
 |                           Governed AI Embassy                           |
 |  - Verifies URN entitlement (src/governed-commerce/transaction.js)      |
 |  - Deducts sandbox payments via mock payment boundary                   |
 |  - Records SHA-256 evidence package to ledger                           |
 +-------------------------------------------------------------------------+
```

The codebase is strictly layered. Higher layers (Embassy/Commerce) import lower governance layers, but lower layers (Governance/Platform) have **no knowledge of payments or pricing models** and must remain completely decoupled.

---

## 2. Layer Definitions & Boundaries

### A. The Governance Layer (`src/governance/`)
* **Core Entrypoint**: `evaluatePolicy(request, policy)` in `evaluate.js`.
* **Input**: An access request envelope containing:
  * `subject` (actor passport details)
  * `resource` (target asset id)
  * `action` (e.g., `TRANSLATE` or `PUBLISH`)
  * `payload` (context mapping parameters)
* **Precedence Rules**: The engine resolves multiple policies sequentially. Precedence rules declare that Ethical Custody conditions outrank local domain and user preferences.
* **Output**: A standardized Decision Object:
  ```json
  {
    "status": "ALLOW" | "ALLOW_WITH_CONSTRAINTS" | "DENY",
    "policy_id": "DAVINCIA-CULTURAL-003",
    "reason_code": "ALLOW_SOVEREIGN" | "INVALID_DELEGATION" | "PROVENANCE_DRIFT_SUSPENSION"
  }
  ```

### B. The Admission & Platform Layer (`src/platform/`)
* **Core Entrypoint**: `verifyPassportSchema(passport)` and `delegateCapabilities(...)` in `passport.js`.
* **Role**: Handles URN registration, Governance Passport issuance, cryptographic signature validation, and delegation scopes.
* **Delegation Token**: A token mapping a human delegator to a proxy agent. If the human passport is suspended or revoked, all proxy agent tokens become immediately invalid.

### C. The Knowledge Fabric Layer (`src/knowledge/`)
* **Core Entrypoint**: `refineRawToDerived(...)` in `refinery.js`.
* **Role**: Periodically pulls raw data elements, calculates SHA-256 integrity hashes, checks metadata properties, and generates derived assets in `/data/GOVERNED/`.
* **Provenance Check**: During execution, the current asset hash is compared against the registry hash. A mismatch halts the pipeline and triggers a suspension log.

### D. The Commercial Layer (`src/governed-commerce/` & `src/marketplace/`)
* **Core Orchestrator**: `src/governed-commerce/transaction.js`.
* **Catalog & Offers**: `src/marketplace/offers.js` generates cryptographically bound offers based on versioned licensing agreements and pricing plans defined in `catalog.js`.
* **Fail-Closed Execution**: If the governance engine returns a status other than `ALLOW` or `ALLOW_WITH_CONSTRAINTS`, the commerce engine immediately sets the price to `$0.00` and refuses to issue an entitlement or clear payment.

---

## 3. Data Flows & Evidence Ledgering

### Evidence Packages
Every transaction generates an audit receipt saved to `data/evidence-packages/<urn-hash>.json` and appended to `data/evidence-ledger.jsonl`.
The package records:
```json
{
  "transaction_id": "urn:davincia:transaction:123",
  "actor_passport": "urn:davincia:passport:human:david",
  "decision": { "status": "ALLOW", "policy_id": "DAVINCIA-CULTURAL-003" },
  "price": 0.05,
  "evidence_hash": "sha256-..."
}
```

---

## 4. Test & Verification Architecture

* **Unit Testing**: Standard Node.js `test` framework executed via `scripts/run-unit-tests.mjs`.
* **E2E Golden Path Test**: Located in `tests/e2e-transaction.test.js`, verifying the complete flow from passport onboarding to billing.
* **Scorecards**: Static analysis and runtime validation script scorecards located in `/tools/` executing assertions for regression prevention.
