import { createHash } from 'node:crypto';

/**
 * Multi-Role Telemetry Mesh ("E Pluribus Unum")
 * Synchronizes Player/Caddie, Spotter, AI Agent (BRO), and HITL Supervisor in real time.
 */
export class MultiRoleTelemetryMesh {
  constructor(matchId = "MATCH-2026-RYDER-01") {
    this.matchId = matchId;
    this.state = {
      matchId,
      holeNumber: 17,
      shotNumber: 1,
      activeRole: "CADDIE",
      spatialData: {
        ballLocation: [0.0, 1.0, 150.0],
        targetPinLocation: [0.0, 0.2, -100.0],
        playsLikeYardage: 518,
        actualYardage: 495,
        windVector: { speedMph: 18.5, directionDeg: 45 }
      },
      spotterTelemetry: {
        lieType: "FAIRWAY",
        lieQualityIndex: 95,
        verifiedBySpotterId: "SPOTTER-ST-ANDREWS-01",
        gpsPinDrop: [56.3435, -2.8042]
      },
      clipPlaybackState: {
        courseId: "st_andrews_old_course",
        holeNumber: 17,
        isPlaying: false,
        currentTimeSec: 0.0,
        activeWaypoint: "Tee Box (Old Course Hotel Line)"
      },
      governance: {
        gamp5Hash: "",
        timestampUtc: new Date().toISOString()
      }
    };

    this.listeners = new Map();
    this.updateHash();
  }

  updateHash() {
    const rawState = JSON.stringify({
      matchId: this.state.matchId,
      holeNumber: this.state.holeNumber,
      shotNumber: this.state.shotNumber,
      spatialData: this.state.spatialData,
      spotterTelemetry: this.state.spotterTelemetry
    });
    this.state.governance.gamp5Hash = createHash('sha256').update(rawState).digest('hex');
    this.state.governance.timestampUtc = new Date().toISOString();
  }

  subscribe(role, callback) {
    if (!this.listeners.has(role)) {
      this.listeners.set(role, []);
    }
    this.listeners.get(role).push(callback);
    callback(this.state);
  }

  updateState(role, updates) {
    this.state.activeRole = role;
    if (updates.spatialData) {
      Object.assign(this.state.spatialData, updates.spatialData);
    }
    if (updates.spotterTelemetry) {
      Object.assign(this.state.spotterTelemetry, updates.spotterTelemetry);
    }
    if (updates.clipPlaybackState) {
      Object.assign(this.state.clipPlaybackState, updates.clipPlaybackState);
    }
    if (updates.holeNumber !== undefined) {
      this.state.holeNumber = updates.holeNumber;
    }
    if (updates.shotNumber !== undefined) {
      this.state.shotNumber = updates.shotNumber;
    }

    this.updateHash();
    this.notifyAll();

    return this.state;
  }

  notifyAll() {
    for (const [role, callbacks] of this.listeners.entries()) {
      for (const cb of callbacks) {
        cb(this.state);
      }
    }
  }

  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }
}
