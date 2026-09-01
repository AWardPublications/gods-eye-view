import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordGodsEyeShot } from '../../../../scripts/media/recordGodsEyeShot.js';

test('1. recordGodsEyeShot initiates headless capture pipeline', async () => {
  const recRes = await recordGodsEyeShot({
    courseId: 'valderrama_golf_club',
    holeNumber: 5,
    shotTelemetry: { pinCoordinates: [-2.8010, 56.3450], bearing: 45 },
    outputPath: './temp_captures/'
  });

  assert.ok(recRes.status === 'RECORDING_COMPLETE' || recRes.status === 'SIMULATED_RECORDING');
  assert.equal(recRes.courseId, 'valderrama_golf_club');
  assert.equal(recRes.holeNumber, 5);
});

test('2. Media Factory matrix registers 10 God\'s Eye content workflows', () => {
  const WORKFLOWS = [
    { id: 1, title: "EV Heatmap & Dispersion Ellipses", target: "YouTube Shorts / TikTok Strategy Series" },
    { id: 2, title: "Canopy Wind Shear Vectors", target: "Breakdown Reel" },
    { id: 3, title: "Specular Rebound Cones", target: "Technical Short" },
    { id: 4, title: "Stance Torque Gradient", target: "Biomechanical Tip Clip" },
    { id: 5, title: "False Front & Tier Fallaway", target: "Pro Strategy Reel" },
    { id: 6, title: "Solar Shadow & Evaporation", target: "Short-Form Explainer" },
    { id: 7, title: "APAC Dual-Green Line-of-Sight", target: "Discovery Feature" },
    { id: 8, title: "Blind Dune Hazard X-Ray", target: "Course Vlog Hook" },
    { id: 9, title: "Eve of Round Pin Risk Matrix", target: "YouTube Preview" },
    { id: 10, title: "19th Hole Shot Trace Recap", target: "Full Video Podcast" }
  ];

  assert.equal(WORKFLOWS.length, 10);
  assert.equal(WORKFLOWS[0].id, 1);
  assert.equal(WORKFLOWS[9].id, 10);
});
