import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DecoupledEmergencyVetoEscrowEngine } from '../workflows/decoupledEmergencyVetoEscrow.mjs';

test('123_Simulated_Veto_Escrow_Scenario_A_Veto_Carried: Triggers physical lever, handles conflict check, and carries veto', () => {
  const escrow = new DecoupledEmergencyVetoEscrowEngine();
  
  // Step 1: Depress lever in RM-10
  const triggerRes = escrow.triggerPhysicalLever('RM-05', 'ST_MCCARTHY_004', 'ELEV-LIFT-ROUTINE-v1.0');
  assert.equal(triggerRes.status, 'PHYSICAL_LEVER_TRIPPED_FAIL_CLOSED');
  assert.equal(triggerRes.process_velocity, 0.0);
  assert.equal(triggerRes.conflict_check.conflict_detected, true);
  assert.equal(triggerRes.assembled_stewards.length, 3);

  // Step 2: Collect Votes & Execute Escrow
  const escrowRes = escrow.runEscrowChamber(
    triggerRes.assembled_stewards,
    { ST_DALY_003: 'VETO', ST_SAMMY_005: 'VETO', ST_MILLS_002: 'VETO' },
    5
  );

  assert.equal(escrowRes.verdict, 'VETO_CARRIED');
  assert.equal(escrowRes.system_state, 'SYSTEM_HALTED_BY_HUMAN_VETO');
  assert.ok(escrowRes.receipt_hash.length === 64);
});

test('124_Simulated_Veto_Escrow_Scenario_B_Unanimous_Restore: Restores process velocity on 100% unanimous proceed votes', () => {
  const escrow = new DecoupledEmergencyVetoEscrowEngine();
  
  const triggerRes = escrow.triggerPhysicalLever('RM-05', 'ST_DALY_003', 'ELEV-TEMP-GLITCH-v1.0');
  const escrowRes = escrow.runEscrowChamber(
    triggerRes.assembled_stewards,
    { ST_MCCARTHY_004: 'PROCEED', ST_SAMMY_005: 'PROCEED', ST_MILLS_002: 'PROCEED' },
    8
  );

  assert.equal(escrowRes.verdict, 'RESOLUTION_UNANIMOUSLY_APPROVED');
  assert.equal(escrowRes.restored_velocity, 1.0);
});

test('125_Simulated_Veto_Escrow_Scenario_C_SLA_Timeout: Permanently locks system on >15 min SLA expiration', () => {
  const escrow = new DecoupledEmergencyVetoEscrowEngine();
  
  const triggerRes = escrow.triggerPhysicalLever('RM-05', 'ST_MCCARTHY_004', 'ELEV-LIFT-CRITICAL-v1.0');
  const escrowRes = escrow.runEscrowChamber(
    triggerRes.assembled_stewards,
    {},
    20
  );

  assert.equal(escrowRes.status, 'FAIL_CLOSED_SLA_TIMEOUT');
  assert.equal(escrowRes.escalation_target, 'GLOBAL_BREHON_TRIBUNAL');
});
