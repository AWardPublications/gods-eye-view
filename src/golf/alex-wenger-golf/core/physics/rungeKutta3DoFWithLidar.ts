import { MicroElevationLidarEngine, computeLidarReboundVector } from '../spatial/microElevationLidarEngine.js';
import { createHash } from 'node:crypto';

export interface ValidatedLaunchTelemetry {
  kinematics: {
    ballSpeedMph: number;
    launchAngleDeg: number;
    launchAzimuthDeg: number;
    totalSpinRpm: number;
    spinAxisDeg: number;
    clubHeadSpeedMph?: number;
  };
  provenance: {
    rawPayloadHashSha256: string;
    device: string;
  };
}

export interface EnvironmentalConditions {
  airDensityKgM3: number;    // Standard sea level ~1.225 kg/m^3
  windVelocityMps: [number, number, number]; // [Wx, Wy, Wz] (Easting, Northing, Vertical)
  greenStimpRating: number;  // Typical 10.0 - 12.5
}

export interface TrajectoryPoint {
  t: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface SimulationResult {
  carryDistanceMeters: number;
  totalDistanceMeters: number;
  offlineMeters: number;
  flightTimeSec: number;
  apexHeightMeters: number;
  impactLanding: {
    point: TrajectoryPoint;
    surfaceNormal: [number, number, number];
    slopeDeg: number;
  };
  finalRestingPoint: TrajectoryPoint;
  bounces: number;
  ledgerProofSha256: string;
}

// Physical Constants
const G = 9.80665;          // m/s^2
const BALL_MASS = 0.04593;   // kg (USGA regulation: 1.620 oz)
const BALL_RADIUS = 0.02135; // m (USGA regulation: 1.680 in)
const BALL_AREA = Math.PI * BALL_RADIUS * BALL_RADIUS;

export class TrajectoryOrchestrator {
  /**
   * Main execution loop: Pipes sealed launch monitor vectors into the RK4 solver
   * and terminates flight/rollout using micro-elevation LiDAR profiles.
   */
  public static simulateShot(
    telemetry: ValidatedLaunchTelemetry,
    lidar: MicroElevationLidarEngine,
    env: EnvironmentalConditions
  ): SimulationResult {
    // 1. Initial State Vector Generation (Kinematic Transform)
    const k = telemetry.kinematics;
    const v0_mps = k.ballSpeedMph * 0.44704;
    const thetaRad = (k.launchAngleDeg * Math.PI) / 180.0;
    const psiRad = (k.launchAzimuthDeg * Math.PI) / 180.0;

    // Resolve Cartesian velocity: X = Easting/Lateral, Y = Northing/Down-range, Z = Altitude
    let vx = v0_mps * Math.cos(thetaRad) * Math.sin(psiRad);
    let vy = v0_mps * Math.cos(thetaRad) * Math.cos(psiRad);
    let vz = v0_mps * Math.sin(thetaRad);

    // Spin Vector Resolution (rad/s)
    const totalSpinRadS = (k.totalSpinRpm * 2 * Math.PI) / 60.0;
    const spinAxisRad = (k.spinAxisDeg * Math.PI) / 180.0;
    
    // Decompose backspin and sidespin around flight heading
    let wx = totalSpinRadS * Math.cos(spinAxisRad);
    let wy = 0.0;
    let wz = totalSpinRadS * Math.sin(spinAxisRad);

    // Initial position on course
    let x = 0.0;
    let y = 0.0;
    let ground0 = lidar.evaluateTerrain(x, y).elevationMeters;
    let z = ground0 + 0.01; // Tee height clearance

    const dt = 0.005; // 5ms fixed-step integration
    let t = 0.0;
    let apex = z;
    let isAirborne = true;
    let bounceCount = 0;
    let carryRecorded = false;
    let carryDistance = 0;
    let landingData = {
      point: { t: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 },
      surfaceNormal: [0, 0, 1] as [number, number, number],
      slopeDeg: 0
    };

    // 2. Numerical Integration Loop (Flight + Bounce/Rollout)
    while (t < 30.0) { // Safety ceiling of 30 seconds
      if (isAirborne) {
        // RK4 Step for Airborne Ballistics
        const state = [x, y, z, vx, vy, vz];
        const nextState = this.rk4Step(state, wx, wy, wz, env, dt);
        
        x = nextState[0];
        y = nextState[1];
        z = nextState[2];
        vx = nextState[3];
        vy = nextState[4];
        vz = nextState[5];

        if (z > apex) apex = z;

        // Spin Decay in Air (Empirical aerodynamic spin decay rate ~0.01/s)
        wx *= (1 - 0.01 * dt);
        wz *= (1 - 0.01 * dt);

        // Ground Intersection Test via LiDAR Elevation Engine
        const terrain = lidar.evaluateTerrain(x, y);
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

          // Dynamic Restitution from Green Firmness/Stimp
          const restitution = Math.max(0.20, 0.48 - (env.greenStimpRating * 0.015));
          const friction = 0.28 + (env.greenStimpRating * 0.01);

          // Specular Vector Rebound using LiDAR continuous normal vector
          const vRebound = computeLidarReboundVector([vx, vy, vz], terrain.normal, restitution, friction);
          vx = vRebound[0];
          vy = vRebound[1];
          vz = vRebound[2];

          // Check for transition from bounce to surface roll
          if (Math.abs(vz) < 0.25 || bounceCount > 5) {
            isAirborne = false;
            vz = 0.0;
          }
        }
      } else {
        // Surface Roll-out along LiDAR slope
        const terrain = lidar.evaluateTerrain(x, y);
        const [nx, ny, nz] = terrain.normal;

        // Gravity acceleration along slope plane
        const gRollX = G * nx * nz;
        const gRollY = G * ny * nz;

        // Stimp-based rolling friction coefficient
        const rollFrictionCoeff = 0.165 / (env.greenStimpRating / 10.0);
        const speed = Math.hypot(vx, vy);

        if (speed < 0.03) {
          // Ball comes to complete rest
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
    const finalPoint: TrajectoryPoint = { t, x, y, z, vx, vy, vz };

    // 3. Cryptographic Provenance Ledger Seal
    const ledgerProofSha256 = createHash('sha256')
      .update(telemetry.provenance.rawPayloadHashSha256)
      .update(lidar.tileSealSha256)
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

  /**
   * Evaluates standard derivatives for 3-DoF Runge-Kutta integration:
   * dx/dt = v
   * dv/dt = Gravity + Drag + Magnus Force
   */
  private static getDerivatives(
    state: number[],
    wx: number,
    wy: number,
    wz: number,
    env: EnvironmentalConditions
  ): number[] {
    const [x, y, z, vx, vy, vz] = state;
    const [wx_wind, wy_wind, wz_wind] = env.windVelocityMps;

    // Relative apparent velocity (accounting for ambient wind field)
    const vRelX = vx - wx_wind;
    const vRelY = vy - wy_wind;
    const vRelZ = vz - wz_wind;
    const vRel = Math.sqrt(vRelX * vRelX + vRelY * vRelY + vRelZ * vRelZ);

    if (vRel < 1e-4) {
      return [vx, vy, vz, 0, 0, -G];
    }

    // Aerodynamic Coefficients (Reynolds/Spin Parameter Regimes)
    const spinMagnitude = Math.sqrt(wx * wx + wy * wy + wz * wz);
    const spinParam = (BALL_RADIUS * spinMagnitude) / vRel;
    
    const Cd = 0.22 + 0.20 / (1.0 + Math.exp((vRel - 40.0) / 4.0)); // Drag coefficient transition
    const Cl = Math.min(0.38, 1.2 * spinParam);                    // Magnus lift coefficient

    const dragFactor = 0.5 * env.airDensityKgM3 * BALL_AREA * Cd * vRel;
    const liftFactor = 0.5 * env.airDensityKgM3 * BALL_AREA * Cl * vRel;

    // Drag Force Vector
    const Fd_x = -dragFactor * vRelX;
    const Fd_y = -dragFactor * vRelY;
    const Fd_z = -dragFactor * vRelZ;

    // Magnus Lift Vector: F_L = liftFactor * (w x vRel) / |w|
    const wCrossV_x = wy * vRelZ - wz * vRelY;
    const wCrossV_y = wz * vRelX - wx * vRelZ;
    const wCrossV_z = wx * vRelY - wy * vRelX;
    const wCrossV_mag = Math.hypot(wCrossV_x, wCrossV_y, wCrossV_z) || 1.0;

    const Fl_x = liftFactor * (wCrossV_x / wCrossV_mag);
    const Fl_y = liftFactor * (wCrossV_y / wCrossV_mag);
    const Fl_z = liftFactor * (wCrossV_z / wCrossV_mag);

    // Net accelerations
    const ax = (Fd_x + Fl_x) / BALL_MASS;
    const ay = (Fd_y + Fl_y) / BALL_MASS;
    const az = -G + (Fd_z + Fl_z) / BALL_MASS;

    return [vx, vy, vz, ax, ay, az];
  }

  /**
   * Classical 4th Order Runge-Kutta Step (O(dt^4) local truncation accuracy)
   */
  private static rk4Step(
    y: number[],
    wx: number,
    wy: number,
    wz: number,
    env: EnvironmentalConditions,
    dt: number
  ): number[] {
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
