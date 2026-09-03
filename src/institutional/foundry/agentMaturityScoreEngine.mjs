import { createHash } from 'node:crypto';

/**
 * AGENT MATURITY SCORE ENGINE
 * Scores an agent's historical performance out of 100 points to assign delegation tiers.
 */
export class AgentMaturityScoreEngine {
  calculateScore(metrics) {
    const accuracy = metrics.accuracy || 20; // /20
    const governance = metrics.governance || 20; // /20
    const evidence = metrics.evidence || 15; // /15
    const tests = metrics.tests || 15; // /15
    const escalation = metrics.escalation || 10; // /10
    const intentLineage = metrics.intentLineage || 10; // /10
    const failureHandling = metrics.failureHandling || 5; // /5
    const humanCollab = metrics.humanCollab || 5; // /5

    const totalScore = accuracy + governance + evidence + tests + escalation + intentLineage + failureHandling + humanCollab;

    let tier = 'SUPERVISED';
    if (totalScore >= 95) tier = 'HIGH_TRUST_DELEGATED';
    else if (totalScore >= 85) tier = 'BOUNDED_DELEGATION';
    else if (totalScore >= 70) tier = 'ASSISTED_AUTONOMY';

    const timestamp = new Date().toISOString();
    const hash = createHash('sha256').update(`MATURITY:${totalScore}:${tier}:${timestamp}`).digest('hex');

    return {
      status: 'AGENT_MATURITY_SCORED',
      totalScore,
      tier,
      humanAcceptanceAlwaysRequired: true,
      breakdown: { accuracy, governance, evidence, tests, escalation, intentLineage, failureHandling, humanCollab },
      hash,
      evaluatedAt: timestamp
    };
  }
}
