import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePinSlopeLegality, generateIllegalPinAlertPayload } from '../core/governance/illegalPinWarningSchema.js';

test('1. validatePinSlopeLegality detects illegal pin on Stimp 11.8 on 3.45% slope', () => {
  const check = validatePinSlopeLegality(11.8, 3.45);

  assert.equal(check.isIllegal, true);
  assert.ok(check.reason.includes('USGA Deacon GS3'));
});

test('2. validatePinSlopeLegality approves safe pin on 1.85% slope', () => {
  const check = validatePinSlopeLegality(11.8, 1.85);

  assert.equal(check.isIllegal, false);
  assert.ok(check.frictionDecel > check.gravityAccel);
});

test('3. generateIllegalPinAlertPayload builds Hole 14 webhook payload', () => {
  const payload = generateIllegalPinAlertPayload({ holeNumber: 14, stimpSpeed: 11.8, slopeGradePct: 3.45 });

  assert.equal(payload.alert_type, 'ILLEGAL_PIN_WARNING');
  assert.equal(payload.severity, 'CRITICAL_GOVERNANCE_RISK');
  assert.equal(payload.course_context.hole_number, 14);
  assert.equal(payload.physics_violation_detail.ballistic_verdict, 'BALL_UNSTOPPABLE_DOWN_TIER');
  assert.equal(payload.regulatory_action.usga_deacon_gs3_status, 'REJECTED');
  assert.equal(payload.regulatory_action.awk_stew_001_action, 'FLAG_AND_REBOOT_PIN_COORDINATE');
});
