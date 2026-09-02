/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Spatial Learning Engine
 * Governance Standard: Patent WO/2026/150385
 *
 * Analyzes telemetry residuals to calibrate environmental constants, wind shielding,
 * turf friction, and Strokes Gained EV baselines dynamically across the 5 Touchpoints.
 *
 * @module alex-wenger-golf/core/spatial/spatialLearningEngine
 */

/**
 * Distance helper in yards between two [lng, lat] coordinates
 */
function calculateDistanceYards(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const meters = R * c;
  return Number((meters * 1.09361).toFixed(1));
}

export class SpatialLearningEngine {
  constructor(options = {}) {
    this.learningRate = options.learningRate || 0.05; // Bayesian learning update rate
  }

  /**
   * Compares theoretical 3-DoF flight with actual on-course landing results.
   * Calibrates localized wind shielding, turf firmness, and expected value tables.
   * @param {string} courseId
   * @param {Array} userRoundHistory
   * @param {object} courseBundle
   * @returns {object} Calibrated environmental telemetry package
   */
  calibrateCourseTelemetry(courseId, userRoundHistory = [], courseBundle = {}) {
    const calibrations = {
      courseId,
      processedShots: 0,
      windShieldingModifiers: {}, // Mapped by hole
      reboundFrictionAdjustments: {}, // Mapped by surface type
      strokesGainedBaselineDrift: { offTheTee: 0.0, approach: 0.0, putting: 0.0 },
      governanceAudit: {
        patentStandard: 'WO/2026/150385',
        exclusively_alex_responsibility: true
      },
      timestamp: new Date().toISOString()
    };

    const courseData = courseBundle?.courses?.[courseId] || {};
    const shots = userRoundHistory.filter(s => s.courseId === courseId && s.verifiedRestingCoord);

    calibrations.processedShots = shots.length;

    for (const shot of shots) {
      const { hole, rawWindMph, targetCoord, verifiedRestingCoord, resolvedLie, firstImpactCoord, modeledRollYards, resolvedSurface } = shot;

      // 1. Calculate Spatial Residual (Yardage gap between target and actual resting position)
      const distanceResidualYards = calculateDistanceYards(targetCoord, verifiedRestingCoord);

      // 2. Drag & Wind Shielding Calibration (Caddy Canopy Adjustments)
      if (rawWindMph && rawWindMph > 12) {
        const holeKey = `hole_${hole || 1}`;
        const currentShielding = courseData.signature_hazards?.[holeKey]?.canopy_shielding_factor || 1.0;
        
        const windDriftError = distanceResidualYards / Math.max(rawWindMph, 1);
        const updatedShielding = currentShielding - (this.learningRate * windDriftError * 0.1);
        
        calibrations.windShieldingModifiers[holeKey] = Number(Math.max(0.2, Math.min(updatedShielding, 1.0)).toFixed(2));
      }

      // 3. Specular Rebound Calibration (Turf Firmness & Rollout μ)
      if (firstImpactCoord && verifiedRestingCoord) {
        const actualRollYards = calculateDistanceYards(firstImpactCoord, verifiedRestingCoord);
        const surfaceType = resolvedSurface || resolvedLie || 'fairway';
        const expectedRoll = modeledRollYards || 10.0;

        if (actualRollYards > expectedRoll * 1.15) {
          calibrations.reboundFrictionAdjustments[surfaceType] = 'FIRM_RUNOUT_ADJUSTED';
        } else if (actualRollYards < expectedRoll * 0.85) {
          calibrations.reboundFrictionAdjustments[surfaceType] = 'SOFT_TURF_DAMPENED';
        } else {
          calibrations.reboundFrictionAdjustments[surfaceType] = 'OPTIMAL_CALIBRATED';
        }
      }

      // 4. Strokes Gained Baseline Drift
      if (shot.sgValue !== undefined) {
        if (shot.lie === 'tee' || resolvedLie === 'Tee Box') {
          calibrations.strokesGainedBaselineDrift.offTheTee += Number((shot.sgValue * 0.1).toFixed(2));
        } else if (shot.lie === 'fairway' || resolvedLie === 'Fairway') {
          calibrations.strokesGainedBaselineDrift.approach += Number((shot.sgValue * 0.1).toFixed(2));
        }
      }
    }

    return calibrations;
  }
}

export const spatialLearningEngine = new SpatialLearningEngine();
