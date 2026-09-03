import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AriosEightQuestionsGovernorEngine } from '../ariosEightQuestionsGovernorEngine.mjs';

test('110_ARIOS_Governor_Full_Q1_Q8_Approval: Approves action when all 8 questions are fully satisfied', () => {
  const governor = new AriosEightQuestionsGovernorEngine();
  const res = governor.evaluateAction({
    principal_id: 'usr_david_001',
    owner_entity: 'AWPUB',
    authorized_scopes: ['SCOPE_GRANT_WRITE', 'SCOPE_PUBLISH'],
    risk_class: 'HIGH',
    applicable_regulations: ['EU_AI_ACT_ART14', 'GAMP5_PART11'],
    approval_required: true,
    hitl_approval_signature: 'APPROVED_BY_DP_WARD_001_0x80D0ADA1',
    recorded_in_ledger: true,
    replayability: {
      input_hash: 'a'.repeat(64),
      output_hash: 'b'.repeat(64),
      code_version: 'v1.0.0-commit-046d8a7',
      policy_version: 'DAVINCIA-ARIOS-002-v1'
    }
  });

  assert.equal(res.status, 'ACTION_APPROVED_BY_ARIOS_GOVERNOR');
  assert.equal(res.evaluated_questions.length, 8);
  assert.ok(res.q8_replay_signature.length === 64);
});

test('111_ARIOS_Governor_Q8_Replayability_Fail_Closed: Hard-blocks action when Q8 code_version or policy_version is missing', () => {
  const governor = new AriosEightQuestionsGovernorEngine();
  const res = governor.evaluateAction({
    principal_id: 'usr_david_001',
    owner_entity: 'AWPUB',
    authorized_scopes: ['SCOPE_GRANT_WRITE'],
    risk_class: 'MEDIUM',
    applicable_regulations: ['EU_AI_ACT'],
    approval_required: false,
    recorded_in_ledger: true,
    replayability: {
      input_hash: 'a'.repeat(64),
      output_hash: 'b'.repeat(64),
      code_version: null, // MISSING CODE VERSION!
      policy_version: 'DAVINCIA-ARIOS-002-v1'
    }
  });

  assert.equal(res.status, 'BLOCKED_FAIL_CLOSED');
  assert.equal(res.failed_question, 'Q8');
  assert.equal(res.rm10_routed, true);
});

test('112_ARIOS_Governor_Q6_HITL_Signature_Fail_Closed: Hard-blocks action when HITL approval is required but signature missing', () => {
  const governor = new AriosEightQuestionsGovernorEngine();
  const res = governor.evaluateAction({
    principal_id: 'usr_david_001',
    owner_entity: 'AWPUB',
    authorized_scopes: ['SCOPE_GRANT_WRITE'],
    risk_class: 'CRITICAL',
    applicable_regulations: ['EU_AI_ACT'],
    approval_required: true,
    hitl_approval_signature: null, // MISSING HITL SIGNATURE!
    recorded_in_ledger: true,
    replayability: {
      input_hash: 'a'.repeat(64),
      output_hash: 'b'.repeat(64),
      code_version: 'v1.0.0',
      policy_version: 'v1'
    }
  });

  assert.equal(res.status, 'BLOCKED_FAIL_CLOSED');
  assert.equal(res.failed_question, 'Q6');
});
