/**
 * Alex Wenger² Persistent Memory Architecture
 * Implements Claim 1 & Claim 3 (Structured Longitudinal Memory Schema, Indexing, Persistence & Replay)
 * Isomorphic: supports Node.js file-backed storage and Browser localStorage.
 */

function getNodeFs() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      return { fs, path };
    } catch (e) {}
  }
  return { fs: null, path: null };
}

export class PersistentMemoryArchitecture {
  constructor(options = {}) {
    this.storageFilePath = options.storageFilePath || null;
    this.storageKey = options.storageKey || 'wenger_athlete_sessions';
    this.sessions = [];

    this.loadFromStorage();
  }

  loadFromStorage() {
    // 1. Browser LocalStorage Environment
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (raw) {
          this.sessions = JSON.parse(raw);
        }
      } catch (e) {
        console.warn("[PersistentMemoryArchitecture] Failed to load from localStorage:", e);
      }
      return;
    }

    // 2. Node.js Environment
    if (this.storageFilePath) {
      const { fs } = getNodeFs();
      if (fs) {
        try {
          if (fs.existsSync(this.storageFilePath)) {
            const fileContent = fs.readFileSync(this.storageFilePath, 'utf8');
            const lines = fileContent.split('\n').map(l => l.trim()).filter(Boolean);
            this.sessions = lines.map(line => JSON.parse(line));
          }
        } catch (e) {
          console.error(`[PersistentMemoryArchitecture] Warning: Failed to load from disk '${this.storageFilePath}':`, e);
        }
      }
    }
  }

  appendSessionRecord(record) {
    // Validate required conceptual schema fields (Claim 3)
    const entry = {
      player_id: record.player_id || "urn:davincia:athlete:alex_wenger",
      session_id: record.session_id || `session-${Date.now()}`,
      run_id: record.run_id || `run-${Date.now()}`,
      timestamp: record.timestamp || Date.now(),
      iso_time: new Date(record.timestamp || Date.now()).toISOString(),
      domain: record.domain || "golf",
      input_reference: record.input_reference || "urn:wenger:input:raw",
      signal_vector: record.signal_vector || {},
      sentiment_state: record.sentiment_state ?? 0.0,
      compliance_score: record.compliance_score ?? 0.8,
      engagement_state: record.engagement_state || "ENGAGED",
      tone_state: record.tone_state || "BASELINE",
      threshold_results: record.threshold_results || [],
      routing_result: record.routing_result || {},
      execution_result: record.execution_result || {},
      policy_version: record.policy_version || "1.0.0",
      model_version: record.model_version || "v1.0.0",
      evidence_reference: record.evidence_reference || `urn:davincia:evidence:wenger-${Date.now()}`
    };

    this.sessions.push(entry);

    // Persist in Browser
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
      } catch (e) {}
    }

    // Persist in Node.js
    if (this.storageFilePath) {
      const { fs, path } = getNodeFs();
      if (fs && path) {
        try {
          const dir = path.dirname(this.storageFilePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.appendFileSync(this.storageFilePath, JSON.stringify(entry) + '\n', 'utf8');
        } catch (e) {
          console.error(`[PersistentMemoryArchitecture] Warning: Failed to append to disk '${this.storageFilePath}':`, e);
        }
      }
    }

    return entry;
  }

  getSessionsByPlayer(playerId, limit = 20) {
    return this.sessions
      .filter(s => s.player_id === playerId)
      .slice(-limit);
  }

  getSessionById(sessionId) {
    return this.sessions.find(s => s.session_id === sessionId) || null;
  }

  calculatePlayerBaseline(playerId, windowSize = 5) {
    const playerSessions = this.getSessionsByPlayer(playerId, windowSize);
    if (playerSessions.length === 0) {
      return null;
    }

    const validSentiments = playerSessions
      .map(s => Number(s.sentiment_state))
      .filter(v => !isNaN(v) && isFinite(v));
    const validCompliances = playerSessions
      .map(s => Number(s.compliance_score))
      .filter(v => !isNaN(v) && isFinite(v))
      .map(v => Math.max(0.0, Math.min(1.0, v)));

    const rawAvgSentiment = validSentiments.length > 0
      ? validSentiments.reduce((a, b) => a + b, 0) / validSentiments.length
      : 0.0;
    const rawAvgCompliance = validCompliances.length > 0
      ? validCompliances.reduce((a, b) => a + b, 0) / validCompliances.length
      : 0.8;

    return {
      avg_sentiment: Math.round(rawAvgSentiment * 10000) / 10000,
      avg_compliance: Math.round(rawAvgCompliance * 10000) / 10000,
      total_sessions_analyzed: playerSessions.length,
      calculated_at: Date.now()
    };
  }

  exportMemorySnapshot() {
    return {
      system: "Alex Wenger Longitudinal Memory Snapshot",
      total_records: this.sessions.length,
      sessions: [...this.sessions],
      exported_at: new Date().toISOString()
    };
  }

  replaySession(sessionId) {
    const session = this.getSessionById(sessionId);
    if (!session) {
      throw new Error(`REPLAY_ERROR: Session '${sessionId}' not found in memory archive.`);
    }

    return {
      reconstructed: true,
      session_id: session.session_id,
      run_id: session.run_id,
      timestamp: session.timestamp,
      signal_vector: session.signal_vector,
      threshold_evaluations: session.threshold_results,
      applied_tone_state: session.tone_state,
      original_output: session.execution_result
    };
  }

  clear() {
    this.sessions = [];
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(this.storageKey);
      } catch (e) {}
    }
    if (this.storageFilePath) {
      const { fs } = getNodeFs();
      if (fs && fs.existsSync(this.storageFilePath)) {
        try {
          fs.writeFileSync(this.storageFilePath, '', 'utf8');
        } catch (e) {}
      }
    }
  }
}
