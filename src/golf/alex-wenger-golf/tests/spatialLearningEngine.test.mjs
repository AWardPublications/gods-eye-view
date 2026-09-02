import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SpatialLearningEngine } from '../core/spatial/spatialLearningEngine.js';

test('1. SpatialLearningEngine calculates telemetry residuals and updates canopy wind shielding', () => {
  const engine = new SpatialLearningEngine({ learningRate: 0.05 });
  const mockCourseBundle = {
    courses: {
      valderrama_golf_club: {
        signature_hazards: {
          hole_4: { canopy_shielding_factor: 1.0 }
        }
      }
    }
  };

  const userRoundHistory = [
    {
      courseId: 'valderrama_golf_club',
      hole: 4,
      rawWindMph: 18,
      targetCoord: [-5.328, 36.284],
      verifiedRestingCoord: [-5.325, 36.286],
      resolvedLie: 'fairway',
      sgValue: +0.42
    }
  ];

  const calib = engine.calibrateCourseTelemetry('valderrama_golf_club', userRoundHistory, mockCourseBundle);

  assert.equal(calib.courseId, 'valderrama_golf_club');
  assert.equal(calib.processedShots, 1);
  assert.ok(calib.windShieldingModifiers['hole_4'] <= 1.0);
  assert.equal(calib.governanceAudit.patentStandard, 'WO/2026/150385');
  assert.equal(calib.governanceAudit.exclusively_alex_responsibility, true);
});

test('2. SpatialLearningEngine calibrates specular rebound friction based on rollout residuals', () => {
  const engine = new SpatialLearningEngine();
  const userRoundHistory = [
    {
      courseId: 'camiral_stadium_course',
      hole: 11,
      firstImpactCoord: [2.763, 41.855],
      verifiedRestingCoord: [2.765, 41.857],
      modeledRollYards: 8.0,
      resolvedSurface: 'fairway'
    }
  ];

  const calib = engine.calibrateCourseTelemetry('camiral_stadium_course', userRoundHistory, {});

  assert.equal(calib.processedShots, 1);
  assert.equal(calib.reboundFrictionAdjustments['fairway'], 'FIRM_RUNOUT_ADJUSTED');
});
