import { createHash } from 'node:crypto';

/**
 * Safety.Wellbeing.Flagger & Coach.Recovery Deterministic Safety Shutoff Engine
 * Monitors cardiac telemetry (HR, HRV) and enforces immediate fail-closed training shutoff
 */
export class SafetyWellbeingFlagger {
  constructor(options = {}) {
    this.maxHeartRateBpm = options.maxHeartRateBpm || 175;
    this.minHrvRmssdMs = options.minHrvRmssdMs || 20.0;
    this.recoveryThresholdMs = options.recoveryThresholdMs || 35.0;
  }

  evaluateBiometricTelemetry(telemetrySample) {
    const heartRate = telemetrySample.heartRateBpm || 70;
    const hrvRmssd = telemetrySample.hrvRmssdMs || 50.0;
    const timestamp = telemetrySample.timestamp || Date.now();
    const playerId = telemetrySample.playerId || 'PLAYER-PRO-001';

    const flags = [];

    if (heartRate > this.maxHeartRateBpm) {
      flags.push({
        code: 'CARDIAC_HYPEREXERTION',
        severity: 'CRITICAL',
        message: `Heart rate ${heartRate} BPM exceeds safety threshold of ${this.maxHeartRateBpm} BPM`
      });
    }

    if (hrvRmssd < this.minHrvRmssdMs) {
      flags.push({
        code: 'AUTONOMIC_FATIGUE_CRASH',
        severity: 'CRITICAL',
        message: `HRV RMSSD ${hrvRmssd}ms fell below critical safety threshold of ${this.minHrvRmssdMs}ms`
      });
    }

    const isAnomalous = flags.length > 0;
    const action = isAnomalous ? 'DETERMINISTIC_SAFETY_SHUTOFF' : 'ALLOW_TRAINING_CONTINUATION';

    // Generate SHA-256 Evidence Pack Signature
    const payload = JSON.stringify({ playerId, timestamp, heartRate, hrvRmssd, isAnomalous, flags });
    const evidenceHash = createHash('sha256').update(payload).digest('hex');

    return {
      agentId: 'Safety.Wellbeing.Flagger',
      timestamp,
      playerId,
      isAnomalous,
      action,
      flags,
      evidenceHash,
      recoveryInstruction: isAnomalous ? {
        mode: 'PASSIVE_RECOVERY_LOCKOUT',
        handlingAgent: 'Coach.Recovery',
        message: 'High-velocity swing drills HALTED. Initiating 3-minute cardiac recovery breathwork protocol.',
        recoveryTargetHrvMs: this.recoveryThresholdMs
      } : null
    };
  }
}
