import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPassport, PassportStates, ParticipantTypes } from './passport.js';
import { DaVinciAPlatformClient } from './client.js';

const client = new DaVinciAPlatformClient();

// Helper to make a standard clean human passport
function makeCleanHuman() {
  return buildPassport(
    { id: "urn:davincia:identity:user:david", name: "David O'Connor" },
    ParticipantTypes.HUMAN,
    ["READ", "TRANSLATE"]
  );
}

test('Platform: 1. Valid human passport admission', async () => {
  const p = makeCleanHuman();
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
});

test('Platform: 2. Valid organisation passport admission', async () => {
  const p = buildPassport(
    { id: "urn:davincia:identity:organization:brehon_ai", name: "Brehon AI" },
    ParticipantTypes.ORGANIZATION,
    ["READ", "PUBLISH"]
  );
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
});

test('Platform: 3. Valid AI-agent passport admission', async () => {
  const p = buildPassport(
    { id: "urn:davincia:identity:agent:authorized-agent-corklan", name: "Authorized Slang Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ", "TRANSLATE"]
  );
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
});

test('Platform: 4. Valid application passport admission', async () => {
  const p = buildPassport(
    { id: "urn:davincia:identity:app:gods-eye-view", name: "Gods Eye View Console" },
    ParticipantTypes.APPLICATION,
    ["READ", "DISPLAY"]
  );
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
});

test('Platform: 5. Valid knowledge-asset passport admission', async () => {
  const p = buildPassport(
    { id: "urn:davincia:knowledge:asset:acting-the-gowl", name: "Acting the gowl" },
    ParticipantTypes.KNOWLEDGE_ASSET,
    ["READ"]
  );
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
});

test('Platform: 6. Unknown participant validation fails', async () => {
  const p = buildPassport(
    { id: "urn:davincia:identity:system:future-participant-x", name: "FutureParticipant-X" },
    "UNKNOWN",
    ["READ"]
  );
  const d = await client.requestAuthorization(p, "READ");
  assert.equal(d.decision, "DENY");
  assert.equal(d.reason_code, "UNKNOWN_PARTICIPANT");
});

test('Platform: 7. Missing identity validation fails', async () => {
  const p = makeCleanHuman();
  delete p.identity;
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "MALFORMED_PASSPORT");
});

test('Platform: 8. Missing provenance validation fails', async () => {
  const p = makeCleanHuman();
  delete p.provenance;
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "MALFORMED_PASSPORT");
});

test('Platform: 9. Invalid signature validation fails', async () => {
  const p = makeCleanHuman();
  p.verification.state = "UNVERIFIED";
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "UNVERIFIED_PASSPORT");
});

test('Platform: 10. Expired passport admission fails', async () => {
  const p = makeCleanHuman();
  p.expires_at = new Date(Date.now() - 1000).toISOString();
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "PASSPORT_EXPIRED");
});

test('Platform: 11. Suspended passport admission fails', async () => {
  const p = makeCleanHuman();
  p.status = PassportStates.SUSPENDED;
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "SUSPENDED_PASSPORT");
});

test('Platform: 12. Manifest drift detection', async () => {
  const p = makeCleanHuman();
  p.governance.drift_hash = "sha256-drifted-metadata";
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
  assert.equal(adm.reason_code, "DRIFT_DETECTED");
  assert.ok(adm.requalification_required);
});

test('Platform: 13. Policy drift validation fails', async () => {
  const p = makeCleanHuman();
  p.governance.drift_hash = "sha256-drifted-policy";
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "DENY");
});

test('Platform: 14. Unknown action evaluation fails', async () => {
  const p = makeCleanHuman();
  const d = await client.requestAuthorization(p, "UNKNOWN_ACTION");
  assert.equal(d.decision, "DENY");
});

test('Platform: 15. Unknown capability validation fails', async () => {
  const p = makeCleanHuman();
  const d = await client.requestAuthorization(p, "PUBLISH"); // PUBLISH is not in declared_capabilities
  assert.equal(d.decision, "DENY");
  assert.equal(d.reason_code, "INSUFFICIENT_CAPABILITIES");
});

test('Platform: 16. Policy unavailable evaluation handling', async () => {
  const p = makeCleanHuman();
  p.domain = "nonexistent-domain";
  // Fallback to DENY when resolver fails
  const d = await client.requestAuthorization(p, "READ");
  assert.equal(d.decision, "DENY");
});

test('Platform: 17. Human authority requirement for AI agents', async () => {
  const agentPassport = buildPassport(
    { id: "urn:davincia:identity:agent:unauthorized-bot", name: "Agent Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ", "TRANSLATE"]
  );
  
  // Without human actor class -> REVIEW_REQUIRED
  const d = await client.requestAuthorization(agentPassport, "TRANSLATE", { id: "agent", class: "AI_AGENT" });
  assert.equal(d.decision, "REVIEW_REQUIRED");
  assert.equal(d.reason_code, "HUMAN_AUTHORITY_REQUIRED");
});

test('Platform: 18. Unauthorized AI agent', async () => {
  const agentPassport = buildPassport(
    { id: "urn:davincia:identity:agent:unauthorized-bot", name: "Agent Bot" },
    ParticipantTypes.AI_AGENT,
    ["READ"]
  );
  // Attempts action TRANSLATE which is not in declared_capabilities
  const d = await client.requestAuthorization(agentPassport, "TRANSLATE");
  assert.equal(d.decision, "DENY");
});

test('Platform: 19. Successful admission', async () => {
  const p = makeCleanHuman();
  const adm = await client.requestAdmission(p);
  assert.equal(adm.decision, "ALLOW");
  assert.equal(adm.admitted_passport.status, PassportStates.AUTHORIZED);
});

test('Platform: 20. Successful contextual authorization', async () => {
  const p = makeCleanHuman();
  const d = await client.requestAuthorization(p, "READ");
  assert.equal(d.decision, "ALLOW");
});

test('Platform: 21. Authorization denied after drift', async () => {
  const p = makeCleanHuman();
  p.governance.drift_hash = "sha256-metadata-modified";
  const d = await client.requestAuthorization(p, "READ");
  assert.equal(d.decision, "DENY");
  assert.equal(d.reason_code, "DRIFT_DETECTED");
});

test('Platform: 22. Requalification required after drift', async () => {
  const p = makeCleanHuman();
  p.governance.drift_hash = "sha256-metadata-drifted";
  const d = await client.requestAuthorization(p, "READ");
  assert.ok(d.requalification_required);
});
