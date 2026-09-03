import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GrantCoverLettersAndCheatSheetEngine } from '../../../agents/grantCoverLettersAndCheatSheetEngine.mjs';

test('1. GrantCoverLettersAndCheatSheetEngine verifies 6 tailored cover letters and 5-rule master cheat sheet', () => {
  const engine = new GrantCoverLettersAndCheatSheetEngine();
  const res = engine.generateCoverLettersAndCheatSheet();

  assert.equal(res.status, 'COVER_LETTERS_AND_CHEAT_SHEET_GENERATED');
  assert.equal(res.coverLettersCount, 6);
  assert.equal(res.totalFilesGenerated, 7);
  assert.equal(engine.cheatSheetRules.length, 5);
  assert.ok(res.hash.length === 64);
});
