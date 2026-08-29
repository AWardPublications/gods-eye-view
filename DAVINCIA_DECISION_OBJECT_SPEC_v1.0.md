# DAVINCIA⁺ DECISION OBJECT SPECIFICATION v1.0

Every governance evaluation produces a signed, standardized Universal Decision Object detailing not only **what** decision was reached, but **why**.

---

## Decision JSON Schema

```json
{
  "$schema": "https://davincia.awardpublications.com/schemas/decision-v1.json",
  "decision_id": "urn:davincia:decision:<uuid>",
  "system_id": "urn:davincia:system:<system_id>",
  "object_id": "urn:davincia:<domain>:<object_type>:<id>",
  "action": "ACTION_NAME",
  "decision": "ALLOW | ALLOW_WITH_CONSTRAINTS | REVIEW_REQUIRED | DENY",
  "reason_code": "REASON_CODE_CONSTANT",
  "policy_version": "vX.Y.Z",
  "kernel_version": "davincia-kernel-conformance-v0.1.0",
  "authority": {
    "human_required": true,
    "human_present": false
  },
  "evidence": [
    "urn:davincia:evidence:<id>"
  ],
  "audit": {
    "timestamp": "ISO-8601-timestamp",
    "actor": "urn:davincia:identity:<class>:<id>",
    "trace_id": "<uuid>"
  }
}
```
