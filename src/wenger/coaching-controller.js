/**
 * Alex Wenger 5-Mode Coaching Controller
 * Integrates Article 19 Adaptive Engine with DaVinciA+ Constitutional Policy Layer
 */

import { evaluatePolicy } from '../governance/evaluate.js';
import wengerPolicy from '../policies/alex-wenger.policy.json' with { type: 'json' };
import { AlexWengerCoachingEngine } from './wenger-engine.js';

export const WENGER_MODES = {
  TRAIN: {
    id: "TRAIN",
    name: "Drill & Practice",
    action: "TRAIN",
    description: "Structured mechanical advice, tempo regulation, and practice drills."
  },
  PREPARE: {
    id: "PREPARE",
    name: "Pre-Round Tactical",
    action: "SEARCH",
    description: "Course strategy scouting, environmental layout analysis, and tactical game plan."
  },
  COMPETE: {
    id: "COMPETE",
    name: "Live Competition",
    action: "EXECUTE",
    description: "Real-time on-course shot pacing and focus management. Requires active Human Supervision."
  },
  REVIEW: {
    id: "REVIEW",
    name: "Post-Round Review",
    action: "INFER",
    description: "Longitudinal analysis of round telemetry, behavioral drift, and fatigue patterns."
  },
  CAREER: {
    id: "CAREER",
    name: "Career Projection",
    action: "SHARE",
    description: "Multi-year skill development modeling and career telemetry sharing."
  }
};

export class WengerCoachingController {
  constructor() {
    this.engine = new AlexWengerCoachingEngine();
    this.currentMode = "TRAIN";
    
    // Consent and Governance State
    this.athleteConsent = true;
    this.careerOptIn = false;
    this.humanSupervision = false;
    
    // Session State
    this.sessionLogs = [];
  }

  setConsent(athleteConsent, careerOptIn = false, humanSupervision = false) {
    this.athleteConsent = !!athleteConsent;
    this.careerOptIn = !!careerOptIn;
    this.humanSupervision = !!humanSupervision;
  }

  setMode(modeKey) {
    if (!WENGER_MODES[modeKey]) {
      throw new Error(`INVALID_MODE: Unknown mode '${modeKey}'. Allowed modes: ${Object.keys(WENGER_MODES).join(', ')}`);
    }
    this.currentMode = modeKey;
    return WENGER_MODES[modeKey];
  }

  async evaluateAccess(action) {
    const targetPayload = {
      athlete_consent: this.athleteConsent
    };

    if (action === "EXECUTE") {
      targetPayload.human_supervision = this.humanSupervision;
    }
    if (action === "SHARE") {
      targetPayload.career_opt_in = this.careerOptIn;
    }

    const envelope = {
      object_id: `urn:davincia:alex-wenger:telemetry_session:${this.currentMode.toLowerCase()}`,
      object_type: "telemetry_session",
      domain: "alex-wenger",
      version: "1.0.0",
      lifecycle_state: "SUBMITTED",
      provenance: {
        source_type: "COMMUNITY",
        source_reference: "Telemetry Mesh",
        geographic_origin: { latitude: 46.2276, longitude: 7.3589 },
        collected_at: new Date().toISOString()
      },
      verification: { state: "UNVERIFIED", evidence_ref: "" },
      sensitivity: { classification: "PUBLIC_RESTRICTED" },
      payload: targetPayload
    };

    const mockActor = { id: "urn:davincia:identity:user:coach", class: "HUMAN" };
    return await evaluatePolicy(envelope, action, mockActor);
  }

  async processCoachingTurn(userNaturalLanguageInput, templateGuidance = null) {
    const modeConfig = WENGER_MODES[this.currentMode];
    
    // Step 1: Evaluate DaVinciA+ Constitutional Policy
    const decision = await this.evaluateAccess(modeConfig.action);
    
    if (decision.status !== "ALLOW") {
      const refusalEnvelope = {
        status: "DENIED",
        mode: this.currentMode,
        policy_decision: decision,
        reason_code: decision.reason_code,
        message: decision.reason_code === "SUPERVISION_REQUIRED"
          ? "Refusal: Competition execution mode requires certified human coach supervision to activate live pacing guidance."
          : "Refusal: Operation blocked by DaVinciA+ Ethical Custody rules. Athlete consent or career opt-in is not active.",
        coaching_output: {
          text: "[GOVERNANCE REFUSAL - ACTION PROHIBITED]",
          tone_state: "DECAYED",
          tone_framing: "BLOCKED",
          delivery_modality: "NONE"
        }
      };
      this.sessionLogs.push(refusalEnvelope);
      return refusalEnvelope;
    }

    // Step 2: Pass into Article 19 Adaptive Coaching Engine
    const engineResult = this.engine.processInteraction(userNaturalLanguageInput, {
      mode: this.currentMode,
      domain: "golf",
      template_content: templateGuidance
    });

    const successEnvelope = {
      status: "AUTHORIZED",
      mode: this.currentMode,
      policy_decision: decision,
      result: engineResult,
      coaching_output: engineResult.coaching_output
    };

    this.sessionLogs.push(successEnvelope);
    return successEnvelope;
  }
}
