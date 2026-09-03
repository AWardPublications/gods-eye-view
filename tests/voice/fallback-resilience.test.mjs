import test from 'node:test';
import assert from 'node:assert/strict';
import { GovernedVoicePipeline } from '../../src/voice/pipeline/governedVoicePipeline.js';

test('Voice Fallback: Fail-Closed Muting on Governance Block', async () => {
  const pipeline = new GovernedVoicePipeline();

  // Denied action (no consent)
  const turn = await pipeline.processVoiceTurn("Teeing off without consent.", {
    mode: "COMPETE",
    athlete_consent: false,
    human_supervision: false,
    career_opt_in: false
  });

  assert.equal(turn.status, "DENIED");
  assert.equal(turn.voice_rendering.status, "MUTED_BY_GOVERNANCE");
  assert.equal(turn.voice_rendering.audio_buffer, null);
  assert.equal(turn.transport, null);
});

test('Voice Fallback: Automatic TTS Fallback Engagement on Primary Error', async () => {
  // Faulty primary TTS throwing error
  const faultyTts = {
    name: "FaultyPrimaryTTS",
    synthesize: async () => { throw new Error("TTS_SYNTHESIS_OUT_OF_MEMORY"); }
  };

  const pipeline = new GovernedVoicePipeline({ ttsProvider: faultyTts });

  const turn = await pipeline.processVoiceTurn("Executing recovery stroke.", {
    mode: "PRACTICE",
    athlete_consent: true,
    human_supervision: true,
    career_opt_in: true
  });

  assert.equal(turn.status, "SUCCESS");
  assert.equal(turn.evidence.fallback_engaged, true);
  assert.equal(turn.evidence.tts.engine, "PiperONNX");
  assert.ok(turn.voice_rendering.audio_buffer.length > 0);
});
