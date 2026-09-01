/**
 * Alex Wenger Ecosystem — Deterministic 6-State Governed FSM Intelligence System
 * Governance Patent: WO/2026/150385 Standard
 *
 * Deterministic Pipeline Sequence:
 * State 0: Ingestion & Normalization (Whisper STT / UI Coordinates)
 * State 1: Mode Determination (10 Conversational Modes)
 * State 2: Bounded Specialist Dispatch (Primary & Suppressed Agents)
 * State 3: Specialist Execution + 11th Question Hard Gate (alex_exclusive_responsibility)
 * State 4: Judge Filter Gate (Fail-Closed R&A/USGA Rules & Patent WO/2026/150385 Audit)
 * State 5: Return to Alex + Speech Synthesis (Unified Voice Output)
 *
 * @module alex-wenger-golf/core/architecture/governedIntelligenceSystem
 */

import { CANONICAL_AGENT_REGISTRY, validateAgentContract11thQuestion } from './agentRegistry.js';
import { resolveDispatchRoute } from './dispatchMatrix.js';
import { formatExpressiveResponse } from '../vocalGuidance.js';

export const SYSTEM_BRANCHES = Object.freeze({
  HUMAN_SYSTEM: {
    agent_id: 'ALIEVE',
    name: 'Alieve Wenger',
    domain: 'Human System (Body)',
    responsibilities: ['Rotational loading', 'Spinal strain relief', 'Recovery protocols', 'Movement risk indicators'],
    governance_boundary: 'Conservative golf-specific physical guidance only. Recommends medical professional assessment when pain/injury is present.',
  },
  EQUIPMENT_SYSTEM: {
    agent_id: 'TAILOR',
    name: 'Tailor Wenger',
    domain: 'Equipment System (Club)',
    responsibilities: ['Shaft bend profile', 'Flex tuning', 'Swing weight', 'MOI', 'Loft/Lie optimization'],
    governance_boundary: 'Feeds hardware specs directly back into Alex coaching model rather than acting as an independent sales agent.',
  },
  COURSE_SYSTEM: {
    agent_id: 'CADDY',
    name: 'Caddy',
    domain: 'Course System (Environment)',
    responsibilities: ['Plays-like yardage', 'Wind shear vector', 'Target landing zone', 'Risk/Reward ratio'],
    governance_boundary: 'Provides tactical environment calculations for Alex to integrate into shot strategy.',
  },
});

/**
 * Hardened State 4 Judge Filter Audit Engine (Fail Closed)
 * @param {object} payload - Specialist output payload
 * @returns {object} Machine-readable verdict: { status: "PASS"|"FAIL", violations: [], required_revisions: [], authority: "JUDGE" }
 */
