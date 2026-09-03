import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TriUniverseLaunchEngine } from '../../../publishing/triUniverseLaunchEngine.mjs';

test('1. TriUniverseLaunchEngine launches all 3 applications and integrated review platforms', () => {
  const engine = new TriUniverseLaunchEngine();
  const res = engine.launchAllApplications();

  assert.equal(res.status, 'ALL_3_APPLICATIONS_AND_REVIEW_PLATFORMS_LIVE');
  assert.equal(res.applicationsCount, 3);
  assert.equal(res.applications[0].appUrl, '/embassy');
  assert.equal(res.applications[1].appUrl, '/golf-resort');
  assert.equal(res.applications[2].appUrl, '/corkonian-island');
  assert.ok(res.launchHash.length === 64);
});
