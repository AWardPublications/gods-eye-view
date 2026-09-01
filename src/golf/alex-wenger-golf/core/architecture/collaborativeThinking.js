/**
 * Alex Wenger Ecosystem - Collaborative Thinking Engine
 *
 * Implements "Characters Thinking Together":
 * Enables dynamic multi-person dialogue where specialists collaborate, challenge, and refine advice.
 *
 * @module alex-wenger-golf/core/architecture/collaborativeThinking
 */

import { formatExpressiveResponse } from '../vocalGuidance.js';

/**
 * Generate a collaborative thinking dialogue snippet (e.g. Swingsy + Statty).
 * @param {object} params
 * @returns {{topic: string, dialogue: Array<{speaker: string, formatted_speech: string, vocal_cadence: string}>}}
 */
export function generateCollaborativeThinkingDialogue({
  topic = 'swing path vs launch data',
  primarySpecialist = 'Statty',
  secondarySpecialist = 'Swingsy',
} = {}) {
  const statty1 = formatExpressiveResponse('Statty', 'The numbers say your club path is two degrees out-to-in.');
  const swingsy1 = formatExpressiveResponse('Swingsy', "Right, but here's the interesting bit — I don't want you chasing two degrees. I want to know what you're doing that creates it.");
  const statty2 = formatExpressiveResponse('Statty', "But the launch data suggests the problem isn't as consistent as you're describing.");
  const alexAnchor = formatExpressiveResponse('Alex', 'Mais oui! Now we have characters thinking together! Let us look at what your body is feeling right as you turn.');

  return {
    topic,
    dialogue: [statty1, swingsy1, statty2, alexAnchor],
  };
}
