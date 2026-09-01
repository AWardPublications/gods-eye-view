/**
 * DaVinciA⁺ / Alex Wenger² - Golf Intelligence Engine
 * Mobile Spotter Coordinate, Lie Detection, and Event Serialization Module
 *
 * Implements WO/2026/150385 Golf Governance & Spotter Data Integrity.
 *
 * @module golf/spotterEngine
 */

/**
 * Standard Lie Classifications in DaVinciA⁺ Governance Engine.
 */
export const LIE_TYPES = Object.freeze({
  TEE: 'TEE',
  FAIRWAY: 'FAIRWAY',
  FIRST_CUT: 'FIRST_CUT',
  ROUGH: 'ROUGH',
  DEEP_ROUGH: 'DEEP_ROUGH',
  FAIRWAY_BUNKER: 'FAIRWAY_BUNKER',
  GREENSIDE_BUNKER: 'GREENSIDE_BUNKER',
  FRINGE: 'FRINGE',
  GREEN: 'GREEN',
  PENALTY_AREA: 'PENALTY_AREA',
  OUT_OF_BOUNDS: 'OUT_OF_BOUNDS',
});

/**
 * Human-readable lie labels.
 */
export const LIE_LABELS = Object.freeze({
  [LIE_TYPES.TEE]: 'Tee Box',
  [LIE_TYPES.FAIRWAY]: 'Fairway',
  [LIE_TYPES.FIRST_CUT]: 'First Cut',
  [LIE_TYPES.ROUGH]: 'Primary Rough',
  [LIE_TYPES.DEEP_ROUGH]: 'Deep Rough',
  [LIE_TYPES.FAIRWAY_BUNKER]: 'Fairway Bunker',
  [LIE_TYPES.GREENSIDE_BUNKER]: 'Greenside Bunker',
  [LIE_TYPES.FRINGE]: 'Fringe',
  [LIE_TYPES.GREEN]: 'Putting Green',
  [LIE_TYPES.PENALTY_AREA]: 'Penalty Area',
  [LIE_TYPES.OUT_OF_BOUNDS]: 'Out of Bounds',
});

/**
 * Lie color coding tokens for HUD and 2D canvas spotter.
 */
export const LIE_COLORS = Object.freeze({
  [LIE_TYPES.TEE]: '#34d399',
  [LIE_TYPES.FAIRWAY]: '#10b981',
  [LIE_TYPES.FIRST_CUT]: '#84cc16',
  [LIE_TYPES.ROUGH]: '#eab308',
  [LIE_TYPES.DEEP_ROUGH]: '#d97706',
  [LIE_TYPES.FAIRWAY_BUNKER]: '#f59e0b',
  [LIE_TYPES.GREENSIDE_BUNKER]: '#fcd34d',
  [LIE_TYPES.FRINGE]: '#06b6d4',
  [LIE_TYPES.GREEN]: '#3b82f6',
  [LIE_TYPES.PENALTY_AREA]: '#ef4444',
  [LIE_TYPES.OUT_OF_BOUNDS]: '#991b1b',
});

/**
 * Standard club selection registry.
 */
export const CLUBS = Object.freeze([
  '1W', '3W', '5W', '7W',
  '2I', '3I', '4I', '5I', '6I', '7I', '8I', '9I',
  'PW', 'GW', 'SW', 'LW',
  'PUTTER',
]);

/**
 * Calculate Euclidean distance in yards based on 2D coordinates and scale factor.
 * @param {number} x1 - Start X (0.0 to 1.0 or canvas px)
 * @param {number} y1 - Start Y (0.0 to 1.0 or canvas px)
 * @param {number} x2 - End X
 * @param {number} y2 - End Y
 * @param {number} scaleYards - Total yardage representation of canvas height/length
 * @returns {number} Distance in yards (rounded to 1 decimal place)
 */
export function calculateDistanceYards(x1, y1, x2, y2, scaleYards = 450) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const normalizedDistance = Math.hypot(dx, dy);
  const yards = normalizedDistance * scaleYards;
  return Math.round(yards * 10) / 10;
}

