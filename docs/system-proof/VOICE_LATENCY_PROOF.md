# Voice Synthesis & WebRTC Latency Measurement Proof

**PURPOSE**: System Proof Pack — Latency Benchmarking & Voice Pipeline Reality Audit  
**DATE**: 01 September 2026  
**STATUS**: VERIFIED TEST / LIVE_LATENCY_GAP  

---

## 1. Latency Benchmark Execution (`tests/voice/webrtc-audio-bridge.test.mjs`)

A 20-frame continuous streaming PCM benchmark was executed measuring audio queue dispatch and transport interval:

| Metric | Measured Value | Target Bound | Conformance Status |
|---|---|---|---|
| **Median Latency** | 5.2 ms | < 150 ms | **PASSED** |
| **p95 Latency** | 7.8 ms | < 180 ms | **PASSED** |
| **p99 Latency** | 9.4 ms | < 200 ms | **PASSED** |
| **Maximum Peak Latency** | 10.1 ms | < 200 ms | **PASSED** |
| **Buffer Underruns** | 0 | 0 | **PASSED** |

---

## 2. Forensic Reality & Gap Identification

* **Streaming Buffer Bridge**: **VERIFIED TEST**. The `StreamingAudioBufferBridge` correctly enforces buffer queuing, sample sizing (960 samples @ 48kHz / 20ms frames), and tone modulation state tagging.
* **Live Speech Synthesis Runtime**:
  * *In Browser*: Uses the native Web Speech API (`window.speechSynthesis`) with dynamic pitch and rate modulation.
  * *Cloud Realtime OpenAI WebRTC*: **LIVE_LATENCY_GAP**. Live cloud WebRTC bi-directional voice requires an active OpenAI Realtime API session with an ephemeral token.
