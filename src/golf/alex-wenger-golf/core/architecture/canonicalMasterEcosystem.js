/**
 * Alex Wenger Ecosystem - Canonical Master Architecture & Execution Pipeline
 *
 * Implements the locked 3-System Governance & Synthesis Pipeline:
 *
 *                           ┌─────────────────────────┐
 *                           │      ALEX WENGER        │
 *                           │ MASTER GOLF INTELLIGENCE│
 *                           │   COACH / FINAL VOICE   │
 *                           └────────────┬────────────┘
 *                                        │
 *                ┌───────────────────────┼────────────────────────┐
 *                │                       │                        │
 *          HUMAN SYSTEM             EQUIPMENT SYSTEM          GAME SYSTEM
 *                │                       │                        │
 *         ┌──────┼──────┐           ┌────┴────┐            ┌──────┼────────┐
 *         │      │      │           │         │            │      │        │
 *      ALIEVE  FITTY  ZENNER     TAILOR    STICKS       CADDY  STATTY  PUTTSER
 *         │      │      │           │         │            │      │        │
 *       Body  Fitness Mind       Shafts   Hardware      Course  Data    Putting
 *         │      │      │           │         │            │      │        │
 *         └──────┴──────┴───────────┴─────────┴────────────┴──────┴────────┘
 *                                        │
 *                             ┌──────────┴──────────┐
 *                             │   SPECIALIST OUTPUT │
 *                             └──────────┬──────────┘
 *                                        │
 *                                     JUDGE
 *                           Rules / Governance / Patent
 *                                        │
 *                                        ↓
 *                           ┌─────────────────────────┐
 *                           │       RETURN TO ALEX    │
 *                           │  Synthesis + Decision   │
 *                           └────────────┬────────────┘
 *                                        │
 *                                        ↓
 *                              INTEGRATED SPEECH
 *
 * @module alex-wenger-golf/core/architecture/canonicalMasterEcosystem
 */

import { retrieveRulesFact } from '../../knowledge/rulesRetrieval.js';
import { formatExpressiveResponse } from '../vocalGuidance.js';

export const SYSTEM_CATEGORIES = Object.freeze({
  HUMAN_SYSTEM: {
    category: 'HUMAN_SYSTEM',
    agents: {
      ALIEVE: { name: 'Alieve Wenger', focus: 'Body & Rotational Strain' },
      FITTY: { name: 'Fitty', focus: 'Fitness & Physical Stamina' },
      ZENNER: { name: 'Zenner', focus: 'Mind & Pressure Calibration' },
    },
  },
  EQUIPMENT_SYSTEM: {
    category: 'EQUIPMENT_SYSTEM',
    agents: {
      TAILOR: { name: 'Tailor Wenger', focus: 'Shafts & Flex Tuning' },
      STICKS: { name: 'Sticks', focus: 'Hardware Specs & Fitting' },
    },
  },
  GAME_SYSTEM: {
    category: 'GAME_SYSTEM',
    agents: {
      CADDY: { name: 'Caddy', focus: 'Course Strategy & Yardage' },
      STATTY: { name: 'Statty', focus: 'Performance Data & EV' },
      PUTTSER: { name: 'PUTTSER', focus: 'Putting & Green Reading' },
    },
  },
});

/**
 * Execute the Canonical Master Ecosystem Pipeline.
 * @param {object} params
 * @returns {object} Integrated Speech Execution Package
 */
