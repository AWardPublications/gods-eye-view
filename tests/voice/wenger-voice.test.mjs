import test from 'node:test';
import assert from 'node:assert/strict';
import { WengerVoiceProxy } from '../../src/voice/wengerVoiceProxy.js';
import { AlexWengerSubsystem } from '../../src/golf/index.js';
import { createGevActionRunner } from '../../src/voice/gevActions.js';

test('Voice Pipeline: Dynamic speech cadence and pitch calculation across Article 19 Tone States', () => {
  const proxy = new WengerVoiceProxy();

  // 1. BASELINE Tone State
  const baseParams = proxy.calculateVoiceParameters('BASELINE');
  assert.equal(baseParams.rate, 1.0);
  assert.equal(baseParams.pitch, 1.0);
  assert.equal(baseParams.volume, 1.0);

  // 2. MODULATED Tone State (Supportive, slower pacing)
  const modParams = proxy.calculateVoiceParameters('MODULATED');
  assert.equal(modParams.rate, 0.85);
  assert.equal(modParams.pitch, 0.95);
  assert.ok(modParams.prefix_announcement.includes('Tempo guidance'));

  // 3. DECAYED Tone State (Neutral objective, slowest cadence)
  const decayParams = proxy.calculateVoiceParameters('DECAYED');
  assert.equal(decayParams.rate, 0.75);
  assert.equal(decayParams.pitch, 1.0);
  assert.ok(decayParams.prefix_announcement.includes('Neutral log'));

  // 4. RECOVERING Tone State
  const recParams = proxy.calculateVoiceParameters('RECOVERING');
  assert.equal(recParams.rate, 0.95);
  assert.equal(recParams.pitch, 1.05);

  // 5. NEUTRAL Tone State
  const neutralParams = proxy.calculateVoiceParameters('NEUTRAL');
  assert.equal(neutralParams.rate, 0.80);
});

test('Voice Pipeline: Governance Fail-Closed Muting on blocked actions', (t, done) => {
  const proxy = new WengerVoiceProxy();

  // Muted when delivery_modality is NONE
  proxy.speakCoachingResponse({
    text: "Should not be spoken",
    delivery_modality: "NONE",
    tone_state: "NEUTRAL"
  }, (res) => {
    assert.equal(res.success, false);
    assert.equal(res.reason, "GOVERNANCE_MUTED");
    done();
  });
});

test('Voice Pipeline: Subsystem to Voice Audio Bridge integration', async () => {
  const subsystem = new AlexWengerSubsystem();
  const proxy = new WengerVoiceProxy();

  // Execute a modulated coaching turn
  const res = await subsystem.executeCoachingTurn("I skipped the drill and gave up because I was frustrated.", {
    mode: "TRAIN"
  });

  assert.equal(res.tone_state, "MODULATED");
  assert.equal(res.output.delivery_modality, "AUDIO_PRIMARY_SUMMARY");

  const voiceParams = proxy.calculateVoiceParameters(res.tone_state);
  assert.equal(voiceParams.rate, 0.85);
  assert.equal(res.output.pacing_units, 0.5);
});

test('Voice Pipeline: Realtime GEV Action Runner wenger_coaching_turn execution', async () => {
  const mockViewer = {
    camera: {
      moveEnd: { addEventListener() {} },
      positionWC: { x: 0, y: 0, z: 0 }
    },
    trackedEntity: null,
    clock: { onTick: { addEventListener: () => () => {} } },
    scene: {
      canvas: {
        clientWidth: 1200,
        clientHeight: 800,
        addEventListener() {},
        removeEventListener() {}
      },
      globe: { getHeight: () => 0 },
      camera: { moveStart: { addEventListener() {} } },
      postRender: { addEventListener() {} }
    }
  };
  const mockStyleManager = {};
  const mockDataManager = { layers: new Map() };

  const runner = createGevActionRunner({
    viewer: mockViewer,
    styleManager: mockStyleManager,
    dataManager: mockDataManager
  });

  // 1. Authorized Voice Coaching Turn
  const actionRes = await runner('wenger_coaching_turn', {
    natural_language_input: 'Completed all 20 reps of alignment drill.',
    mode: 'TRAIN',
    athlete_consent: true
  });

  assert.equal(actionRes.ok, true);
  assert.equal(actionRes.action, 'wenger_coaching_turn');
  assert.equal(actionRes.status, 'SUCCESS');
  assert.equal(actionRes.mode, 'TRAIN');
  assert.equal(actionRes.tone_state, 'BASELINE');
  assert.ok(actionRes.response_text.length > 0);
  assert.ok(actionRes.evidence_hash.startsWith('sha256-'));

  // 2. Blocked Voice Coaching Turn (Unsupervised live competition)
  const blockedRes = await runner('wenger_coaching_turn', {
    natural_language_input: 'Recommend club for approach on hole 18.',
    mode: 'COMPETE',
    athlete_consent: true,
    human_supervision: false
  });

  assert.equal(blockedRes.ok, false);
  assert.equal(blockedRes.governance_blocked, true);
  assert.equal(blockedRes.delivery_modality, 'NONE');
});
