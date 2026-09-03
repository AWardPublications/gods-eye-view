import { LifecycleStates } from './lifecycle.js';

export function profileSystem(manifest) {
  if (!manifest) return null;

  const dataClasses = manifest.data_classes || ["UNKNOWN"];
  const riskClass = manifest.risk_profile?.declared || "UNKNOWN";

  return {
    lifecycle_state: LifecycleStates.PROFILED,
    system_id: manifest.system_id,
    domain: (manifest.domain || "UNKNOWN").toUpperCase(),
    capabilities: manifest.capabilities || [],
    data_classes: dataClasses,
    actions: manifest.actions || [],
    actors: manifest.actors || [],
    risk_class: riskClass,
    human_oversight_required: manifest.governance?.human_oversight_required ?? true,
    policy_requirements: manifest.governance?.policy_requirements || [],
    potential_sensitivity: dataClasses.includes("biometric") || dataClasses.includes("confidential") ? "HIGH" : "LOW"
  };
}
