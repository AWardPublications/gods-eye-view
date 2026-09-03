import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantGedhiExportEngine } from '../../../agents/grantGedhiExportEngine.mjs';

test('1. GrantGedhiExportEngine exports beautifully branded files and Google Docs to Desktop/GRANT GEDHI', () => {
  const engine = new GrantGedhiExportEngine();
  const res = engine.exportAllGrantGedhiDocs();

  assert.equal(res.status, 'GRANT_GEDHI_DESKTOP_EXPORT_COMPLETE');
  assert.equal(res.targetDirectory, 'C:\\Users\\David\\Desktop\\GRANT GEDHI');
  assert.ok(res.totalFilesGenerated >= 100);
  assert.ok(res.exportHash.length === 64);
});
