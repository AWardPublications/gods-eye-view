import { test } from 'node:test';
import assert from 'node:assert/strict';
import { IntelligenceElevatorEngine } from '../intelligenceElevatorEngine.mjs';

test('107_Intelligence_Elevator_Role_To_Floor_Dispatches: Dispatches elevator car for Founder to Floor 8 with FIDO2 touch', () => {
  const elevator = new IntelligenceElevatorEngine();
  const res = elevator.requestTransition('usr_david', 'FOUNDER', 8, true);

  assert.equal(res.status, 'ELEVATOR_CAR_DISPATCHED');
  assert.equal(res.active_role_flap_display, 'ROLE: FOUNDER');
  assert.equal(res.floor_arrived, 8);
  assert.ok(res.printed_entry.entry_hash.length === 64);
});

test('108_Intelligence_Elevator_Unauthorized_Floor_Hard_Reject: Hard-rejects Client attempt to visit Floor 6', () => {
  const elevator = new IntelligenceElevatorEngine();
  const res = elevator.requestTransition('usr_client', 'CLIENT', 6, true);

  assert.equal(res.status, 'TRANSITION_DENIED_UNAUTHORIZED_FLOOR');
  assert.equal(res.rm10_routed, true);
});

test('109_Intelligence_Elevator_Independent_Replay_Verifier: Reconstructs authentic passport log and rejects tampered entries', () => {
  const elevator = new IntelligenceElevatorEngine();
  elevator.requestTransition('usr_david', 'FOUNDER', 8, true);
  elevator.requestTransition('usr_client', 'CLIENT', 2, true);

  const verification = elevator.verifyScannedPassport(elevator.passportLogs);
  assert.equal(verification.verified, true);
  assert.equal(verification.status, 'ALL_TRANSITIONS_RECONSTRUCTED_AND_AUTHENTICATED');

  // Inject tampered entry
  const tampered = [
    ...elevator.passportLogs,
    { seq: 3, user_id: 'usr_client', role: 'CLIENT', target_floor: 8, timestamp: new Date().toISOString(), prev_hash: elevator.passportLogs[1].entry_hash, entry_hash: 'f'.repeat(64) }
  ];

  const attackVerification = elevator.verifyScannedPassport(tampered);
  assert.equal(attackVerification.verified, false);
});
