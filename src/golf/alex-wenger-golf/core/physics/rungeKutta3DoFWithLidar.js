/**
 * src/golf/alex-wenger-golf/core/physics/rungeKutta3DoFWithLidar.js
 * Trajectory Orchestrator: RK4 3-DoF Airborne Integrator + Micro-LiDAR Rebound & Rollout
 * Governance: WO/2026/150385 | DaVinciA+ Provenance Sealing
 */

import { MicroElevationLidarEngine, computeLidarReboundVector } from '../spatial/microElevationLidarEngine.js';
import { createHash } from 'node:crypto';

const G = 9.80665;
const BALL_MASS = 0.04593;
const BALL_RADIUS = 0.02135;
const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;

export class TrajectoryOrchestrator {
  /**
   * Main execution loop: Pipes sealed launch monitor vectors into the RK4 solver
   * and terminates flight/rollout using micro-elevation LiDAR profiles.
   */
  static simulateShot(telemetry, lidar, env) {
    const k = telemetry.kinematics || { ballSpeedMph: 165.0, launchAngleDeg: 10.5, launchAzimuthDeg: 0, totalSpinRpm: 2600, spinAxisDeg: 0 };
    const v0_mps = k.ballSpeedMph * 0.44704;
    const thetaRad = (k.launchAngleDeg * Math.PI) / 180.0;
    const psiRad = ((k.launchAzimuthDeg || 0) * Math.PI) / 180.0;

    let vx = v0_mps * Math.cos(thetaRad) * Math.sin(psiRad);
    let vy = v0_mps * Math.cos(thetaRad) * Math.cos(psiRad);
    let vz = v0_mps * Math.sin(thetaRad);

    const totalSpinRadS = (k.totalSpinRpm * 2 * Math.PI) / 60.0;
    const spinAxisRad = ((k.spinAxisDeg || 0) * Math.PI) / 180.0;
    
    let wx = totalSpinRadS * Math.cos(spinAxisRad);
    let wy = 0.0;
    let wz = totalSpinRadS * Math.sin(spinAxisRad);

    let x = 0.0;
    let y = 0.0;
    const terrainEval0 = lidar.evaluateTerrain ? lidar.evaluateTerrain(x, y) : { elevationMeters: 0, normal: [0, 0, 1], slopeDeg: 0 };
    let ground0 = terrainEval0.elevationMeters;
    let z = ground0 + 0.01;

    const dt = 0.005;
    let t = 0.0;
    let apex = z;
    let isAirborne = true;
    let bounceCount = 0;
    let carryRecorded = false;
    let carryDistance = 0;
    let landingData = {
      point: { t: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      surfaceNormal: [0, 0, 1],
      slopeDeg: 0
    };

    while (t < 30.0) {
      if (isAirborne) {
        const state = [x, y, z, vx, vy, vz];
        const nextState = this.rk4Step(state, wx, wy, wz, env, dt);
        
        x = nextState[0];
        y = nextState[1];
        z = nextState[2];
        vx = nextState[3];
        vy = nextState[4];
        vz = nextState[5];

        if (z > apex) apex = z;

        wx *= (1 - 0.01 * dt);
        wz *= (1 - 0.01 * dt);

        const terrain = lidar.evaluateTerrain ? lidar.evaluateTerrain(x, y) : { elevationMeters: 0, normal: [0, 0, 1], slopeDeg: 0 };
        if (z <= terrain.elevationMeters) {
          z = terrain.elevationMeters;

          if (!carryRecorded) {
            carryDistance = Math.hypot(x, y);
            landingData = {
              point: { t, x, y, z, vx, vy, vz },
              surfaceNormal: terrain.normal,
              slopeDeg: terrain.slopeDeg
            };
            carryRecorded = true;
          }

          bounceCount++;

          const stimp = env.greenStimpRating || 11.5;
          const restitution = Math.max(0.20, 0.48 - (stimp * 0.015));
          const friction = 0.28 + (stimp * 0.01);

          const vRebound = computeLidarReboundVector([vx, vy, vz], terrain.normal, restitution, friction);
          vx = vRebound[0];
          vy = vRebound[1];
          vz = vRebound[2];

          if (Math.abs(vz) < 0.25 || bounceCount > 5) {
            isAirborne = false;
            vz = 0.0;
          }
        }
      } else {
        const terrain = lidar.evaluateTerrain ? lidar.evaluateTerrain(x, y) : { elevationMeters: 0, normal: [0, 0, 1], slopeDeg: 0 };
        const [nx, ny, nz] = terrain.normal;

        const gRollX = G * nx * nz;
        const gRollY = G * ny * nz;

        const stimp = env.greenStimpRating || 11.5;
        const rollFrictionCoeff = 0.165 / (stimp / 10.0);
        const speed = Math.hypot(vx, vy);

        if (speed < 0.03) {
          break;
        }

        const frictionAx = -(vx / speed) * rollFrictionCoeff * G;
        const frictionAy = -(vy / speed) * rollFrictionCoeff * G;

        vx += (gRollX + frictionAx) * dt;
        vy += (gRollY + frictionAy) * dt;
        x += vx * dt;
        y += vy * dt;
        z = terrain.elevationMeters;
      }

      t += dt;
    }

    const totalDistance = Math.hypot(x, y);
    const finalPoint = { t, x, y, z, vx, vy, vz };

    const rawHash = telemetry.provenance?.rawPayloadHashSha256 || createHash('sha256').update(JSON.stringify(telemetry)).digest('hex');
    const tileHash = lidar.tileSealSha256 || createHash('sha256').update('default_tile').digest('hex');

    const ledgerProofSha256 = createHash('sha256')
      .update(rawHash)
      .update(tileHash)
      .update(`${totalDistance.toFixed(3)}_${carryDistance.toFixed(3)}_${t.toFixed(3)}`)
      .digest('hex');

    return {
      carryDistanceMeters: Number(carryDistance.toFixed(2)),
      totalDistanceMeters: Number(totalDistance.toFixed(2)),
      offlineMeters: Number(x.toFixed(2)),
      flightTimeSec: Number(t.toFixed(2)),
      apexHeightMeters: Number((apex - ground0).toFixed(2)),
      impactLanding: landingData,
      finalRestingPoint: finalPoint,
      bounces: bounceCount,
      ledgerProofSha256
    };
  }

  static getDerivatives(state, wx, wy, wz, env) {
    const [x, y, z, vx, vy, vz] = state;
    const [wx_wind, wy_wind, wz_wind] = env.windVelocityMps || [0, 0, 0];

    const vRelX = vx - wx_wind;
    const vRelY = vy - wy_wind;
    const vRelZ = vz - wz_wind;
    const vRel = Math.sqrt(vRelX * vRelX + vRelY * vRelY + vRelZ * vRelZ);

    if (vRel < 1e-4) {
      return [vx, vy, vz, 0, 0, -G];
    }

    const spinMagnitude = Math.sqrt(wx * wx + wy * wy + wz * wz);
    const spinParam = (BALL_RADIUS * spinMagnitude) / vRel;
    
    const Cd = 0.22 + 0.20 / (1.0 + Math.exp((vRel - 40.0) / 4.0));
    const Cl = Math.min(0.38, 1.2 * spinParam);

    const rho = env.airDensityKgM3 || 1.225;
    const dragFactor = 0.5 * rho * BALL_AREA * Cd * vRel;
    const liftFactor = 0.5 * rho * BALL_AREA * Cl * vRel;

    const Fd_x = -dragFactor * vRelX;
    const Fd_y = -dragFactor * vRelY;
    const Fd_z = -dragFactor * vRelZ;

    const wCrossV_x = wy * vRelZ - wz * vRelY;
    const wCrossV_y = wz * vRelX - wx * vRelZ;
    const wCrossV_z = wx * vRelY - wy * vRelX;
    const wCrossV_mag = Math.hypot(wCrossV_x, wCrossV_y, wCrossV_z) || 1.0;

    const Fl_x = liftFactor * (wCrossV_x / wCrossV_mag);
    const Fl_y = liftFactor * (wCrossV_y / wCrossV_mag);
    const Fl_z = liftFactor * (wCrossV_z / wCrossV_mag);

    const ax = (Fd_x + Fl_x) / BALL_MASS;
    const ay = (Fd_y + Fl_y) / BALL_MASS;
    const az = -G + (Fd_z + Fl_z) / BALL_MASS;

    return [vx, vy, vz, ax, ay, az];
  }

  static rk4Step(y, wx, wy, wz, env, dt) {
    const k1 = this.getDerivatives(y, wx, wy, wz, env);
    
    const y_k2 = y.map((val, i) => val + 0.5 * dt * k1[i]);
    const k2 = this.getDerivatives(y_k2, wx, wy, wz, env);

    const y_k3 = y.map((val, i) => val + 0.5 * dt * k2[i]);
    const k3 = this.getDerivatives(y_k3, wx, wy, wz, env);

    const y_k4 = y.map((val, i) => val + dt * k3[i]);
    const k4 = this.getDerivatives(y_k4, wx, wy, wz, env);

    return y.map((val, i) => val + (dt / 6.0) * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]));
  }
}
