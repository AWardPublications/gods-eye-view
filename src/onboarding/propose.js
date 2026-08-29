import { LifecycleStates } from './lifecycle.js';

export function proposePolicies(profile) {
  if (!profile) return null;

  const proposedPolicies = [];
  const proposedControls = [];

  // Suggest controls based on data class
  if (profile.data_classes.includes("biometric") || profile.data_classes.includes("personal_data")) {
    proposedControls.push("consent_gate");
  }
  if (profile.data_classes.includes("system") || profile.data_classes.includes("confidential")) {
    proposedControls.push("mfa_auth");
  }
  if (profile.human_oversight_required) {
    proposedControls.push("human_signature");
  }

  // Suggest default policy IDs
  if (profile.domain === "CORKLAN") {
    proposedPolicies.push("DAVINCIA-CULTURAL-003");
  } else if (profile.domain === "ARIOS") {
    proposedPolicies.push("DAVINCIA-ARIOS-002");
  } else if (profile.domain === "ALEX-WENGER") {
    proposedPolicies.push("DAVINCIA-GOLF-004");
  } else if (profile.domain === "DAVID-OS") {
    proposedPolicies.push("DAVINCIA-SYSTEM-007");
  } else if (profile.domain === "FIXTURE-OS") {
    proposedPolicies.push("DAVINCIA-SPORTS-005");
  } else {
    proposedPolicies.push("DAVINCIA-CORE-001");
  }

  return {
    lifecycle_state: LifecycleStates.PROPOSED,
    system_id: profile.system_id,
    proposed_policies: proposedPolicies,
    proposed_controls: proposedControls,
    status: "PROPOSED"
  };
}
