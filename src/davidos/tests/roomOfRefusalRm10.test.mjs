import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RoomOfRefusalEngine } from '../roomOfRefusalEngine.mjs';

test('115_Room_Of_Refusal_Valid_15N_Veto: Commits human discard and revokes token when 15N lever is depressed with FIDO2 touch', () => {
  const engine = new RoomOfRefusalEngine();
  const res = engine.executePhysicalVeto({
    stewardId: 'usr_david_001',
    role: 'FOUNDER',
    targetActionId: 'act_n8n_email_dispatch_104',
    leverForceNewtons: 15.0,
    shieldLifted: true,
    fido2Signature: 'SIG_FIDO2_DAVID_0x80D0ADA1'
  });

  assert.equal(res.status, 'VETO_COMMITTED_AUTOMATION_FROZEN');
  assert.equal(res.inscribed_mandate, 'Should this decision have been automated at all?');
  assert.equal(res.committed_record.seq, 1);
  assert.ok(res.committed_record.entry_hash.length === 64);
});

test('116_Room_Of_Refusal_Safety_Shield_Aborts: Aborts physical veto when safety shield is closed', () => {
  const engine = new RoomOfRefusalEngine();
  const res = engine.executePhysicalVeto({
    stewardId: 'usr_david_001',
    role: 'FOUNDER',
    targetActionId: 'act_n8n_email_dispatch_104',
    shieldLifted: false
  });

  assert.equal(res.status, 'VETO_ABORTED_SAFETY_SHIELD_CLOSED');
});

test('117_Room_Of_Refusal_Insufficient_Force_Aborts: Aborts physical veto when lever force is under 15N', () => {
  const engine = new RoomOfRefusalEngine();
  const res = engine.executePhysicalVeto({
    stewardId: 'usr_david_001',
    role: 'FOUNDER',
    targetActionId: 'act_n8n_email_dispatch_104',
    leverForceNewtons: 10.0,
    shieldLifted: true
  });

  assert.equal(res.status, 'VETO_ABORTED_INSUFFICIENT_STROKE_FORCE');
  assert.equal(res.required_force, 15.0);
});
