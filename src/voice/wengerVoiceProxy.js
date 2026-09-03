/**
 * Alex Wenger² Live Voice Pipeline & Dynamic Pacing Bridge
 * Implements Article 19 Claim 4 (Audio Modality Fallbacks & Dynamic Speech Cadence)
 */

export class WengerVoiceProxy {
  constructor(options = {}) {
    this.speechSynthesis = (typeof window !== 'undefined' && window.speechSynthesis) ? window.speechSynthesis : null;
    this.audioContext = null;
    this.analyser = null;
    this.isSpeaking = false;
    this.isListening = false;
    this.onStateChange = options.onStateChange || (() => {});
  }

  initAudioContext() {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !this.audioContext) {
        this.audioContext = new AudioCtx();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
      }
    } catch (e) {
      console.warn("[WengerVoiceProxy] AudioContext unavailable:", e);
    }
  }

  /**
   * Calculates speech cadence, pitch, and volume based on Article 19 Tone State
   */
  calculateVoiceParameters(toneState) {
    switch (toneState) {
      case "MODULATED":
        // Claim 4: Supportive pacing, slower and softer
        return {
          rate: 0.85,
          pitch: 0.95,
          volume: 0.9,
          prefix_announcement: "Tempo guidance: "
        };

      case "DECAYED":
        // Claim 8: Neutral objective, minimal cadence
        return {
          rate: 0.75,
          pitch: 1.0,
          volume: 0.8,
          prefix_announcement: "Neutral log: "
        };

      case "RECOVERING":
        // Claim 8: Encouraging progressive return
        return {
          rate: 0.95,
          pitch: 1.05,
          volume: 1.0,
          prefix_announcement: "Rhythm update: "
        };

      case "NEUTRAL":
        return {
          rate: 0.80,
          pitch: 1.0,
          volume: 0.8,
          prefix_announcement: "System notice: "
        };

      case "BASELINE":
      default:
        // Baseline direct professional coaching
        return {
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          prefix_announcement: ""
        };
    }
  }

  /**
   * Synthesizes coaching feedback using the appropriate tone-modulated speech profile
   */
  speakCoachingResponse(coachingOutput, onComplete = () => {}) {
    // Respect governance first: if delivery_modality is NONE (e.g. governance blocked), mute voice output
    if (coachingOutput.delivery_modality === "NONE") {
      this.isSpeaking = false;
      this.onStateChange({ isSpeaking: false });
      onComplete({ success: false, reason: "GOVERNANCE_MUTED" });
      return;
    }

    if (!this.speechSynthesis) {
      onComplete({ success: false, reason: "NO_SPEECH_SYNTHESIS" });
      return;
    }

    // Cancel any in-flight utterance
    this.speechSynthesis.cancel();

    const textToSpeak = coachingOutput.text || "Awaiting telemetry.";
    const params = this.calculateVoiceParameters(coachingOutput.tone_state);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = params.rate;
    utterance.pitch = params.pitch;
    utterance.volume = params.volume;

    // Pick a natural English voice if available
    const voices = this.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('en-GB') || v.name.includes('en-US')) && v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    this.isSpeaking = true;
    this.onStateChange({ isSpeaking: true, toneState: coachingOutput.tone_state });

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange({ isSpeaking: false });
      onComplete({ success: true });
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.onStateChange({ isSpeaking: false, error: e });
      onComplete({ success: false, error: e });
    };

    this.speechSynthesis.speak(utterance);
  }

  /**
   * Starts speech recognition if supported by the browser
   */
  startListening(onTranscript, onError) {
    if (typeof window === 'undefined') return null;

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onError) onError(new Error("SPEECH_RECOGNITION_UNAVAILABLE"));
      return null;
    }

    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IE'; // Cork / Ireland dialect default, falls back to standard EN

    recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange({ isListening: true });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
    };

    recognition.onerror = (e) => {
      this.isListening = false;
      this.onStateChange({ isListening: false, error: e });
      if (onError) onError(e);
    };

    recognition.onend = () => {
      this.isListening = false;
      this.onStateChange({ isListening: false });
    };

    try {
      recognition.start();
      return recognition;
    } catch (e) {
      if (onError) onError(e);
      return null;
    }
  }

  stopAll() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.isListening = false;
    this.onStateChange({ isSpeaking: false, isListening: false });
  }
}
