export function monitorSystem(systemId, activeManifest) {
  if (!activeManifest) {
    return {
      status: "SUSPENDED",
      reason: "Active manifest removed"
    };
  }

  return {
    status: "MONITORED",
    system_id: systemId,
    last_check: new Date().toISOString()
  };
}
