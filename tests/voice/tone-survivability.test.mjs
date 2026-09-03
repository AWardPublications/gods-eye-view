import test from 'node:test';
import assert from 'node:assert/strict';
import { KokoroTtsAdapter } from '../../src/voice/adapters/kokoroTtsAdapter.js';
import { WengerVoiceProxy } from '../../src/voice/wengerVoiceProxy.js';

test('Tone Survivability: Article 19 Tone State Translation into Neural Prosody', async () => {
  const kokoro = new KokoroTtsAdapter();
  const proxy = new WengerVoiceProxy();

  const states = ["BASELINE", "MODULATED", "DECAYED", "RECOVERING"];

  for (const tone of states) {
    // 1. Check Kokoro Adapter Prosody
    const kokoroParams = kokoro.mapToneToKokoroProsody(tone);
    assert.ok(kokoroParams.speed > 0);
    assert.ok(typeof kokoroParams.pitch_shift === 'number');

    if (tone === "MODULATED") {
      assert.equal(kokoroParams.speed, 0.88);
      assert.ok(kokoroParams.prefix.includes("Supportive"));
    } else if (tone === "DECAYED") {
      assert.equal(kokoroParams.speed, 0.80);
      assert.ok(kokoroParams.prefix.includes("Objective"));
    }

    // 2. Check Web Speech Proxy Parameters
    const voiceParams = proxy.calculateVoiceParameters(tone);
    assert.ok(voiceParams.rate > 0);
    assert.ok(voiceParams.pitch > 0);
    assert.ok(voiceParams.volume > 0);
  }
});
