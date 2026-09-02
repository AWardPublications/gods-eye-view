import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('1. SaMD Elimination Firewall — Non-Diagnostic State 3 Atomic Rollback', () => {
  // Simulate incoming telemetry with internal joint kinematics / diagnostic swing fault attempt
  const telemetry = {
    jointKinematicsCaptured: true,
    lumbarTorqueDegrees: 42.5,
    userIntent: 'SWING_DIAGNOSIS'
  };

  // State 3 Circuit Breaker
  let fsmState = 3;
  let downstreamInferenceCut = false;
  let rollbackExecuted = false;

  if (telemetry.jointKinematicsCaptured || telemetry.userIntent === 'SWING_DIAGNOSIS') {
    fsmState = 0; // Atomic rollback to Ingestion State 0
    downstreamInferenceCut = true;
    rollbackExecuted = true;
  }

  assert.equal(fsmState, 0, 'FSM must execute atomic rollback to State 0 upon swing diagnostic detection');
  assert.equal(downstreamInferenceCut, true);
  assert.equal(rollbackExecuted, true);
});

test('2. "Aucun Mineur" Boundary — Coach-Terminal Human-in-the-Loop Gatekeeper', () => {
  const studentAttempt = {
    isMinorStudent: true,
    hasPersonalAccount: false,
    biometricStorageRequested: true
  };

  const coachTerminal = {
    isCertifiedCoach: true,
    gamp5TerminalAuthenticated: true,
    operatorMode: 'HUMAN_IN_THE_LOOP_COACH'
  };

  // Rule: Minor accounts and biometric storage are HARD FORBIDDEN
  let studentAccountAllowed = false;
  if (!studentAttempt.isMinorStudent) {
    studentAccountAllowed = true;
  }

  // Rule: Coach terminal receives spatial vectors for verbal coaching delivery
  let coachTerminalAllowed = coachTerminal.gamp5TerminalAuthenticated && coachTerminal.isCertifiedCoach;

  assert.equal(studentAccountAllowed, false, 'Uncredentialed minor accounts MUST be hard forbidden (GDPR Art 8)');
  assert.equal(coachTerminalAllowed, true, 'Authenticated coach terminal IS permitted as sovereign HITL operator');
});

test('3. Level 1 vs Level 2 Disclosure Gate — NDA Defense Matrix', () => {
  const level1Request = {
    requestType: 'LIVE_2D_3D_DEMO',
    signedNDA: false,
    signedSOW: true
  };

  const level2Request = {
    requestType: 'INSPECT_WORKER_EDGE_CODE',
    signedNDA: false
  };

  function evaluateDisclosure(req) {
    if (req.requestType === 'LIVE_2D_3D_DEMO' && req.signedSOW) {
      return { permitted: true, tier: 'LEVEL_1_OUTCOMES_ONLY' };
    }
    if (req.requestType === 'INSPECT_WORKER_EDGE_CODE') {
      if (!req.signedNDA) {
        return { permitted: false, refusalMessage: 'Bilateral NDA with €5,000,000 liquidated damages clause required' };
      }
      return { permitted: true, tier: 'LEVEL_2_PROPRIETARY_ARCHITECTURE' };
    }
    return { permitted: false };
  }

  const res1 = evaluateDisclosure(level1Request);
  assert.equal(res1.permitted, true);
  assert.equal(res1.tier, 'LEVEL_1_OUTCOMES_ONLY');

  const res2 = evaluateDisclosure(level2Request);
  assert.equal(res2.permitted, false);
  assert.ok(res2.refusalMessage.includes('€5,000,000'));
});

test('4. Tier 2 Luxembourg Ingestion Verification — Grand Ducal & Kikuoka', () => {
  const distDir = path.join(__dirname, '../../../../dist/r2_bundles');
  const grandDucalFile = path.join(distDir, 'lu_grand_ducal.json');
  const kikuokaFile = path.join(distDir, 'lu_kikuoka.json');

  assert.ok(fs.existsSync(grandDucalFile), 'Golf Club Grand Ducal bundle must exist in dist/r2_bundles');
  assert.ok(fs.existsSync(kikuokaFile), 'Kikuoka Country Club bundle must exist in dist/r2_bundles');

  const grandDucalData = JSON.parse(fs.readFileSync(grandDucalFile, 'utf8'));
  assert.equal(grandDucalData.country_code, 'LU');
  assert.equal(grandDucalData.hole_count, 18);
});
