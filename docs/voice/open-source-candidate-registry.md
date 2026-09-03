# Open-Source Voice & Speech Technology Candidate Registry

**SUBSYSTEM**: Alex Wenger² / DaVinciA⁺ Voice & Speech Pipeline  
**SCOPE**: DATA → TEXT → VOICE → PLAYER  
**DATE**: 01 September 2026  
**STATUS**: SYSTEMATIC EVALUATION REGISTRY  

---

## 1. Evaluation Dimensions & Weighted Scoring Model

| Dimension | Weight (%) | Criteria & Rationale |
|---|---|---|
| **1. Output / Input Quality** | 12% | Intelligibility, Naturalness (MOS), Word Error Rate (WER), Pronunciation Accuracy |
| **2. Latency (TTFA / Streaming)** | 12% | Time-to-First-Audio (TTFA) < 150ms, Real-Time Factor (RTF) < 0.3 |
| **3. CPU / Edge Viability** | 10% | Clean execution on standard x86_64 / ARM64 without mandatory dedicated GPU |
| **4. GPU / Acceleration Viability** | 6% | Optional CUDA/Metal/DirectML/TensorRT acceleration support |
| **5. Memory & Binary Footprint** | 8% | RAM/VRAM < 500MB, Model size < 200MB for edge deployment |
| **6. Licensing & Commercial Usability** | 10% | MIT / Apache 2.0 / BSD (Strict prohibition of non-commercial or copyleft encumbrances) |
| **7. Architecture & Adapter Isolation** | 10% | Pluggable interface compliance, headless operation, zero external telemetry |
| **8. Tone & Prosody Controllability** | 10% | Support for Article 19 Tone States (Pacing, Cadence, Pitch, Volume Modulation) |
| **9. Maintenance & Community Activity** | 6% | Active commits in 2025/2026, issue resolution velocity, release cadence |
| **10. Security & Supply Chain Posture** | 8% | Clean dependency tree, pinned binaries, no hidden remote phone-home hooks |
| **11. Offline / Self-Hosted Guarantee** | 8% | 100% functional without external network or API vendor lock-in |

---

## 2. Speech-to-Text (STT / ASR) Candidates

### STT-01: Sherpa-ONNX (Next-gen Kaldi / k2-fsa)
* **Repository**: `https://github.com/k2-fsa/sherpa-onnx`
* **License**: Apache 2.0 (Commercially Permissive)
* **Runtime**: C++, Node.js/WASM, Python, Go, Rust, C#, Swift
* **Hardware Support**: CPU (x86_64, ARM), GPU (CUDA, CoreML, DirectML)
* **Model Footprint**: 15MB – 150MB (Zipformer, SenseVoice, Moonshine, Whisper-ONNX)
* **Streaming Support**: **Native Streaming & Non-Streaming**
* **Latency**: First-token < 80ms, RTF ~ 0.05 on modern CPU
* **Suitability**: **HIGH**. Unifies STT, TTS, and VAD under a single lightweight Apache 2.0 engine.
* **Status**: **SHORTLISTED / ADOPTED_CORE**

### STT-02: Whisper.cpp (Georgi Gerganov)
* **Repository**: `https://github.com/ggerganov/whisper.cpp`
* **License**: MIT
* **Runtime**: C/C++, WebAssembly, Node.js bindings
* **Hardware Support**: CPU (AVX2, AVX-512, NEON), GPU (Metal, CUDA, OpenCL)
* **Model Footprint**: 39MB (tiny.en quantized) to 460MB (small.en)
* **Streaming Support**: Streaming chunking with sliding context window
* **Latency**: ~120ms chunk latency on CPU
* **Suitability**: **HIGH**. Exceptional CPU optimization and zero dependency footprint.
* **Status**: **SHORTLISTED**

### STT-03: Moonshine (Useful Sensors)
* **Repository**: `https://github.com/usefulsensors/moonshine`
* **License**: MIT
* **Runtime**: Python, ONNX, C++
* **Hardware Support**: Edge CPU, Microcontrollers, x86_64
* **Model Footprint**: 27M – 60M parameters (~60MB quantized)
* **Streaming Support**: Variable-length real-time audio chunk processing
* **Latency**: Extremely fast (<50ms per phrase)
* **Suitability**: **HIGH**. Engineered specifically for low-resource real-time edge interactions.
* **Status**: **SHORTLISTED**

### STT-04: SenseVoice (Alibaba FunASR)
* **Repository**: `https://github.com/FunAudioLLM/SenseVoice`
* **License**: MIT
* **Runtime**: Python, ONNX, C++
* **Hardware Support**: CPU, GPU (CUDA)
* **Model Footprint**: ~200MB (SenseVoice-Small)
* **Latency**: 5x faster than Whisper with integrated acoustic emotion & tone tags
* **Suitability**: **HIGH**. Strong alignment with Article 19 emotion/tone feature extraction.
* **Status**: **SHORTLISTED**

