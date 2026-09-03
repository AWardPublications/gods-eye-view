import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FullEcosystemReviewerJourneySimulator } from '../../../davidos/fullEcosystemReviewerJourneySimulator.mjs';

test('1. FullEcosystemReviewerJourneySimulator executes 7-step reviewer evaluation walkthrough', () => {
  const simulator = new FullEcosystemReviewerJourneySimulator();
  const res = simulator.runReviewerJourney();

  assert.equal(res.status, 'FULL_ECOSYSTEM_REVIEWER_JOURNEY_SUCCESSFUL');
  assert.equal(res.totalSteps, 7);
  assert.equal(res.reviewerSession.googleDriveVault, '1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5');
  assert.equal(res.steps[0].endpoint, '/master_review_control_center.html');
  assert.equal(res.steps[3].endpoint, '/nora_cbd_codex_review_portal.html');
  assert.ok(res.reviewHash.length === 64);
});
