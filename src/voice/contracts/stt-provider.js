/**
 * Speech-to-Text (STT) Provider Contract
 * Formal interface for pluggable speech recognition engines.
 */

export class SpeechToTextProvider {
  constructor(options = {}) {
    this.name = options.name || "BaseSTTProvider";
    this.version = options.version || "1.0.0";
    this.modelName = options.modelName || "generic-model";
    this.isStreaming = Boolean(options.isStreaming);
    this.isInitialized = false;
  }

  async initialize() {
    this.isInitialized = true;
    return { ok: true, provider: this.name, version: this.version };
  }

  /**
   * Transcribes a complete or partial audio chunk
   * @param {Uint8Array|Float32Array|Buffer} audioBuffer
   * @param {Object} context
   * @returns {Promise<{ transcript: string, confidence: number, is_final: boolean, latency_ms: number, provider_metadata: Object }>}
   */
  async transcribe(audioBuffer, context = {}) {
    throw new Error(`[${this.name}] transcribe() must be implemented by subclass.`);
  }

  getMetadata() {
    return {
      provider: this.name,
      version: this.version,
      model: this.modelName,
      streaming_supported: this.isStreaming,
      initialized: this.isInitialized
    };
  }
}
