# DAVINCIA⁺ DRIFT & REQUALIFICATION SPECIFICATION v1.0

This specification defines how the governance fabric monitors changes to onboarding manifests to prevent silent capability changes.

---

## 1. Governance Drift Principle
If any material capability, action, classification, or control is added to a manifest:
* The system transitions instantly: `AUTHORIZED` ➔ `DRIFT_DETECTED` ➔ `SUSPENDED`.
* All active API permissions default to `DENY` until requalification completes.

---

## 2. Requalification Lifecycle
To regain authorization, the modified manifest must progress through:
1. Re-conformance validation (running generated test vectors).
2. Human audit/oversight review.
3. Signature registration.
