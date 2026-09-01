import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LIE_TYPES,
  LIE_LABELS,
  CLUBS,
  calculateDistanceYards,
  detectLieFromCoordinates,
  validateShotEvent,
  createShotEvent,
  formatShotEventJsonl,
  parseShotEventsLedger,
} from './spotterEngine.js';

test('calculateDistanceYards computes accurate yardages across 2D coordinates', () => {
  // Straight line down the fairway from y=1.0 (tee) to y=0.0 (green) with 450 total yards scale
  const d1 = calculateDistanceYards(0.5, 1.0, 0.5, 0.0, 450);
  assert.equal(d1, 450);

  // Halfway down fairway
  const d2 = calculateDistanceYards(0.5, 0.8, 0.5, 0.4, 450);
  assert.equal(d2, 180);

  // Zero distance
  const d3 = calculateDistanceYards(0.5, 0.5, 0.5, 0.5, 450);
  assert.equal(d3, 0);
});

test('detectLieFromCoordinates detects tee, green, fairway, bunker, rough, and OB correctly', () => {
  assert.equal(detectLieFromCoordinates(0.50, 0.88), LIE_TYPES.TEE);
  assert.equal(detectLieFromCoordinates(0.50, 0.10), LIE_TYPES.GREEN);
  assert.equal(detectLieFromCoordinates(0.50, 0.50), LIE_TYPES.FAIRWAY);
  assert.equal(detectLieFromCoordinates(0.01, 0.50), LIE_TYPES.OUT_OF_BOUNDS);
  assert.equal(detectLieFromCoordinates(0.80, 0.45), LIE_TYPES.PENALTY_AREA);
  assert.equal(detectLieFromCoordinates(0.30, 0.15), LIE_TYPES.GREENSIDE_BUNKER);
});

test('createShotEvent generates a valid canonical event object', () => {
  const event = createShotEvent({
    hole_number: 1,
    shot_number: 1,
    norm_x: 0.5,
    norm_y: 0.88,
    lie_type: LIE_TYPES.TEE,
    club: '1W',
  });

  const validation = validateShotEvent(event);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
  assert.equal(event.governance_patent, 'WO/2026/150385');
  assert.equal(event.lie_type, LIE_TYPES.TEE);
  assert.equal(event.lie_label, 'Tee Box');
});

test('formatShotEventJsonl and parseShotEventsLedger serialize and round-trip correctly', () => {
  const event1 = createShotEvent({ hole_number: 1, shot_number: 1, lie_type: LIE_TYPES.TEE, norm_x: 0.5, norm_y: 0.88 });
  const event2 = createShotEvent({ hole_number: 1, shot_number: 2, lie_type: LIE_TYPES.FAIRWAY, norm_x: 0.5, norm_y: 0.45, prev_norm_x: 0.5, prev_norm_y: 0.88 });

  const line1 = formatShotEventJsonl(event1);
  const line2 = formatShotEventJsonl(event2);

  const rawJsonl = `${line1}\n${line2}\nINVALID_JSON_LINE\n`;
  const result = parseShotEventsLedger(rawJsonl);

  assert.equal(result.events.length, 2);
  assert.equal(result.invalidCount, 1);
  assert.equal(result.events[0].event_id, event1.event_id);
  assert.equal(result.events[1].event_id, event2.event_id);
  assert.equal(result.events[1].lie_type, LIE_TYPES.FAIRWAY);
});
