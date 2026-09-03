# WIPO Patent Claim Authority Audit: WO/2026/150385 (PCT/IE2025/050001)

**AUDIT OBJECTIVE**: Determine the exact authoritative boundary of published patent claims vs. internal engineering extensions.  
**AUDIT DATE**: 01 September 2026  
**AUDITOR**: Antigravity System Integration & Proof Gate  
**STATUS**: FROZEN & AUDITED  

---

## 1. Executive Summary & Core Finding

> [!CAUTION]
> **CRITICAL IP AUDIT FINDING**:
> The authoritative WIPO Article 19 publication for `WO/2026/150385` (`PCT/IE2025/050001`) contains **EXACTLY NINE (9) CLAIMS (Claims 1–9)**.
> **Claims 10–13 are NOT part of the published Article 19 claim set.** They originated during development as downstream dependent claim proposals and engineering harnesses.
> **Classification**: Claims 1–9 are `AUTHORITATIVE_PUBLISHED_PATENT_CLAIMS`. Claims 10–13 are `INTERNAL_ENGINEERING_CONCEPTS`.

---

## 2. Claim-by-Claim Authority & Source Mapping

| Claim # | Authoritative Source | Exact Source Location | Implementation Mapping | Status | Forensic Finding |
|---|---|---|---|---|---|
| **Claim 1** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 13–31) | `src/golf/index.js`, `src/golf/nlp/` | `AUTHORITATIVE_PUBLISHED` | Published independent system claim. Full sensorless pipeline. |
| **Claim 2** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 34–40) | `src/golf/governance/policy-router.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Deterministic supervisory pathway. |
| **Claim 3** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 43–46) | `src/golf/governance/session-memory-schema.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Structured longitudinal memory schema. |
| **Claim 4** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 49–59) | `src/golf/article19/output-control.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Dynamic audio summary & supportive tone. |
| **Claim 5** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 63–68) | `src/golf/analytics/drift-detector.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Statistical engagement drift analytics. |
| **Claim 6** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 72–77) | `src/golf/article19/output-control.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Adaptive pacing, complexity, framing. |
| **Claim 7** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 81–85) | `src/golf/adaptation/threshold-evaluator.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Statistical deviation trigger boundaries. |
| **Claim 8** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 89–91) | `src/golf/adaptation/tone-state-machine.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Closed-loop Decay & Recovery state machine. |
| **Claim 9** | WIPO Article 19 Filing | `docs/ip/WO2026150385/authoritative_claims.md` (Lines 94–99) | `src/golf/nlp/compliance-classifier.js` | `AUTHORITATIVE_PUBLISHED` | Published dependent claim. Sensorless ML adherence classifier. |
| **Claim 10** | Engineering Extension | `docs/ip/WO2026150385/extended_claims_10_plus.md` | `tests/golf/patent-reference/extended-claims.test.mjs` | `ENGINEERING_CONCEPT_ONLY` | **NOT A PUBLISHED PATENT CLAIM.** Downstream edge-inference spec. |
| **Claim 11** | Engineering Extension | `docs/ip/WO2026150385/extended_claims_10_plus.md` | `tests/golf/patent-reference/extended-claims.test.mjs` | `ENGINEERING_CONCEPT_ONLY` | **NOT A PUBLISHED PATENT CLAIM.** Secondary sensor fusion spec. |
| **Claim 12** | Engineering Extension | `docs/ip/WO2026150385/extended_claims_10_plus.md` | `tests/golf/patent-reference/extended-claims.test.mjs` | `ENGINEERING_CONCEPT_ONLY` | **NOT A PUBLISHED PATENT CLAIM.** Multi-tenant isolation spec. |
| **Claim 13** | Engineering Extension | `docs/ip/WO2026150385/extended_claims_10_plus.md` | `tests/golf/patent-reference/extended-claims.test.mjs` | `ENGINEERING_CONCEPT_ONLY` | **NOT A PUBLISHED PATENT CLAIM.** Adversarial prompt defense spec. |

---

## 3. Regulatory & Legal Actionable Rules

1. **Strict Terminology Invariant**: Claims 10–13 must NEVER be referred to as "Patent Claims" or "Published Claims" in customer-facing, regulatory, or investor documentation. They are strictly `Technical Boundary Specifications`.
2. **Authoritative Claim Baseline**: The legal patent portfolio for `WO/2026/150385` consists solely of Claims 1–9.
