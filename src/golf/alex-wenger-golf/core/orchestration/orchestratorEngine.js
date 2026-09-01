/**
 * Alex Wenger Golf Platform - Al Orchestrator & De-duplication Guard Engine
 *
 * Implements:
 * 1. Separation of Expertise from Orchestration (Al/Alex resolves who speaks).
 * 2. Hard De-duplication Rule:
 *    - If two personas would produce substantially the same answer, only ONE speaks.
 *    - If they disagree, bring the second persona in for a debate.
 *    - If one persona can materially improve another's answer, collaborate.
 *    - Otherwise, stay out of the conversation to avoid "symposium bloat".
 *
 * @module alex-wenger-golf/core/orchestration/orchestratorEngine
 */

import { PERSONA_INTERACTION_MATRIX } from './interactionMatrix.js';

/**
 * Evaluate speaker claims and select the minimum viable speaker cohort.
 * @param {string} prompt
 * @returns {{primarySpeaker: string, supportingSpeaker: string|null, isDebate: boolean, rationale: string}}
 */
export function resolveSpeakerOrchestration(prompt = '') {
  const p = String(prompt).toLowerCase();

  // Rules -> Judge owns outright
  if (p.includes('rule') || p.includes('penalty') || p.includes('out of bounds') || p.includes('drop')) {
    return {
      primarySpeaker: 'Judge',
      supportingSpeaker: null,
      isDebate: false,
      rationale: 'Judge has exclusive authoritative claim over rules precision.',
    };
  }

  // Putting -> PUTTSER owns outright
  if (p.includes('putt') || p.includes('green break') || p.includes('slope')) {
    return {
      primarySpeaker: 'PUTTSER',
      supportingSpeaker: null,
      isDebate: false,
      rationale: 'PUTTSER owns putting and green reading experience.',
    };
  }

  // Strategy & Yardage -> Caddy owns
  if (p.includes('yardage') || p.includes('wind') || p.includes('target') || p.includes('caddy')) {
    return {
      primarySpeaker: 'Caddy',
      supportingSpeaker: null,
      isDebate: false,
      rationale: 'Caddy owns on-course strategy and plays-like yardage execution.',
    };
  }

  // Disagreement trigger: "bad drive" / "sliced" (Swingsy mechanics vs Sticks equipment vs Fitty fatigue)
  if (p.includes('slice') || p.includes('hit drive badly') || p.includes('missed drive')) {
    return {
      primarySpeaker: 'Swingsy',
      supportingSpeaker: 'Sticks',
      isDebate: true,
      rationale: 'Potential disagreement between swing mechanics (Swingsy) and shaft flex profile (Sticks). Orchestrator brings in a 2-person collaboration.',
    };
  }

  // General conversation -> Alex Wenger (Anchor)
  return {
    primarySpeaker: 'Alex',
    supportingSpeaker: null,
    isDebate: false,
    rationale: 'Alex Wenger anchor handles host conversation and storytelling.',
  };
}

/**
 * Filter duplicate responses to enforce De-duplication Guard.
 * @param {Array<{speaker: string, contribution: string}>} contributions
 * @returns {Array<{speaker: string, contribution: string}>} De-duplicated contributions
 */
export function enforceDeduplicationGuard(contributions = []) {
  if (!Array.isArray(contributions) || contributions.length <= 1) {
    return contributions;
  }

  const result = [];
  const seenIdeas = new Set();

  for (const item of contributions) {
    const text = String(item.contribution).toLowerCase();
    // Check if idea is substantially similar
    let isDuplicate = false;
    for (const idea of seenIdeas) {
      if (text.includes(idea) || idea.includes(text)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      result.push(item);
      seenIdeas.add(text.substring(0, 30));
    }
  }

  return result;
}