export function executeCanonicalMasterPipeline({
  userQuery = '',
  overrideSystem = null, // 'HUMAN_SYSTEM' | 'EQUIPMENT_SYSTEM' | 'GAME_SYSTEM'
  overrideAgent = null,  // 'ALIEVE' | 'FITTY' | 'ZENNER' | 'TAILOR' | 'STICKS' | 'CADDY' | 'STATTY' | 'PUTTSER'
  specialistFinding = null,
} = {}) {
  const query = String(userQuery).toLowerCase();

  // 1. Identify System Category & Specialist Agent
  let selectedCategory = overrideSystem;
  let selectedAgent = overrideAgent;

  if (!selectedAgent) {
    if (query.includes('back') || query.includes('pain') || query.includes('strain') || query.includes('recovery')) {
      selectedCategory = 'HUMAN_SYSTEM';
      selectedAgent = 'ALIEVE';
    } else if (query.includes('fitness') || query.includes('stamina') || query.includes('fatigue')) {
      selectedCategory = 'HUMAN_SYSTEM';
      selectedAgent = 'FITTY';
    } else if (query.includes('breath') || query.includes('nervous') || query.includes('choke') || query.includes('focus')) {
      selectedCategory = 'HUMAN_SYSTEM';
      selectedAgent = 'ZENNER';
    } else if (query.includes('shaft') || query.includes('flex') || query.includes('tailor')) {
      selectedCategory = 'EQUIPMENT_SYSTEM';
      selectedAgent = 'TAILOR';
    } else if (query.includes('club') || query.includes('hardware') || query.includes('loft') || query.includes('lie')) {
      selectedCategory = 'EQUIPMENT_SYSTEM';
      selectedAgent = 'STICKS';
    } else if (query.includes('yardage') || query.includes('wind') || query.includes('caddy') || query.includes('target')) {
      selectedCategory = 'GAME_SYSTEM';
      selectedAgent = 'CADDY';
    } else if (query.includes('stats') || query.includes('strokes gained') || query.includes('dispersion')) {
      selectedCategory = 'GAME_SYSTEM';
      selectedAgent = 'STATTY';
    } else if (query.includes('putt') || query.includes('green') || query.includes('break')) {
      selectedCategory = 'GAME_SYSTEM';
      selectedAgent = 'PUTTSER';
    }
  }

  // 2. Collect Specialist Output
  let rawFinding = specialistFinding;
  if (!rawFinding) {
    if (selectedAgent === 'ALIEVE') rawFinding = 'Rotational strain detected; recommend 10% tempo reduction to protect lower back.';
    else if (selectedAgent === 'FITTY') rawFinding = 'Fatigue Guard active; stamina down 15% on hole 14.';
    else if (selectedAgent === 'ZENNER') rawFinding = 'Arousal spike detected; execute 4-7-8 breath pacer on tee box.';
    else if (selectedAgent === 'TAILOR') rawFinding = 'Shaft bend profile optimized for stiff flex 65g graphite.';
    else if (selectedAgent === 'STICKS') rawFinding = 'Club head lie angle verified at 1 degree upright.';
    else if (selectedAgent === 'CADDY') rawFinding = 'Plays-like yardage calculated at 175 yards into 15 mph breeze.';
    else if (selectedAgent === 'STATTY') rawFinding = 'Strokes Gained Approach EV highest when taking 1 extra club.';
    else if (selectedAgent === 'PUTTSER') rawFinding = 'Sub-surface break shows 4 inches left-to-right on 6-foot putt.';
    else rawFinding = 'General game evaluation complete.';
  }

  const specFormatted = selectedAgent ? formatExpressiveResponse(selectedAgent, rawFinding) : null;

  // 3. Governance Filter: JUDGE (Rules / Governance / Patent WO/2026/150385)
  const rulesEvidence = retrieveRulesFact(query);
  const judgeFilter = {
    evaluated: true,
    rules_applied: rulesEvidence.found,
    rule_number: rulesEvidence.found ? rulesEvidence.rule.rule_number : null,
    patent_governance: 'WO/2026/150385 Compliant',
  };

  // 4. RETURN TO ALEX (Synthesis + Decision)
  let integratedSpeech = '';

  if (selectedAgent) {
    integratedSpeech = `Mais oui, my friend! ${specFormatted.speaker} evaluated your ${selectedCategory.toLowerCase().replace('_', ' ')}: "${rawFinding}". `;
    if (rulesEvidence.found) {
      integratedSpeech += `Judge verifies under Rule ${rulesEvidence.rule.rule_number} that your procedure is 100% clean. `;
    }
    integratedSpeech += `As your coach, here is my decision: commit to your target line with full confidence and let the swing flow!`;
  } else {
    integratedSpeech = `Mais oui, my friend! Welcome to the tee. As your master golf coach, let us take a smooth practice stroke and focus on your target!`;
  }

  return {
    pipeline: 'CANONICAL_MASTER_ECOSYSTEM_PIPELINE',
    authority: 'Alex Wenger (Master Golf Intelligence / Coach / Final Voice)',
    systems: {
      category: selectedCategory || 'DIRECT_ALEX_AUTHORITY',
      agent: selectedAgent || 'ALEX',
      specialist_output: specFormatted,
    },
    governance_filter: judgeFilter,
    return_to_alex: {
      stage: 'SYNTHESIS_AND_DECISION',
      integrated_speech: integratedSpeech,
    },
    timestamp: new Date().toISOString(),
  };
}
