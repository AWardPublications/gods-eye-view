/**
 * Voice Activity Detection (VAD) Provider Contract
 * Formal interface for speech endpointing, boundary detection, and barge-in interruption.
 */

export class VoiceActivityDetector {
  constructor(options = {}) {
    this.name = options.name || "BaseVADProvider";
    this.version = options.version || "1.0.0";
    this.threshold = options.threshold ?? 0.5;
    this.frameSizeMs = options.frameSizeMs || 30;
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    return { ok: true, provider: this.name, version: this.version };
  }

  /**
   * Evaluates if speech is present in an audio frame
   * @param {Float32Array|Uint8Array|Buffer} pcmFrame
   * @returns {Promise<{ is_speech: boolean, speech_probability: number, is_barge_in: boolean, latency_ms: number }>}
   */
  async processFrame(pcmFrame) {
    throw new Error(`[${this.name}] processFrame() must be implemented by subclass.`);
  }

  getMetadata() {
    return {
      provider: this.name,
      version: this.version,
      threshold: this.threshold,
      frame_size_ms: this.frameSizeMs,
      initialized: this.isInitialized
    };
  }
}
