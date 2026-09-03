import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GithubDiskMasterAlignmentEngine } from '../../../davincia/githubDiskMasterAlignmentEngine.mjs';

test('1. GithubDiskMasterAlignmentEngine aligns 15 GitHub repositories and local disk workspaces into 6 Sovereign Operating Systems', () => {
  const engine = new GithubDiskMasterAlignmentEngine();
  const res = engine.executeMasterAlignmentAudit();

  assert.equal(res.status, 'GITHUB_AND_DISK_OPERATING_SYSTEMS_ALIGNED');
  assert.equal(res.totalSovereignOperatingSystems, 6);
  assert.ok(res.alignmentHash.length === 64);
});
