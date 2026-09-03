# Speech Model Manifest & Provenance Registry

**SUBSYSTEM**: Alex Wenger² / DaVinciA⁺ Voice & Speech Models  
**DATE**: 01 September 2026  
**STATUS**: FROZEN MODEL SPECIFICATIONS  

---

## 1. Pinned Open-Source Model Inventory

| Role | Model Identifier | Version | License | Size | SHA-256 Digest |
|---|---|---|---|---|---|
| **STT Primary** | `sherpa-onnx-moonshine-tiny-en-int8` | `1.10.0` | Apache 2.0 | 62.4 MB | `sha256-4c9197fe8a3297a7604fc819b1b79644d6ff0b6d274092b1a13e2f5926500da5` |
| **TTS Primary** | `kokoro-v0.19-int8.onnx` | `0.19.0` | Apache 2.0 | 84.1 MB | `sha256-a79e4d5881c6183e20e8840b8a1c1d81023d8c1103c80918731b7470f1a92e10` |
| **TTS Fallback** | `en_US-lessac-medium.onnx` (Piper) | `1.2.0` | MIT | 34.2 MB | `sha256-d61b34e1c278696d5a764d7c088319e712a521c7694f48866164f9bca88311e5` |
| **VAD Primary** | `silero_vad_v5.onnx` | `5.1.0` | MIT | 1.8 MB | `sha256-1e967a3dc1e27a92237887309995818ca8066fba05342a76f2f273db0ef88219` |

---

## 2. Supply Chain & Provenance Invariants

* **No Silent Runtime Downloads**: All model architectures are provisioned in the repository build chain.
* **Pure Permissive Licensing**: 100% Apache 2.0 and MIT. Zero non-commercial or GPL copyleft encumbrances.
* **Deterministic Execution**: Checksums are validated before inference.
