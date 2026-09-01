import test from 'node:test';
import assert from 'node:assert/strict';
import { EngagementDriftAnalyzer } from '../../../src/golf/article19/engagement-drift.js';

test('Claim 5: Engagement drift analytics with INSUFFICIENT_HISTORY safeguard for sparse users', () => {
  const analyzer = new EngagementDriftAnalyzer(3);

  // 1. Sparse history -> Returns INSUFFICIENT_HISTORY (Never fabricates baseline)
  const sparseHistory = [
    { signal_vector: { sentiment_polarity: 0.5 }, compliance_result: { score: 1.0 } }
  ];
  const sparseResult = analyzer.analyzeDrift({ sentiment_polarity: -0.2, compliance_score: 0.4 }, sparseHistory);
  assert.equal(sparseResult.status, "INSUFFICIENT_HISTORY");
  assert.equal(sparseResult.drift_detected, false);

  // 2. Sufficient history with sharp statistical drop -> Detects drift
  const matureHistory = [
    { signal_vector: { sentiment_polarity: 0.8 }, compliance_result: { score: 1.0 } },
    { signal_vector: { sentiment_polarity: 0.7 }, compliance_result: { score: 0.9 } },
    { signal_vector: { sentiment_polarity: 0.9 }, compliance_result: { score: 1.0 } }
  ];
  const matureDrift = analyzer.analyzeDrift({ sentiment_polarity: -0.3, compliance_score: 0.3 }, matureHistory);
  assert.equal(matureDrift.status, "CALCULATED");
  assert.equal(matureDrift.drift_detected, true);
  assert.ok(matureDrift.current_metrics.sentiment_divergence > 0.4);
});
