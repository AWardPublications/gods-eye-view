import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AlexWengerKnowledgeEngine } from '../core/knowledge/alexWengerKnowledgeEngine.js';

test('1. AWK-CM-001 — 7/10 Risk-Reward Decision Gate (Take Your Medicine Protocol)', () => {
  const engine = new AlexWengerKnowledgeEngine();

  // Test 1: Low probability (65% < 70% threshold) -> Take Your Medicine
  const lowProbResult = engine.evaluateRiskRewardGate({
    executionProbability: 0.65,
    rewardYards: 20,
    hazardPenaltyYards: 50
  });

  assert.equal(lowProbResult.decision, 'REJECT_HERO_SHOT');
  assert.equal(lowProbResult.protocol, 'TAKE_YOUR_MEDICINE');
  assert.equal(lowProbResult.targetStrategy, 'GEOMETRIC_CENTER_OF_GREEN_LAYUP');
  assert.ok(lowProbResult.alexAdvice.includes('Take your medicine'));

  // Test 2: High probability (75% >= 70% threshold) -> Accept Risk
  const highProbResult = engine.evaluateRiskRewardGate({
    executionProbability: 0.75,
    rewardYards: 20,
    hazardPenaltyYards: 50
  });

  assert.equal(highProbResult.decision, 'ACCEPT_RISK_ATTACK_PIN');
  assert.equal(highProbResult.protocol, 'AGGRESSIVE_TARGET_COMMITMENT');
});

test('2. AWK-SG-001 — Short-Game Selection Hierarchy (Putt > Bump-and-Run > Chip > Pitch > Flop)', () => {
  const engine = new AlexWengerKnowledgeEngine();

  // Test 1: Clean fringe lie -> Recommended shot: Putt
  const fringePutt = engine.evaluateShortGameSelection({
    distanceYards: 8,
    lieType: 'fringe',
    obstacleBetween: false
  });
  assert.equal(fringePutt.recommendedShot, 'Putt');

  // Test 2: Firm links turf -> Recommended shot: Bump-and-Run
  const linksBump = engine.evaluateShortGameSelection({
    distanceYards: 25,
    lieType: 'fairway',
    obstacleBetween: false,
    turfCondition: 'firm_links'
  });
  assert.equal(linksBump.recommendedShot, 'Bump-and-Run');

  // Test 3: Obstacle between lie and landing zone -> Recommended shot: Pitch
  const pitchOver = engine.evaluateShortGameSelection({
    distanceYards: 30,
    lieType: 'fairway',
    obstacleBetween: true
  });
  assert.equal(pitchOver.recommendedShot, 'Pitch');
});

test('3. AWK-FIT-001 — Kinetic Grounding & EU MDR 2017/745 Non-Diagnostic Boundary', () => {
  const engine = new AlexWengerKnowledgeEngine();

  const fitResult = engine.evaluateKineticGrounding({});
  assert.equal(fitResult.tempoRatioTarget, '3:1 backswing-to-downswing cadence');
  assert.equal(fitResult.verticalForceRateMs, 200);
  assert.equal(fitResult.nonDiagnosticEU_MDR_Compliant, true);
});

test('4. AWK-PD-001 — Career Periodization Block Retrieval', () => {
  const engine = new AlexWengerKnowledgeEngine();

  const pdBlock = engine.getBlock('AWK-PD-001');
  assert.ok(pdBlock !== null);
  assert.equal(pdBlock.origin, 'DERIVED_SYSTEM_KNOWLEDGE');
  assert.equal(pdBlock.content.weekly_cycle.length, 6);
});