/**
 * Detect lie type automatically from normalized canvas coordinates (0.0 to 1.0).
 * Default geometry assumes a standard hole layout:
 * - y > 0.85: Tee Box
 * - y < 0.20: Green complex
 * - 0.20 <= y <= 0.85: Fairway & rough corridors
 *
 * @param {number} nx - Normalized X coordinate [0.0..1.0]
 * @param {number} ny - Normalized Y coordinate [0.0..1.0]
 * @param {object} [customZones] - Optional custom zone polygon/rect registry
 * @returns {string} One of LIE_TYPES
 */
export function detectLieFromCoordinates(nx, ny, customZones = null) {
  const x = Math.max(0, Math.min(1, Number(nx) || 0));
  const y = Math.max(0, Math.min(1, Number(ny) || 0));

  if (customZones && Array.isArray(customZones.zones)) {
    for (const zone of customZones.zones) {
      if (
        x >= zone.xMin && x <= zone.xMax &&
        y >= zone.yMin && y <= zone.yMax
      ) {
        return zone.type;
      }
    }
  }

  // Out of Bounds check (outer margins)
  if (x < 0.05 || x > 0.95 || y < 0.02 || y > 0.98) {
    return LIE_TYPES.OUT_OF_BOUNDS;
  }

  // Water / Penalty Area (preset water hazard polygon near mid-right)
  if (x > 0.68 && x < 0.92 && y > 0.35 && y < 0.60) {
    return LIE_TYPES.PENALTY_AREA;
  }

  // Greenside Bunker (left/right of green complex)
  if (y < 0.22 && (x > 0.25 && x < 0.36 || x > 0.64 && x < 0.75)) {
    return LIE_TYPES.GREENSIDE_BUNKER;
  }

  // Fairway Bunker (mid fairway right)
  if (y >= 0.45 && y <= 0.65 && x >= 0.58 && x <= 0.66) {
    return LIE_TYPES.FAIRWAY_BUNKER;
  }

  // Green Complex
  if (y <= 0.18 && x >= 0.36 && x <= 0.64) {
    return LIE_TYPES.GREEN;
  }

  // Fringe (ring around green)
  if (y <= 0.23 && x >= 0.30 && x <= 0.70) {
    return LIE_TYPES.FRINGE;
  }

  // Tee Box
  if (y >= 0.86 && x >= 0.35 && x <= 0.65) {
    return LIE_TYPES.TEE;
  }

  // Fairway Corridor (central dynamic corridor)
  const fairwayWidth = 0.22;
  const fairwayCenterX = 0.50;
  if (y >= 0.18 && y <= 0.86 && Math.abs(x - fairwayCenterX) <= fairwayWidth / 2) {
    return LIE_TYPES.FAIRWAY;
  }

  // First Cut Rough (slightly outside fairway corridor)
  if (y >= 0.18 && y <= 0.86 && Math.abs(x - fairwayCenterX) <= (fairwayWidth / 2) + 0.10) {
    return LIE_TYPES.FIRST_CUT;
  }

  // Deep Rough (outer margins)
  if (Math.abs(x - fairwayCenterX) > 0.32) {
    return LIE_TYPES.DEEP_ROUGH;
  }

  // Default Primary Rough
  return LIE_TYPES.ROUGH;
}

/**
 * Validate a shot event object before persistence.
 * @param {object} event - Shot event candidate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateShotEvent(event) {
  const errors = [];
  if (!event || typeof event !== 'object') {
    return { valid: false, errors: ['Shot event must be an object'] };
  }

  const nx = event.norm_x ?? event.coordinates?.norm_x;
  const ny = event.norm_y ?? event.coordinates?.norm_y;

  if (!event.event_id) errors.push('Missing event_id');
  if (!event.hole_number || event.hole_number < 1 || event.hole_number > 18) {
    errors.push('Hole number must be between 1 and 18');
  }
  if (!event.shot_number || event.shot_number < 1) {
    errors.push('Shot number must be >= 1');
  }
  if (!event.lie_type || !Object.values(LIE_TYPES).includes(event.lie_type)) {
    errors.push(`Invalid lie_type: ${event.lie_type}`);
  }
  if (typeof nx !== 'number' || nx < 0 || nx > 1) {
    errors.push('norm_x must be a number between 0.0 and 1.0');
  }
  if (typeof ny !== 'number' || ny < 0 || ny > 1) {
    errors.push('norm_y must be a number between 0.0 and 1.0');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Factory for creating a canonical DaVinciA⁺ Shot Event record.
 * @param {object} params
 * @returns {object} Standardized event record
 */
