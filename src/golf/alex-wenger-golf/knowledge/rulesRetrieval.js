/**
 * Alex Wenger Golf Platform - Strict Knowledge Retrieval & Source Validation
 *
 * Separates raw ground-truth facts from personality rendering.
 *
 * @module alex-wenger-golf/knowledge/rulesRetrieval
 */

import rulesData from './sources/rules_usga_ra.json' with { type: 'json' };

/**
 * Retrieve verified ground-truth rules evidence.
 * @param {string} query
 * @returns {{found: boolean, rule: object|null, confidence: number, source: string}}
 */
export function retrieveRulesFact(query = '') {
  const q = String(query).toLowerCase();

  if (q.includes('out of bounds') || q.includes('ob') || q.includes('lost ball')) {
    return {
      found: true,
      rule: rulesData.rules['18.2'],
      confidence: 0.98,
      source: rulesData.rules['18.2'].canonical_source,
    };
  }

  if (q.includes('water') || q.includes('penalty area') || q.includes('hazard')) {
    return {
      found: true,
      rule: rulesData.rules['17.1'],
      confidence: 0.99,
      source: rulesData.rules['17.1'].canonical_source,
    };
  }

  if (q.includes('unplayable')) {
    return {
      found: true,
      rule: rulesData.rules['19.2'],
      confidence: 0.97,
      source: rulesData.rules['19.2'].canonical_source,
    };
  }

  if (q.includes('drop') || q.includes('knee height')) {
    return {
      found: true,
      rule: rulesData.rules['14.3'],
      confidence: 0.99,
      source: rulesData.rules['14.3'].canonical_source,
    };
  }

  // Insufficient confidence / source evidence -> Refuse to invent ruling
  return {
    found: false,
    rule: null,
    confidence: 0.0,
    source: 'None',
  };
}
