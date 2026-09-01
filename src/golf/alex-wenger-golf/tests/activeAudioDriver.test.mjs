import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ActiveAudioDriver, alexAudioDriver } from '../core/vocal/activeAudioDriver.js';

test('ActiveAudioDriver initializes with default speaker Alex', () => {
  const driver = new ActiveAudioDriver();
  assert.equal(driver.speaker, 'Alex');
  assert.equal(driver.isListening, false);
});

test('ActiveAudioDriver speak method generates SSML payload for Alex', async () => {
  const driver = new ActiveAudioDriver({ speaker: 'Alex' });
  const result = await driver.speak('Exhale, trust your line, and commit.');
  assert.equal(result, true);
});

test('alexAudioDriver singleton instance is exported correctly', () => {
  assert.ok(alexAudioDriver);
  assert.equal(typeof alexAudioDriver.speak, 'function');
  assert.equal(typeof alexAudioDriver.startVoiceControl, 'function');
});
