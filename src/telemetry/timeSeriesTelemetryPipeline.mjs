import { createHash } from 'node:crypto';

/**
 * High-Rate Swing Pose & Biometrics Time-Series Telemetry Pipeline
 * Handles 120Hz kinematics & 10Hz ECG/HRV biometric streams w/ GAMP 5 SHA-256 partitioning
 */
export class TimeSeriesTelemetryPipeline {
  constructor(options = {}) {
    this.sessionId = options.sessionId || `SESSION-${Date.now()}`;
    this.playerId = options.playerId || 'PLAYER-PRO-001';
    this.buffer = [];
    this.partitions = new Map();
  }

  ingestSwingPoseSample(poseData) {
    const timestamp = poseData.timestamp || Date.now();
    const partitionKey = new Date(timestamp).toISOString().split('T')[0]; // Daily Partition Key (YYYY-MM-DD)

    const record = {
      type: 'SWING_POSE',
      sessionId: this.sessionId,
      playerId: this.playerId,
      timestamp,
      kinematics: {
        headX: poseData.headX || 0.0,
        headY: poseData.headY || 0.0,
        headZ: poseData.headZ || 0.0,
        hipX: poseData.hipX || 0.0,
        hipY: poseData.hipY || 0.0,
        hipZ: poseData.hipZ || 0.0,
        wristX: poseData.wristX || 0.0,
        wristY: poseData.wristY || 0.0,
        wristZ: poseData.wristZ || 0.0,
        clubheadSpeedMps: poseData.clubheadSpeedMps || 0.0
      }
    };

    // SHA-256 Signature for GAMP 5 Auditability
    const hashPayload = `${record.sessionId}:${record.timestamp}:${record.kinematics.clubheadSpeedMps}`;
    record.sha256 = createHash('sha256').update(hashPayload).digest('hex');

    this._addToPartition(partitionKey, record);
    return record;
  }

  ingestBiometricSample(bioData) {
    const timestamp = bioData.timestamp || Date.now();
    const partitionKey = new Date(timestamp).toISOString().split('T')[0];

    const record = {
      type: 'BIOMETRICS',
      sessionId: this.sessionId,
      playerId: this.playerId,
      timestamp,
      biometrics: {
        heartRateBpm: bioData.heartRateBpm || 72,
        hrvRmssdMs: bioData.hrvRmssdMs || 45.0,
        gsrMicrosiemens: bioData.gsrMicrosiemens || 2.1
      }
    };

    const hashPayload = `${record.sessionId}:${record.timestamp}:${record.biometrics.heartRateBpm}`;
    record.sha256 = createHash('sha256').update(hashPayload).digest('hex');

    this._addToPartition(partitionKey, record);
    return record;
  }

  _addToPartition(partitionKey, record) {
    if (!this.partitions.has(partitionKey)) {
      this.partitions.set(partitionKey, []);
    }
    this.partitions.get(partitionKey).push(record);
  }

  getPartitionStats() {
    const stats = {};
    for (const [key, records] of this.partitions.entries()) {
      stats[key] = {
        recordCount: records.length,
        poseSamples: records.filter(r => r.type === 'SWING_POSE').length,
        biometricSamples: records.filter(r => r.type === 'BIOMETRICS').length
      };
    }
    return stats;
  }
}
