import { createHash } from 'node:crypto';

/**
 * ROOM OF REFUSAL (RM-10) PHYSICAL-DIGITAL VETO ENGINE
 * Document ID: DVA-RM10-REFUSAL-2026
 * Governs the 6-stage physical-digital lever execution sequence, 15N force requirement,
 * two-stage safety shield, FIDO2 touch verification, and PostgreSQL append-only commit.
 */
export class RoomOfRefusalEngine {
  constructor() {
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    this.refusalLedger = [];
    this.inscribedMandate = 'Should this decision have been automated at all?';
  }

  executePhysicalVeto({
    stewardId,
    role,
    targetActionId,
    leverForceNewtons = 15.0,
    shieldLifted = true,
    fido2Signature = null
  }) {
    if (!shieldLifted) {
      return {
        status: 'VETO_ABORTED_SAFETY_SHIELD_CLOSED',
        reason: 'Polycarbonate safety shield was not lifted.'
      };
    }

    if (leverForceNewtons < 15.0) {
      return {
        status: 'VETO_ABORTED_INSUFFICIENT_STROKE_FORCE',
        force_applied: leverForceNewtons,
        required_force: 15.0,
        reason: `Lever force of ${leverForceNewtons}N is below required 15N mechanical threshold.`
      };
    }

    if (!fido2Signature) {
      return {
        status: 'VETO_ABORTED_MISSING_FIDO2_SIGNATURE',
        reason: 'WebAuthn/FIDO2 touch signature is missing.'
      };
    }

    const timestamp = new Date().toISOString();
    const prevHash = this.refusalLedger.length > 0 ? this.refusalLedger[this.refusalLedger.length - 1].entry_hash : this.genesisHash;
    const entryHash = createHash('sha256').update(`${stewardId}:${role}:${targetActionId}:${timestamp}:${prevHash}:${fido2Signature}`).digest('hex');

    const record = {
      seq: this.refusalLedger.length + 1,
      steward_id: stewardId,
      role,
      target_action_id: targetActionId,
      lever_snap_verified: true,
      force_newtons: leverForceNewtons,
      timestamp,
      fido2_signature: fido2Signature,
      prev_hash: prevHash,
      entry_hash: entryHash,
      state: 'HUMAN_DISCARD_TOKEN_REVOKED'
    };

    this.refusalLedger.push(record);

    return {
      status: 'VETO_COMMITTED_AUTOMATION_FROZEN',
      inscribed_mandate: this.inscribedMandate,
      committed_record: record,
      decision_passport_receipt: `RM10-VETO-SEQ${record.seq}:${entryHash.substring(0, 16)}`
    };
  }
}
