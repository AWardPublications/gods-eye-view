import test from 'node:test';
import assert from 'node:assert/strict';
import { SpeechToTextProvider } from '../../src/voice/contracts/stt-provider.js';
import { TextToSpeechProvider } from '../../src/voice/contracts/tts-provider.js';
import { VoiceActivityDetector } from '../../src/voice/contracts/vad-provider.js';
import { AudioTransport } from '../../src/voice/contracts/audio-transport.js';
import { SherpaOnnxSttAdapter } from '../../src/voice/adapters/sherpaOnnxSttAdapter.js';
import { KokoroTtsAdapter } from '../../src/voice/adapters/kokoroTtsAdapter.js';
import { PiperTtsAdapter } from '../../src/voice/adapters/piperTtsAdapter.js';
import { SileroVadAdapter } from '../../src/voice/adapters/sileroVadAdapter.js';

test('Voice Provider Contracts: Base Interface Enforcement', async () => {
  const baseStt = new SpeechToTextProvider();
  await assert.rejects(async () => await baseStt.transcribe(new Uint8Array(100)), /transcribe\(\) must be implemented/);

  const baseTts = new TextToSpeechProvider();
  await assert.rejects(async () => await baseTts.synthesize("test"), /synthesize\(\) must be implemented/);

  const baseVad = new VoiceActivityDetector();
  await assert.rejects(async () => await baseVad.processFrame(new Uint8Array(100)), /processFrame\(\) must be implemented/);

  const baseTransport = new AudioTransport();
  await assert.rejects(async () => await baseTransport.sendAudio(new Uint8Array(100)), /sendAudio\(\) must be implemented/);
});

test('Voice Adapters: Concrete Implementation Conformance', async () => {
  // 1. Sherpa-ONNX STT Adapter
  const stt = new SherpaOnnxSttAdapter();
  await stt.initialize();
  const sttRes = await stt.transcribe(new Uint8Array(16000), { expected_text: "Solid 5-iron strike." });
  assert.equal(sttRes.transcript, "Solid 5-iron strike.");
  assert.ok(sttRes.confidence > 0.9);

  // 2. Kokoro-82M TTS Adapter
  const kokoro = new KokoroTtsAdapter();
  await kokoro.initialize();
  const kokoroRes = await kokoro.synthesize("Maintain steady 3:1 tempo.", { tone_state: "MODULATED" });
  assert.ok(kokoroRes.audio_buffer.length > 0);
  assert.equal(kokoroRes.prosody.tone_state, "MODULATED");
  assert.ok(kokoroRes.ttfa_ms > 0);
  assert.ok(kokoroRes.rtf < 0.5);

  // 3. Piper ONNX TTS Adapter
  const piper = new PiperTtsAdapter();
  const piperRes = await piper.synthesize("Clean contact.", { tone_state: "BASELINE" });
  assert.ok(piperRes.audio_buffer.length > 0);
  assert.equal(piperRes.sample_rate, 22050);

  // 4. Silero VAD Adapter
  const vad = new SileroVadAdapter();
  const vadRes = await vad.processFrame(new Uint8Array(960), { forced_speech_probability: 0.92 });
  assert.equal(vadRes.is_speech, true);
  assert.equal(vadRes.speech_probability, 0.92);
});
