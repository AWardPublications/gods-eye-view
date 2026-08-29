export function calculateGovernanceDelta(oldManifest, newManifest) {
  if (!oldManifest || !newManifest) {
    return {
      status: "INVALIDATED",
      reason: "Missing manifests for comparison",
      actionsRequired: ["HUMAN_REVIEW"]
    };
  }

  const delta = {
    added_actions: [],
    added_classifications: [],
    added_objects: [],
    added_controls: []
  };

  // Compare actions
  const oldActions = (oldManifest.actions || []).map(a => a.name || a);
  const newActions = (newManifest.actions || []).map(a => a.name || a);
  for (const act of newActions) {
    if (!oldActions.includes(act)) {
      delta.added_actions.push(act);
    }
  }

  // Compare classifications / profiles
  const oldProfiles = oldManifest.governance_profile || [];
  const newProfiles = newManifest.governance_profile || [];
  for (const prof of newProfiles) {
    if (!oldProfiles.includes(prof)) {
      delta.added_classifications.push(prof);
    }
  }

  // Compare objects
  const oldObjects = (oldManifest.objects || []).map(o => o.name || o);
  const newObjects = (newManifest.objects || []).map(o => o.name || o);
  for (const obj of newObjects) {
    if (!oldObjects.includes(obj)) {
      delta.added_objects.push(obj);
    }
  }

  // Compare controls
  const oldControls = oldManifest.required_controls || [];
  const newControls = newManifest.required_controls || [];
  for (const ctrl of newControls) {
    if (!oldControls.includes(ctrl)) {
      delta.added_controls.push(ctrl);
    }
  }

  const hasDrift = 
    delta.added_actions.length > 0 ||
    delta.added_classifications.length > 0 ||
    delta.added_objects.length > 0 ||
    delta.added_controls.length > 0;

  return {
    status: hasDrift ? "INVALIDATED" : "CONFORMANT",
    driftDetected: hasDrift,
    delta,
    actionsRequired: hasDrift ? ["HUMAN_REVIEW", "RETEST"] : []
  };
}
