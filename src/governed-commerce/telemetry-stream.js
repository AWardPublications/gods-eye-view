/**
 * Sovereign Settlement Telemetry Pub-Sub Stream
 * Dispatches active transaction clearing events in real-time to HUDs and audit monitors.
 */

class TelemetryStreamEmitter {
  constructor() {
    this.listeners = new Set();
  }

  subscribe(callback) {
    if (typeof callback !== 'function') return () => {};
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  publish(event) {
    const payload = {
      stream_id: `stream-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.warn('[TelemetryStream] Listener error:', err.message);
      }
    }
    return payload;
  }
}

export const SettlementTelemetryStream = new TelemetryStreamEmitter();
