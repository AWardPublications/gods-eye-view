# Alex Wenger Golf: DaVinciA⁺ Governance Case Study (v1.0.0)

This case study documents the complete vertical implementation of **Alex Wenger Golf** under the sovereign controls of the DaVinciA⁺ Governance Architecture.

---

## 1. Architectural Model & Component Roles

The vertical governance topology decouples human permission from automated execution:

* **Sovereign Operator (DAVID_OS)**: David O'Connor manages the core system policy. The player (Player One) manages their individual telemetry consent permissions (`athlete_consent: true` / `career_opt_in: true`).
* **Constitutional Policy Resolver (DaVinciA⁺)**: Evaluates incoming requests against target rules in `src/policies/alex-wenger.policy.json`.
* **Governed Agent (Wenger AI Golf Coach)**: Interacts with the swing database purely under proxy authority.
* **Sandbox Commerce Ledger (Governed AI Embassy)**: Logs metered usage and settles transaction splits downstream of allowance decisions.

---

## 2. Governed Knowledge Assets

Three core assets from the Alex Wenger knowledge corpus are registered in the metadata catalog:

1. **`urn:davincia:knowledge:asset:wenger-swing-mechanics`**:
   * *Classification*: `SENSITIVE_PROTECTED`
   * *Provenance Hash*: `sha256-wenger-swing-mechanics-prov-hash-88c2f1`
   * *Permitted Actions*: `READ`, `ANALYSE`, `COACH`
   * *Prohibited Actions*: `TRANSFORM`, `DELETE`
   * *Pricing*: `USAGE_BASED` ($0.05 per coaching unit)
   * *License*: `wenger-commercial-v1`

2. **`urn:davincia:knowledge:asset:wenger-drills-database`**:
   * *Classification*: `PUBLIC_RESTRICTED`
   * *Provenance Hash*: `sha256-wenger-drills-database-prov-hash-3c829e`
   * *Permitted Actions*: `READ`, `SEARCH`, `COACH`
   * *Prohibited Actions*: `PUBLISH`, `TRANSFORM`
   * *Pricing*: `FIXED` ($0.02 per access unit)
   * *License*: `wenger-educational-v1`

3. **`urn:davincia:knowledge:asset:wenger-course-strategy`**:
   * *Classification*: `SENSITIVE_PROTECTED`
   * *Provenance Hash*: `sha256-wenger-course-strategy-prov-hash-99a31b`
   * *Permitted Actions*: `READ`, `ANALYSE`, `TRAIN`
   * *Prohibited Actions*: `DELETE`, `PUBLISH`
   * *Pricing*: `USAGE_BASED` ($0.05 per coaching unit)
   * *License*: `wenger-commercial-v1`

---

## 3. Five Governed Operating Modes

Policies govern player interaction across five distinct contexts:

| Mode | Allowed Action | Constraints / Policies Evaluated |
| :--- | :--- | :--- |
| **TRAIN** | `TRAIN` | Requires active `athlete_consent: true`. |
| **PREPARE** | `PREPARE` | Requires active `athlete_consent: true`. |
| **COMPETE** | `COMPETE` | Requires active `athlete_consent: true` AND secondary human operator supervision (`human_supervision: true`). Unsupervised access is blocked with `SUPERVISION_REQUIRED`. |
| **REVIEW** | `REVIEW` | Requires active `athlete_consent: true`. |
| **CAREER** | `CAREER` | Requires explicit `career_opt_in: true`. |

---

## 4. Adversarial Attack & Fail-Closed Verdicts

* **Revocation Integrity**: If the player revokes consent (`athlete_consent = false`), requests for `PUBLISH`, `TRAIN`, or `COACH` are immediately blocked with a `DENY (CUSTODY_PROTECTED)` outcome. No commercial billing occurs.
* **Provenance Drift Invalidation**: If the swing mechanics checksum shifts, any active entitlement is suspended, and the transaction locks.
* **Payment Bypass Lockout**: Any attempt to trigger transaction settlements directly without a signed Decision Object resolves to `HOLD / DENY`.

---

## 5. Verification & Conformance Verdict
* **Unit Tests**: Full test suite validation in `tests/conformance/domains/alex-wenger.test.mjs` verifying all 5 modes.
* **Maturity Status**: **DEMONSTRATED & SANDBOXED** (simulated payment clearances with schema-validated ledgering).
