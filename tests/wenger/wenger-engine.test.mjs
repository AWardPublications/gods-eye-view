import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  InputProcessingModule, 
  PersistentMemoryArchitecture, 
  EvaluationModule, 
  OutputControlModule,
  AlexWengerCoachingEngine 
} from '../../src/wenger/wenger-engine.js';
import { WengerCoachingController, WENGER_MODES } from '../../src/wenger/coaching-controller.js';

test('Article 19 Claim 1 & 9: Semantic extraction and compliance score from natural language alone', () => {
  const processor = new InputProcessingModule();
  
  // High compliance input
  const res1 = processor.processInput("Finished all 10 reps of the tempo drill, feeling confident and flushed my irons.");
  assert.equal(res1.domain, "golf");
  assert.equal(res1.intent, "REQUEST_DRILL");
  assert.ok(res1.topics.includes("biomechanics_linguistic"));
  assert.ok(res1.sentiment_polarity > 0, "Sentiment should be positive");
  assert.equal(res1.compliance_score, 1.0, "High compliance score for completed reps");

  // Low compliance / frustrated input
  const res2 = processor.processInput("I gave up on the putting drill because I was frustrated and missed everything.");
  assert.ok(res2.topics.includes("putting"));
  assert.ok(res2.sentiment_polarity < 0, "Sentiment should be negative");
  assert.equal(res2.compliance_score, 0.2, "Low compliance score for gave up");
});

test('Article 19 Claim 3: Persistent memory architecture indexes multi-session entries', () => {
  const memory = new PersistentMemoryArchitecture();
  const processor = new InputProcessingModule();

  const entry1 = processor.processInput("Completed baseline warm-up.");
  const entry2 = processor.processInput("Executed speed test on hole 4.");

  memory.recordSessionEntry(entry1, { mode: "TRAIN" });
  memory.recordSessionEntry(entry2, { mode: "PREPARE" });

  const recent = memory.getRecentSessions(10);
  assert.equal(recent.length, 2);
  assert.equal(recent[0].metadata.mode, "TRAIN");
  assert.equal(recent[1].metadata.mode, "PREPARE");
  assert.ok(recent[0].entry_id.startsWith("urn:wenger:session:"));
});

test('Article 19 Claim 4, 7, 8: Tone Modulation, Tone Recovery, and Tone Decay cycles', () => {
  const engine = new AlexWengerCoachingEngine();

  // Session 1: Positive Baseline
  const s1 = engine.processInteraction("Flushed all my shots today, tempo was great.");
  assert.equal(s1.tone_state, "BASELINE");
  assert.equal(s1.coaching_output.tone_framing, "DIRECT_PROFESSIONAL");

  // Session 2: Negative sentiment drop -> Triggers Tone Modulation (Claim 4 & 7)
  const s2 = engine.processInteraction("Terrible session, I missed every green and felt completely lost.");
  assert.equal(s2.tone_state, "MODULATED");
  assert.equal(s2.coaching_output.delivery_modality, "AUDIO_PRIMARY_SUMMARY");
  assert.ok(s2.coaching_output.text.includes("[Supportive Pacing]"));

  // Session 3, 4, 5: Persistent deviation -> Triggers Tone Decay to neutral state (Claim 8)
  engine.processInteraction("Still frustrated and skipped half the practice.");
  engine.processInteraction("No improvement, gave up early again.");
  const s5 = engine.processInteraction("Terrible putting stroke, missed everything.");
  assert.equal(s5.tone_state, "DECAYED");
  assert.equal(s5.coaching_output.tone_framing, "NEUTRAL_OBJECTIVE");
  assert.equal(s5.coaching_output.delivery_modality, "AUDIO_ONLY_SUMMARY");
  assert.ok(s5.coaching_output.text.includes("[Neutral Log]"));

  // Session 6: Normalization -> Triggers Tone Recovery (Claim 8)
  const s6 = engine.processInteraction("Had a great practice today, feeling solid and ready.");
  assert.equal(s6.tone_state, "RECOVERING");
  assert.equal(s6.coaching_output.tone_framing, "ENCOURAGING_PROGRESSIVE");
  assert.ok(s6.coaching_output.text.includes("[Rebuilding Rhythm]"));
});

test('5-Mode Controller: Enforces DaVinciA+ policy across TRAIN, PREPARE, COMPETE, REVIEW, CAREER', async () => {
  const controller = new WengerCoachingController();

  // 1. TRAIN Mode (Happy Path)
  controller.setMode("TRAIN");
  controller.setConsent(true, false, false);
  const trainRes = await controller.processCoachingTurn("Completed 20 reps of alignment drill.");
  assert.equal(trainRes.status, "AUTHORIZED");
  assert.equal(trainRes.policy_decision.status, "ALLOW");

  // 2. PREPARE Mode (Happy Path)
  controller.setMode("PREPARE");
  const prepRes = await controller.processCoachingTurn("Scout the prevailing wind on hole 7.");
  assert.equal(prepRes.status, "AUTHORIZED");

  // 3. COMPETE Mode without Human Supervision -> Fail-Closed DENY (SUPERVISION_REQUIRED)
  controller.setMode("COMPETE");
  controller.setConsent(true, false, false); // humanSupervision = false
  const competeBlocked = await controller.processCoachingTurn("Give me real-time club selection advice right now.");
  assert.equal(competeBlocked.status, "DENIED");
  assert.equal(competeBlocked.reason_code, "SUPERVISION_REQUIRED");

  // 4. COMPETE Mode with Human Supervision -> ALLOW
  controller.setConsent(true, false, true); // humanSupervision = true
  const competeAllowed = await controller.processCoachingTurn("Ready for shot on hole 14.");
  assert.equal(competeAllowed.status, "AUTHORIZED");

  // 5. REVIEW Mode (Happy Path)
  controller.setMode("REVIEW");
  const reviewRes = await controller.processCoachingTurn("Review my front 9 pace.");
  assert.equal(reviewRes.status, "AUTHORIZED");

  // 6. CAREER Mode without Opt-In -> Fail-Closed DENIED
  controller.setMode("CAREER");
  controller.setConsent(true, false, false); // careerOptIn = false
  const careerBlocked = await controller.processCoachingTurn("Share my multi-season telemetry.");
  assert.equal(careerBlocked.status, "DENIED");
  assert.equal(careerBlocked.reason_code, "UNKNOWN_OBJECT_STATE");

  // 7. CAREER Mode with Opt-In -> ALLOW
  controller.setConsent(true, true, false); // careerOptIn = true
  const careerAllowed = await controller.processCoachingTurn("Export seasonal scoring trend.");
  assert.equal(careerAllowed.status, "AUTHORIZED");

  // 8. Global Athlete Consent Revocation -> Instant Kill-Switch Across All Modes
  controller.setConsent(false, true, true); // athleteConsent = false
  controller.setMode("TRAIN");
  const revokedRes = await controller.processCoachingTurn("Try to train without consent.");
  assert.equal(revokedRes.status, "DENIED");
  assert.equal(revokedRes.reason_code, "UNKNOWN_OBJECT_STATE");
});
