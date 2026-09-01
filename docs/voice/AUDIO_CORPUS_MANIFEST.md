# Audio Fixture Corpus Manifest

**CORPUS IDENTIFIER**: `WENGER_VOICE_CORPUS_v2.0`  
**TOTAL FIXTURES**: 35 Audio WAV Files  
**DATE**: 01 September 2026  
**STATUS**: VERSIONED & REPRODUCIBLE  

---

## 1. Corpus Category Distribution

| Category | Fixture Count | Sample Rate | Format | Primary Objective |
|---|---|---|---|---|
| **Normal Golf Utterances** | 10 | 16,000 Hz | 16-bit PCM WAV | Core practice and competitive cadence |
| **Short Commands** | 5 | 16,000 Hz | 16-bit PCM WAV | Rapid club and distance queries |
| **Golf Terminology** | 5 | 16,000 Hz | 16-bit PCM WAV | Technical terms (backspin, fade, ratio, stimpmeter) |
| **Proper Names (Swiss/Irish/French)** | 5 | 16,000 Hz | 16-bit PCM WAV | Geographic & cultural entity recognition |
| **Noisy Speech** | 5 | 16,000 Hz | 16-bit PCM WAV | Alpine wind, rain, crowd, turf noise |
| **Hesitation & Repair** | 5 | 16,000 Hz | 16-bit PCM WAV | Athlete hesitation ("uh...", "wait...", "no...") |

---

## 2. Invariant Properties

* Every fixture contains valid 44-byte RIFF/WAVE headers.
* Every fixture has a precomputed deterministic SHA-256 hash digest.
* Tested under `tests/voice/benchmarks/real-voice-benchmark.mjs`.
