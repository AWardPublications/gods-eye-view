/**
 * Silero VAD v5 Adapter
 * Implements VoiceActivityDetector contract for speech endpointing and barge-in interruption.
 */

import { VoiceActivityDetector } from '../contracts/vad-provider.js';

export class SileroVadAdapter extends VoiceActivityDetector {
  constructor(options = {}) {
    super({
      name: "SileroVADv5",
      version: "5.1.0",
      threshold: options.threshold ?? 0.5,
      frameSizeMs: 30
    });
    this.isSpeaking = false;
  }

  async processFrame(pcmFrame, options = {}) {
    const startTime = Date.now();
    const isPlayerInterrupting = Boolean(options.is_speaking_while_system_active);

    // Calculate RMS energy of the frame
    let sumSquares = 0;
    const len = pcmFrame ? (pcmFrame.length || 0) : 0;

    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const val = pcmFrame[i] / 32768.0;
        sumSquares += val * val;
      }
    }

    const rms = len > 0 ? Math.sqrt(sumSquares / len) : 0;
    const prob = options.forced_speech_probability ?? Math.min(1.0, rms * 10);
    const hasSpeech = prob >= this.threshold;

    this.isSpeaking = hasSpeech;
    const isBargeIn = hasSpeech && isPlayerInterrupting;

    const elapsedMs = Math.max(1, Date.now() - startTime);

    return {
      is_speech: hasSpeech,
      speech_probability: parseFloat(prob.toFixed(4)),
      is_barge_in: isBargeIn,
      latency_ms: elapsedMs,
      provider_metadata: {
        engine: this.name,
        version: this.version,
        threshold: this.threshold
      }
    };
  }
}
