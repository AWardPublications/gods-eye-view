/**
 * Audio Processor Provider Contract
 * Formal interface for acoustic noise suppression, gain normalization, and echo cancellation.
 */

export class AudioProcessor {
  constructor(options = {}) {
    this.name = options.name || "BaseAudioProcessor";
    this.version = options.version || "1.0.0";
    this.noiseSuppression = options.noiseSuppression ?? true;
    this.gainNormalization = options.gainNormalization ?? true;
  }

  /**
   * Processes raw PCM audio before feeding into VAD / STT
   */
  async process(rawAudioBuffer) {
    throw new Error(`[${this.name}] process() must be implemented by subclass.`);
  }

  getMetadata() {
    return {
      processor: this.name,
      version: this.version,
      noise_suppression: this.noiseSuppression,
      gain_normalization: this.gainNormalization
    };
  }
}
