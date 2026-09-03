import { LifecycleStates } from './lifecycle.js';

const RECOGNIZED_DOMAINS = ["corklan", "arios", "alex-wenger", "david-os", "fixture-os"];

export function discoverSystem(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return {
      lifecycle_state: LifecycleStates.DISCOVERED,
      recognized: false,
      policy_status: "UNKNOWN",
      decision: "HOLD",
      errors: ["Invalid manifest object"]
    };
  }

  const required = ["system_id", "name", "version", "domain", "capabilities", "required_controls"];
  const errors = [];
  for (const r of required) {
    if (!manifest[r]) {
      errors.push(`Missing manifest required attribute: '${r}'`);
    }
  }

  if (errors.length > 0) {
    return {
      lifecycle_state: LifecycleStates.DISCOVERED,
      recognized: false,
      policy_status: "UNKNOWN",
      decision: "HOLD",
      errors
    };
  }

  const recognized = RECOGNIZED_DOMAINS.includes(manifest.domain);
  return {
    lifecycle_state: LifecycleStates.DISCOVERED,
    system_id: manifest.system_id,
    recognized,
    policy_status: recognized ? "MAPPED" : "UNKNOWN",
    decision: recognized ? "PROCEED" : "HOLD",
    errors: []
  };
}
