/**
 * Alex Wenger Golf Platform — Voice & Speech Synthesis Engine (Piper TTS / Whisper STT Integration)
 *
 * Connects to State 5 (RETURN TO ALEX) to provide:
 * 1. Sub-50ms Piper TTS voice config (Alex Voice: Warm, Confident, Authoritative, French-Irish Cadence).
 * 2. SSML Emotion & Cadence markup generator.
 * 3. On-device Whisper.cpp STT speech input hooks.
 *
 * @module alex-wenger-golf/core/vocal/alexVoiceAudioEngine
 */

export const VOICE_PROFILES = Object.freeze({
  Alex: {
    speaker_id: 'alex_wenger_v1',
    model: 'piper-en_IE-alex-medium',
    sample_rate_hz: 22050,
    cadence: 'WARM_AUTHORITATIVE',
    default_ssml_pitch: '+0%',
    default_ssml_rate: '1.05',
    tagline: 'Mais oui, my friend!',
  },
  Al: {
    speaker_id: 'al_host_v1',
    model: 'piper-en_US-al-medium',
    sample_rate_hz: 22050,
    cadence: 'BROADCAST_ENGAGING',
    default_ssml_pitch: '+2%',
    default_ssml_rate: '1.10',
    tagline: 'Welcome back to the clubhouse podcast!',
  },
});

/**
 * Format speech text into Piper TTS SSML payload with vocal cadence and emotion markers.
 * @param {string} speaker
 * @param {string} text
 * @returns {object} SSML speech synthesis payload
 */
export function generateSSMLSpeechPayload(speaker = 'Alex', text = '') {
  const profile = VOICE_PROFILES[speaker] || VOICE_PROFILES.Alex;

  const ssml = `<speak><prosody rate="${profile.default_ssml_rate}" pitch="${profile.default_ssml_pitch}"><emphasis level="strong">${profile.tagline}</emphasis> ${text}</prosody></speak>`;

  return {
    speaker: profile.speaker_id,
    model: profile.model,
    sample_rate_hz: profile.sample_rate_hz,
    ssml,
    raw_text: text,
    latency_target_ms: 45,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Process hands-free Whisper STT speech transcript into normalized query payload.
 * @param {string} audioTranscript
 * @returns {object} Normalized audio query payload
 */
export function processWhisperSTTInput(audioTranscript = '') {
  const cleaned = String(audioTranscript).trim();
  return {
    stt_engine: 'whisper.cpp-ondevice',
    transcript: cleaned,
    word_count: cleaned.split(/\s+/).filter(Boolean).length,
    timestamp: new Date().toISOString(),
  };
}
