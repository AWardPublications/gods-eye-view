/**
 * Alex Wenger² Persistent Memory Architecture
 * Implements Claim 1 & Claim 3 (Structured Longitudinal Memory Schema, Indexing & Replay)
 */

export class PersistentMemoryArchitecture {
  constructor() {
    this.sessions = [];
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

    const sentiments = playerSessions.map(s => s.sentiment_state);
    const compliances = playerSessions.map(s => s.compliance_score);

    const rawAvgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const rawAvgCompliance = compliances.reduce((a, b) => a + b, 0) / compliances.length;

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
  }
}
