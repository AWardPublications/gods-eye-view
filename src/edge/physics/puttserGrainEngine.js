/**
 * PUTTSER — Grass Grain Shear & Green Rolling Resistance Matrix Engine
 * Governance Standard: Patent WO/2026/150385
 *
 * Implements:
 * 1. Moisture-scaled rolling friction coefficient: mu_r(GMC, type)
 * 2. Lateral grain shear deflection vector: f_grain(type, GMC, g_vector . v_vector)
 * 3. 2D Green Break Path Integration incorporating slope gradient & grain steering
 *
 * @module edge/physics/puttserGrainEngine
 */

import constants from './ballistics_turf_constants.json' with { type: 'json' };

export class PuttserGrainEngine {
  constructor() {
    this.turfMatrices = constants.turf_friction_matrices;
    this.g = 9.80665; // m/s^2
  }

  /**
   * Calculates moisture-scaled rolling friction coefficient mu_r
   * @param {string} turfType - 'creeping_bentgrass' | 'bermuda_tifeagle' | 'coastal_fescue'
   * @param {number} gmcPct - Green Moisture Content % (e.g. 15.0%)
   * @returns {number} Dynamic rolling friction coefficient mu_r
   */
  calculateMoistureRollingFriction(turfType = 'creeping_bentgrass', gmcPct = 15.0) {
    const turf = this.turfMatrices[turfType] || this.turfMatrices.creeping_bentgrass;
    const mu0 = turf.base_friction_mu;
    const betaM = turf.moisture_drag_beta;

    // mu_r(GMC, type) = mu_{r,0} * [1 + beta_m * ((GMC - 10) / 20)]
    const moistureTerm = 1.0 + betaM * ((gmcPct - 10.0) / 20.0);
    const muR = mu0 * moistureTerm;

    return Number(muR.toFixed(4));
  }

  /**
   * Calculates total deceleration & lateral acceleration vector a_roll on greens
   * @param {object} params - Rolling state parameters
   * @returns {object} { ax, ay, muR, grainSteeringAngleDeg }
   */
  calculateRollingAcceleration({
    turfType = 'creeping_bentgrass',
    gmcPct = 15.0,
    velocityMps = [1.5, 0.0], // [vx, vy]
    slopeVector = [0.02, 0.0],  // [sin(theta_x), sin(theta_y)]
    grainVector = [0.0, 1.0]    // [gx, gy] unit vector pointing in grain direction
  } = {}) {
    const muR = this.calculateMoistureRollingFriction(turfType, gmcPct);
    const turf = this.turfMatrices[turfType] || this.turfMatrices.creeping_bentgrass;

    const speed = Math.hypot(velocityMps[0], velocityMps[1]);
    if (speed < 0.01) {
      return { ax: 0, ay: 0, muR, grainSteeringAngleDeg: 0 };
    }

    const vHat = [velocityMps[0] / speed, velocityMps[1] / speed];
    const gHat = [grainVector[0], grainVector[1]];

    // Grain alignment dot product: g_vector . v_vector
    const gDotV = gHat[0] * vHat[0] + gHat[1] * vHat[1];

    // Lateral grain force increases at lower rolling speeds (v < 0.8 m/s) on coarse Bermuda
    const speedFactor = speed < 0.8 ? (0.8 - speed) / 0.8 : 0.0;
    const grainForceMag = turf.lateral_grain_influence * (1.0 + speedFactor * 1.5);

    // Cross product magnitude for lateral grain shear
    const gCrossV = gHat[0] * vHat[1] - gHat[1] * vHat[0];

    // Total acceleration components: a_roll = -mu_r g v_hat + g sin(slope) + f_grain
    const ax = -muR * this.g * vHat[0] + this.g * slopeVector[0] - grainForceMag * gCrossV * vHat[1];
    const ay = -muR * this.g * vHat[1] + this.g * slopeVector[1] + grainForceMag * gCrossV * vHat[0];

    const grainSteeringAngleDeg = Number(((Math.atan2(ay, ax) * 180) / Math.PI).toFixed(1));

    return {
      ax: Number(ax.toFixed(4)),
      ay: Number(ay.toFixed(4)),
      muR,
      grainSteeringAngleDeg,
      turfType,
      gmcPct
    };
  }

  /**
   * Simulates full putt rollout trajectory path until ball comes to rest
   * @param {object} puttParams
   * @returns {object} { finalDistanceMeters, finalDistanceYards, pathSteps, durationSeconds }
   */
  simulatePuttBreak({
    initialSpeedMps = 2.5,
    initialBearingDeg = 0.0,
    turfType = 'bermuda_tifeagle',
    gmcPct = 15.0,
    slopeVector = [0.015, 0.0],
    grainVector = [0.0, 1.0]
  } = {}) {
    const dt = 0.01; // 10ms step
    let t = 0;
    let pos = [0, 0];
    const rad = (initialBearingDeg * Math.PI) / 180;
    let vel = [initialSpeedMps * Math.sin(rad), initialSpeedMps * Math.cos(rad)];

    const pathSteps = [];

    while (Math.hypot(vel[0], vel[1]) > 0.02 && t < 10.0) {
      const accel = this.calculateRollingAcceleration({
        turfType,
        gmcPct,
        velocityMps: vel,
        slopeVector,
        grainVector
      });

      vel[0] += accel.ax * dt;
      vel[1] += accel.ay * dt;

      pos[0] += vel[0] * dt;
      pos[1] += vel[1] * dt;

      t += dt;
      if (Math.floor(t * 100) % 10 === 0) {
        pathSteps.push({ t: Number(t.toFixed(2)), pos: [Number(pos[0].toFixed(3)), Number(pos[1].toFixed(3))] });
      }
    }

    const totalDistanceMeters = Math.hypot(pos[0], pos[1]);
    const totalDistanceYards = Number((totalDistanceMeters * 1.09361).toFixed(2));

    return {
      finalDistanceMeters: Number(totalDistanceMeters.toFixed(2)),
      finalDistanceYards: totalDistanceYards,
      totalRolloutTimeSeconds: Number(t.toFixed(2)),
      pathStepsCount: pathSteps.length,
      turfType,
      gmcPct,
      exclusively_alex_responsibility: true
    };
  }
}
