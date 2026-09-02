import { createHash } from 'node:crypto';

export interface LidarGridMetadata {
  /** Geographic or projected CRS identifier (e.g., EPSG:2056 for Swiss LV95, EPSG:6349 for US) */
  crs: string;
  /** Real-world spatial resolution per grid cell in meters (e.g., 0.5 for swisstopo, 1.0 for USGS 3DEP) */
  resolutionMeters: number;
  /** Origin coordinate at top-left corner (x: Easting, y: Northing) */
  originX: number;
  originY: number;
  /** Grid dimensions */
  width: number;
  height: number;
  /** Identifier or tile hash */
  tileId: string;
}

export interface TerrainPointEvaluation {
  /** Continuous interpolated elevation (z) in meters */
  elevationMeters: number;
  /** Normalized 3D unit surface normal vector [nx, ny, nz] */
  normal: [number, number, number];
  /** Terrain slope magnitude in degrees [0.0° to 90.0°] */
  slopeDeg: number;
  /** Aspect/fall-line azimuth in degrees [0.0° to 360.0°, 0° = True North] */
  aspectDeg: number;
  /** Terrain curvature/roughness factor */
  localCurvature: number;
}

export class MicroElevationLidarEngine {
  private readonly heights: Float32Array;
  private readonly meta: LidarGridMetadata;
  public readonly tileSealSha256: string;

  /**
   * @param elevationBuffer Single-channel 32-bit float raster data (row-major order)
   * @param metadata Spatial referencing and dimension metadata
   */
  constructor(elevationBuffer: Float32Array, metadata: LidarGridMetadata) {
    if (elevationBuffer.length !== metadata.width * metadata.height) {
      throw new Error(
        `Buffer length mismatch: expected ${metadata.width * metadata.height} cells, received ${elevationBuffer.length}`
      );
    }
    this.heights = elevationBuffer;
    this.meta = metadata;

    // DaVinciA+ Provenance Sealing of raw raster tile
    this.tileSealSha256 = createHash('sha256')
      .update(Buffer.from(elevationBuffer.buffer, elevationBuffer.byteOffset, elevationBuffer.byteLength))
      .update(metadata.tileId)
      .digest('hex');
  }

  /**
   * Evaluates elevation, exact gradient, and unit normal vector at continuous coordinates (x, y).
   */
  public evaluateTerrain(x: number, y: number): TerrainPointEvaluation {
    const { originX, originY, resolutionMeters, width, height } = this.meta;

    // Convert world coordinates to fractional grid indices
    // Note: Grid y typically traverses North-to-South (top-to-bottom)
    const gx = (x - originX) / resolutionMeters;
    const gy = (originY - y) / resolutionMeters;

    // Clamp coordinates safely within bicubic neighborhood bounds [1, width - 3]
    const clampedGx = Math.max(1, Math.min(width - 2.001, gx));
    const clampedGy = Math.max(1, Math.min(height - 2.001, gy));

    const ix = Math.floor(clampedGx);
    const iy = Math.floor(clampedGy);

    const tx = clampedGx - ix; // [0, 1)
    const ty = clampedGy - iy; // [0, 1)

    // Extract 4x4 control grid around (ix, iy)
    const p: number[][] = [];
    for (let row = -1; row <= 2; row++) {
      const pRow: number[] = [];
      const currY = Math.max(0, Math.min(height - 1, iy + row));
      const rowOffset = currY * width;
      for (let col = -1; col <= 2; col++) {
        const currX = Math.max(0, Math.min(width - 1, ix + col));
        pRow.push(this.heights[rowOffset + currX]);
      }
      p.push(pRow);
    }

    // Evaluate bicubic surface and directional partial derivatives
    const elevationMeters = this.bicubicInterpolate(p, tx, ty);
    const dZ_dgx = this.bicubicDerivativeX(p, tx, ty);
    const dZ_dgy = this.bicubicDerivativeY(p, tx, ty);

    // Convert grid-space partial derivatives to world-space gradients
    // dx = dgx * resolution, dy = -dgy * resolution
    const dz_dx = dZ_dgx / resolutionMeters;
    const dz_dy = -dZ_dgy / resolutionMeters;

    // Analytical unit surface normal vector: n = [-dz/dx, -dz/dy, 1] / sqrt((dz/dx)^2 + (dz/dy)^2 + 1)
    const denom = Math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy + 1.0);
    const normal: [number, number, number] = [
      -dz_dx / denom,
      -dz_dy / denom,
      1.0 / denom
    ];

    // Slope calculation: angle between normal vector and up-vector [0, 0, 1]
    const slopeRad = Math.acos(normal[2]);
    const slopeDeg = (slopeRad * 180.0) / Math.PI;

