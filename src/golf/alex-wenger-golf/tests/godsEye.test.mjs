import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GodsEyeController } from '../core/spatial/godsEyeController.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. GodsEyeController snaps to Nadir perpendicular view (Pitch: 0°)', () => {
  const controller = new GodsEyeController();
  const res = controller.snapToNadir([-2.8027, 56.3432], 17);

  assert.equal(res.status, 'NADIR_LOCKED');
  assert.equal(res.pitch, 0);
  assert.equal(controller.mode, 'GODS_EYE_NADIR');
});

test('2. GodsEyeController engages Oblique 3D Green Orbit (Pitch: 58°)', () => {
  const controller = new GodsEyeController();
  const res = controller.orbitApproach([-2.8010, 56.3450], 45);

  assert.equal(res.status, 'ORBIT_ENGAGED');
  assert.equal(res.pitch, 58);
  assert.equal(res.bearing, 45);
  assert.equal(controller.mode, 'GODS_EYE_ORBIT');
});

test('3. GodsEyeController configures FLIR and High-Contrast sensor styles', () => {
  const controller = new GodsEyeController();
  const resFlir = controller.setVisualSensorStyle('FLIR_TERRAIN');
  assert.equal(resFlir.style, 'FLIR_TERRAIN');

  const resTopo = controller.setVisualSensorStyle('HIGH_CONTRAST_TOPO');
  assert.equal(resTopo.style, 'HIGH_CONTRAST_TOPO');
});

test('4. Governed pipeline parses "God\'s Eye" query and returns Alex tactical speech', () => {
  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, give me God's Eye on this hole",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: "Taking a God's Eye look from above. Fairway pinches at 240 yards between pot bunkers; bail out left-center."
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.length > 10);
});
