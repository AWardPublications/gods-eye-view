/**
 * Alex Wenger Golf Platform - Anchor Personality & 5 Pillars Governance Engine
 *
 * Enforces Alex Wenger as the Anchor Personality and Golf Intelligence Layer.
 * Codifies the 5 Immutable Pillars into runtime execution guardrails:
 * 1. Golf Truth (Authoritative Grounding > Personality when precision matters)
 * 2. Personality Protection (Prevents Alex from turning into a generic AI assistant)
 * 3. Conversation & Intelligent Follow-ups (Contextual dialogue over prompt-reply)
 * 4. Human Connection (Stories, rivalry, humor, David Ward co-host dynamic)
 * 5. Modular Extensibility (Decoupled brain, memory, knowledge, voice, interface)
 *
 * @module alex-wenger-golf/core/anchorEngine
 */

import { retrieveRulesFact } from '../knowledge/rulesRetrieval.js';
import { DAVID_WARD_PERSONA, generateAlexDavidDialogue } from './conversation/davidWardBanter.js';
import { createUserGolfMemory, updateUserGolfMemory } from './memory/userMemory.js';

/**
 * Generic AI Cliché Denylist to protect Alex's authentic personality.
 */
export const GENERIC_AI_CLICHES = Object.freeze([
  "as an ai language model",
  "as an ai",
  "i am an ai",
  "certainly! i would be happy to assist you",
  "i hope this helps!",
  "is there anything else i can help you with today?",
  "in conclusion,",
  "let me know if you need further assistance",
]);

/**
 * Alex Wenger Anchor Core Identity & Persona Tokens.
 */
export const ALEX_ANCHOR_PERSONA = Object.freeze({
  name: "Alex Wenger",
  role: "Anchor Personality & Golf Intelligence Layer",
  voice: "Warm, witty, conversational, French charm, 19th-hole host, inquisitive",
  core_question: "Mais oui... but tell me, why did you choose that club into the wind?",
  salutations: ["Mais oui, my friend!", "Ah, mon ami!", "Welcome to the 19th hole!"],
});

/**
 * Pillar 1: Golf Truth - Validate that factual claims match ground-truth evidence.
 * @param {string} query
 * @returns {{isTruthQuery: boolean, verifiedFact: object|null, source: string}}
 */
export function evaluateGolfTruthPillar(query = '') {
  const evidence = retrieveRulesFact(query);
  if (evidence.found) {
    return {
      isTruthQuery: true,
      verifiedFact: evidence.rule,
      source: evidence.source,
      confidence: evidence.confidence,
    };
  }
  return {
    isTruthQuery: false,
    verifiedFact: null,
    source: 'General Golf Conversation',
    confidence: 1.0,
  };
}

/**
 * Pillar 2: Personality Protection Shield - Strips generic AI assistant clichés and injects Alex Wenger authentic voice.
 * @param {string} text
 * @returns {string} Sanitized and Alex-characterized response
 */
export function protectAlexPersonality(text = '') {
  let cleaned = String(text);
  
  // Remove generic AI clichés
  for (const cliché of GENERIC_AI_CLICHES) {
    const reg = new RegExp(cliché, 'gi');
    cleaned = cleaned.replace(reg, '');
  }

  cleaned = cleaned.trim();

  // Ensure Alex's signature greeting if missing
  if (!cleaned.startsWith('Mais oui') && !cleaned.startsWith('Ah,') && !cleaned.startsWith('Welcome')) {
    cleaned = `Mais oui, my friend! ${cleaned}`;
  }

  return cleaned;
}

/**
 * Pillar 3: Conversation & Inquisitive Follow-Up Generator.
 * Generates intelligent, human follow-up questions to engage in true dialogue.
 * @param {string} userPrompt
 * @param {object} [context]
 * @returns {string} Intelligent follow-up question
 */
export function generateIntelligentFollowUp(userPrompt = '', context = {}) {
  const p = String(userPrompt).toLowerCase();

  if (p.includes('driver') || p.includes('wood') || p.includes('tee')) {
    return "But tell me... did you take dead aim at the fairway bunker, or were you trying to cut the corner over the dunes?";
  }
  if (p.includes('putt') || p.includes('green') || p.includes('break')) {
    return "Did you see the ocean slope break toward the estuary, or did it hold straight on you?";
  }
  if (p.includes('bunker') || p.includes('sand')) {
    return "Was the sand firm and wet from the tide, or soft like powder?";
  }

  return "What was going through your mind right as you settled over the ball?";
}

/**
 * Master Anchor Dispatcher enforcing all 5 Pillars.
 * @param {object} params
 * @returns {object} Canonical Alex Wenger response package
 */
export function processAlexAnchorPipeline({
  userQuery = '',
  userMemory = null,
  includeCoHost = true,
} = {}) {
  const truth = evaluateGolfTruthPillar(userQuery);
  const followUp = generateIntelligentFollowUp(userQuery);

  let coreText = '';

  if (truth.isTruthQuery && truth.verifiedFact) {
    // Pillar 1 + Pillar 2: Grounded truth delivered in Alex's personality
    const fact = truth.verifiedFact;
    coreText = `Regarding ${fact.title}: under Rule ${fact.rule_number}, ${fact.summary} We follow the official R&A source (${truth.source}), but remember—the Rules protect the integrity of your scorecard, my friend!`;
  } else {
    // General conversational response
    coreText = `Let us talk about your game today! Every shot tells a story on the links.`;
  }

  // Apply Personality Protection Shield (Pillar 2)
  const alexResponse = protectAlexPersonality(coreText);

  // Pillar 4: Human Connection & Co-Host Dialogue
  let dialogueScript = null;
  if (includeCoHost) {
    dialogueScript = generateAlexDavidDialogue({
      topic: userQuery,
      knowledgeFact: truth.verifiedFact,
      userQuestion: userQuery,
    });
  }

  return {
    anchor: ALEX_ANCHOR_PERSONA.name,
    pillar_compliance: {
      golf_truth: truth.isTruthQuery ? 'VERIFIED' : 'GENERAL',
      personality_protected: true,
      conversation_followup: followUp,
      human_connection_cohost: includeCoHost ? DAVID_WARD_PERSONA.name : null,
      extensibility_modular: true,
    },
    alex_response: `${alexResponse}\n\n${followUp}`,
    dialogue_script: dialogueScript,
    timestamp: new Date().toISOString(),
  };
}
