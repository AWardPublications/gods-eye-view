# DaVinciA⁺ AI-Native Repository Operating Manual (v1.0.0)

This is the primary operational orientation guide for AI coding agents inheriting this repository. Follow this manual strictly to preserve system design, maintain correctness, and avoid violating constitutional boundaries.

---

## 1. MISSION

**DaVinciA⁺** is a machine-enforceable governance infrastructure layer that separates technical capability from authority and places governance upstream of execution and commerce.

### Technical Readiness Definitions

To prevent confusion, the system explicitly defines and separates technical maturity:

* **PRODUCTION**: The core policy evaluation engine, validation schema routines, and passport/delegation cryptographic signatures. These are mathematically complete, tested, and production-grade.
* **DEMONSTRATED**: End-to-end execution flows where external agents request, authorize, consume, and settle transactions.
* **SANDBOX / SIMULATED**: The downstream payment boundary (`PAYMENT_PROVIDER = SANDBOX`). Credit clearance, pricing splits, and wallet balances are sandboxed in memory and logs; no live credit card transactions or banking systems are connected.

---

## 2. SYSTEM MAP

The repository is built around three distinct architectural layers:

```
                  +-----------------------------------+
                  |             DAVID_OS              |
                  |     Human/Organization Authority  |
                  +-----------------------------------+
                                    |
                                    v (Issues Passport / Delegation)
                  +-----------------------------------+
                  |            DaVinciA⁺              |
                  |     Constitutional Policy Gate    |
                  +-----------------------------------+
                                    |
                                    v (Yields ALLOW/DENY Decision)
                  +-----------------------------------+
                  |        Governed AI Embassy        |
                  |   Discovery, Catalog & Commerce   |
                  +-----------------------------------+
                                    |
                                    v (Executes Transaction & Ledgering)
                  +-----------------------------------+
                  |        App Domains (e.g. CorkLan) |
                  +-----------------------------------+
```

1. **DAVID_OS (Operator Layer)**: Establishes the human/organizational authority layer. It issues and revokes Governance Passports for actors, creates delegation scopes for AI agents, and reviews audit ledgers.
2. **DaVinciA⁺ (Constitutional Layer)**: Intercepts all gateway operations, validates passport signatures, evaluates targets and conditions, and yields signed, immutable Decision Objects (e.g., `ALLOW`, `ALLOW_WITH_CONSTRAINTS`, or `DENY`).
3. **Governed AI Embassy (Exchange Layer)**: Governs discovery of cultural knowledge assets, manages licensing plans, meters token usage, clears sandboxed transactions, and appends receipts to the evidence ledger.

---

## 3. GOVERNANCE PRINCIPLES

### Core Invariant: `CAPABILITY ≠ AUTHORITY`
An actor or AI agent may technically have the capability to fetch or translate an asset, but it MUST NOT be permitted to do so unless it has verified authority. 

### Sequential Ordering Constraint
Every transaction transaction must flow sequentially. A stage cannot bypass its predecessor:

$$\text{DISCOVER} \rightarrow \text{IDENTIFY} \rightarrow \text{GOVERN} \rightarrow \text{AUTHORIZE} \rightarrow \text{ENTITLE} \rightarrow \text{CONSUME} \rightarrow \text{METER} \rightarrow \text{SETTLE} \rightarrow \text{ALLOCATE} \rightarrow \text{EVIDENCE}$$

### Commerce is Downstream
Payment does not buy authority. If DaVinciA⁺ evaluates a request as `DENY`, no commercial entitlement may be issued, and no settlement may occur.

---

## 4. CONSTITUTIONAL FREEZE

The constitutional engine semantics are frozen. **DO NOT modify the files or functions that implement these semantics.**

### Frozen Files & Handlers
* **`src/governance/evaluate.js`**: Core policy evaluation, precedence rules (Ethical Custody outranking domain targets), and context matching.
* **`src/platform/passport.js`**: Cryptographic validation, UDO state verification, and schema checking.
* **`src/governed-commerce/transaction.js`**: Fail-closed transaction coordinator enforcing that settlements only proceed for `ALLOW` decisions.

