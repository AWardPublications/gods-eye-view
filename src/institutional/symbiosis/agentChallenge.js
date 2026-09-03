import { createHash } from 'node:crypto';

/**
 * AGENT CHALLENGE PROTOCOL ENGINE
 * Allows agents to challenge unsafe, ambiguous, or unevidenced actions to prevent automation bias.
 */
export class AgentChallengeEngine {
  constructor() {
    this.confidenceFloor = 0.85;
  }

  evaluateChallengeRequirement(actionContext) {
    const triggers = [];

    if (actionContext.confidenceScore && actionContext.confidenceScore < this.confidenceFloor) {
      triggers.push(`Confidence score (${actionContext.confidenceScore}) below floor (${this.confidenceFloor})`);
    }

    if (actionContext.evidenceConflicts) {
      triggers.push('Conflicting evidence records detected in input sources');
    }

    if (actionContext.rightsAmbiguous) {
      triggers.push('Rights or license URN statement ambiguous or unverified');
    }

    if (actionContext.amountEur && actionContext.amountEur >= 50000) {
      triggers.push(`Financial exposure (€${actionContext.amountEur}) exceeds delegated ceiling (€50,000)`);
    }

    const requiresChallenge = triggers.length > 0;
    const timestamp = new Date().toISOString();
    const challengeHash = createHash('sha256').update(`CHALLENGE:${triggers.join('|')}:${timestamp}`).digest('hex');

    return {
      status: requiresChallenge ? 'AGENT_CHALLENGE_ESCALATED' : 'NO_CHALLENGE_REQUIRED',
      requiresChallenge,
      triggers,
      recommendation: requiresChallenge ? 'ESCALATE_TO_HUMAN_AUTHORITY' : 'PROCEED_WITH_EXECUTION',
      challengeHash,
      timestamp
    };
  }
}
