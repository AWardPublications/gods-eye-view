export const LicenseTemplates = [
  {
    license_id: "urn:davincia:license:brehon-commercial-v1",
    asset_id: "urn:davincia:knowledge:asset:brehon-ip",
    owner: "urn:davincia:identity:organization:brehon_ai",
    permitted_actions: ["READ", "SEARCH"],
    prohibited_actions: ["TRANSFORM"],
    territory: "GLOBAL",
    duration: 30, // days
    participant_scope: ["HUMAN", "ORGANIZATION", "AI_AGENT"],
    agent_scope: ["READ", "TRANSLATE"],
    usage_limits: 10000,
    redistribution: false,
    derivative_use: false,
    attribution: true,
    revocation_conditions: "PROVENANCE_DRIFT_OR_PASSPORT_SUSPENSION"
  },
  {
    license_id: "urn:davincia:license:slang-educational-v1",
    asset_id: "urn:davincia:knowledge:asset:munster-slang",
    owner: "urn:davincia:identity:organization:brehon_ai",
    permitted_actions: ["READ", "TRANSLATE"],
    prohibited_actions: ["PUBLISH"],
    territory: "IE",
    duration: 365,
    participant_scope: ["HUMAN", "ORGANIZATION"],
    agent_scope: [],
    usage_limits: 500,
    redistribution: false,
    derivative_use: true,
    attribution: true,
    revocation_conditions: "POLICY_CHANGE"
  },
  {
    license_id: "urn:davincia:license:arios-enterprise-v1",
    asset_id: "urn:davincia:knowledge:asset:arios-security",
    owner: "urn:davincia:identity:organization:arios_corp",
    permitted_actions: ["READ", "INFER"],
    prohibited_actions: ["EXECUTE"],
    territory: "GLOBAL",
    duration: 30,
    participant_scope: ["ORGANIZATION"],
    agent_scope: ["READ"],
    usage_limits: 1000,
    redistribution: false,
    derivative_use: false,
    attribution: true,
    revocation_conditions: "OS_INTEGRITY_COMPROMISED"
  }
];

export function lookupLicenseTemplate(licenseId) {
  const lic = LicenseTemplates.find(l => l.license_id === licenseId);
  if (!lic) return null;
  return { ...lic };
}
