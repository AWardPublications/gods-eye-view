import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HumanApprovalDaisEngine } from '../humanApprovalDaisEngine.mjs';

test('118_Human_Approval_Dais_Gate4_Success: Promotes document to Gate 4 Final Release on Dais Plinth with GnuPG 0x80D0ADA1 and FIDO2 touch', () => {
  const dais = new HumanApprovalDaisEngine();
  const res = dais.signOffDocumentGate4({
    stewardId: 'usr_david_001',
    role: 'FOUNDER',
    documentId: 'doc_embassy_rfp_2026',
    gpgKey: '0x80D0ADA1',
    fido2TouchVerified: true,
    mechanicalStampApplied: true
  });

  assert.equal(res.status, 'DOCUMENT_PROMOTED_GATE_4_RELEASED');
  assert.equal(res.dais_location, 'Human Approval Room Dais (Stone Plinth)');
  assert.ok(res.committed_record.entry_hash.length === 64);
});

test('119_Human_Approval_Dais_Role_Reject: Hard-rejects Client attempt to perform Gate 4 sign-off', () => {
  const dais = new HumanApprovalDaisEngine();
  const res = dais.signOffDocumentGate4({
    stewardId: 'usr_client',
    role: 'CLIENT',
    documentId: 'doc_embassy_rfp_2026',
    gpgKey: '0x80D0ADA1',
    fido2TouchVerified: true,
    mechanicalStampApplied: true
  });

  assert.equal(res.status, 'APPROVAL_DENIED_INSUFFICIENT_ROLE');
  assert.equal(res.rm10_routed, true);
});

test('120_Human_Approval_Dais_Stamp_Reject: Hard-rejects Gate 4 sign-off if mechanical stamp was not actuated', () => {
  const dais = new HumanApprovalDaisEngine();
  const res = dais.signOffDocumentGate4({
    stewardId: 'usr_david_001',
    role: 'FOUNDER',
    documentId: 'doc_embassy_rfp_2026',
    gpgKey: '0x80D0ADA1',
    fido2TouchVerified: true,
    mechanicalStampApplied: false
  });

  assert.equal(res.status, 'APPROVAL_DENIED_MISSING_MECHANICAL_STAMP');
});
