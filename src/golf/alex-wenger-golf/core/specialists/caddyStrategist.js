/**
 * Alex Wenger Golf Platform - Caddy Specialist (Course Strategist)
 *
 * "Hi, I’m Caddy — Alex Wenger’s Course Strategist. ⛳"
 *
 * Handles on-course management, target selection, slope/wind yardage math, and risk-reward evaluation.
 *
 * @module alex-wenger-golf/core/specialists/caddyStrategist
 */

import { SPECIALIST_DISCOVERY_MATRIX, SPECIALIST_IDS } from './specialistRegistry.js';

export const CADDY_MANIFEST = SPECIALIST_DISCOVERY_MATRIX[SPECIALIST_IDS.CADDY];

/**
 * Calculate slope & wind adjusted plays-like yardage.
 * @param {object} params
 * @returns {{raw_yards: number, plays_like_yards: number, wind_adjustment: number, elevation_adjustment: number, recommendation: string}}
 */
export function calculatePlaysLikeYardage({
  rawYards = 150,
  elevationChangeFeet = 0, // positive = uphill, negative = downhill
  windSpeedMph = 0,
  windDirection = 'INTO', // 'INTO' | 'DOWN' | 'CROSS'
} = {}) {
  // Elevation rule of thumb: +/- 1 yard per 3 feet elevation
  const elevationAdj = Math.round(elevationChangeFeet / 3);

  // Wind rule of thumb:Into wind = +1% per mph; Down wind = -0.5% per mph
  let windAdj = 0;
  if (windDirection === 'INTO') {
    windAdj = Math.round(rawYards * (windSpeedMph * 0.01));
  } else if (windDirection === 'DOWN') {
    windAdj = Math.round(-rawYards * (windSpeedMph * 0.005));
  } else if (windDirection === 'CROSS') {
    windAdj = 0; // Crosswind affects lateral target line, not distance
  }

  const playsLike = Math.max(10, Math.round(rawYards + elevationAdj + windAdj));

  let advice = '';
  if (playsLike > rawYards + 10) {
    advice = `Playing ${playsLike} yards — take 1 to 2 extra clubs and commit to a smooth finish into the breeze.`;
  } else if (playsLike < rawYards - 10) {
    advice = `Playing ${playsLike} yards — take 1 less club, tee it down slightly, and smooth it out.`;
  } else {
    advice = `Playing true to yardage at ${playsLike} yards — pick your landing target and trust your stock swing.`;
  }

  return {
    raw_yards: Number(rawYards),
    plays_like_yards: playsLike,
    wind_adjustment: windAdj,
    elevation_adjustment: elevationAdj,
    recommendation: advice,
  };
}

/**
 * Caddy Strategic Decision Engine.
 * @param {object} params
 * @returns {object} Caddy strategic advice package
 */
export function generateCaddyStrategy({
  holeNumber = 1,
  rawYards = 408,
  windSpeedMph = 15,
  windDirection = 'INTO',
  elevationFeet = 15,
  lieType = 'FAIRWAY',
  targetPinPosition = 'CENTER',
} = {}) {
  const yardageMath = calculatePlaysLikeYardage({
    rawYards,
    elevationChangeFeet: elevationFeet,
    windSpeedMph,
    windDirection,
  });

  const strategicAdvice = `${CADDY_MANIFEST.greeting}\n\nWe are looking at Hole #${holeNumber}, raw distance ${rawYards} yards. With a ${windSpeedMph} mph wind ${windDirection.toLowerCase()} and a ${elevationFeet} ft uphill rise, it is playing like **${yardageMath.plays_like_yards} yards**.\n\n${yardageMath.recommendation}`;

  return {
    specialist: CADDY_MANIFEST.name,
    specialist_id: CADDY_MANIFEST.id,
    greeting: CADDY_MANIFEST.greeting,
    hole_number: holeNumber,
    plays_like_yards: yardageMath.plays_like_yards,
    strategy_advice: strategicAdvice,
    discovery_schema: CADDY_MANIFEST.discovery_schema,
    timestamp: new Date().toISOString(),
  };
}
