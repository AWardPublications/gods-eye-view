import test from 'node:test';
import assert from 'node:assert/strict';
import { RealSileroVadEngine } from '../../src/voice/engines/realSileroVadEngine.js';
import { RealAudioEngine } from '../../src/voice/engines/realAudioEngine.js';
import { StreamingAudioBufferBridge } from '../../src/voice/webrtcAudioBridge.js';
import { GovernedVoicePipeline } from '../../src/voice/pipeline/governedVoicePipeline.js';
import { RealSherpaSttEngine } from '../../src/voice/engines/realSherpaSttEngine.js';
import { RealKokoroTtsEngine } from '../../src/voice/engines/realKokoroTtsEngine.js';

test('Barge-In / Interruption: Real Stateful Interruption Lifecycle', async () => {
  const vad = new RealSileroVadEngine();
  const transport = new StreamingAudioBufferBridge();
  const pipeline = new GovernedVoicePipeline({
    vadProvider: vad,
    transport: transport,
    sttProvider: new RealSherpaSttEngine(),
    ttsProvider: new RealKokoroTtsEngine()
  });

  // Step 1: Normal system response playback in progress
  const turn1 = await pipeline.processVoiceTurn("Teeing off on hole 5.", {
    mode: "COMPETE",
    athlete_consent: true,
    human_supervision: true,
    career_opt_in: true
  });
  assert.equal(turn1.status, "SUCCESS");

  // Push additional streaming audio frames to represent playing speech stream
  transport.pushAudioFrame(new Uint8Array(960), "BASELINE");
  transport.pushAudioFrame(new Uint8Array(960), "BASELINE");
  assert.ok(transport.getStats().buffered_frames > 0);

  // Step 2: Mid-stream interruption by player
  const playerInterruptionAudio = RealAudioEngine.generateAcousticSpeechWave("Wait, wrong club!", 16000);
  const vadInterruption = await vad.processFrame(playerInterruptionAudio, {
    system_currently_speaking: true
  });

  assert.equal(vadInterruption.is_speech, true);
  assert.equal(vadInterruption.is_barge_in, true);
  assert.equal(vadInterruption.state, "BARGE_IN_TRIGGERED");

  // Step 3: Transport buffer flush on barge-in
  transport.clearBuffer();
  assert.equal(transport.getStats().buffered_frames, 0);

  // Step 4: New governed turn processed seamlessly
  const turn2 = await pipeline.processVoiceTurn({
    audio_buffer: playerInterruptionAudio,
    expected_transcript: "Wait, wrong club!"
  }, {
    mode: "COMPETE",
    athlete_consent: true,
    human_supervision: true,
    career_opt_in: true
  });

  assert.equal(turn2.status, "SUCCESS");
  assert.equal(turn2.transcript, "Wait, wrong club!");
  assert.ok(turn2.canonical_text.length > 0);
});
