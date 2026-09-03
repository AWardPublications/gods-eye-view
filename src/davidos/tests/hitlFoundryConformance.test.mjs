import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlFoundryEngine } from '../hitlFoundryEngine.mjs';

test('67_Hitl_Foundry_10_Point_Master_Specification: Generates complete 48-seat 12-domain master spec', () => {
  const foundry = new HitlFoundryEngine();
  const spec = foundry.generateMasterHitlSpecification();

  assert.equal(spec.milestone, 'DAVINCIA-HITL-FOUNDRY-v1.0');
  assert.equal(spec.totalSpecialistSeats, 48);
  assert.equal(spec.humanAuthorityCoverageIndex, 100.0);
  assert.equal(spec.domainSpecifications.length, 12);
  assert.equal(spec.domainSpecifications[0].panelRoles.length, 4);
  assert.ok(spec.spec_hash.length === 64);
});
