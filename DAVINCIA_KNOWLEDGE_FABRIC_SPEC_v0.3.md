# DAVINCIA⁺ GOVERNED KNOWLEDGE FABRIC SPECIFICATION v0.3

This specification defines the architecture of the **DaVinciA⁺ Governed Knowledge Fabric**. The fabric acts as a refinery that ingests raw intellectual corpus material (the catalogue), derives structured assertions and entities, applies the DaVinciA⁺ governance kernel, and registers authorized, commercializable knowledge assets.

---

## 1. Three-Strata Storage Architecture
To preserve provenance and auditability, information is strictly isolated into three tiers:

```text
 ┌────────────────────────────────────────────────────────┐
 │ 1. RAW TIER (Immutable Sources)                        │
 │    - Raw notebooks, books, documents, text files       │
 │    - Unchangeable parent checksums & timestamps        │
 └──────────────────────────┬─────────────────────────────┘
                            │ Machine Extraction
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. DERIVED TIER (Candidate Objects)                    │
 │    - Extracted entities, claims, summaries, embeddings │
 │    - Explicitly NOT authoritative                       │
 └──────────────────────────┬─────────────────────────────┘
                            │ Governance Verification Pipeline
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. GOVERNED TIER (Authorized Assets)                   │
 │    - Passed DaVinciA⁺ lifecycle checking               │
 │    - Carry a signed Universal Decision Object (UDO)    │
 └────────────────────────────────────────────────────────┘
```

---

## 2. Ingestion & Refinery Pipeline
The Refinery executes a 13-stage ingestion ceremony:
1. **Inventory**: Discovers all files and assets on disk.
2. **Canonical Identity**: Allocates stable URNs (e.g. `urn:davincia:knowledge:concept:<uuid>`).
3. **Provenance Capture**: Tracks source files, author metadata, and creation dates.
4. **Domain Discovery**: Auto-detects domain namespaces.
5. **Claim Extraction**: Isolates factual claims from the raw prose.
6. **Relationship Extraction**: Maps connections (e.g., `related_to`, `author_of`).
7. **Sensitivity Classification**: Evaluates data class classification levels.
8. **Manifest Generation**: Generates passport manifests.
9. **Verification Queues**: Routes claims requiring native speaker or regulatory audit verification.
10. **Governance Evaluation**: Executes the frozen DaVinciA⁺ kernel against candidate objects.
11. **Knowledge Registry**: Persists verified objects in the secure registry layer.
12. **API Layer**: Exposes read/query endpoints for domain systems.
13. **Commercial Metadata**: Appends permission models (e.g. `publishable`, `licensable`).

---

## 3. Governed Knowledge Object Schema
Every record in the Governed Tier must conform to this schema:

```json
{
  "object_id": "urn:davincia:knowledge:object:<uuid>",
  "object_type": "knowledge_asset",
  "domain": "DOMAIN_NAME",
  "version": "1.0.0",
  "stratum": "GOVERNED",
  "provenance": {
    "source_urn": "urn:davincia:source:notebook:<uuid>",
    "checksum": "sha256-hash",
    "extracted_at": "ISO-8601-timestamp"
  },
  "verification": {
    "state": "VERIFIED | UNVERIFIED | PENDING_REVIEW",
    "evidence_ref": "urn:davincia:evidence:<uuid>"
  },
  "payload": {
    "claim": "The core thesis or entity statement",
    "details": {},
    "relationships": [
      { "target": "urn:davincia:knowledge:object:<uuid>", "type": "LINK_TYPE" }
    ]
  },
  "governance_passport": {
    "manifest_hash": "sha256-hash",
    "authorized_at": "ISO-8601-timestamp"
  }
}
```
