import { createHash } from 'node:crypto';

/**
 * ARIOS EIGHT-QUESTIONS GOVERNOR ENGINE (DVA-ARIOS-Q8-2026)
 * Enforces Q1 through Q8 before any action is permitted to execute:
 * Q1: Who is acting? (principal_id)
 * Q2: Which entity owns? (owner_entity)
 * Q3: What authority exists? (authorized_scopes)
 * Q4: What risk class? (risk_class)
 * Q5: What regulation? (applicable_regulations)
 * Q6: Is HITL required? (approval_required)
 * Q7: Has it been recorded? (recorded_in_ledger)
 * Q8: Can this action be replayed? (input_hash, output_hash, code_version, policy_version)
 */
export class AriosEightQuestionsGovernorEngine {
  constructor() {
    this.validRiskClasses = new Set(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  }

  evaluateAction(actionPayload) {
    // Q1 Check: Who is acting?
    if (!actionPayload.principal_id) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q1', reason: 'Missing principal_id' };
    }

    // Q2 Check: Which entity owns?
    if (!actionPayload.owner_entity) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q2', reason: 'Missing owner_entity' };
    }

    // Q3 Check: What authority exists?
    if (!actionPayload.authorized_scopes || !Array.isArray(actionPayload.authorized_scopes) || actionPayload.authorized_scopes.length === 0) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q3', reason: 'Missing or empty authorized_scopes' };
    }

    // Q4 Check: What risk class?
    if (!actionPayload.risk_class || !this.validRiskClasses.has(actionPayload.risk_class)) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q4', reason: 'Invalid or missing risk_class' };
    }

    // Q5 Check: What regulation?
    if (!actionPayload.applicable_regulations || !Array.isArray(actionPayload.applicable_regulations)) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q5', reason: 'Missing applicable_regulations array' };
    }

    // Q6 Check: Is HITL required?
    if (typeof actionPayload.approval_required !== 'boolean') {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q6', reason: 'Missing approval_required boolean flag' };
    }

    if (actionPayload.approval_required && (!actionPayload.hitl_approval_signature || actionPayload.hitl_approval_signature.length === 0)) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q6', reason: 'HITL approval required but missing signature' };
    }

    // Q7 Check: Has it been recorded?
    if (!actionPayload.recorded_in_ledger) {
      return { status: 'BLOCKED_FAIL_CLOSED', failed_question: 'Q7', reason: 'Action not committed to append-only ledger' };
    }

    // Q8 Check: Can this action be replayed?
    const q8 = actionPayload.replayability || {};
    if (!q8.input_hash || !q8.output_hash || !q8.code_version || !q8.policy_version) {
      return {
        status: 'BLOCKED_FAIL_CLOSED',
        failed_question: 'Q8',
        reason: 'Q8 Replayability Violation: Missing input_hash, output_hash, code_version, or policy_version',
        rm10_routed: true
      };
    }

    const replaySignature = createHash('sha256').update(
      `${q8.input_hash}:${q8.output_hash}:${q8.code_version}:${q8.policy_version}`
    ).digest('hex');

    return {
      status: 'ACTION_APPROVED_BY_ARIOS_GOVERNOR',
      q8_replay_signature: replaySignature,
      evaluated_questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8']
    };
  }
}
