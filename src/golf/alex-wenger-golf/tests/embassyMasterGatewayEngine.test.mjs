import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EmbassyMasterGatewayEngine } from '../../../davidos/embassyMasterGatewayEngine.mjs';

test('1. EmbassyMasterGatewayEngine compiles 5 sovereign portal gateways (Corkonian, Alex Wenger, BAIR, DaVinciA DVA, Embassy)', () => {
  const engine = new EmbassyMasterGatewayEngine();
  const res = engine.compileEmbassyGateway();

  assert.equal(res.status, 'EMBASSY_MASTER_GATEWAY_COMPILED_AND_ACTIVE');
  assert.equal(res.portalsCount, 5);
  assert.equal(res.embassyGatewayPortals[0].name, 'CORKONIAN OS');
  assert.equal(res.embassyGatewayPortals[1].name, 'ALEX WENGER OS');
  assert.equal(res.embassyGatewayPortals[2].name, 'BAIR (Brehon AI Research)');
  assert.equal(res.embassyGatewayPortals[3].name, 'DAVINCIA DVA (DaVinciA⁺)');
  assert.equal(res.embassyGatewayPortals[4].name, 'DAVID_OS EMBASSY');
  assert.ok(res.gatewayHash.length === 64);
});