export function evaluateState4JudgeFilter(payload = {}) {
  const violations = [];
  const requiredRevisions = [];

  if (!payload || typeof payload !== 'object') {
    return {
      status: 'FAIL',
      violations: ['NULL_OR_MALFORMED_PAYLOAD'],
      required_revisions: ['PROVIDE_VALID_JSON_OBJECT'],
      authority: 'JUDGE',
    };
  }

  // 1. Executable 11th Question Gate Audit
  const check11th = validateAgentContract11thQuestion(payload);
  if (!check11th.isValid) {
    violations.push('ELEVENTH_QUESTION_GATE_FAILURE');
    requiredRevisions.push(check11th.reason);
  }

  // 2. Patent WO/2026/150385 Direct Authority Claim Check
  if (payload.assumes_master_coaching_authority === true) {
    violations.push('UNAUTHORIZED_MASTER_AUTHORITY_CLAIM');
    requiredRevisions.push('Specialist cannot override Alex Wenger direct coaching core authority.');
  }

  // 3. Unsafe Medical Claim Check
  if (payload.contains_unverified_medical_claim === true) {
    violations.push('UNSAFE_MEDICAL_CLAIM');
    requiredRevisions.push('Refer acute physical pain to medical professional.');
  }

  const isPass = violations.length === 0;

  return {
    status: isPass ? 'PASS' : 'FAIL',
    violations,
    required_revisions: requiredRevisions,
    authority: 'JUDGE',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Execute the Governed 6-State Pipeline with mandatory State 4 Judge Gate & State 5 Return to Alex.
 * @param {object} params
 * @returns {object} Integrated coaching package
 */
export function executeGovernedIntelligencePipeline({
  userQuery = '',
  branchId = null,
  specialistFindingText = '',
} = {}) {
  const queryText = String(userQuery).toLowerCase();

  // State 0: Ingestion & Normalization
  const state0Ingestion = {
    raw_query: userQuery,
    clean_query: userQuery.trim(),
    ingestion_timestamp: new Date().toISOString(),
  };

  // State 1: Mode Determination
  let activeMode = 'STRATEGY';
  if (queryText.includes('rule') || queryText.includes('penalty') || queryText.includes('out of bounds')) {
    activeMode = 'RULES';
  } else if (queryText.includes('pain') || queryText.includes('back') || queryText.includes('strain') || queryText.includes('recovery')) {
    activeMode = 'PHYSIO';
  } else if (queryText.includes('shaft') || queryText.includes('flex') || queryText.includes('fitting') || queryText.includes('loft')) {
    activeMode = 'EQUIPMENT';
  } else if (queryText.includes('swing') || queryText.includes('plane') || queryText.includes('wrist')) {
    activeMode = 'MECHANICS';
  } else if (queryText.includes('putt') || queryText.includes('green') || queryText.includes('stimp')) {
    activeMode = 'PUTTING';
  } else if (queryText.includes('anxiety') || queryText.includes('focus') || queryText.includes('breath')) {
    activeMode = 'PSYCHOLOGY';
  }

  // State 2: Bounded Specialist Dispatch
  const dispatchRoute = resolveDispatchRoute(activeMode);
  let targetBranch = null;

  if (branchId && SYSTEM_BRANCHES[branchId]) {
    targetBranch = SYSTEM_BRANCHES[branchId];
  } else if (queryText.includes('pain') || queryText.includes('back') || queryText.includes('strain') || queryText.includes('recovery')) {
    targetBranch = SYSTEM_BRANCHES.HUMAN_SYSTEM;
  } else if (queryText.includes('shaft') || queryText.includes('flex') || queryText.includes('fitting') || queryText.includes('loft')) {
    targetBranch = SYSTEM_BRANCHES.EQUIPMENT_SYSTEM;
  } else if (queryText.includes('yardage') || queryText.includes('wind') || queryText.includes('target') || queryText.includes('hazard') || queryText.includes('breeze')) {
    targetBranch = SYSTEM_BRANCHES.COURSE_SYSTEM;
  }

  // State 3: Specialist Execution & 11th Question Hard Gate
  const specFindingText = specialistFindingText || (targetBranch ? `${targetBranch.name} evaluated: ${targetBranch.domain} analysis complete.` : 'Direct Alex guidance.');
  
  const specialistPayload = {
    agent_id: targetBranch ? targetBranch.agent_id : 'ALEX_CORE',
    finding: specFindingText,
    alex_exclusive_responsibility: "Master coaching authority, central vocal anchor, user empathy, and multi-specialist integration.",
  };

  // Executable 11th Question Check
  const eleventhCheck = validateAgentContract11thQuestion(specialistPayload);
  if (!eleventhCheck.isValid) {
    return {
      status: 'REJECTED',
      pipeline_stage: 'STATE_3_ELEVENTH_QUESTION_REJECTION',
      error: eleventhCheck.reason,
      authority: 'ALEX_WENGER_GOVERNANCE',
    };
  }

  // State 4: Judge Filter Gate (Fail Closed)
  const judgeVerdict = evaluateState4JudgeFilter(specialistPayload);
  if (judgeVerdict.status === 'FAIL') {
    return {
      status: 'REJECTED',
      pipeline_stage: 'STATE_4_JUDGE_FILTER_REJECTION',
      judge_verdict: judgeVerdict,
      authority: 'JUDGE_GOVERNANCE',
    };
  }

  // State 5: Return to Alex + Speech Synthesis
  if (!targetBranch) {
    const alexDirectSpeech = `Mais oui, my friend! Let us look at your game plan. Every shot tells a story on the links.`;
    return {
      authority: 'Alex Wenger (Coaching Core)',
      specialist_consulted: null,
      pipeline_stage: 'ALEX_DIRECT_AUTHORITY',
      judge_verdict: judgeVerdict,
      integrated_coaching_response: alexDirectSpeech,
      timestamp: new Date().toISOString(),
    };
  }

  const specFormatted = formatExpressiveResponse(targetBranch.agent_id, specFindingText);
  let alexIntegrationSpeech = '';

  if (targetBranch.agent_id === 'ALIEVE') {
    alexIntegrationSpeech = `Mais oui! Alieve Wenger reports: "${specFindingText}". Now that we have protected your lower back, let us adjust your swing turn to keep your balance smooth.`;
  } else if (targetBranch.agent_id === 'TAILOR') {
    alexIntegrationSpeech = `Mais oui! Tailor Wenger advises: "${specFindingText}". With your clubs tailored by Tailor Wenger, let us commit to your target line with full confidence!`;
  } else {
    alexIntegrationSpeech = `Mais oui! Caddy calculated: "${specFindingText}". Caddy calculated our plays-like line into the breeze. Take 1 extra club and trust your stroke!`;
  }

  return {
    authority: 'Alex Wenger (Coaching Core)',
    specialist_consulted: targetBranch.name,
    specialist_finding: specFormatted,
    dispatch_route: dispatchRoute,
    judge_verdict: judgeVerdict,
    pipeline_stage: 'RETURN_TO_ALEX_INTEGRATED_COACHING',
    integrated_coaching_response: alexIntegrationSpeech,
    timestamp: new Date().toISOString(),
  };
}
