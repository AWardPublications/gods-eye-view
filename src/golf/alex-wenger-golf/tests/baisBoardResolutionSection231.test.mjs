import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaisBoardResolutionSection231Engine } from '../../../corporate/baisBoardResolutionSection231.mjs';

test('1. BaisBoardResolutionSection231Engine verifies Companies Act 2014 Section 231 disclosure, Karshan test, and Section 835D TCA 1997 Transfer Pricing', () => {
  const engine = new BaisBoardResolutionSection231Engine();
  const res = engine.generateStatutoryRecord();

  assert.equal(res.status, 'SECTION_231_STATUTORY_RECORD_VERIFIED');
  assert.equal(res.company.croNumber, '790337');
  assert.equal(res.company.director, 'Anna Ward');
  assert.equal(res.company.companySecretary, 'Paddy Ward');

  assert.ok(res.compliance.section231Notice.includes('Section 231'));
  assert.ok(res.compliance.connectedPerson.includes('Section 220'));
  assert.ok(res.taxFramework.transferPricing.includes('Cost-Plus 8.5%'));
  assert.ok(res.taxFramework.peSafeguard.includes('Article 5'));
  assert.ok(res.taxFramework.independentContractor.includes('Karshan'));
  assert.ok(res.evidenceHash.length === 64);
});
