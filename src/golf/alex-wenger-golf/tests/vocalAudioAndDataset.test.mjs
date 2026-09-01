import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateSSMLSpeechPayload, processWhisperSTTInput } from '../core/vocal/alexVoiceAudioEngine.js';

test('alexVoiceAudioEngine generates sub-50ms SSML payload for Alex Voice', () => {
  const payload = generateSSMLSpeechPayload('Alex', 'Trust your line over the dune.');

  assert.equal(payload.speaker, 'alex_wenger_v1');
  assert.ok(payload.ssml.includes('<speak>'));
  assert.ok(payload.ssml.includes('Mais oui, my friend!'));
  assert.equal(payload.latency_target_ms, 45);
});

test('processWhisperSTTInput normalizes hands-free mobile speech transcript', () => {
  const stt = processWhisperSTTInput(' What is the wind playing like on hole 17? ');

  assert.equal(stt.stt_engine, 'whisper.cpp-ondevice');
  assert.equal(stt.transcript, 'What is the wind playing like on hole 17?');
  assert.equal(stt.word_count, 9);
});

test('geographic_memory_engine.json includes Royal County Down and Carnoustie', () => {
  const filePath = join(process.cwd(), 'src/golf/data/geographic_memory_engine.json');
  const db = JSON.parse(readFileSync(filePath, 'utf-8'));

  assert.ok(db.courses.royal_county_down, 'Royal County Down should exist in geographic memory');
  assert.ok(db.courses.carnoustie_champ, 'Carnoustie should exist in geographic memory');

  // Verify Royal County Down
  const rcd = db.courses.royal_county_down;
  assert.equal(rcd.name, 'Royal County Down Golf Club');
  assert.ok(rcd.holes['4'], 'Hole 4 The Giant should exist');
  assert.equal(rcd.holes['4'].name, 'The Giant');

  // Verify Carnoustie
  const carnoustie = db.courses.carnoustie_champ;
  assert.equal(carnoustie.name, 'Carnoustie Golf Links (Championship Course)');
  assert.ok(carnoustie.holes['18'], 'Hole 18 Barry Burn should exist');
  assert.equal(carnoustie.holes['18'].name, 'Home (Barry Burn)');
});
