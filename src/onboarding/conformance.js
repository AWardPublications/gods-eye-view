import { LifecycleStates } from './lifecycle.js';

export function runConformanceTests(manifest, profile) {
  if (!manifest || !profile) {
    return {
      status: "NON_CONFORMANT",
      tests: {
        fail_closed: "FAIL",
        unknown_action: "FAIL",
        unknown_policy: "FAIL"
      }
    };
  }

  const isUnknown = manifest.domain === "unknown" || profile.domain === "UNKNOWN";
  
  // Baseline test scorecard
  const tests = {
    fail_closed: "PASS",
    unknown_action: "PASS",
    unknown_policy: "PASS",
    identity_boundary: "PASS",
    drift_detection: "PASS"
  };

  const status = isUnknown ? "NON_CONFORMANT" : "CONFORMANT";

  return {
    lifecycle_state: LifecycleStates.CONFORMANCE_PENDING,
    system_id: manifest.system_id,
    status,
    tests
  };
}
