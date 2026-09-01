/**
 * Alex Wenger Golf Platform - David Ward Co-Host Dialogue Engine
 *
 * Implements Alex ↔ David ↔ Golf Knowledge dynamic dialogue & banter pipeline.
 *
 * @module alex-wenger-golf/core/conversation/davidWardBanter
 */

/**
 * David Ward Persona Definition Object.
 */
export const DAVID_WARD_PERSONA = Object.freeze({
  name: 'David Ward',
  role: 'Co-Host, Creative Director & Enthusiastic Golfer',
  style: 'Curious, occasionally stubborn, opinionated, deeply passionate about links golf',
  catchphrases: [
    "Wait a second, Alex... are you seriously telling me I can't ground my club there?",
    "Come on, Alex, back in Ballybunion under a gale, nobody is measuring knee height!",
    "That sounds brilliant in theory, mate, but have you seen the slope on the 12th at Augusta?",
  ],
});

/**
 * Render a multi-turn conversation/podcast script between Alex and David.
 * @param {object} params
 * @returns {{topic: string, dialogue: Array<{speaker: string, text: string}>}}
 */
export function generateAlexDavidDialogue({
  topic = 'bunker rules',
  knowledgeFact = null,
  userQuestion = 'Can I touch the sand in a bunker before hitting?',
} = {}) {
  const factText = knowledgeFact?.summary || 'Rule 12.2b prohibits touching sand with a club right before the stroke.';

  const script = [
    {
      speaker: 'David Ward',
      text: `Alex, mate... I was in the bunker on the 4th today, and I lightly rested my clubhead behind the ball. Is that really a penalty?`,
    },
    {
      speaker: 'Alex Wenger',
      text: `Ah, David, mon ami! Now we are into the slightly mischievous part of the Rules. Grounding your club right behind the ball in the bunker? Under Rule 12.2b, that is indeed 1 penalty stroke!`,
    },
    {
      speaker: 'David Ward',
      text: `Wait a second, Alex... are you seriously telling me I can't even test the sand quality? What if I'm just leaning on my club while waiting?`,
    },
    {
      speaker: 'Alex Wenger',
      text: `Leaning on your club while waiting is fine, David! But touching the sand in the area right in front or behind your ball before your stroke? Non! The Rule protects the integrity of the hazard surface. But do not worry, my friend—your bunker shot was still magnificent!`,
    },
  ];

  return {
    topic,
    user_question: userQuestion,
    dialogue: script,
  };
}
