import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FullEcosystemUserJourneySimulator } from '../../../davidos/fullEcosystemUserJourneySimulator.mjs';

test('1. FullEcosystemUserJourneySimulator executes 10-step user walkthrough across entire ecosystem', () => {
  const simulator = new FullEcosystemUserJourneySimulator();
  const res = simulator.runFullJourney();

  assert.equal(res.status, 'FULL_ECOSYSTEM_USER_JOURNEY_SUCCESSFUL');
  assert.equal(res.totalSteps, 10);
  assert.equal(res.userSession.gpgKey, '0x80D0ADA1');
  assert.equal(res.steps[0].endpoint, '/david-os');
  assert.equal(res.steps[3].endpoint, '/library_shelves.html');
  assert.equal(res.steps[4].endpoint, '/cop_on_corkonian_game.html');
  assert.ok(res.journeyHash.length === 64);
});
