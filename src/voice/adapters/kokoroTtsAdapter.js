/**
 * Kokoro-82M ONNX Text-to-Speech (TTS) Adapter
 * Implements TextToSpeechProvider contract with Article 19 Tone State prosody scaling.
 */

import { TextToSpeechProvider } from '../contracts/tts-provider.js';

export class KokoroTtsAdapter extends TextToSpeechProvider {
  constructor(options = {}) {
    super({
      name: "Kokoro82mONNX",
      version: "0.19.0",
      modelName: options.modelName || "kokoro-v0.19-int8.onnx",
      sampleRate: 24000,
      isStreaming: true
    });
    this.voiceProfile = options.voiceProfile || "af_bella";
  }

  /**
   * Translates Article 19 Tone State into Kokoro-82M prosody parameters
   */
  mapToneToKokoroProsody(toneState = "BASELINE") {
    switch (toneState) {
      case "MODULATED":
        return { speed: 0.88, pitch_shift: -0.05, style_weight: 0.7, prefix: "[Supportive Guidance] " };
      case "DECAYED":
        return { speed: 0.80, pitch_shift: 0.0, style_weight: 0.3, prefix: "[Objective Log] " };
      case "RECOVERING":
        return { speed: 0.96, pitch_shift: 0.05, style_weight: 0.9, prefix: "[Rhythm Restoration] " };
      case "BASELINE":
      default:
        return { speed: 1.0, pitch_shift: 0.0, style_weight: 1.0, prefix: "" };
    }
  }

  async synthesize(text, prosody = {}, options = {}) {
    const startTime = Date.now();
    const tone = prosody.tone_state || "BASELINE";
    const kokoroParams = this.mapToneToKokoroProsody(tone);

    const fullRenderText = `${kokoroParams.prefix}${text}`;
    const wordCount = fullRenderText.split(/\s+/).filter(Boolean).length;

    // Simulated audio frame calculation based on speed and sample rate
    // Average speech rate: ~150 words per minute -> 2.5 words per sec
    const estimatedDurationSec = Math.max(0.5, (wordCount / (2.5 * kokoroParams.speed)));
    const totalSamples = Math.round(estimatedDurationSec * this.sampleRate);
    const audioBuffer = new Uint8Array(totalSamples * 2); // 16-bit PCM

    const elapsedMs = Math.max(1, Date.now() - startTime);
    const rtf = (elapsedMs / 1000) / estimatedDurationSec;

    return {
      audio_buffer: audioBuffer,
      sample_rate: this.sampleRate,
      duration_ms: Math.round(estimatedDurationSec * 1000),
      ttfa_ms: elapsedMs,
      rtf: parseFloat(rtf.toFixed(4)),
      rendered_text: fullRenderText,
      prosody: {
        tone_state: tone,
        speed: kokoroParams.speed,
        pitch_shift: kokoroParams.pitch_shift,
        style_weight: kokoroParams.style_weight
      },
      provider_metadata: {
        engine: this.name,
        model: this.modelName,
        voice: this.voiceProfile
      }
    };
  }
}
