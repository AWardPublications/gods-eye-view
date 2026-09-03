# DaVinciA⁺ Institutional Gap Register

**PURPOSE**: System Proof Pack — Transparent Forensic Inventory of Open Technical & Infrastructure Gaps  
**DATE**: 01 September 2026  
**STATUS**: FROZEN & AUDITED  

---

## 1. Open Gaps Inventory

| Gap ID | Category | Description | Current State | Required for Production Clearance |
|---|---|---|---|---|
| **GAP-IP-01** | Patent Authority | Claims 10–13 are engineering test specs, not published WIPO Article 19 claims. | Handled via `docs/ip/claim-authority-audit.md` | Keep Claims 1–9 as the sole published patent claims. |
| **GAP-S3-01** | Cloud Storage | Wasabi S3 WORM off-site replication is currently executed by a local daemon without live S3 credentials. | Local WORM header simulation & checksum validation | Provision live Wasabi S3 bucket with Object Lock and configure credentials. |
| **GAP-DB-01** | Distributed DB | PostgreSQL adapter runs in-memory fallback during local/CI test runs. | In-memory relational tables + production SQL schema | Connect live PostgreSQL 16+ instance via `DATABASE_URL` in production staging. |
| **GAP-VOX-01** | Live Audio | WebRTC streaming audio latency is benchmarked in a local queue; live bi-directional speech uses Web Speech API. | Local Opus frame queue (<10ms) + browser speech synthesis | Provision OpenAI Realtime ephemeral session tokens for cloud WebRTC voice. |
| **GAP-PRN-01** | Physical Fulfillment | 7-Step SVG Refinery generates valid print-ready SVGs; automated physical print-on-demand API is not wired. | Live SVG rendering in Studio HUD + SVG download | Connect print-on-demand webhook (e.g. Prodigi / MakePlayingCards API). |

---

## 2. Risk Mitigation & Resolution Path

All listed gaps have working reference implementations and deterministic test harnesses. None of them represent architectural blockers; they represent infrastructure provisioning steps for cloud staging.
