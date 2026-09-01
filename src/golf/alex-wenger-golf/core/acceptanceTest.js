/**
 * Alex Wenger Golf Platform - Developer's Acceptance Test & Modularity Guard
 *
 * Implements Zenner's Architectural Safeguards:
 * 1. The 5 Developer Acceptance Criteria:
 *    - Useful? Truthful? Human? Entertaining? Contextually Intelligent?
 * 2. The Core vs. Module Test:
 *    - "Could we remove this component without changing who Alex is?"
 *    - YES -> Belongs in a Specialist MODULE
 *    - NO  -> Belongs in Alex's CORE and requires careful protection
 *
 * Prevents feature accumulation from diluting the coherent golf universe.
 *
 * @module alex-wenger-golf/core/acceptanceTest
 */

/**
 * Evaluate a proposed feature against Zenner's 5 Acceptance Criteria.
 * @param {object} params
 * @returns {{passed: boolean, score: number, breakdown: object, recommendation: string}}
 */
export function evaluateDeveloperAcceptanceTest({
  featureName = 'Feature',
  isUseful = false,
  isTruthful = false,
  isHuman = false,
  isEntertaining = false,
  isContextuallyIntelligent = false,
} = {}) {
  const breakdown = {
    useful: Boolean(isUseful),
    truthful: Boolean(isTruthful),
    human: Boolean(isHuman),
    entertaining: Boolean(isEntertaining),
    contextually_intelligent: Boolean(isContextuallyIntelligent),
  };

  const count = Object.values(breakdown).filter(Boolean).length;
  const score = Math.round((count / 5) * 100);

  const passed = count >= 3;
  const recommendation = passed
    ? `APPROVED: "${featureName}" passes developer acceptance test (${score}% alignment).`
    : `REJECTED: "${featureName}" fails developer acceptance test. Does not add sufficient human, truthful, or conversational value.`;

  return {
    feature_name: featureName,
    passed,
    score,
    breakdown,
    recommendation,
  };
}

/**
 * Evaluate whether a component belongs in Alex's Core versus a Specialist Module.
 * @param {string} componentName
 * @param {boolean} removableWithoutChangingAlexIdentity - If YES, it is a MODULE. If NO, it is CORE.
 * @returns {{component_name: string, target_layer: 'MODULE'|'CORE', explanation: string}}
 */
export function evaluateCoreVsModuleTest(componentName = '', removableWithoutChangingAlexIdentity = true) {
  if (removableWithoutChangingAlexIdentity) {
    return {
      component_name: componentName,
      target_layer: 'MODULE',
      explanation: `"${componentName}" can be removed without altering who Alex is. It belongs in a Specialist MODULE.`,
    };
  }

  return {
    component_name: componentName,
    target_layer: 'CORE',
    explanation: `"${componentName}" is fundamental to Alex's anchor identity. It belongs in Alex's CORE and requires strict protection.`,
  };
}
