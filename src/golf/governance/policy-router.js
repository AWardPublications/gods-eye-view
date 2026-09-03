/**
 * Alex Wenger² Policy Router & Pathway Selector
 * Implements Claim 1 & Claim 2 (Deterministic Routing & Supervisory Pathway Activation)
 */

import { evaluatePolicy } from '../../governance/evaluate.js';

export const OPERATING_MODES = {
  TRAIN: {
    id: "TRAIN",
    action: "TRAIN",
    default_pathway: "MECHANICAL_PRACTICE",
    requires_supervision: false,
    requires_career_optin: false
  },
  PREPARE: {
    id: "PREPARE",
    action: "SEARCH",
    default_pathway: "TACTICAL_SCOUTING",
    requires_supervision: false,
    requires_career_optin: false
  },
  COMPETE: {
    id: "COMPETE",
    action: "EXECUTE",
    default_pathway: "LIVE_COMPETITION_PACING",
    requires_supervision: true,
    requires_career_optin: false
  },
  REVIEW: {
    id: "REVIEW",
    action: "INFER",
    default_pathway: "POST_ROUND_LONGITUDINAL",
    requires_supervision: false,
    requires_career_optin: false
  },
  CAREER: {
    id: "CAREER",
    action: "SHARE",
    default_pathway: "MULTI_SEASON_PROJECTION",
    requires_supervision: false,
    requires_career_optin: true
  }
};

export class PolicyRouter {
  constructor() {
    this.version = "1.0.0";
  }

  async routeRequest(modeKey, consentState, thresholdEvaluation, context = {}) {
    const modeConfig = OPERATING_MODES[modeKey] || OPERATING_MODES.TRAIN;
    
    // Construct DNSL standard envelope
    const envelope = {
      object_id: `urn:davincia:alex-wenger:telemetry_session:${modeConfig.id.toLowerCase()}`,
      object_type: "telemetry_session",
      domain: "alex-wenger",
      version: "1.0.0",
      lifecycle_state: "SUBMITTED",
      provenance: {
        source_type: "COMMUNITY",
        source_reference: "Wenger AI Coach Telemetry",
        geographic_origin: { latitude: 46.2276, longitude: 7.3589 }, // Sion, Switzerland
        collected_at: new Date().toISOString()
      },
      verification: { state: "UNVERIFIED", evidence_ref: "" },
      sensitivity: { classification: "PUBLIC_RESTRICTED" },
      payload: {
        athlete_consent: !!consentState.athlete_consent,
        human_supervision: !!consentState.human_supervision,
        career_opt_in: !!consentState.career_opt_in
      }
    };

    const mockActor = { id: context.actor_id || "urn:davincia:identity:user:coach", class: "HUMAN" };

    // 1. Evaluate DaVinciA+ Constitutional Policy
    const decision = await evaluatePolicy(envelope, modeConfig.action, mockActor);

    if (decision.status !== "ALLOW") {
      return {
        status: "DENIED",
        pathway: "REFUSAL_GATE",
        pathway_type: "BLOCKED",
        mode: modeConfig.id,
        policy_decision: decision,
        reason_code: decision.reason_code,
        message: decision.reason_code === "SUPERVISION_REQUIRED"
          ? "Refusal: Competition mode requires certified human coach supervision."
          : "Refusal: Blocked by DaVinciA+ Ethical Custody rules.",
        router_version: this.version
      };
    }

    // 2. Claim 2: Determine Default vs. Supervisory Processing Pathway
    let pathwayType = "DEFAULT";
    let selectedPathway = modeConfig.default_pathway;

    // Route to supervisory pathway if persistent deviation or supervision active
    if (thresholdEvaluation?.is_persistent || modeConfig.requires_supervision) {
      pathwayType = "SUPERVISORY";
      selectedPathway = `${modeConfig.default_pathway}_SUPERVISORY`;
    }

    return {
      status: "AUTHORIZED",
      pathway: selectedPathway,
      pathway_type: pathwayType,
      mode: modeConfig.id,
      policy_decision: decision,
      reason_code: "APPROVED",
      router_version: this.version
    };
  }
}
