/**
 * Alex Wenger Golf Platform - Persona Interaction Matrix & Information Flow
 *
 * Implements the Persona Interaction Matrix:
 * Maps Primary Expertise, Needs From, and Can Contribute To across all 9 personas.
 *
 * Enforces "Specialisation Without Isolation".
 *
 * @module alex-wenger-golf/core/orchestration/interactionMatrix
 */

export const PERSONA_INTERACTION_MATRIX = Object.freeze({
  PUTTSER: {
    persona: 'PUTTSER',
    primary_expertise: 'Putting & Green Reading',
    needs_from: ['Statty', 'Zenner'],
    can_contribute_to: ['Caddy', 'Alex'],
    key_question: 'What does the golfer actually experience on the green?',
  },
  Statty: {
    persona: 'Statty',
    primary_expertise: 'Performance Data & Strokes Gained',
    needs_from: ['Everyone'],
    can_contribute_to: ['Everyone'],
    key_question: 'What does the data reveal?',
  },
  Judge: {
    persona: 'Judge',
    primary_expertise: 'Rules & Governance Integrity',
    needs_from: ['Context'],
    can_contribute_to: ['Everyone'],
    key_question: 'What happens when we are not certain?',
  },
  Zenner: {
    persona: 'Zenner',
    primary_expertise: 'Psychology & Emotional Performance',
    needs_from: ['Statty', 'Swingsy'],
    can_contribute_to: ['Everyone'],
    key_question: 'What is happening between the golfer’s ears?',
  },
  Swingsy: {
    persona: 'Swingsy',
    primary_expertise: 'Swing Mechanics & Kinematics',
    needs_from: ['Statty', 'Fitty', 'Sticks'],
    can_contribute_to: ['Caddy'],
    key_question: 'What is the movement telling us?',
  },
  Fitty: {
    persona: 'Fitty',
    primary_expertise: 'Physical Performance & Recovery',
    needs_from: ['Swingsy', 'Golfer History'],
    can_contribute_to: ['Swingsy', 'Caddy'],
    key_question: 'Can the golfer physically execute the solution?',
  },
  Caddy: {
    persona: 'Caddy',
    primary_expertise: 'Strategy & On-Course Decision Making',
    needs_from: ['Everyone'],
    can_contribute_to: ['Golfer'],
    key_question: 'What should the golfer do with all this information?',
  },
  Sticks: {
    persona: 'Sticks',
    primary_expertise: 'Equipment & Shaft Fitting',
    needs_from: ['Statty', 'Swingsy'],
    can_contribute_to: ['Caddy'],
    key_question: 'Does the equipment actually matter?',
  },
  Al: {
    persona: 'Al',
    primary_expertise: 'Conversation & Media Orchestration',
    needs_from: ['Everyone'],
    can_contribute_to: ['Audience'],
    key_question: 'How do you decide who needs to speak?',
  },
});

/**
 * Retrieve interaction flow rules for a specific persona.
 * @param {string} personaName
 * @returns {object} Interaction flow object
 */
export function getInteractionFlow(personaName = '') {
  const key = Object.keys(PERSONA_INTERACTION_MATRIX).find(
    k => k.toLowerCase() === String(personaName).toLowerCase()
  );
  return PERSONA_INTERACTION_MATRIX[key] || PERSONA_INTERACTION_MATRIX.Al;
}
