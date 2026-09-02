/**
 * Alex Wenger Master Golf Intelligence Ecosystem — Knowledge Engine (AWK-v0.2)
 * Governance Patent: WO/2026/150385
 *
 * Implements canonical AWK-v0.2 knowledge blocks:
 * 1. AWK-CM-001: 7/10 Risk-Reward Decision Gate (Take Your Medicine Protocol)
 * 2. AWK-SG-001: Short-Game Selection Hierarchy (Putt > Bump-and-Run > Chip > Pitch > Flop)
 * 3. AWK-FIT-001: Kinetic Grounding & Non-Diagnostic Biophysical Boundaries (EU MDR 2017/745)
 * 4. AWK-PD-001: Long-Term Career Periodization & Load Triage
 *
 * @module alex-wenger-golf/core/knowledge/alexWengerKnowledgeEngine
 */

import knowledgePayloadV2 from '../../../data/alex_wenger_knowledge_v0_2.json' with { type: 'json' };
import knowledgePayloadV3 from '../../../data/alex_wenger_knowledge_v0_3.json' with { type: 'json' };

export class AlexWengerKnowledgeEngine {
  constructor() {
    this.registryV2 = knowledgePayloadV2;
    this.registryV3 = knowledgePayloadV3;
    this.blocks = new Map([
      ...this.registryV2.blocks.map(b => [b.id, b]),
      ...this.registryV3.blocks.map(b => [b.id, b])
    ]);

    this.prohibitedTerms = [
      'recommend', 'advise', 'decide', 'approve',
      'guarantee', 'ensure', 'optimise', 'best'
    ];
  }

  /**
   * Scans and validates synthesized speech text against Prohibited Terms Hard Block (AWK-GOV-001)
   * @param {string} text - Spoken text string
   * @returns {object} { isCompliant, detectedProhibitedTerms, sanitizedText }
   */
  validateVocabularyGating(text = '') {
    if (!text || typeof text !== 'string') {
      return { isCompliant: true, detectedProhibitedTerms: [], sanitizedText: '' };
    }

    const lower = text.toLowerCase();
    const detected = [];

    for (const term of this.prohibitedTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(lower)) {
        detected.push(term);
      }
    }

    let sanitized = text;
    if (detected.length > 0) {
      // Replace prohibited decision verbs with non-authoritative support terms
      sanitized = sanitized
        .replace(/\brecommend\b/gi, 'suggest options for')
        .replace(/\badvise\b/gi, 'share insights on')
        .replace(/\bdecide\b/gi, 'evaluate choice for')
        .replace(/\bapprove\b/gi, 'verify')
        .replace(/\bguarantee\b/gi, 'estimate')
        .replace(/\bensure\b/gi, 'support')
        .replace(/\boptimise\b/gi, 'calibrate')
        .replace(/\bbest\b/gi, 'high-probability');
    }

    return {
      isCompliant: detected.length === 0,
      detectedProhibitedTerms: detected,
      sanitizedText: sanitized,
      exclusively_alex_responsibility: true
    };
  }

  /**
   * Retrieves a specific knowledge block by ID
   * @param {string} blockId - e.g. 'AWK-CM-001'
   * @returns {object|null}
   */
  getBlock(blockId) {
    return this.blocks.get(blockId) || null;
  }

  /**
   * Evaluates Knowledge Block AWK-CM-001: 7/10 Risk-Reward Decision Gate
   * @param {object} scenario - { executionProbability, rewardYards, hazardPenaltyYards, distanceToPin }
   * @returns {object} { decision, targetStrategy, protocol, exclusively_alex_responsibility }
   */
  evaluateRiskRewardGate(scenario = {}) {
    const block = this.getBlock('AWK-CM-001');
    const threshold = block?.content?.execution_threshold || 0.70;
    const probability = scenario.executionProbability ?? 0.65;

    if (probability < threshold) {
      return {
        decision: 'REJECT_HERO_SHOT',
        protocol: 'TAKE_YOUR_MEDICINE',
        targetStrategy: 'GEOMETRIC_CENTER_OF_GREEN_LAYUP',
        executionProbability: probability,
        thresholdRequired: threshold,
        alexAdvice: 'Take your medicine, my friend! Shift target to the fat side of the green for a safe two-putt.',
        exclusively_alex_responsibility: true
      };
    }

    return {
      decision: 'ACCEPT_RISK_ATTACK_PIN',
      protocol: 'AGGRESSIVE_TARGET_COMMITMENT',
      targetStrategy: 'TUCKED_PIN_ATTACK',
      executionProbability: probability,
      thresholdRequired: threshold,
      alexAdvice: 'Execution probability is high (>= 70%). Trust your line and fire at the target!',
      exclusively_alex_responsibility: true
    };
  }

  /**
   * Evaluates Knowledge Block AWK-SG-001: Short-Game Selection Hierarchy
   * @param {object} greensideScenario - { distanceYards, lieType, obstacleBetween, turfCondition }
   * @returns {object} { recommendedShot, hierarchyOrder, reasoning }
   */
  evaluateShortGameSelection(greensideScenario = {}) {
    const block = this.getBlock('AWK-SG-001');
    const hierarchy = block?.content?.selection_hierarchy || ['Putt', 'Bump-and-Run', 'Chip', 'Pitch', 'Flop'];

    const { distanceYards = 15, lieType = 'fringe', obstacleBetween = false, turfCondition = 'firm_links' } = greensideScenario;

    let recommendedShot = 'Putt';
    let reasoning = 'Fringe / clean ground trajectory available. Putt for zero air-time variance.';

    if (obstacleBetween) {
      recommendedShot = 'Pitch';
      reasoning = 'Obstacle present between lie and landing zone. Pitch over hazard.';
    } else if (distanceYards <= 10 && (lieType === 'fringe' || lieType === 'tight_fairway')) {
      recommendedShot = 'Putt';
      reasoning = 'Simplest effective trajectory first: Putt.';
    } else if (turfCondition === 'firm_links' && lieType !== 'rough') {
      recommendedShot = 'Bump-and-Run';
      reasoning = 'Firm links turf favors a low bump-and-run release.';
    } else if (lieType === 'rough') {
      recommendedShot = 'Chip';
      reasoning = 'Rough lie requires short carry chip to green surface.';
    }

    return {
      recommendedShot,
      hierarchyOrder: hierarchy,
      distanceYards,
      reasoning,
      exclusively_alex_responsibility: true
    };
  }

  /**
   * Evaluates Knowledge Block AWK-FIT-001: Kinetic Grounding & Biophysical Non-Diagnostic Boundary
   * @param {object} fitInput - { cadenceRatio, reportPain }
   * @returns {object} { tempoStatus, groundingReset, nonDiagnosticEU_MDR_Compliant }
   */
  evaluateKineticGrounding(fitInput = {}) {
    const block = this.getBlock('AWK-FIT-001');

    return {
      tempoRatioTarget: block?.content?.tempo_ratio_target || '3:1 backswing-to-downswing cadence',
      verticalForceRateMs: block?.content?.vertical_force_rate_ms || 200,
      groundingResetRecommended: true,
      nonDiagnosticEU_MDR_Compliant: true,
      boundaryNotice: 'Non-diagnostic athletic coaching payload. No medical/plantar fascia treatment under EU MDR 2017/745.',
      exclusively_alex_responsibility: true
    };
  }
}
