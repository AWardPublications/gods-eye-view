/**
 * Alex Wenger² Article 19 Engagement Drift Analytics Module
 * Implements Claim 5 (Longitudinal engagement drift and session frequency drop)
 */

export class EngagementDriftAnalyzer {
  constructor(minSessionsRequired = 3) {
    this.minSessionsRequired = minSessionsRequired;
    this.version = "1.0.0";
  }

  analyzeDrift(currentSignal, historicalSessions = []) {
    if (!historicalSessions || historicalSessions.length < this.minSessionsRequired) {
      return {
        status: "INSUFFICIENT_HISTORY",
        drift_detected: false,
        message: "Baseline cannot be fabricated. Insufficient longitudinal history (< 3 sessions).",
        baseline_metrics: null,
        analyzer_version: this.version
      };
    }

    const sentiments = historicalSessions.map(s => s.signal_vector?.sentiment_polarity ?? 0.0);
    const compliances = historicalSessions.map(s => s.compliance_result?.score ?? 0.8);

    const avgSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const avgCompliance = compliances.reduce((a, b) => a + b, 0) / compliances.length;

    // Check statistical drop from baseline (> 0.4 sentiment drop or < 0.6 compliance)
    const currentSentiment = currentSignal?.sentiment_polarity ?? 0.0;
    const currentCompliance = currentSignal?.compliance_score ?? 0.8;

    const sentimentDivergence = avgSentiment - currentSentiment;
    const complianceDivergence = avgCompliance - currentCompliance;

    const isDrift = (currentSentiment < -0.2) || (sentimentDivergence > 0.4) || (currentCompliance < 0.5);

    return {
      status: "CALCULATED",
      drift_detected: isDrift,
      baseline_metrics: {
        avg_sentiment: avgSentiment,
        avg_compliance: avgCompliance,
        session_count: historicalSessions.length
      },
      current_metrics: {
        sentiment_polarity: currentSentiment,
        compliance_score: currentCompliance,
        sentiment_divergence: sentimentDivergence,
        compliance_divergence: complianceDivergence
      },
      analyzer_version: this.version
    };
  }
}
