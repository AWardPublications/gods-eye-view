import { LifecycleStates } from './lifecycle.js';

export function authorizeSystem(systemId, humanSignaturePresent) {
  if (!humanSignaturePresent) {
    return {
      status: "HOLD",
      reason: "Missing mandatory human signature verification",
      lifecycle_state: LifecycleStates.CONFORMANCE_PENDING
    };
  }

  return {
    status: "AUTHORIZED",
    lifecycle_state: LifecycleStates.AUTHORIZED,
    system_id: systemId,
    authorized_at: new Date().toISOString()
  };
}
