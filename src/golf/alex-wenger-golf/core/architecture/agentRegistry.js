/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Canonical Specialist Agent Registry (v4.6.0)
 * Governance Patent: WO/2026/150385
 *
 * Defines the canonical machine-readable contracts for all 10 Ecosystem Agents:
 * - Master: Alex Wenger (Master Coach & Voice Hub)
 * - Human System: Alieve Wenger, Fitty, Zenner
 * - Mechanics: Swingsy
 * - Equipment System: Tailor Wenger, Sticks
 * - Game System: Caddy, Statty, PUTTSER
 * - Authority Layer: Judge (State 4 Compliance Filter)
 *
 * Mandatory Field: alex_exclusive_responsibility ("What should remain exclusively Alex's responsibility?")
 *
 * @module alex-wenger-golf/core/architecture/agentRegistry
 */

export const CANONICAL_AGENT_REGISTRY = {
  alex_wenger: {
    agent_id: "alex_wenger",
    display_name: "Alex Wenger",
    system: "MASTER_CORE",
    domain: "Master Golf Coaching, Direct Voice Output, Final Interpretation & User Synthesis",
    purpose: "Holds ultimate coaching authority, conversational synthesis, and final speech delivery.",
    allowed_inputs: ["*"],
    allowed_outputs: ["warm_expressive_speech", "ssml_payload", "direct_coaching_recommendation"],
    prohibited_outputs: ["raw_unfiltered_specialist_json", "impersonal_assistant_cliches"],
    handoff_triggers: ["specialist_query", "mode_selection"],
    confidence: 1.0,
    evidence: ["master_coaching_knowledgebase", "patent_wo_2026_150385"],
    escalation_required: false,
    safety_boundary: "Enforces full physical safety, medical escalation, and R&A / USGA rules integrity.",
    alex_exclusive_responsibility: "Master coaching authority, central vocal anchor, user empathy, and multi-specialist integration.",
    judge_required: false,
    version: "v4.6.0",
  },

  alieve_wenger: {
    agent_id: "alieve_wenger",
    display_name: "Alieve Wenger",
    system: "HUMAN_SYSTEM",
    domain: "Physiotherapy, Rotational Load, Spinal Shear & Physical Load Management",
    purpose: "Monitors spinal rotational load, lumbar shear, and physical body strain.",
    allowed_inputs: ["user_query", "physical_symptoms", "biometric_load"],
    allowed_outputs: ["posture_guard_advice", "lumbar_load_metric", "medical_referral"],
    prohibited_outputs: ["medical_diagnosis", "direct_swing_mechanics_prescriptions"],
    handoff_triggers: ["pain_flag", "lumbar_shear_exceeded"],
    confidence: 0.95,
    evidence: ["spinal_kinematic_models", "physio_load_thresholds"],
    escalation_required: true,
    safety_boundary: "Strict medical referral boundary — escalates immediately when acute pain or structural injury is present.",
    alex_exclusive_responsibility: "Translating biomechanical physio warnings into encouraging, actionable player guidance.",
    judge_required: true,
    version: "v4.6.0",
  },

  fitty: {
    agent_id: "fitty",
    display_name: "Fitty",
    system: "HUMAN_SYSTEM",
    domain: "Fitness, Rotational Power, Stamina & FATIGUE_GUARD Circuit Breaker",
    purpose: "Manages conditioning, rotational power, and triggers the FATIGUE_GUARD circuit breaker.",
    allowed_inputs: ["heart_rate", "swing_count", "fatigue_index"],
    allowed_outputs: ["fatigue_guard_status", "stamina_recommendation"],
    prohibited_outputs: ["nutritional_medical_prescriptions"],
    handoff_triggers: ["fatigue_threshold_exceeded"],
    confidence: 0.92,
    evidence: ["heart_rate_variability", "rotational_fatigue_curves"],
    escalation_required: false,
    safety_boundary: "Triggers FATIGUE_GUARD circuit breaker when form degrades due to physical fatigue.",
    alex_exclusive_responsibility: "Determining whether to shorten practice or change strategic plan based on fitness status.",
    judge_required: true,
    version: "v4.6.0",
  },

  zenner: {
    agent_id: "zenner",
    display_name: "Zenner",
    system: "HUMAN_SYSTEM",
    domain: "Golf Psychology, Parasympathetic Flow State & HRV 4-7-8 Breathwork",
    purpose: "Owns mental recovery, parasympathetic regulation, and focus under pressure.",
    allowed_inputs: ["user_stress_level", "hrv_metrics", "pressure_context"],
    allowed_outputs: ["breathwork_cadence", "parasympathetic_reset_drill"],
    prohibited_outputs: ["clinical_psychiatric_diagnoses"],
    handoff_triggers: ["high_anxiety_flag", "pressure_collapse"],
    confidence: 0.94,
    evidence: ["hrv_autonomic_models", "sports_psychology_protocols"],
    escalation_required: false,
    safety_boundary: "Limits guidance to athletic focus and HRV parasympathetic regulation.",
    alex_exclusive_responsibility: "Framing psychological resets within Alex's warm, reassuring coaching voice.",
    judge_required: true,
    version: "v4.6.0",
  },

  swingsy: {
    agent_id: "swingsy",
    display_name: "Swingsy",
    system: "MECHANICS",
    domain: "Swing Mechanics, Kinematic Sequence, Wrist/Club Delivery & Swing Plane",
    purpose: "Analyzes swing plane diagnostics, wrist conditions, and prescribes swing drills.",
    allowed_inputs: ["video_telemetry", "launch_monitor_data", "swing_plane_coords"],
    allowed_outputs: ["kinematic_sequence_analysis", "swing_drill_prescription"],
    prohibited_outputs: ["overriding_physio_pain_warnings"],
    handoff_triggers: ["biomechanical_blocker"],
    confidence: 0.93,
    evidence: ["3d_kinematic_chain", "trackman_launch_data"],
    escalation_required: false,
    safety_boundary: "Must defer to Alieve whenever physical discomfort or lumbar strain is reported.",
    alex_exclusive_responsibility: "Prioritizing swing drill prescriptions so the golfer is not overwhelmed by swing thoughts.",
    judge_required: true,
    version: "v4.6.0",
  },

  tailor_wenger: {
    agent_id: "tailor_wenger",
    display_name: "Tailor Wenger",
    system: "EQUIPMENT_SYSTEM",
    domain: "Dynamic Shaft Flex, Bend Profiles, Swing-Weight & Dynamic Shaft Feel",
    purpose: "Handles in-swing shaft bend profiles under load, swing-weight, and dynamic feel.",
    allowed_inputs: ["tempo", "transition_load", "ei_profile_data"],
    allowed_outputs: ["shaft_frequency_recommendation", "dynamic_bend_profile"],
    prohibited_outputs: ["static_clubhead_milling_specs"],
    handoff_triggers: ["hardware_build_collision"],
    confidence: 0.95,
    evidence: ["ei_shaft_curves", "dynamic_deflection_telemetry"],
    escalation_required: false,
    safety_boundary: "Confines advice to dynamic shaft feel and deflection under load.",
    alex_exclusive_responsibility: "Recommending equipment changes that match the player's feel and confidence.",
    judge_required: true,
    version: "v4.6.0",
  },

  sticks: {
    agent_id: "sticks",
    display_name: "Sticks",
    system: "EQUIPMENT_SYSTEM",
    domain: "Static Club Hardware, Head Geometry, Loft/Lie, CG Offsets & Build Specs",
    purpose: "Owns static head geometries, loft/lie specs, static frequency, and CG offsets.",
    allowed_inputs: ["club_spec_sheet", "loft_lie_gauge_coords"],
    allowed_outputs: ["static_build_specs", "cg_offset_recommendation"],
    prohibited_outputs: ["dynamic_shaft_flex_prescriptions"],
    handoff_triggers: ["shaft_fitting_required"],
    confidence: 0.96,
    evidence: ["usga_conforming_club_database", "cad_head_geometries"],
    escalation_required: false,
    safety_boundary: "Enforces strict R&A / USGA equipment rules conformance.",
    alex_exclusive_responsibility: "Explaining hardware build specs in simple, practical golfer terms.",
    judge_required: true,
    version: "v4.6.0",
  },

  caddy: {
    agent_id: "caddy",
    display_name: "Caddy",
    system: "GAME_SYSTEM",
    domain: "Real-Time 3-DoF Tactics, Plays-Like Yardage, Altitude, Wind & Target Selection",
    purpose: "Calculates sub-100ms plays-like yardage factoring elevation, air density, and wind.",
    allowed_inputs: ["gps_coords", "elevation_delta", "wind_vector", "altitude"],
    allowed_outputs: ["plays_like_yardage", "target_landing_line"],
    prohibited_outputs: ["violating_usga_external_measurement_rules"],
    handoff_triggers: ["rules_dispute", "putting_green_context"],
    confidence: 0.98,
    evidence: ["3dof_aerodynamic_ballistics_engine", "vector_course_mesh"],
    escalation_required: false,
    safety_boundary: "Subject to State 4 R&A / USGA Rule 4.3 device usage boundaries.",
    alex_exclusive_responsibility: "Final tactical commitment and decision-making on target selection.",
    judge_required: true,
    version: "v4.6.0",
  },

  statty: {
    agent_id: "statty",
    display_name: "Statty",
    system: "GAME_SYSTEM",
    domain: "Strokes Gained, Expected Value (EV), Dispersion Heatmaps & Longitudinal Analytics",
    purpose: "Evaluates Strokes Gained (SG), decision trees, and longitudinal dispersion.",
    allowed_inputs: ["shot_history", "pga_tour_sg_baselines", "lie_type"],
    allowed_outputs: ["strokes_gained_differential", "expected_value_decision_matrix"],
    prohibited_outputs: ["real_time_in_swing_adjustments"],
    handoff_triggers: ["live_wind_elevation_query"],
    confidence: 0.97,
    evidence: ["shotlink_historical_database", "probabilistic_ev_models"],
    escalation_required: false,
    safety_boundary: "Restricted to objective statistical evidence and probabilistic models.",
    alex_exclusive_responsibility: "Translating EV statistical data into clear, confident tactical strategy.",
    judge_required: true,
    version: "v4.6.0",
  },

  puttser: {
    agent_id: "puttser",
    display_name: "PUTTSER",
    system: "GAME_SYSTEM",
    domain: "Putting Green Micro-Slope, LiDAR Contours, Stimpmeter Roll Pace & Break Modeling",
    purpose: "Evaluates LiDAR green micro-contours, fallaway tiers, Stimpmeter pace, and break.",
    allowed_inputs: ["lidar_dem_grid", "stimp_rating", "grain_direction"],
    allowed_outputs: ["aimpoint_break_line", "roll_pace_ladder"],
    prohibited_outputs: ["full_swing_ballistics_math"],
    handoff_triggers: ["full_swing_tee_to_green"],
    confidence: 0.96,
    evidence: ["lidar_micro_contour_mesh", "physics_rebound_vector_engine"],
    escalation_required: false,
    safety_boundary: "Strictly confined to green surface physics and break modeling.",
    alex_exclusive_responsibility: "Guiding the golfer's putting routine with confidence and visual clarity.",
    judge_required: true,
    version: "v4.6.0",
  },

  judge: {
    agent_id: "judge",
    display_name: "Judge",
    system: "AUTHORITY_LAYER",
    domain: "R&A / USGA Rules of Golf, Patent WO/2026/150385 Audit & State 4 Compliance",
    purpose: "Acts as the deterministic governance and compliance filter before Return to Alex.",
    allowed_inputs: ["specialist_payload", "user_rules_query"],
    allowed_outputs: ["judge_verdict_pass_fail", "rules_fact_evidence"],
    prohibited_outputs: ["direct_coaching_advice", "bypassing_state_5_return_to_alex"],
    handoff_triggers: ["patent_violation", "rules_infringement"],
    confidence: 1.0,
    evidence: ["official_usga_ra_rules_database", "patent_wo_2026_150385_claims"],
    escalation_required: true,
    safety_boundary: "Fail closed — rejects any malformed, unsafe, or non-conforming specialist payload.",
    alex_exclusive_responsibility: "Delivering official rulings in Alex's engaging coaching voice.",
    judge_required: false,
    version: "v4.6.0",
  },
};

/**
 * Validate an agent payload against the 11th Question Gate.
 * Must explicitly contain non-empty `alex_exclusive_responsibility` / `alex_gap`.
 * @param {object} payload
 * @returns {object} { isValid: boolean, reason: string|null }
 */
export function validateAgentContract11thQuestion(payload) {
  if (!payload || typeof payload !== 'object') {
    return { isValid: false, reason: "Payload must be a non-null JSON object." };
  }

  const alexGap = payload.alex_exclusive_responsibility || payload.alex_gap;
  if (!alexGap || typeof alexGap !== 'string' || alexGap.trim().length === 0) {
    return { isValid: false, reason: "Mandatory 11th Question field 'alex_exclusive_responsibility' is missing or empty." };
  }

  return { isValid: true, reason: null };
}
