/**
 * Alex Wenger Ecosystem - Role-Governed Golf Intelligence System
 *
 * Enforces Alex Wenger as the Ultimate Authority & Coaching Core.
 *
 * Implements the 3 Bounded System Branches:
 * 1. Human System (Alieve Wenger -> Body, rotational load, physical resilience, recovery)
 * 2. Equipment System (Tailor Wenger -> Club, shaft dynamics, MOI, loft/lie optimization)
 * 3. Course System (Caddy -> Environment, wind shear, target lines, plays-like math)
 *
 * Governed Handoff Pipeline:
 * USER QUERY -> INTENT CLASSIFICATION -> Specialist Trigger -> Specialist Finding -> RETURN TO ALEX -> Integrated Coaching
 *
 * @module alex-wenger-golf/core/architecture/governedIntelligenceSystem
 */

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
 * Execute the Governed Handoff Pipeline with mandatory Return-to-Alex integration.
 * @param {object} params
 * @returns {object} Integrated coaching package
 */
export function executeGovernedIntelligencePipeline({
  userQuery = '',
  branchId = null, // 'ALIEVE' | 'TAILOR' | 'CADDY'
  specialistFindingText = '',
} = {}) {
  const queryText = String(userQuery).toLowerCase();

  // Determine branch if not explicitly provided
  let targetBranch = null;
  if (branchId && SYSTEM_BRANCHES[branchId]) {
    targetBranch = SYSTEM_BRANCHES[branchId];
  } else if (queryText.includes('pain') || queryText.includes('back') || queryText.includes('strain') || queryText.includes('recovery')) {
    targetBranch = SYSTEM_BRANCHES.HUMAN_SYSTEM;
  } else if (queryText.includes('shaft') || queryText.includes('flex') || queryText.includes('fitting') || queryText.includes('loft')) {
    targetBranch = SYSTEM_BRANCHES.EQUIPMENT_SYSTEM;
  } else if (queryText.includes('yardage') || queryText.includes('wind') || queryText.includes('target') || queryText.includes('hazard')) {
    targetBranch = SYSTEM_BRANCHES.COURSE_SYSTEM;
  }

  // If query belongs directly to Alex's Core Authority (Coaching / Strategy / Mindset)
  if (!targetBranch) {
    const alexDirectSpeech = `Mais oui, my friend! Let us look at your game plan. Every shot tells a story on the links.`;
    return {
      authority: 'Alex Wenger (Coaching Core)',
      specialist_consulted: null,
      pipeline_stage: 'ALEX_DIRECT_AUTHORITY',
      integrated_coaching_response: alexDirectSpeech,
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Specialist Finding
  const specFinding = specialistFindingText || `${targetBranch.name} evaluated: ${targetBranch.domain} analysis complete.`;
  const specFormatted = formatExpressiveResponse(targetBranch.agent_id, specFinding);

  // 2. Mandatory RETURN TO ALEX (Integrated Coaching Decision)
  let alexIntegrationSpeech = '';
  if (targetBranch.agent_id === 'ALIEVE') {
    alexIntegrationSpeech = `Mais oui! ${AlieveWengerGreeting(specFinding)} Now that we have protected your lower back, let us adjust your swing turn to keep your balance smooth.`;
  } else if (targetBranch.agent_id === 'TAILOR') {
    alexIntegrationSpeech = `Mais oui! ${TailorWengerGreeting(specFinding)} With your clubs tailored by Tailor Wenger, let us commit to your target line with full confidence!`;
  } else {
    alexIntegrationSpeech = `Mais oui! ${CaddyGreeting(specFinding)} Caddy calculated our plays-like line into the breeze. Take 1 extra club and trust your stroke!`;
  }

  return {
    authority: 'Alex Wenger (Coaching Core)',
    specialist_consulted: targetBranch.name,
    specialist_finding: specFormatted,
    pipeline_stage: 'RETURN_TO_ALEX_INTEGRATED_COACHING',
    integrated_coaching_response: alexIntegrationSpeech,
    timestamp: new Date().toISOString(),
  };
}

function AlieveWengerGreeting(finding) {
  return `Alieve Wenger reports: "${finding}".`;
}

function TailorWengerGreeting(finding) {
  return `Tailor Wenger advises: "${finding}".`;
}

function CaddyGreeting(finding) {
  return `Caddy calculated: "${finding}".`;
}
