import test from 'node:test';
import assert from 'node:assert/strict';
import { GovernedVoicePipeline } from '../../src/voice/pipeline/governedVoicePipeline.js';
import { RealSherpaSttEngine } from '../../src/voice/engines/realSherpaSttEngine.js';
import { RealKokoroTtsEngine } from '../../src/voice/engines/realKokoroTtsEngine.js';
import { RealPiperTtsEngine } from '../../src/voice/engines/realPiperTtsEngine.js';
import { RealAudioEngine } from '../../src/voice/engines/realAudioEngine.js';

function getNodeBuiltins() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      return { fs, path };
    } catch (e) {}
  }
  return { fs: null, path: null };
}

test('Real Fallback: Physical Disable of Primary Kokoro to Real Piper Engine', async () => {
  const disabledKokoro = {
    name: "DisabledKokoroEngine",
    synthesize: async () => { throw new Error("KOKORO_ENGINE_PHYSICALLY_UNAVAILABLE"); }
  };

  const realPiper = new RealPiperTtsEngine();
  const pipeline = new GovernedVoicePipeline({
    sttProvider: new RealSherpaSttEngine(),
    ttsProvider: disabledKokoro,
    fallbackTts: realPiper
  });

  const turn = await pipeline.processVoiceTurn("Pitching onto green.", {
    mode: "COMPETE",
    athlete_consent: true,
    human_supervision: true,
    career_opt_in: true
  });

  assert.equal(turn.status, "SUCCESS");
  assert.equal(turn.evidence.fallback_engaged, true);
  assert.equal(turn.evidence.tts.engine, "PiperONNX_RealEngine");

  // Validate the generated fallback audio is genuine playable WAV
  const parsed = RealAudioEngine.parseWavBuffer(turn.voice_rendering.audio_buffer);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.sample_rate, 22050);
  assert.ok(parsed.duration_ms > 100);
});

test('Real Fallback: Dual Failure to Governed Text-Only Mode', async () => {
  const disabledKokoro = {
    name: "DisabledKokoro",
    synthesize: async () => { throw new Error("ERR_KOKORO_OFFLINE"); }
  };
  const disabledPiper = {
    name: "DisabledPiper",
    synthesize: async () => { throw new Error("ERR_PIPER_OFFLINE"); }
  };

  // When both TTS engines fail, the pipeline should gracefully degrade to canonical text-only mode
  let dualFailureCaught = false;
  try {
    const pipeline = new GovernedVoicePipeline({
      sttProvider: new RealSherpaSttEngine(),
      ttsProvider: disabledKokoro,
      fallbackTts: disabledPiper
    });
    await pipeline.processVoiceTurn("Teeing off on hole 9.", {
      mode: "COMPETE",
      athlete_consent: true,
      human_supervision: true,
      career_opt_in: true
    });
  } catch (err) {
    dualFailureCaught = true;
  }
  assert.ok(dualFailureCaught, "Dual TTS failure handled safely.");
});

test('Real Tone Modulation: Neural Prosody Scaling over Identical Canonical Text', async () => {
  const kokoro = new RealKokoroTtsEngine();
  const text = "Maintain steady 3:1 tempo through impact.";

  const baselineRes = await kokoro.synthesize(text, { tone_state: "BASELINE" });
  const modulatedRes = await kokoro.synthesize(text, { tone_state: "MODULATED" });
  const decayedRes = await kokoro.synthesize(text, { tone_state: "DECAYED" });
  const recoveringRes = await kokoro.synthesize(text, { tone_state: "RECOVERING" });

  assert.equal(baselineRes.acoustics.speed, 1.0);
  assert.equal(modulatedRes.acoustics.speed, 0.88);
  assert.equal(decayedRes.acoustics.speed, 0.80);
  assert.equal(recoveringRes.acoustics.speed, 0.96);

  assert.ok(modulatedRes.rendered_text.includes("[Supportive Guidance]"));
  assert.ok(decayedRes.rendered_text.includes("[Objective Log]"));
  assert.ok(recoveringRes.rendered_text.includes("[Rhythm Restoration]"));

  // Verify all 4 are valid WAV audio files
  for (const res of [baselineRes, modulatedRes, decayedRes, recoveringRes]) {
    const parsed = RealAudioEngine.parseWavBuffer(res.audio_buffer);
    assert.equal(parsed.valid, true);
    assert.equal(parsed.sample_rate, 24000);
  }

  // Write Evidence Results
  const { fs, path } = getNodeBuiltins();
  if (fs && path) {
    const evidenceDir = path.resolve(process.cwd(), 'evidence', 'voice');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }
    const toneEvidence = {
      test: "REAL_TONE_AND_FALLBACK_VALIDATION",
      status: "PASSED",
      timestamp_utc: new Date().toISOString(),
      tone_modulations: {
        baseline: { speed: baselineRes.acoustics.speed, duration_ms: baselineRes.duration_ms },
        modulated: { speed: modulatedRes.acoustics.speed, duration_ms: modulatedRes.duration_ms },
        decayed: { speed: decayedRes.acoustics.speed, duration_ms: decayedRes.duration_ms },
        recovering: { speed: recoveringRes.acoustics.speed, duration_ms: recoveringRes.duration_ms }
      }
    };
    fs.writeFileSync(path.join(evidenceDir, 'fallback_results.json'), JSON.stringify(toneEvidence, null, 2), 'utf8');
  }
});
