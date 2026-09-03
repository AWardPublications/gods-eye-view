import { createHash } from 'node:crypto';

/**
 * SYMBIOTIC WORK ENGINE
 * Manages the canonical SymbioticWorkItem lifecycle across Human Intent -> Agent Proposal -> Governance Gate -> Human Decision -> Agent Execution -> Evidence -> Learning.
 */
export class SymbioticWorkEngine {
  constructor() {
    this.financialThresholdEur = 50000;
    this.confidenceThreshold = 0.85;
  }

  createWorkItem(humanIntent, agentRole, proposedAction) {
    const timestamp = new Date().toISOString();
    const workId = `work_${createHash('md5').update(`${humanIntent}:${timestamp}`).digest('hex').substring(0, 10)}`;

    const workItem = {
      work_id: workId,
      human_intent: humanIntent,
      agent_role: agentRole,
      agent_proposal: {
        action: proposedAction.name,
        params: proposedAction.params || {},
        amountEur: proposedAction.amountEur || 0,
        confidenceScore: proposedAction.confidenceScore || 0.9,
        reversibility: proposedAction.reversibility || 'REVERSIBLE'
      },
      evidence: [],
      governance_decision: null,
      human_decision: null,
      execution: { status: 'PENDING' },
      accountability: {
        agentExecutor: agentRole,
        humanAuthorityRequired: proposedAction.amountEur >= this.financialThresholdEur || proposedAction.confidenceScore < this.confidenceThreshold
      },
      timestamps: { created: timestamp }
    };

    return workItem;
  }

  evaluateGovernance(workItem) {
    const isHighFinancial = workItem.agent_proposal.amountEur >= this.financialThresholdEur;
    const isLowConfidence = workItem.agent_proposal.confidenceScore < this.confidenceThreshold;

    let status = 'ALLOW';
    let constraint = null;

    if (isHighFinancial || isLowConfidence) {
      status = 'ALLOW_WITH_CONSTRAINTS';
      constraint = isHighFinancial ? 'REQUIRES_HUMAN_BOARD_APPROVAL_EXCEEDS_50K' : 'REQUIRES_HUMAN_REVIEW_LOW_CONFIDENCE';
    }

    workItem.governance_decision = {
      status,
      constraint,
      evaluatedAt: new Date().toISOString(),
      governedBy: 'DaVinciA+ Constitutional Gate'
    };

    return workItem;
  }

  applyHumanDecision(workItem, humanUser, decisionStatus, decisionRationale = '') {
    workItem.human_decision = {
      status: decisionStatus, // APPROVED | MODIFIED | REJECTED
      decidedBy: humanUser.name || 'David Ward',
      gpgKey: humanUser.gpgKey || '0x80D0ADA1',
      rationale: decisionRationale,
      decidedAt: new Date().toISOString()
    };

    if (decisionStatus === 'APPROVED') {
      workItem.execution = {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        executionHash: createHash('sha256').update(JSON.stringify(workItem)).digest('hex')
      };
    } else {
      workItem.execution = {
        status: 'HALTED_BY_HUMAN_DECISION',
        haltedAt: new Date().toISOString()
      };
    }

    return workItem;
  }
}
