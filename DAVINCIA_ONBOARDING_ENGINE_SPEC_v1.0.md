# DAVINCIA⁺ ONBOARDING ENGINE SPECIFICATION v1.0

This specification defines the pipeline to dynamically onboard new systems into the DaVinciA⁺ ecosystem based on declarative manifests.

---

## 1. Onboarding Lifecycle States
Every system passport transitions through:

```text
DISCOVERED ➔ PROFILED ➔ PROPOSED ➔ CONFORMANCE_PENDING ➔ CONFORMANT ➔ AUTHORIZED
```

---

## 2. Dynamic Intake Pipeline
* **Discovery**: Ingests and asserts structural integrity of the system manifest.
* **Profiling**: Determines sensitivity classifications and required controls.
* **Proposals**: Suggests core and domain policies.
* **Conformance**: Executes test vectors programmatically.
* **Authorization**: Evaluates and registers cryptographic approvals.
