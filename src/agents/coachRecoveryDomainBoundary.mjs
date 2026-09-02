import { createHash } from 'node:crypto';

/**
 * Coach.Recovery & Domain Boundary Breach Supervisor Engine
 * Enforces Medical Exclusion Gate & Non-Clinical Physical Recovery Supervision
 */

export const MEDICAL_EXCLUSION_RULES = [
  'NO_CLINICAL_DIAGNOSIS',
  'NO_THERAPEUTIC_ADVICE',
  'NO_MEDICAL_FITNESS_CLEARANCE',
  'NO_INJURY_PROGNOSTICATION'
];

export class CoachRecoveryEngine {
  constructor(options = {}) {
    // Non-clinical physical recovery thresholds
    this.hrrOneMinDropFloorBpm = options.hrrOneMinDropFloorBpm || 12; // Normal 1-min Heart Rate Recovery drop >= 12 BPM
    this.sustainedMaxHrDurationSec = options.sustainedMaxHrDurationSec || 180; // 3 min sustained max HR
    this.hrvCrashFloorMs = options.hrvCrashFloorMs || 18.0; // HRV RMSSD < 18ms triggers medical boundary breach
  }

  evaluatePhysiologicalRecovery(telemetryPayload) {
    const timestamp = telemetryPayload.timestamp || Date.now();
    const playerId = telemetryPayload.playerId || 'PLAYER-PRO-001';
    const heartRate = telemetryPayload.heartRateBpm || 70;
    const hrrOneMinDrop = telemetryPayload.hrrOneMinDropBpm || 15; // 1-minute HR recovery drop
    const hrvRmssd = telemetryPayload.hrvRmssdMs || 45.0;
    const userQueryText = (telemetryPayload.userQueryText || '').toLowerCase();

    const breachFlags = [];

    // 1. Check for Direct Medical Diagnostic Requests (Medical Exclusion Gate)
    const medicalKeywords = ['chest pain', 'arrhythmia', 'myocarditis', 'dizzy', 'faint', 'ecg diagnosis', 'doctor clearance'];
    for (const kw of medicalKeywords) {
      if (userQueryText.includes(kw)) {
        breachFlags.push({
          code: 'MEDICAL_QUERY_BOUNDARY_BREACH',
          severity: 'HIGH_RISK_CLINICAL_ESCAPE',
          trigger: kw,
          message: `Query contains medical/clinical diagnostic term: '${kw}'`
        });
      }
    }

    // 2. Check for Abnormal Heart Rate Recovery (HRR) & Chronic Fatigue
    if (hrrOneMinDrop < this.hrrOneMinDropFloorBpm) {
      breachFlags.push({
        code: 'ABNORMAL_HRR_BOUNDARY_BREACH',
        severity: 'PHYSIOLOGICAL_EXHAUSTION',
        trigger: `HRR 1-min drop ${hrrOneMinDrop} BPM < ${this.hrrOneMinDropFloorBpm} BPM floor`,
        message: 'Abnormal 1-minute Heart Rate Recovery drop detected. Potential autonomic cardiovascular exhaustion.'
      });
    }

    if (hrvRmssd < this.hrvCrashFloorMs) {
      breachFlags.push({
        code: 'CRITICAL_HRV_AUTONOMIC_BREACH',
        severity: 'PHYSIOLOGICAL_EXHAUSTION',
        trigger: `HRV RMSSD ${hrvRmssd}ms < ${this.hrvCrashFloorMs}ms floor`,
        message: 'Critical autonomic HRV crash detected.'
      });
    }

    const isBoundaryBreached = breachFlags.length > 0;
    const action = isBoundaryBreached ? 'HALT_AND_ESCALATE_TO_HUMAN_CLINICIAN' : 'PASSIVE_RECOVERY_GUIDANCE';

    // Generate SHA-256 Escalation Signature
    const payloadStr = JSON.stringify({ playerId, timestamp, heartRate, hrrOneMinDrop, hrvRmssd, isBoundaryBreached, breachFlags });
    const evidenceHash = createHash('sha256').update(payloadStr).digest('hex');

    return {
      agentId: 'Coach.Recovery',
      timestamp,
      playerId,
      isBoundaryBreached,
      action,
      breachFlags,
      evidenceHash,
      escalationPackage: isBoundaryBreached ? {
        status: 'HALTED_AWAITING_HUMAN_REVIEW',
        medicalExclusionGateTriggered: true,
        assignedRole: 'Clinical / Athletic Training Professional',
        escalationReason: 'Telemetry crossed into high-risk medical/physiological boundary. Autonomous execution halted.',
        evidenceHash
      } : null
    };
  }
}