### STT-05: Web Speech API (W3C Standard)
* **Repository**: Native Browser Engine (Chromium / WebKit)
* **License**: Public Web Standard
* **Runtime**: Browser JavaScript
* **Hardware Support**: Native OS Speech Subsystem
* **Latency**: ~100ms - 250ms
* **Suitability**: **ESSENTIAL FALLBACK**. Zero-install in-browser execution.
* **Status**: **ADOPTED_FALLBACK**

---

## 3. Text-to-Speech (TTS / Neural Synthesis) Candidates

### TTS-01: Kokoro-82M (hexgrad)
* **Repository**: `https://github.com/hexgrad/kokoro` / `https://github.com/thewh1teagle/kokoro-onnx`
* **License**: Apache 2.0
* **Runtime**: ONNX, C++, Python, WebAssembly / Node.js
* **Hardware Support**: Pure CPU real-time, GPU (CUDA, DirectML)
* **Model Footprint**: 82M parameters (~80MB ONNX float32/fp16/q8)
* **Latency**: TTFA < 120ms, RTF < 0.15 on standard CPU
* **Quality**: Exceptional naturalness, clear articulation, studio-grade phoneme rendering
* **Prosody Control**: Full phoneme-level speed, pitch, and duration scaling
* **Suitability**: **HIGHEST**. Exceptional quality-to-size ratio in open source.
* **Status**: **SHORTLISTED / ADOPTED_CORE**

### TTS-02: Piper (Open Home Foundation / Rhasspy)
* **Repository**: `https://github.com/rhasspy/piper`
* **License**: MIT
* **Runtime**: C++, ONNX Runtime, Python
* **Hardware Support**: Low-power CPU (Raspberry Pi, x86_64), GPU
* **Model Footprint**: 15MB – 60MB per voice
* **Latency**: TTFA < 50ms, RTF < 0.10 on Raspberry Pi 4
* **Quality**: High intelligibility, crisp delivery, fast tempo handling
* **Suitability**: **HIGH**. Ultra-fast low-latency sports coaching fallback.
* **Status**: **SHORTLISTED / ADOPTED_LIGHTWEIGHT**

### TTS-03: StyleTTS 2
* **Repository**: `https://github.com/yl4579/StyleTTS2`
* **License**: MIT
* **Runtime**: PyTorch, Python
* **Hardware Support**: GPU recommended (CPU slower)
* **Model Footprint**: ~300MB
* **Latency**: ~250ms - 400ms (Diffusion steps)
* **Quality**: Unmatched expressive human prosody
* **Suitability**: **MEDIUM**. High quality but heavier compute footprint than Kokoro/Piper.
* **Status**: **DEFERRED (HIGH-TIER GPU PROFILES)**

### TTS-04: Web Speech API (`window.speechSynthesis`)
* **Repository**: Native Browser Standard
* **License**: Public Web Standard
* **Runtime**: Browser Native
* **Latency**: < 30ms immediate start
* **Prosody**: Deterministic `rate`, `pitch`, and `volume` modulation
* **Suitability**: **ESSENTIAL ZERO-DEPENDENCY BROWSER FALLBACK**.
* **Status**: **ADOPTED_FALLBACK**

---

## 4. Voice Activity Detection (VAD) & Audio Processing Candidates

### VAD-01: Silero VAD v5 (snakers4)
* **Repository**: `https://github.com/snakers4/silero-vad`
* **License**: MIT
* **Runtime**: ONNX, C++, Python, WebAssembly / JS
* **Footprint**: < 2MB model
* **Latency**: < 1ms per 30ms audio chunk
* **Features**: State-of-the-art speech start/end boundary detection, barge-in support
* **Suitability**: **HIGHEST**. Industry gold standard for real-time speech boundary detection.
* **Status**: **ADOPTED_CORE**

### VAD-02: WebRTC Native VAD (Google / Chromium)
* **Repository**: `https://webrtc.googlesource.com/src/`
* **License**: BSD-3-Clause
* **Runtime**: C, WebAssembly
* **Footprint**: < 50KB
* **Features**: Classical GMM energy detection, 3 aggressiveness modes
* **Suitability**: **HIGH**. Ultra-lightweight fallback.
* **Status**: **ADOPTED_FALLBACK**

---

## 5. Audio Transport & Codec Candidates

| Technology | License | Latency Profile | Network Reliability | Use Case in Alex Wenger² | Status |
|---|---|---|---|---|
| **Opus Codec** | BSD-3-Clause | 5ms – 20ms frames | FEC (Forward Error Correction) | Core audio compression standard | **ADOPTED_STANDARD** |
| **WebRTC MediaStream / DataChannel** | W3C / BSD | < 100ms P2P | UDP with NACK / jitter buffer | Real-time browser coaching | **ADOPTED_PRIMARY** |
| **WebSocket PCM / Opus Streaming** | RFC 6455 | 50ms – 150ms | TCP reliable delivery | Edge / Cloud server bridge | **ADOPTED_SECONDARY** |
| **Local Memory Ring Buffer** | MIT (Internal) | < 1ms | 100% In-Process | Headless CI & Local Testing | **ADOPTED_LOCAL** |
