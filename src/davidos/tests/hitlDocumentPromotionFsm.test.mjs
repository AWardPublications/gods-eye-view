import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlDocumentPromotionFsmEngine } from '../hitlDocumentPromotionFsmEngine.mjs';

test('98_FSM_Gate_2_Editorial_Refusal: Refuses document at Gate 2 due to open critical placeholder', () => {
  const fsm = new HitlDocumentPromotionFsmEngine();
  const res = fsm.evaluateDraft({
    doc_id: 'DOC-FSM-001',
    title: 'Swiss Ballistics Report',
    current_gate: 'GATE_2_EDITORIAL',
    placeholders: [{ id: 'p1', priority: 'CRITICAL', status: 'OPEN' }]
  });

  assert.equal(res.status, 'REFUSED_AT_GATE_2');
  assert.equal(res.fsm_state, 'REFUSED_RM10');
  assert.equal(res.rm10_routed, true);
});

test('99_FSM_Gate_3_Governance_Refusal: Refuses document at Gate 3 due to open optional placeholder', () => {
  const fsm = new HitlDocumentPromotionFsmEngine();
  const res = fsm.evaluateDraft({
    doc_id: 'DOC-FSM-002',
    title: 'CorkMan Folklore Archive',
    current_gate: 'GATE_3_GOVERNANCE',
    placeholders: [{ id: 'p2', priority: 'LOW', status: 'OPEN' }]
  });

  assert.equal(res.status, 'REFUSED_AT_GATE_3');
  assert.equal(res.fsm_state, 'REFUSED_RM10');
  assert.equal(res.rm10_routed, true);
});

test('100_FSM_Gate_4_Press_Signature_Refusal: Refuses document at Gate 4 when release signature is missing', () => {
  const fsm = new HitlDocumentPromotionFsmEngine();
  const res = fsm.evaluateDraft({
    doc_id: 'DOC-FSM-003',
    title: 'A.Ward ISBN Catalogue',
    current_gate: 'GATE_4_PRESS',
    placeholders: [{ id: 'p3', priority: 'CRITICAL', status: 'CLOSED' }]
  }, null);

  assert.equal(res.status, 'REFUSED_AT_GATE_4');
  assert.equal(res.fsm_state, 'REFUSED_RM10');
  assert.equal(res.rm10_routed, true);
});

test('101_FSM_Gate_4_Press_Promotion_Success: Successfully promotes document to PUBLISHED with valid GnuPG release seal', () => {
  const fsm = new HitlDocumentPromotionFsmEngine();
  const res = fsm.evaluateDraft({
    doc_id: 'DOC-FSM-004',
    title: 'DaVinciA GRC Spine Blueprint',
    current_gate: 'GATE_4_PRESS',
    placeholders: [{ id: 'p4', priority: 'CRITICAL', status: 'CLOSED' }]
  }, 'APPROVED by DP Ward 001 (0x80D0ADA1)');

  assert.equal(res.status, 'PROMOTED_AND_PUBLISHED');
  assert.equal(res.release_seal.fsm_state, 'PUBLISHED');
  assert.equal(res.release_seal.gpg_signature, '0x80D0ADA1');
  assert.ok(res.release_seal.release_hash.length === 64);
});
