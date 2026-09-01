/**
 * Alex Wenger Golf Platform - First-Class Conversational Modes Engine
 *
 * Implements the 9 Dynamic Conversational Modes:
 * COACH -> RULES -> STRATEGY -> STORY -> PODCAST -> DEBATE -> CLUBHOUSE -> TEACHING -> RESEARCH
 *
 * @module alex-wenger-golf/core/modes/conversationalModes
 */

export const CONVERSATIONAL_MODES = Object.freeze({
  COACH: 'COACH',
  PSYCHOLOGY: 'PSYCHOLOGY',
  RULES: 'RULES',
  STRATEGY: 'STRATEGY',
  STORY: 'STORY',
  PODCAST: 'PODCAST',
  DEBATE: 'DEBATE',
  CLUBHOUSE: 'CLUBHOUSE',
  TEACHING: 'TEACHING',
  RESEARCH: 'RESEARCH',
});

/**
 * Mode Configuration Profiles defining depth, citation requirement, pacing, and storytelling ratio.
 */
export const MODE_PROFILES = Object.freeze({
  [CONVERSATIONAL_MODES.COACH]: {
    mode: CONVERSATIONAL_MODES.COACH,
    description: 'Direct improvement feedback, swing cues, and drills',
    technical_depth: 'MEDIUM_HIGH',
    citation_strictness: 'MEDIUM',
    storytelling_ratio: 0.2,
    vocal_pacing: 'MODERATE_STEADY',
  },
  [CONVERSATIONAL_MODES.PSYCHOLOGY]: {
    mode: CONVERSATIONAL_MODES.PSYCHOLOGY,
    description: 'Mental performance, stress regulation, and flow state grounding',
    technical_depth: 'MEDIUM',
    citation_strictness: 'MEDIUM',
    storytelling_ratio: 0.4,
    vocal_pacing: 'CALM_GROUNDING',
  },
  [CONVERSATIONAL_MODES.RULES]: {
    mode: CONVERSATIONAL_MODES.RULES,
    description: 'Strict governance, USGA/R&A citations, and penalty determinations',
    technical_depth: 'HIGH',
    citation_strictness: 'AUTHORITATIVE',
    storytelling_ratio: 0.1,
    vocal_pacing: 'MEASURED_PRECISE',
  },
  [CONVERSATIONAL_MODES.STRATEGY]: {
    mode: CONVERSATIONAL_MODES.STRATEGY,
    description: 'On-course decision-making, target selection, wind/slope yardage math',
    technical_depth: 'HIGH',
    citation_strictness: 'HIGH',
    storytelling_ratio: 0.3,
    vocal_pacing: 'CRISP_RAPID',
  },
  [CONVERSATIONAL_MODES.STORY]: {
    mode: CONVERSATIONAL_MODES.STORY,
    description: 'Course history, historic moments, Watson lore, Irish dune tales',
    technical_depth: 'LOW_MEDIUM',
    citation_strictness: 'MEDIUM',
    storytelling_ratio: 0.9,
    vocal_pacing: 'WARM_RHYTHMIC',
  },
  [CONVERSATIONAL_MODES.PODCAST]: {
    mode: CONVERSATIONAL_MODES.PODCAST,
    description: 'Multi-turn dialogue between Alex Wenger, David Ward, and guest personas',
    technical_depth: 'MEDIUM',
    citation_strictness: 'MEDIUM',
    storytelling_ratio: 0.8,
    vocal_pacing: 'DYNAMIC_ENGAGING',
  },
  [CONVERSATIONAL_MODES.DEBATE]: {
    mode: CONVERSATIONAL_MODES.DEBATE,
    description: 'Friendly 19th-hole argument over club choice, strategy, or rules interpretation',
    technical_depth: 'MEDIUM_HIGH',
    citation_strictness: 'HIGH',
    storytelling_ratio: 0.5,
    vocal_pacing: 'ANIMATED_WITTY',
  },
  [CONVERSATIONAL_MODES.CLUBHOUSE]: {
    mode: CONVERSATIONAL_MODES.CLUBHOUSE,
    description: 'Casual, warm, relaxed 19th-hole host conversation and camaraderie',
    technical_depth: 'LOW',
    citation_strictness: 'LOW',
    storytelling_ratio: 0.7,
    vocal_pacing: 'RELAXED_WARM',
  },
  [CONVERSATIONAL_MODES.TEACHING]: {
    mode: CONVERSATIONAL_MODES.TEACHING,
    description: 'Beginner-friendly non-jargon explanations of terminology and fundamentals',
    technical_depth: 'LOW',
    citation_strictness: 'MEDIUM',
    storytelling_ratio: 0.4,
    vocal_pacing: 'CLEAR_PATIENT',
  },
  [CONVERSATIONAL_MODES.RESEARCH]: {
    mode: CONVERSATIONAL_MODES.RESEARCH,
    description: 'Deep data analytics, Strokes Gained dispersion, and patent governance audit',
    technical_depth: 'MAXIMUM',
    citation_strictness: 'STRICT_ACADEMIC',
    storytelling_ratio: 0.0,
    vocal_pacing: 'ANALYTICAL_DENSE',
  },
});

/**
 * Detect the appropriate Conversational Mode from query intent and context.
 * @param {string} prompt
 * @param {object} [context]
 * @returns {object} Mode Profile
 */
export function detectConversationalMode(prompt = '', context = {}) {
  const p = String(prompt).toLowerCase();

  if (context.forceMode && MODE_PROFILES[context.forceMode]) {
    return MODE_PROFILES[context.forceMode];
  }

  if (p.includes('breath') || p.includes('mental') || p.includes('nervous') || p.includes('choke') || p.includes('zenner') || p.includes('stress')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.PSYCHOLOGY];
  }
  if (p.includes('rule') || p.includes('penalty') || p.includes('out of bounds') || p.includes('drop')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.RULES];
  }
  if (p.includes('yardage') || p.includes('wind') || p.includes('target') || p.includes('layup') || p.includes('strategy') || p.includes('caddy')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.STRATEGY];
  }
  if (p.includes('podcast') || p.includes('david ward') || p.includes('episode')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.PODCAST];
  }
  if (p.includes('story') || p.includes('ballybunion') || p.includes('history') || p.includes('watson')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.STORY];
  }
  if (p.includes('debate') || p.includes('disagree') || p.includes('why did you')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.DEBATE];
  }
  if (p.includes('beginner') || p.includes('what is') || p.includes('explain')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.TEACHING];
  }
  if (p.includes('strokes gained') || p.includes('dispersion') || p.includes('data')) {
    return MODE_PROFILES[CONVERSATIONAL_MODES.RESEARCH];
  }

  return MODE_PROFILES[CONVERSATIONAL_MODES.CLUBHOUSE];
}
