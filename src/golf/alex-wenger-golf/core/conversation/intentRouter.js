/**
 * Alex Wenger Golf Platform - Intent Router & Rules Pathway
 *
 * Implements the Rules-First Decision Pipeline:
 * User question -> Intent detection -> Is Rules question? -> YES -> Rules retrieval -> Source validation -> Confidence check -> Alex explanation
 *
 * @module alex-wenger-golf/core/conversation/intentRouter
 */

import { retrieveRulesFact } from '../../knowledge/rulesRetrieval.js';
import { generateAlexDavidDialogue } from './davidWardBanter.js';

export const INTENT_TYPES = Object.freeze({
  RULES_QUERY: 'RULES_QUERY',
  COACHING_SWING: 'COACHING_SWING',
  STORYTELLING_PODCAST: 'STORYTELLING_PODCAST',
  GENERAL_CONVERSATION: 'GENERAL_CONVERSATION',
});

/**
 * Detect user intent.
 * @param {string} userQuery
 * @returns {string} Intent type
 */
export function detectIntent(userQuery = '') {
  const text = String(userQuery).toLowerCase();

  if (text.includes('rule') || text.includes('ruling') || text.includes('penalty') || text.includes('out of bounds') || text.includes('hazard') || text.includes('unplayable') || text.includes('drop') || text.includes('can i')) {
    return INTENT_TYPES.RULES_QUERY;
  }
  if (text.includes('swing') || text.includes('grip') || text.includes('slice') || text.includes('hook') || text.includes('tempo')) {
    return INTENT_TYPES.COACHING_SWING;
  }
  if (text.includes('david') || text.includes('podcast') || text.includes('story') || text.includes('ballybunion')) {
    return INTENT_TYPES.STORYTELLING_PODCAST;
  }
  return INTENT_TYPES.GENERAL_CONVERSATION;
}

/**
 * Orchestrate conversational response adhering to Alex Wenger Platform Manifesto.
 * @param {object} params
 * @returns {object} Response object
 */
export function processAlexWengerRequest({
  userQuery = '',
  userMemory = null,
  formatMode = 'conversational', // 'conversational' | 'podcast_script' | 'api'
} = {}) {
  const intent = detectIntent(userQuery);

  if (intent === INTENT_TYPES.RULES_QUERY) {
    const evidence = retrieveRulesFact(userQuery);

    if (!evidence.found || evidence.confidence < 0.80) {
      return {
        intent,
        rules_pathway: true,
        ground_truth_found: false,
        alex_response: "Ah, now that is a very specific situational question! I will not guess a ruling without checking the official R&A Decision Book. Let me look that exact scenario up for you so we get it right on the scorecard.",
        evidence_source: null,
      };
    }

    // Evidence found -> Render with Alex personality (NOT an encyclopedia quote)
    const rule = evidence.rule;
    const alexExplanation = `Ah, now we are into the slightly mischievous part of the Rules! Regarding ${rule.title}: under ${rule.rule_number}, you take ${rule.penalty_strokes} penalty stroke. ${rule.summary} Remember, the Rules are there to protect the field, my friend!`;

    return {
      intent,
      rules_pathway: true,
      ground_truth_found: true,
      rule_number: rule.rule_number,
      canonical_source: rule.canonical_source,
      confidence: evidence.confidence,
      alex_response: alexExplanation,
    };
  }

  if (intent === INTENT_TYPES.STORYTELLING_PODCAST || formatMode === 'podcast_script') {
    const dialogue = generateAlexDavidDialogue({ topic: userQuery, userQuestion: userQuery });
    return {
      intent: INTENT_TYPES.STORYTELLING_PODCAST,
      rules_pathway: false,
      script: dialogue,
      alex_response: `${dialogue.dialogue[1].speaker}: ${dialogue.dialogue[1].text}\n${dialogue.dialogue[2].speaker}: ${dialogue.dialogue[2].text}\n${dialogue.dialogue[3].speaker}: ${dialogue.dialogue[3].text}`,
    };
  }

  // General conversation
  return {
    intent,
    rules_pathway: false,
    alex_response: "Mais oui! Welcome to the golf course, my friend. What club are we taking out of the bag today?",
  };
}
