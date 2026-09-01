/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Authoritative Dispatch Matrix (v4.6.0)
 * Governance Patent: WO/2026/150385
 *
 * Deterministic Mapping:
 * Mode -> Primary Specialist -> Permitted Supporting Specialists -> Suppressed Specialists -> Judge Requirement -> Alex Synthesis
 *
 * @module alex-wenger-golf/core/architecture/dispatchMatrix
 */

export const AUTHORITATIVE_DISPATCH_MATRIX = {
  RULES: {
    mode: "RULES",
    primary_specialist: "judge",
    permitted_supporting: [],
    suppressed_specialists: ["tailor_wenger", "sticks", "fitty", "zenner", "alieve_wenger", "swingsy"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  EQUIPMENT: {
    mode: "EQUIPMENT",
    primary_specialist: "tailor_wenger",
    permitted_supporting: ["sticks", "swingsy", "statty"],
    suppressed_specialists: ["zenner", "judge"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  PHYSIO: {
    mode: "PHYSIO",
    primary_specialist: "alieve_wenger",
    permitted_supporting: ["fitty", "swingsy"],
    suppressed_specialists: ["tailor_wenger", "sticks", "caddy"],
    judge_required: true,
    alex_synthesis_required: true,
    enforce_medical_escalation: true,
  },

  STRATEGY: {
    mode: "STRATEGY",
    primary_specialist: "caddy",
    permitted_supporting: ["statty", "puttser", "zenner"],
    suppressed_specialists: ["swingsy", "tailor_wenger"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  MECHANICS: {
    mode: "MECHANICS",
    primary_specialist: "swingsy",
    permitted_supporting: ["alieve_wenger", "tailor_wenger", "statty"],
    suppressed_specialists: ["puttser", "judge"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  PUTTING: {
    mode: "PUTTING",
    primary_specialist: "puttser",
    permitted_supporting: ["statty", "zenner"],
    suppressed_specialists: ["swingsy", "sticks", "tailor_wenger"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  PSYCHOLOGY: {
    mode: "PSYCHOLOGY",
    primary_specialist: "zenner",
    permitted_supporting: ["fitty", "caddy"],
    suppressed_specialists: ["sticks", "tailor_wenger"],
    judge_required: true,
    alex_synthesis_required: true,
  },

  CLUBHOUSE: {
    mode: "CLUBHOUSE",
    primary_specialist: "alex_wenger",
    permitted_supporting: ["david_ward", "al"],
    suppressed_specialists: [],
    judge_required: false,
    alex_synthesis_required: true,
  },
};

/**
 * Resolve deterministic specialist dispatch route for a given mode string.
 * @param {string} mode
 * @returns {object} Dispatch route configuration
 */
export function resolveDispatchRoute(mode = "STRATEGY") {
  const normalized = (mode || "STRATEGY").toUpperCase();
  return AUTHORITATIVE_DISPATCH_MATRIX[normalized] || AUTHORITATIVE_DISPATCH_MATRIX.STRATEGY;
}
