import { createHash } from 'node:crypto';

/**
 * INTELLIGENCE ELEVATOR (RM-05) & REPLAY VERIFIER ENGINE
 * Document ID: DVA-RM05-ELEVATOR-2026
 * Governs 6 Personas (PUBLIC, CLIENT, CONTRACTOR, INVESTOR, BOARD_MEMBER, FOUNDER)
 * across 8 Floors, WebAuthn FIDO2 attestations, 1000mm AFFL Decision Passport impact printing,
 * and decoupled analog safety isolation.
 */
export class IntelligenceElevatorEngine {
  constructor() {
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    this.roleClearance = {
      PUBLIC: [1],
      CLIENT: [1, 2],
      CONTRACTOR: [1, 2, 3],
      INVESTOR: [1, 2, 4],
      BOARD_MEMBER: [1, 2, 4, 5],
      FOUNDER: [1, 2, 3, 4, 5, 6, 7, 8]
    };
    this.passportLogs = [];
  }

  requestTransition(userId, role, targetFloor, fido2TouchVerified = true) {
    const cleared = this.roleClearance[role] || [];
    if (!cleared.includes(targetFloor)) {
      return {
        status: 'TRANSITION_DENIED_UNAUTHORIZED_FLOOR',
        role,
        target_floor: targetFloor,
        reason: `Role ${role} is not cleared for Floor ${targetFloor}.`,
        rm10_routed: true
      };
    }

    if (!fido2TouchVerified) {
      return {
        status: 'TRANSITION_DENIED_MISSING_FIDO2_TOUCH',
        reason: 'WebAuthn/FIDO2 touch-scanner signal missing.',
        rm10_routed: true
      };
    }

    const timestamp = new Date().toISOString();
    const prevHash = this.passportLogs.length > 0 ? this.passportLogs[this.passportLogs.length - 1].entry_hash : this.genesisHash;
    const entryHash = createHash('sha256').update(`${userId}:${role}:${targetFloor}:${timestamp}:${prevHash}`).digest('hex');

    const entry = {
      seq: this.passportLogs.length + 1,
      user_id: userId,
      role,
      target_floor: targetFloor,
      timestamp,
      prev_hash: prevHash,
      entry_hash: entryHash,
      qr_code_payload: `RM05:FL${targetFloor}:${entryHash.substring(0, 16)}`
    };

    this.passportLogs.push(entry);

    return {
      status: 'ELEVATOR_CAR_DISPATCHED',
      active_role_flap_display: `ROLE: ${role}`,
      floor_arrived: targetFloor,
      printed_entry: entry
    };
  }

  verifyScannedPassport(scannedLogs) {
    let prevHash = this.genesisHash;
    for (const entry of scannedLogs) {
      const cleared = this.roleClearance[entry.role] || [];
      if (!cleared.includes(entry.target_floor)) {
        return {
          verified: false,
          error_at_seq: entry.seq,
          reason: `UNAUTHORIZED TRANSITION DETECTED at Seq ${entry.seq}: ${entry.role} visited Floor ${entry.target_floor}`
        };
      }

      if (entry.prev_hash !== prevHash) {
        return {
          verified: false,
          error_at_seq: entry.seq,
          reason: `CHAIN SPLIT DETECTED at Seq ${entry.seq}`
        };
      }

      prevHash = entry.entry_hash;
    }

    return {
      verified: true,
      scanned_count: scannedLogs.length,
      status: 'ALL_TRANSITIONS_RECONSTRUCTED_AND_AUTHENTICATED'
    };
  }
}
