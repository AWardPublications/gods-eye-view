import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderDemoTacticalReel } from '../../../../scripts/media/renderDemoTacticalReel.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. demo_altitude_corridor.json seed dataset exists and contains Camiral Hole 11 telemetry', () => {
  const seedPath = './public/data/demo_altitude_corridor.json';
  assert.ok(fs.existsSync(seedPath));

  const data = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  assert.equal(data.hole_number, 11);
  assert.equal(data.raw_yards, 164);
  assert.equal(data.plays_like_yards, 151);
  assert.equal(data.elevation_plunge_meters, -13);
  assert.equal(data.thermodynamics.air_density_kg_m3, 1.002);
});

test('2. renderDemoTacticalReel executes automated demo reel assembly factory', async () => {
  const res = await renderDemoTacticalReel('./public/data/demo_altitude_corridor.json');

  assert.equal(res.status, 'DEMO_REEL_READY');
  assert.equal(res.seedData.hole_number, 11);
  assert.ok(fs.existsSync(res.subtitlesPath));
});

test('3. Governed 6-state pipeline executes Camiral Hole 11 voice query with Judge audit PASS', () => {
  const seedData = JSON.parse(fs.readFileSync('./public/data/demo_altitude_corridor.json', 'utf8'));

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, pin is tucked front-right over the ridge. How does this wind and altitude affect my carry?",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: seedData.alex_coaching_speech
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.includes('164') || pipelineRes.integrated_coaching_response.includes('151') || pipelineRes.integrated_coaching_response.includes('9-iron'));
});
