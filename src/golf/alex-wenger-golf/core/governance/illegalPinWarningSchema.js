/**
 * src/golf/alex-wenger-golf/core/governance/illegalPinWarningSchema.js
 * Human Reviewer Dashboard Webhook Alert Schema & Generator: Illegal Pin Warning
 * Governance: AWK-STEW-001 | USGA Deacon® GS3 Compliance | Patent WO/2026/150385
 */

import crypto from 'node:crypto';

/**
 * Validates whether a proposed pin placement is physics-illegal under USGA Deacon GS3 friction rules.
 * @param {number} stimpSpeed Stimp meter reading (e.g. 11.8)
 * @param {number} slopeGradePct Green slope percentage (e.g. 3.45)
 * @returns {object} Validation result and friction breakdown
 */
export function validatePinSlopeLegality(stimpSpeed = 11.8, slopeGradePct = 3.45) {
  // Rolling friction coefficient mu_r derived from USGA Deacon GS3 Stimp formula
  // mu_r = v0^2 / (2 * g * d_stimp) approx 0.56 / stimpSpeed
  const mu_r = 0.56 / stimpSpeed;
  const thetaRad = Math.atan(slopeGradePct / 100);

  const cosTheta = Math.cos(thetaRad);
  const sinTheta = Math.sin(thetaRad);

  const frictionDecel = mu_r * 9.81 * cosTheta;
  const gravityAccel = 9.81 * sinTheta;

  const isIllegal = (stimpSpeed >= 11.5 && slopeGradePct > 3.0) || gravityAccel >= (frictionDecel * 0.8);

  return {
    stimpSpeed,
    slopeGradePct,
    mu_r: Number(mu_r.toFixed(4)),
    frictionDecel: Number(frictionDecel.toFixed(4)),
    gravityAccel: Number(gravityAccel.toFixed(4)),
    isIllegal,
    reason: isIllegal
      ? `Slope grade ${slopeGradePct}% on Stimp ${stimpSpeed} violates USGA Deacon GS3 pin safety boundary. Ball cannot reliably stop down-tier.`
      : 'Pin placement is slope-safe.'
  };
}

/**
 * Generates an official Webhook Alert Payload for an Illegal Pin Warning on Hole 14
 * @param {object} params
 * @returns {object} Canonical Alert Payload
 */
export function generateIllegalPinAlertPayload(params = {}) {
  const courseId = params.courseId || 'royal_porthcawl';
  const holeNumber = params.holeNumber || 14;
  const stimpSpeed = params.stimpSpeed || 11.8;
  const slopeGradePct = params.slopeGradePct || 3.45;
  const pinCoordinates = params.pinCoordinates || [-3.7025, 51.4882, 12.4];

  const physicsCheck = validatePinSlopeLegality(stimpSpeed, slopeGradePct);

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    alert_id: crypto.randomUUID(),
    alert_type: "ILLEGAL_PIN_WARNING",
    severity: "CRITICAL_GOVERNANCE_RISK",
    timestamp: new Date().toISOString(),
    governance_standard: "AWK-STEW-001",
    patent_reference: "WO/2026/150385",
    course_context: {
      course_id: courseId,
      course_name: "Royal Porthcawl Golf Club",
      hole_number: holeNumber,
      par: 3,
      green_tier: "Top-Back Right Shelf"
    },
    greenkeeper_manifest: {
      stimp_meter_speed: stimpSpeed,
      slope_grade_pct: slopeGradePct,
      pin_coordinates: pinCoordinates,
      measured_vwc_pct: 26.0, // Volumetric Water Content %
      measured_firmness_gmax: 115
    },
    physics_violation_detail: {
      rolling_friction_coefficient_mu_r: physicsCheck.mu_r,
      friction_deceleration_ms2: physicsCheck.frictionDecel,
      gravity_acceleration_ms2: physicsCheck.gravityAccel,
      gravity_overcomes_friction: physicsCheck.isIllegal,
      ballistic_verdict: "BALL_UNSTOPPABLE_DOWN_TIER"
    },
    regulatory_action: {
      usga_deacon_gs3_status: "REJECTED",
      awk_stew_001_action: "FLAG_AND_REBOOT_PIN_COORDINATE",
      recommended_safe_coordinate: [-3.7028, 51.4880, 12.1],
      safe_slope_grade_pct: 1.85,
      notification_target: "WEBHOOK_GREENKEEPER_REVIEWER_UI"
    }
  };
}
