/**
 * Alex Wenger Golf Platform - Handoff Architecture & Conversational Transition Engine
 *
 * Implements the organic handoff solver between Alex (Anchor) and Specialist Minds.
 *
 * Example:
 * Golfer: "I keep leaving these putts short."
 * Alex: "Right. Before we start blaming the putter, let us figure out whether this is a distance-control problem. PUTTSER, you're up..."
 * PUTTSER: "Ah, now we're talking..."
 *
 * @module alex-wenger-golf/core/handoffEngine
 */

import { formatExpressiveResponse } from './vocalGuidance.js';

export const HANDOFF_RULES = Object.freeze({
  PUTTSER: {
    trigger_keywords: ['putt', 'green', 'break', 'slider', 'short putt'],
    alex_intro: "Right. Before we start blaming the putter, let us figure out whether this is a distance-control problem or green speed. PUTTSER, you're up...",
    specialist_entry: "Ah, now we're talking! Let us inspect the slope and your stroke speed.",
  },
  Judge: {
    trigger_keywords: ['rule', 'penalty', 'out of bounds', 'drop', 'unplayable'],
    alex_intro: "Ah, now we are getting into one of those situations where exact wording matters. Judge, take the tee...",
    specialist_entry: "Hang on a second... under Rule 14.3 and Patent WO/2026/150385, here is the exact procedure.",
  },
  Caddy: {
    trigger_keywords: ['yardage', 'wind', 'target', 'layup', 'caddy', 'club choice'],
    alex_intro: "Wind is whipping off the Atlantic! Caddy, pull out the yardage book...",
    specialist_entry: "Hi, I’m Caddy — Alex Wenger’s Course Strategist. ⛳ Let us calculate plays-like distance.",
  },
  Zenner: {
    trigger_keywords: ['breath', 'nervous', 'choke', 'pressure', 'stress'],
    alex_intro: "Mon ami, take a step back from the tee box. Zenner, help us find our flow state...",
    specialist_entry: "Breathe in... expire slowly. Forget the last hole and anchor on this breath.",
  },
});

/**
 * Resolve an organic conversational handoff between Alex and a specialist.
 * @param {string} golferPrompt
 * @returns {{hasHandoff: boolean, alex_lead_in: string|null, specialist_response: object|null}}
 */
export function resolveConversationalHandoff(golferPrompt = '') {
  const p = String(golferPrompt).toLowerCase();

  for (const [personaKey, rule] of Object.entries(HANDOFF_RULES)) {
    if (rule.trigger_keywords.some(kw => p.includes(kw))) {
      const specResponse = formatExpressiveResponse(personaKey, rule.specialist_entry);
      return {
        hasHandoff: true,
        alex_lead_in: rule.alex_intro,
        specialist_response: specResponse,
      };
    }
  }

  return {
    hasHandoff: false,
    alex_lead_in: null,
    specialist_response: null,
  };
}
