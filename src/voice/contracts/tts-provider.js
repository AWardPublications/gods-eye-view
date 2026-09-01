/**
 * Text-to-Speech (TTS) Provider Contract
 * Formal interface for pluggable neural speech synthesis engines.
 */

export class TextToSpeechProvider {
  constructor(options = {}) {
    this.name = options.name || "BaseTTSProvider";
    this.version = options.version || "1.0.0";
    this.modelName = options.modelName || "generic-voice";
    this.sampleRate = options.sampleRate || 24000;
    this.isStreaming = Boolean(options.isStreaming);
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    return { ok: true, provider: this.name, version: this.version };
  }

  /**
   * Synthesizes governed response text into audio
   * @param {string} text - Canonical governed text
   * @param {Object} prosody - Pacing, cadence, pitch, volume, and tone state
   * @param {Object} options
   * @returns {Promise<{ audio_buffer: Uint8Array|ArrayBuffer|null, sample_rate: number, duration_ms: number, ttfa_ms: number, rtf: number, provider_metadata: Object }>}
   */
  async synthesize(text, prosody = {}, options = {}) {
    throw new Error(`[${this.name}] synthesize() must be implemented by subclass.`);
  }

  getMetadata() {
    return {
      provider: this.name,
      version: this.version,
      model: this.modelName,
      sample_rate: this.sampleRate,
      streaming_supported: this.isStreaming,
      initialized: this.isInitialized
    };
  }
}