    // Aspect calculation: direction of maximum downward slope (fall-line)
    // 0 deg = North, 90 deg = East, 180 deg = South, 270 deg = West
    let aspectDeg = (Math.atan2(-dz_dx, dz_dy) * 180.0) / Math.PI;
    if (aspectDeg < 0) aspectDeg += 360.0;

    const localCurvature = Math.sqrt(dz_dx * dz_dx + dz_dy * dz_dy);

    return {
      elevationMeters,
      normal,
      slopeDeg,
      aspectDeg,
      localCurvature
    };
  }

  /**
   * Catmull-Rom Cubic Spline evaluation: f(t) = a*t^3 + b*t^2 + c*t + d
   */
  private catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
    const b = p0 - 2.5 * p1 + 2.0 * p2 - 0.5 * p3;
    const c = -0.5 * p0 + 0.5 * p2;
    const d = p1;
    return a * t * t * t + b * t * t + c * t + d;
  }

  /**
   * First derivative of Catmull-Rom Spline: f'(t) = 3a*t^2 + 2b*t + c
   */
  private catmullRomDerivative(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const a = -0.5 * p0 + 1.5 * p1 - 1.5 * p2 + 0.5 * p3;
    const b = p0 - 2.5 * p1 + 2.0 * p2 - 0.5 * p3;
    const c = -0.5 * p0 + 0.5 * p2;
    return 3.0 * a * t * t + 2.0 * b * t + c;
  }

  /**
   * 2D Bicubic interpolation across the 4x4 matrix
   */
  private bicubicInterpolate(p: number[][], tx: number, ty: number): number {
    const colResults = [
      this.catmullRom(p[0][0], p[0][1], p[0][2], p[0][3], tx),
      this.catmullRom(p[1][0], p[1][1], p[1][2], p[1][3], tx),
      this.catmullRom(p[2][0], p[2][1], p[2][2], p[2][3], tx),
      this.catmullRom(p[3][0], p[3][1], p[3][2], p[3][3], tx)
    ];
    return this.catmullRom(colResults[0], colResults[1], colResults[2], colResults[3], ty);
  }

  /**
   * Partial derivative with respect to grid X (dZ / d_gx)
   */
  private bicubicDerivativeX(p: number[][], tx: number, ty: number): number {
    const colDerivatives = [
      this.catmullRomDerivative(p[0][0], p[0][1], p[0][2], p[0][3], tx),
      this.catmullRomDerivative(p[1][0], p[1][1], p[1][2], p[1][3], tx),
      this.catmullRomDerivative(p[2][0], p[2][1], p[2][2], p[2][3], tx),
      this.catmullRomDerivative(p[3][0], p[3][1], p[3][2], p[3][3], tx)
    ];
    return this.catmullRom(colDerivatives[0], colDerivatives[1], colDerivatives[2], colDerivatives[3], ty);
  }

  /**
   * Partial derivative with respect to grid Y (dZ / d_gy)
   */
  private bicubicDerivativeY(p: number[][], tx: number, ty: number): number {
    const colResults = [
      this.catmullRom(p[0][0], p[0][1], p[0][2], p[0][3], tx),
      this.catmullRom(p[1][0], p[1][1], p[1][2], p[1][3], tx),
      this.catmullRom(p[2][0], p[2][1], p[2][2], p[2][3], tx),
      this.catmullRom(p[3][0], p[3][1], p[3][2], p[3][3], tx)
    ];
    return this.catmullRomDerivative(colResults[0], colResults[1], colResults[2], colResults[3], ty);
  }
}

export function computeLidarReboundVector(
  vIncident: [number, number, number],
  normal: [number, number, number],
  restitution: number = 0.42,
  friction: number = 0.35
): [number, number, number] {
  // Dot product (v . n)
  const vDotN = vIncident[0] * normal[0] + vIncident[1] * normal[1] + vIncident[2] * normal[2];

  // Normal velocity component: v_n = (v . n) * n
  const vn: [number, number, number] = [
    vDotN * normal[0],
    vDotN * normal[1],
    vDotN * normal[2]
  ];

  // Tangential velocity component: v_t = v - v_n
  const vt: [number, number, number] = [
    vIncident[0] - vn[0],
    vIncident[1] - vn[1],
    vIncident[2] - vn[2]
  ];

  // Rebound velocity: v_rebound = (1 - friction) * v_t - restitution * v_n
  return [
    (1 - friction) * vt[0] - restitution * vn[0],
    (1 - friction) * vt[1] - restitution * vn[1],
    (1 - friction) * vt[2] - restitution * vn[2]
  ];
}