### Escalation Protocol: `CONSTITUTIONAL_CHANGE_REQUIRED`
If a feature request requires altering these frozen files or modifying policy evaluation rules, the agent **MUST stop immediately** and output the token:
```
CONSTITUTIONAL_CHANGE_REQUIRED
```

---

## 5. REPOSITORY MAP

```
C:\Users\David\.gemini\antigravity\scratch\gods-eye-view\
├── data/
│   ├── GOVERNED/          <-- Derived compiled JSON assets output by refinery
│   ├── RAW/               <-- Raw cultural assets source files
│   └── evidence-packages/ <-- Cryptographic verification logs
├── milestones/            <-- Mutation certificates certifying v0.1.0 to v0.8.0
├── src/
│   ├── governance/        <-- Policy evaluation logic (FROZEN)
│   ├── platform/          <-- Passport & delegation verification (FROZEN)
│   ├── governed-commerce/ <-- Transaction, metering & settlement orchestrators (FROZEN)
│   ├── marketplace/       <-- Catalog metadata, pricing and licensing engines
│   └── data/davincia.js   <-- HUD panel visualization layer and simulations
├── tools/                 <-- Conformance scorecard test scripts
└── package.json           <-- Run scripts and dependencies definition
```

* **Safe to modify**: `src/marketplace/`, `src/data/davincia.js` (UI modifications), `tests/`, `tools/`.
* **Treat cautiously / DO NOT modify**: `src/governance/`, `src/platform/`, `src/governed-commerce/`.

---

## 6. COMPONENT REGISTRY

| Component | Purpose | Inputs | Outputs | Authority | Safe to Modify? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Policy Engine** | Evaluates rules | Request, Policy | Decision Object | `CONSTITUTIONAL` | **NO** |
| **Passport Layer** | Verifies Identity | URN, Signature | Validation Status | `CONSTITUTIONAL` | **NO** |
| **Transaction Coordinator** | Intercepts gateway | Decision, Wallet | Entitlement Status | `CONSTITUTIONAL` | **NO** |
| **Marketplace Catalog** | Catalog metadata | Asset ID | Plan/License URN | `COMMERCIAL` | **YES** |
| **Pricing Engine** | Calculates costs | Volume, Tier | Cost estimate | `COMMERCIAL` | **YES** |
| **Evidence Ledger** | Writes receipts | Transaction logs | SHA-256 Package | `AUDIT_LOG` | **NO** |

---

## 7. TRANSACTION LIFECYCLE

```
[Incoming Request]
       |
       v
1. IDENTIFY: Verify Human/Agent passports and active delegation tokens.
       |
       v
2. GOVERN: Evaluate policies (evaluatePolicy). If invalid/unauthorized -> DENY.
       |
       v
3. ENTITLE: Issue URN commercial entitlement with custom license parameters.
       |
       v
4. METER: Track token consumption against model registry rates.
       |
       v
5. SETTLE: Deduct sandbox balance and write allocation splits.
       |
       v
6. EVIDENCE: Append SHA-256 package hash to the ledger.
```

---

## 8. FAILURE MODEL

* **Passport Expired / Revoked**: Resolves to `DENY (EXPIRED_PASSPORT)` or `DENY (REVOKED_PASSPORT)`. Entitlement blocked.
* **Provenance Drift**: Mismatch between computed sha256 checksum and registry checksum. Resolves to `DENY (PROVENANCE_DRIFT_SUSPENSION)`. Entitlement suspended.
* **Payment Bypass**: Triggering settlement directly without a signed decision. Resolves to `HOLD / DENY (GOVERNANCE_SOVEREIGNTY_VIOLATION)`. Transaction blocked.

---

## 9. TESTING & CONFORMANCE

Run these commands in order to certify changes:

```bash
# 1. Run all unit and integration tests (2,702 tests must pass)
npm test

# 2. Verify Vite production bundle compiles cleanly
npm run build

# 3. Run governance, onboarding, and marketplace scorecards
node tools/run-commercial-conformance.js
node tools/run-embassy-conformance.js
node tools/run-marketplace-conformance.js
```

