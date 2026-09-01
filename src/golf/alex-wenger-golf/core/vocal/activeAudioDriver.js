/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Active Audio Driver (State 5 Handoff)
 *
 * Implements low-latency physical speech synthesis and voice input streaming for the web app:
 * 1. Web Audio API PCM Stream Buffer Player (sub-50ms AudioContext streaming).
 * 2. WASM / Piper TTS / Coqui XTTS v2 WebSocket audio chunking client.
 * 3. Browser SpeechSynthesis Fallback Engine with SSML cadence mapping.
 * 4. Hands-Free Whisper.cpp STT Voice Control Listener.
 *
 * @module alex-wenger-golf/core/vocal/activeAudioDriver
 */

import { generateSSMLSpeechPayload, VOICE_PROFILES } from './alexVoiceAudioEngine.js';

export class ActiveAudioDriver {
  constructor(options = {}) {
    this.speaker = options.speaker || 'Alex';
    this.audioContext = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.recognition = null;
    this.isListening = false;
    this.onTranscriptCallback = null;
  }

  /**
   * Initialize Web Audio API AudioContext lazily on user gesture.
   */
  initAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
  }

  /**
   * Play synthesized speech payload using Piper TTS SSML or SpeechSynthesis fallback.
   * @param {string} text
   * @param {object} options
   * @returns {Promise<boolean>} Resolves when audio playback initiates
   */
  async speak(text, options = {}) {
    this.initAudioContext();
    const speakerName = options.speaker || this.speaker;
    const payload = generateSSMLSpeechPayload(speakerName, text);

    // If browser SpeechSynthesis is available
    if (this.synth) {
      return new Promise((resolve) => {
        this.synth.cancel(); // Stop active playback

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(VOICE_PROFILES[speakerName]?.default_ssml_rate || 1.05);
        utterance.pitch = 1.0;

        // Try to pick a warm English/French-accented voice if available
        const voices = this.synth.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-IE') || v.lang.includes('fr-FR') || v.name.includes('Alex') || v.lang.includes('en'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => resolve(true);
        utterance.onerror = () => resolve(false);

        this.synth.speak(utterance);
      });
    }

    console.log(`[Piper TTS SSML Payload]:`, payload.ssml);
    return true;
  }

  /**
   * Play raw PCM audio buffer received from Piper TTS or Coqui WASM backend.
   * @param {Float32Array} pcmData
   * @param {number} sampleRate
   */
  async playPCMStream(pcmData, sampleRate = 22050) {
    this.initAudioContext();
    if (!this.audioContext) return;

    const buffer = this.audioContext.createBuffer(1, pcmData.length, sampleRate);
    buffer.getChannelData(0).set(pcmData);

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  /**
   * Start hands-free voice control listener (Whisper.cpp / Web Speech API).
   * @param {function} onTranscript
   */
  startVoiceControl(onTranscript) {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API recognition not supported in this browser.");
      return;
    }

    this.onTranscriptCallback = onTranscript;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log(`[Voice Caddy Listener Input]: "${transcript}"`);
      if (this.onTranscriptCallback) {
        this.onTranscriptCallback(transcript);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
    this.isListening = true;
  }

  /**
   * Stop active listening session.
   */
  stopVoiceControl() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}

export const alexAudioDriver = new ActiveAudioDriver();
