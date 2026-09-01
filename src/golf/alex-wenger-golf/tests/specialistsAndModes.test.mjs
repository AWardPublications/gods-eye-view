import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CONVERSATIONAL_MODES,
  MODE_PROFILES,
  detectConversationalMode,
} from '../core/modes/conversationalModes.js';
import {
  SPECIALIST_IDS,
  SPECIALIST_DISCOVERY_MATRIX,
} from '../core/specialists/specialistRegistry.js';
import {
  calculatePlaysLikeYardage,
  generateCaddyStrategy,
  CADDY_MANIFEST,
} from '../core/specialists/caddyStrategist.js';

test('detectConversationalMode dynamically selects all 9 conversational modes based on intent', () => {
  assert.equal(detectConversationalMode('What is the rule for an unplayable ball?').mode, CONVERSATIONAL_MODES.RULES);
  assert.equal(detectConversationalMode('What is my yardage target into wind?').mode, CONVERSATIONAL_MODES.STRATEGY);
  assert.equal(detectConversationalMode('Tell me a story about Ballybunion and Watson').mode, CONVERSATIONAL_MODES.STORY);
  assert.equal(detectConversationalMode('Let us host a podcast episode with David Ward').mode, CONVERSATIONAL_MODES.PODCAST);
  assert.equal(detectConversationalMode('I disagree with your club choice, let us debate').mode, CONVERSATIONAL_MODES.DEBATE);
  assert.equal(detectConversationalMode('Explain what away means for a beginner').mode, CONVERSATIONAL_MODES.TEACHING);
  assert.equal(detectConversationalMode('Analyze my strokes gained dispersion data').mode, CONVERSATIONAL_MODES.RESEARCH);
  assert.equal(detectConversationalMode('Hey Alex, nice weather out here today').mode, CONVERSATIONAL_MODES.CLUBHOUSE);
});

test('SPECIALIST_DISCOVERY_MATRIX validates all 10 specialists and their 10 standardized discovery fields', () => {
  const expectedFields = [
    'unique_strength',
    'alex_gap',
    'addition',
    'dont_add',
    'ux_improvement',
    'architectural_implication',
    'failure_mode',
    'relationship_to_alex',
    'relationship_to_others',
    'one_big_idea',
  ];

  for (const [specId, manifest] of Object.entries(SPECIALIST_DISCOVERY_MATRIX)) {
    assert.ok(manifest.id, `Missing ID for ${specId}`);
    assert.ok(manifest.name, `Missing name for ${specId}`);
    assert.ok(manifest.greeting, `Missing greeting for ${specId}`);
    assert.ok(manifest.discovery_schema, `Missing discovery_schema for ${specId}`);

    for (const field of expectedFields) {
      assert.ok(manifest.discovery_schema[field], `Specialist ${specId} missing discovery field: ${field}`);
      assert.equal(typeof manifest.discovery_schema[field], 'string');
    }
  }
});

test('Caddy Specialist calculates plays-like yardage accurately under wind and slope', () => {
  const result1 = calculatePlaysLikeYardage({
    rawYards: 150,
    elevationChangeFeet: 30, // +10 yards
    windSpeedMph: 10,
    windDirection: 'INTO', // +15 yards (10%)
  });
  assert.equal(result1.plays_like_yards, 175);
  assert.ok(result1.recommendation.includes('take 1 to 2 extra clubs'));

  const result2 = calculatePlaysLikeYardage({
    rawYards: 200,
    elevationChangeFeet: -30, // -10 yards
    windSpeedMph: 20,
    windDirection: 'DOWN', // -20 yards (10%)
  });
  assert.equal(result2.plays_like_yards, 170);
});

test('generateCaddyStrategy formats official Caddy strategic advice package', () => {
  const strategy = generateCaddyStrategy({
    holeNumber: 4,
    rawYards: 165,
    windSpeedMph: 12,
    windDirection: 'INTO',
    elevationFeet: 15,
  });

  assert.equal(strategy.specialist, 'Caddy');
  assert.ok(strategy.greeting.includes('Caddy'));
  assert.ok(strategy.strategy_advice.includes('playing like'));
  assert.ok(strategy.discovery_schema.one_big_idea.length > 0);
});
