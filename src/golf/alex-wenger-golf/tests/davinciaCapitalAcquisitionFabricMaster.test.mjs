import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaCapitalAcquisitionFabricMaster } from '../../../davincia/davinciaCapitalAcquisitionFabricMaster.mjs';

test('1. DavinciaCapitalAcquisitionFabricMaster verifies Capital DNA, TAO-1.0, 13 Control Gates, Human Authority Gate, and Adversarial Neutralization', () => {
  const engine = new DavinciaCapitalAcquisitionFabricMaster();

  assert.equal(engine.specificationVersion, 'v1.0-AUTONOMOUS-ENTERPRISE-FEATURE');
  assert.equal(engine.controlGates.length, 13);
  assert.equal(engine.agentRegistry.length, 15);
  assert.equal(engine.conformance20Families.length, 20);

  const dna = engine.createCapitalDnaProfile({ name: 'Brehon AI Solutions Limited', targetCapitalEur: 25000000 });
  assert.equal(dna.entity.name, 'Brehon AI Solutions Limited');
  assert.equal(dna.capitalTargetEur, 25000000);

  const unauth = engine.executeGovernedSubmissionPipeline('ENT-001', 'OPP-001', null);
  assert.equal(unauth.status, 'PAUSED_WAITING_HUMAN_SIGN_OFF');
  assert.equal(unauth.isSubmitted, false);

  const auth = engine.executeGovernedSubmissionPipeline('ENT-001', 'OPP-001', 'David Ward');
  assert.equal(auth.status, 'SUBMISSION_SUCCESSFULLY_EXECUTED_AND_LOGGED');
  assert.equal(auth.isSubmitted, true);

  const adv = engine.executeAdversarialAttackSuite();
  assert.equal(adv.allAttacksNeutralized, true);
});
