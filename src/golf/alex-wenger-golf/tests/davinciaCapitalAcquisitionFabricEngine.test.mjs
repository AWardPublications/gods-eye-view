import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DavinciaCapitalAcquisitionFabricEngine } from '../../../davincia/davinciaCapitalAcquisitionFabricEngine.mjs';

test('1. DavinciaCapitalAcquisitionFabricEngine verifies 15 specialized agents, typed artefact pipeline, and Red Team / Authority Gate', () => {
  const engine = new DavinciaCapitalAcquisitionFabricEngine();
  const res = engine.executeTypedArtefactPipeline('ENT-001', 'OPP-001');

  assert.equal(res.status, 'FABRIC_PIPELINE_EXECUTED_WAITING_HUMAN_AUTHORISATION');
  assert.equal(res.totalAgentsInConstellation, 15);
  assert.equal(res.controlPlaneControlsCount, 12);

  assert.equal(res.artefacts.eligibilityArtefact.decision, 'ELIGIBLE_UNDER_GOVERNANCE_RULES');
  assert.equal(res.artefacts.redTeamArtefact.criticalVulnerabilities, 0);
  assert.equal(res.artefacts.authorityGateArtefact.gateState, 'PAUSED_WAITING_HUMAN_SIGN_OFF');
  assert.ok(res.pipelineHash.length === 64);
});
