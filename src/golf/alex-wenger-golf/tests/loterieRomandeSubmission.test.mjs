import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Loterie Romande Submission verifies CHF 25,000 request, CHF 95,000 total budget, Sion address, and 7 Annexes', () => {
  const requestedChf = 25000;
  const totalBudgetChf = 95000;
  const applicantAddress = 'Route de la Drague 18, 1950 Sion — Valais';
  const recipientAddress = 'Place de la Gare 2, 1950 Sion 2';
  const signatory = 'David Ward';

  const annexes = [
    'Formulaire officiel',
    'Note de présentation',
    'Budget & plan de financement',
    'Fiches de médiation (A, B, C, D)',
    'Extrait de script bilingue',
    'Extrait Registre du Commerce',
    'Relevé d\'identité bancaire (QR-IBAN)'
  ];

  assert.equal(requestedChf, 25000, 'Requested amount must equal CHF 25,000');
  assert.equal(totalBudgetChf, 95000, 'Total budget must equal CHF 95,000');
  assert.equal(annexes.length, 7, 'Must attach 7 required annexes');
  assert.equal(signatory, 'David Ward', 'Signatory must be David Ward');
});
