import test from 'node:test';
import assert from 'node:assert/strict';
import { SION_ALPINES_COURSE, SpeedgolfTelemetrySimulator } from '../../src/golf/simulator/speedgolf-sim.js';

test('Speedgolf Simulator: Sion Alpine 18-Hole Course Topology', () => {
  assert.equal(SION_ALPINES_COURSE.length, 18);
  for (const hole of SION_ALPINES_COURSE) {
    assert.ok(hole.hole >= 1 && hole.hole <= 18);
    assert.ok(hole.par >= 3 && hole.par <= 5);
    assert.ok(hole.lat > 46.2 && hole.lat < 46.3);
    assert.ok(hole.lon > 7.3 && hole.lon < 7.4);
    assert.ok(hole.elevationM >= 500);
  }
});

test('Speedgolf Simulator: Hole-by-Hole Telemetry & Article 19 Tone Shifts', async () => {
  const sim = new SpeedgolfTelemetrySimulator();

  // Hole 1: Normal
  const f1 = await sim.playHole("NORMAL");
  assert.equal(f1.hole_number, 1);
  assert.equal(f1.tone_state, "BASELINE");
  assert.ok(f1.cumulative.speedgolf_score > 0);

  // Hole 2: Frustration Scenario
  const f2 = await sim.playHole("FRUSTRATION_DIVERGENCE");
  assert.equal(f2.hole_number, 2);
  assert.equal(f2.tone_state, "MODULATED");
  assert.ok(f2.coaching_output.pacing_units <= 0.5);
});

test('Speedgolf Simulator: Full 18-Hole Championship Simulation', async () => {
  const sim = new SpeedgolfTelemetrySimulator();
  const round = await sim.simulateFullRound();

  assert.equal(round.round_completed, true);
  assert.equal(round.holes_played, 18);
  assert.ok(round.total_strokes >= 65 && round.total_strokes <= 85);
  assert.ok(parseFloat(round.total_time_min) >= 50 && parseFloat(round.total_time_min) <= 80);
  assert.ok(round.final_speedgolf_score > 100);
  assert.equal(round.frames.length, 18);

  for (const frame of round.frames) {
    assert.ok(frame.evidence_hash.startsWith("sha256-"));
  }
});
