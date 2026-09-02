import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AltitudeBallisticsEngine } from '../core/physics/altitudeBallisticsSolver.js';
import { ActiveAudioDriver } from '../core/vocal/activeAudioDriver.js';
import { MasterOrchestratorEcosystem } from '../core/orchestration/masterOrchestratorEcosystem.js';
import { SPECIALIST_MANDATES } from '../core/specialists/designMandates.js';

test('1. Lie-to-Spin Decay calculates wet rough flyer spin reduction and extra carry', () => {
  const solver = new AltitudeBallisticsEngine();

  const fairwayRes = solver.calculateLieSpinDecay({ lieType: 'fairway', moisturePct: 14.0 });
  assert.equal(fairwayRes.effectiveSpinRpm, 6800);
  assert.equal(fairwayRes.isFlyerLie, false);
  assert.equal(fairwayRes.extraFlyerCarryYards, 0);

  const wetRoughRes = solver.calculateLieSpinDecay({ lieType: 'first_cut', moisturePct: 24.0 });
  assert.ok(wetRoughRes.effectiveSpinRpm < 3000);
  assert.equal(wetRoughRes.isFlyerLie, true);
  assert.ok(wetRoughRes.extraFlyerCarryYards >= 12);
});

test('2. Target Windows calculates Front, Cover, Pin, and Back Runoff thresholds', () => {
  const solver = new AltitudeBallisticsEngine();
  const window = solver.calculateTargetWindow({ rawDistanceYards: 170, playsLikeYards: 176, frontBunkerDepth: 12, backRunoffDepth: 15 });

  assert.equal(window.front_edge, 164);
  assert.equal(window.cover_bunker, 168);
  assert.equal(window.pin_distance, 176);
  assert.equal(window.back_runoff, 191);
  assert.ok(window.window_text.includes('Front: 164y'));
});

test('3. Address Mute Lock immediately aborts audio playback during takeaway posture', async () => {
  const driver = new ActiveAudioDriver();
  driver.setAddressMuteLock(true);

  const res = await driver.speak("Hole 15 approach shot plays 176 yards.");
  assert.equal(res, false);
  assert.equal(driver.addressMuteLockActive, true);
});

test('4. PGA Tour Posture Mode strips conversational catchphrases into cold facts', () => {
  const driver = new ActiveAudioDriver();
  driver.setPgaTourPostureMode(true);

  const text = "Mais oui, my friend! Looking down at the green from here, she looks beautiful, but do not let the layout deceive you. Target laser is 170 yards.";
  const filtered = driver.applyPgaTourPostureFilter(text);

  assert.equal(filtered, "Target laser is 170 yards.");
});

test('5. Hard Tournament Lockout PIN physically disconnects plays-like assistance under Rule 4.3a', () => {
  const ecosystem = new MasterOrchestratorEcosystem();
  const res = ecosystem.processGolfQuery({ rawLaserYards: 165, tournamentPinLocked: true });

  assert.equal(res.governance.rule_4_3a_status, 'DISCONNECTED_HARD_LOCKOUT');
  assert.equal(res.governance.plays_like_suppressed, true);
  assert.ok(res.alex_voice_response.includes('[HARD TOURNAMENT LOCKOUT ACTIVE]'));
});

test('6. Zenner 6-Second Tactical Vagal Exhale fits strictly within the 40-second shot clock', () => {
  const zenner = SPECIALIST_MANDATES.ZENNER;
  assert.equal(zenner.tactical_breathing.protocol, '6_SECOND_TACTICAL_VAGAL_EXHALE');
  assert.equal(zenner.tactical_breathing.max_duration_seconds, 6);
  assert.ok(zenner.tactical_breathing.max_duration_seconds < zenner.tactical_breathing.shot_clock_budget_seconds);
});
