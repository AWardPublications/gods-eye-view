import { calculateGovernanceDelta } from '../governance/delta.js';
import { LifecycleStates } from './lifecycle.js';

export function requalifySystem(oldManifest, newManifest) {
  const delta = calculateGovernanceDelta(oldManifest, newManifest);
  if (delta.driftDetected) {
    return {
      status: "SUSPENDED",
      lifecycle_state: LifecycleStates.SUSPENDED,
      reason: "Governance drift detected",
      delta: delta.delta,
      actionsRequired: delta.actionsRequired
    };
  }

  return {
    status: "AUTHORIZED",
    lifecycle_state: LifecycleStates.AUTHORIZED,
    reason: "No governance drift detected"
  };
}
