import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NoraGoogleDriveSyncEngine } from '../../../publishing/noraGoogleDriveSyncEngine.mjs';

test('1. NoraGoogleDriveSyncEngine stages Google Drive upload bundle for Nora folder 1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5', () => {
  const engine = new NoraGoogleDriveSyncEngine();
  const res = engine.prepareDriveUploadPackage();

  assert.equal(res.status, 'NORA_GOOGLE_DRIVE_UPLOAD_BUNDLE_READY');
  assert.equal(res.reviewer, 'Nora');
  assert.equal(res.googleDriveFolderId, '1ZrjOVi_kNPQxAHVynaPgEw821hVm8nb5');
  assert.equal(res.stagedFiles.length, 2);
  assert.ok(res.hash.length === 64);
});