export function createShotEvent({
  course_id = 'ballybunion_old',
  course_name = 'Ballybunion Old Course',
  hole_number = 1,
  hole_par = 4,
  hole_handicap = 5,
  hole_total_yards = 408,
  shot_number = 1,
  player_id = 'AW2-ATHLETE-001',
  player_name = 'Alex Wenger',
  norm_x = 0.50,
  norm_y = 0.88,
  prev_norm_x = null,
  prev_norm_y = null,
  lie_type = LIE_TYPES.TEE,
  club = '1W',
  intent = 'Full Swing',
  shot_shape = 'Straight',
  carry_yards = null,
  total_yards = null,
  remaining_to_pin_yards = 408,
  wind_speed_mph = 12,
  wind_direction_deg = 225,
  spotter_id = 'SPOTTER-MOBILE-01',
  notes = '',
  timestamp = null,
} = {}) {
  const now = timestamp || new Date().toISOString();
  const event_id = `SHOT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Calculate shot distance if previous position provided
  let distance_from_prev_yards = 0;
  if (prev_norm_x !== null && prev_norm_y !== null) {
    distance_from_prev_yards = calculateDistanceYards(
      prev_norm_x, prev_norm_y,
      norm_x, norm_y,
      hole_total_yards
    );
  }

  const roundedNx = Math.round(norm_x * 10000) / 10000;
  const roundedNy = Math.round(norm_y * 10000) / 10000;

  const record = {
    event_id,
    schema_version: '2.0.0',
    governance_patent: 'WO/2026/150385',
    timestamp: now,
    course_id,
    course_name,
    hole_number: Number(hole_number),
    hole_par: Number(hole_par),
    hole_handicap: Number(hole_handicap),
    hole_total_yards: Number(hole_total_yards),
    shot_number: Number(shot_number),
    player_id,
    player_name,
    norm_x: roundedNx,
    norm_y: roundedNy,
    coordinates: {
      norm_x: roundedNx,
      norm_y: roundedNy,
      prev_norm_x: prev_norm_x !== null ? Math.round(prev_norm_x * 10000) / 10000 : null,
      prev_norm_y: prev_norm_y !== null ? Math.round(prev_norm_y * 10000) / 10000 : null,
    },
    lie_type,
    lie_label: LIE_LABELS[lie_type] || lie_type,
    club,
    intent,
    shot_shape,
    metrics: {
      distance_from_prev_yards,
      carry_yards: carry_yards !== null ? Number(carry_yards) : distance_from_prev_yards,
      total_yards: total_yards !== null ? Number(total_yards) : distance_from_prev_yards,
      remaining_to_pin_yards: Number(remaining_to_pin_yards),
    },
    environment: {
      wind_speed_mph: Number(wind_speed_mph),
      wind_direction_deg: Number(wind_direction_deg),
    },
    spotter: {
      spotter_id,
      device_ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'NodeJS/Engine',
    },
    notes: String(notes).trim(),
  };

  return record;
}

/**
 * Format a shot event object into a single clean JSONL string line.
 * @param {object} event
 * @returns {string} JSON line
 */
export function formatShotEventJsonl(event) {
  const validation = validateShotEvent(event);
  if (!validation.valid) {
    throw new Error(`Cannot format invalid shot event: ${validation.errors.join(', ')}`);
  }
  return JSON.stringify(event);
}

/**
 * Parse JSONL string text into an array of validated shot event objects.
 * @param {string} jsonlContent
 * @returns {{events: object[], invalidCount: number}}
 */
export function parseShotEventsLedger(jsonlContent) {
  if (typeof jsonlContent !== 'string') return { events: [], invalidCount: 0 };
  const lines = jsonlContent.trim().split(/\r?\n/).filter(Boolean);
  const events = [];
  let invalidCount = 0;

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      if (validateShotEvent(parsed).valid) {
        events.push(parsed);
      } else {
        invalidCount++;
      }
    } catch {
      invalidCount++;
    }
  }

  return { events, invalidCount };
}
