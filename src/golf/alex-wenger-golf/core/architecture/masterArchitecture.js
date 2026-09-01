/**
 * Alex Wenger Ecosystem - Master Architecture & 3-Tier System Registry
 *
 * Implements the 3-Tier Ecosystem Architecture:
 * 1. Tier 1: Alex Wenger (Central Golf Personality & Golf Intelligence)
 * 2. Tier 2: 8 Specialist Minds (PUTTSER, Statty, Judge, Zenner, Swingsy, Fitty, Caddy, Sticks)
 * 3. Tier 3: Al (Host/Moderator) & David Ward (Executive Producer)
 * 4. Shared Infrastructure: Knowledge + Memory + Retrieval + Orchestration + Voice
 *
 * Enforces the 10 Master Interview Questions for each Specialist.
 *
 * @module alex-wenger-golf/core/architecture/masterArchitecture
 */

export const ECOSYSTEM_TIERS = Object.freeze({
  ANCHOR: {
    name: 'Alex Wenger',
    role: 'Central Golf Personality & Golf Intelligence (Hub)',
    description: 'Holds the central relationship with the golfer, conversational anchor, framing all dialogue with warmth and French charm.',
  },
  MODERATOR: {
    name: 'Al',
    role: 'Podcast Host & Conversational Moderator',
    description: 'Draws out specialist perspectives, paces the show, and guides multi-character dialogue.',
  },
  PRODUCER: {
    name: 'David Ward',
    role: 'Executive Producer & Co-Host',
    description: 'Oversees podcast production, challenges assumptions, and provides authentic golfer banter.',
  },
  SPECIALISTS: Object.freeze({
    PUTTSER: { name: 'PUTTSER', lens: 'Precision and feel', primary_domain: 'Putting & Green Reading' },
    Statty: { name: 'Statty', lens: 'Measurement, memory, learning', primary_domain: 'Performance Data & Strokes Gained' },
    Judge: { name: 'Judge', lens: 'Truth, factual authority, uncertainty', primary_domain: 'Rules & Governance' },
    Zenner: { name: 'Zenner', lens: 'Confidence, pressure, mindset', primary_domain: 'Psychology & Mental Flow' },
    Swingsy: { name: 'Swingsy', lens: 'Personalized swing coaching', primary_domain: 'Swing Mechanics & Kinematics' },
    Fitty: { name: 'Fitty', lens: 'Golf-fitness & physical performance', primary_domain: 'Fitness, Recovery & Fatigue Guard' },
    Alieve: { name: 'Alieve Wenger', lens: 'Biomechanical relief & rotational health', primary_domain: 'Strain Relief, Bio-Health & Recovery' },
    Caddy: { name: 'Caddy', lens: 'On-course strategic decisions', primary_domain: 'Course Strategy & Execution' },
    Sticks: { name: 'Sticks', lens: 'Equipment & shaft fitting', primary_domain: 'Equipment & Product Intelligence' },
    Tailor: { name: 'Tailor Wenger', lens: 'Master club fitting & gear tailoring', primary_domain: 'Shaft Dynamics & Equipment Craftsmanship' },
  }),
});

/**
 * 11 Master Interview Questions Schema for Specialist Consultants (including 11th Guardrail Question).
 */
export const MASTER_INTERVIEW_QUESTIONS = Object.freeze([
  'q1_unique_capability',
  'q2_alex_blind_spot',
  'q3_boundary',
  'q4_shared_capability',
  'q5_memory_requirement',
  'q6_knowledge_requirement',
  'q7_conversation_requirement',
  'q8_failure_mode',
  'q9_integration_opportunity',
  'q10_transformational_idea',
  'q11_exclusively_alex_responsibility',
]);

/**
 * Evaluate if an architectural proposal satisfies the 5 Master Filters.
 * @param {object} params
 * @returns {{passed: boolean, score: number, filter_breakdown: object, recommendation: string}}
 */
export function evaluateMasterArchitectureFilter({
  proposalName = '',
  moreUseful = false,
  moreHuman = false,
  moreEntertaining = false,
  moreAccurate = false,
  moreCoherent = false,
} = {}) {
  const filterBreakdown = {
    useful: Boolean(moreUseful),
    human: Boolean(moreHuman),
    entertaining: Boolean(moreEntertaining),
    accurate: Boolean(moreAccurate),
    coherent: Boolean(moreCoherent),
  };

  const count = Object.values(filterBreakdown).filter(Boolean).length;
  const score = Math.round((count / 5) * 100);
  const passed = count >= 3;

  return {
    proposal_name: proposalName,
    passed,
    score,
    filter_breakdown: filterBreakdown,
    recommendation: passed
      ? `ACCEPTED: Proposal "${proposalName}" passes master architecture filter (${score}% alignment).`
      : `REJECTED: Proposal "${proposalName}" fails master architecture filter.`,
  };
}