---

## 10. MILESTONE SYSTEM

A milestone is recognized by executing `node tools/recognize-milestone.js <milestone-name>`.
* **Latest Verified Milestone**: `davincia-governed-marketplace-v0.8.0` on commit `1d63af54ad4037599cb5a07153406f97cecf96fa`.
* **Verification Constraints**: No milestone may be tagged unless all 2,700+ tests and conformance scorecards are 100% green.

---

## 11. HISTORICAL LEARNINGS VS. GUIDE
* **`LEARNINGS.md`**: Stores historical engineering memory (resolved bugs, lessons, and environment configurations).
* **`AI_AGENT_GUIDE.md`**: Provides the active operational orientation map for incoming agents (this file).

---

## 12. CURRENT STATE

* **Latest Commit**: `33f7696c79f9791404c0ec54b73b5eb497fae69e` (main branch)
* **Test Status**: **2,702 / 2,702 Passed**
* **Scorecards**: Real Commerce (10/10), Onboarding (13/13), Marketplace (15/15) - **All PASS**.
* **Payment State**: Sandboxed (no real banking rails).

---

## 13. KNOWN RISKS
* **Vite HMR Invalidation**: Rapid edits to `evaluate.js` or `passport.js` may trigger temporary HMR server build drops in Dev mode; restart the Vite process (`npm run dev`) if hydration issues occur.
* **Registry Serialization Length**: Adding a new data layer to the app without registering it in `src/data/layerState.js` causes immediate browser initialization failure. Always update the registered layers array length assertion in `src/data/layerState.test.mjs`.

---

## 14. CURRENT FRONTIER

The current bottleneck is not engineering capacity, but **institutional legibility and external repeatability**. 

The immediate next frontier is:
* **Evidence Ledger Visibility**: Implementing a visual history inspector below the console log in the UI panel so users can trace and inspect the sequence of transaction receipts generated since boot.

---

## 15. NEXT AGENT PROTOCOL

Before writing code, the incoming agent must execute these steps sequentially:
1. **Orient**: Read `AI_AGENT_GUIDE.md` and `LEARNINGS.md`.
2. **Scan**: Run `git status` and verify tests are green (`npm test`).
3. **Execute**: Propose small, composable additions.
4. **Test**: Run unit tests and all three conformance scorecards.
5. **Certify**: Run `npm run build` to confirm Vite bundles successfully.

---

## 16. AGENT DECISION RULES

* **RULE 1**: Never weaken fail-closed behavior to make a test pass.
* **RULE 2**: Never allow commerce to bypass governance.
* **RULE 3**: Never claim simulated infrastructure is production.
* **RULE 4**: Never modify frozen constitutional semantics without escalation (`CONSTITUTIONAL_CHANGE_REQUIRED`).
* **RULE 5**: Prefer small composable extensions over kernel modification.
* **RULE 6**: Evidence must accompany important governance and commerce decisions.
* **RULE 7**: Tests are evidence, not decoration.
* **RULE 8**: Documentation must reflect implementation reality.

---

## 17. AI HANDOVER SUMMARY

```yaml
PROJECT: DaVinciA+
CURRENT_MILESTONE: davincia-governed-marketplace-v0.8.0
CORE_ENGINE: src/governance/
COMMERCIAL_LAYER: src/governed-commerce/
KNOWLEDGE_LAYER: src/knowledge/
UI_LAYER: src/data/davincia.js
LATEST_TEST_STATUS: 2702/2702 PASSED
LATEST_BUILD_STATUS: SUCCESSFUL
LATEST_CONFORMANCE: 100% PASS (COMMERCIAL, EMBASSY, MARKETPLACE)
CONSTITUTIONAL_STATUS: FROZEN
COMMERCE_STATUS: SANDBOX_SIMULATED
NEXT_FRONTIER: EVIDENCE_LEDGER_UI_VISIBILITY
ESCALATION_TOKEN: CONSTITUTIONAL_CHANGE_REQUIRED
```
