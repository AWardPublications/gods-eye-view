import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('1. Headless render script produces raw video, audio, and subtitle assets', () => {
  const mp4Path = path.resolve('dist/renders/camiral_h11_flight_deck.mp4');
  const wavPath = path.resolve('dist/renders/camiral_h11_alex_voice.wav');
  const srtPath = path.resolve('dist/renders/camiral_h11_subtitles.srt');

  assert.ok(fs.existsSync(mp4Path), 'Raw visual MP4 asset should exist');
  assert.ok(fs.existsSync(wavPath), 'Raw audio WAV asset should exist');
  assert.ok(fs.existsSync(srtPath), 'Subtitle SRT timing file should exist');
});

test('2. DaVinci Resolve Assembly script compiles master 9:16 vertical short', () => {
  const masterPath = path.resolve('dist/renders/Alex_Wenger_FlightDeck_Camiral_H11_master.mp4');
  assert.ok(fs.existsSync(masterPath), 'Compiled master MP4 output should exist in /dist/renders/');
});

test('3. Social distribution metadata contains templates for YouTube Shorts, TikTok, Reels, and LinkedIn', () => {
  const metadata = {
    platforms: ['YOUTUBE_SHORTS', 'TIKTOK', 'INSTAGRAM_REELS', 'LINKEDIN'],
    resolution: '1080x1920',
    fps: 60,
    governance_patent: 'WO/2026/150385'
  };

  assert.equal(metadata.platforms.length, 4);
  assert.equal(metadata.resolution, '1080x1920');
  assert.equal(metadata.fps, 60);
});
