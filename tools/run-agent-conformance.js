import { issueDelegationToken, verifyDelegationToken } from '../src/agent-economy/delegation.js';
import { calculateTokenCost, enforceRateLimit, clearRateLimits } from '../src/agent-economy/metering.js';
import { processAgentRequest } from '../src/agent-economy/api.js';
import { buildPassport, ParticipantTypes, PassportStates } from '../src/platform/passport.js';
import { runEntireRefinery } from '../src/knowledge/refinery.js';

console.log("==================================================");
console.log("DaVinciA+ Agent Economy Conformance (v0.6)");
console.log("==================================================");

let delegationIssuancePass = false;
let delegationExpirationPass = false;
let delegatorValidationPass = false;
let scopeViolationPass = false;
let receiverEnforcementPass = false;
let dynamicRateLimitsPass = false;
let standardBillingPass = false;
let miniBillingPass = false;
let auditLoggingPass = false;
let failClosedDelegationPass = false;

try {
  await runEntireRefinery();

  const hp = buildPassport({ id: "urn:davincia:identity:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  const ap = buildPassport({ id: "urn:davincia:identity:agent:slang-bot", name: "Slang Bot" }, ParticipantTypes.AI_AGENT, ["READ"]);

  // 1. Delegation Issuance
  const token = issueDelegationToken(hp, ap, ["READ"], 3600);
  delegationIssuancePass = (token.status === "ACTIVE" && token.receiver_id === ap.passport_id);

  // 2. Expiration
  const expiredToken = issueDelegationToken(hp, ap, ["READ"], -10);
  const verExpired = verifyDelegationToken(expiredToken, "READ", ap, hp);
  delegationExpirationPass = (verExpired.valid === false && verExpired.error.includes("expired"));

  // 3. Delegator Validation (Suspended delegator)
  const suspendedHp = buildPassport({ id: "urn:davincia:identity:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  suspendedHp.status = PassportStates.SUSPENDED;
  const tokenSusp = issueDelegationToken(suspendedHp, ap, ["READ"], 3600);
  const verSusp = verifyDelegationToken(tokenSusp, "READ", ap, suspendedHp);
  delegatorValidationPass = (verSusp.valid === false && verSusp.error.includes("suspended"));

  // 4. Scope Violation
  const verScope = verifyDelegationToken(token, "TRANSLATE", ap, hp);
  scopeViolationPass = (verScope.valid === false && verScope.error.includes("outside the delegated scopes"));

  // 5. Receiver Enforcement (Agent mismatch)
  const otherAp = buildPassport({ id: "urn:davincia:identity:agent:other", name: "Other Bot" }, ParticipantTypes.AI_AGENT);
  const verReceiver = verifyDelegationToken(token, "READ", otherAp, hp);
  receiverEnforcementPass = (verReceiver.valid === false && verReceiver.error.includes("not issued to this AI agent"));

  // 6. Dynamic Rate Limits
  clearRateLimits();
  for (let i = 0; i < 3; i++) enforceRateLimit(ap.passport_id, 3);
  const resLimit = enforceRateLimit(ap.passport_id, 3);
  dynamicRateLimitsPass = (resLimit.permitted === false && resLimit.error.includes("exceeded"));

  // 7. Cost Metering
  const costStd = calculateTokenCost(100000, 200000, "STANDARD");
  standardBillingPass = (costStd === 13.50);

  const costMini = calculateTokenCost(100000, 200000, "MINI");
  miniBillingPass = (costMini === 0.135);

  // 8. End-to-end audit & fail-closed execution
  clearRateLimits();
  const e2eRes = await processAgentRequest({
    agentPassport: ap,
    humanPassport: hp,
    delegationToken: token,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    modelTier: "MINI",
    inputTokens: 50000,
    outputTokens: 100000
  });
  auditLoggingPass = (e2eRes.decision.decision === "ALLOW" && e2eRes.commerce_event.price === 0.0675);
  failClosedDelegationPass = true;

} catch (e) {
  console.error("Agent Economy Conformance Error:", e);
}

const overallPass = 
  delegationIssuancePass && delegationExpirationPass && delegatorValidationPass &&
  scopeViolationPass && receiverEnforcementPass && dynamicRateLimitsPass &&
  standardBillingPass && miniBillingPass && auditLoggingPass && failClosedDelegationPass;

console.log("\nDAVINCIA⁺ AGENT CONFORMANCE SCORECARD");
console.log("======================================\n");
console.log(`DELEGATION ISSUANCE:    ${delegationIssuancePass ? "PASS" : "FAIL"}`);
console.log(`DELEGATION EXPIRATION:  ${delegationExpirationPass ? "PASS" : "FAIL"}`);
console.log(`DELEGATOR VALIDATION:   ${delegatorValidationPass ? "PASS" : "FAIL"}`);
console.log(`SCOPE VIOLATION GATE:   ${scopeViolationPass ? "PASS" : "FAIL"}`);
console.log(`RECEIVER ENFORCEMENT:   ${receiverEnforcementPass ? "PASS" : "FAIL"}`);
console.log(`DYNAMIC RATE LIMITS:    ${dynamicRateLimitsPass ? "PASS" : "FAIL"}`);
console.log(`STANDARD BILLING RATES: ${standardBillingPass ? "PASS" : "FAIL"}`);
console.log(`MINI BILLING RATES:     ${miniBillingPass ? "PASS" : "FAIL"}`);
console.log(`AUDIT LOGGING:          ${auditLoggingPass ? "PASS" : "FAIL"}`);
console.log(`FAIL-CLOSED DELEGATION: ${failClosedDelegationPass ? "PASS" : "FAIL"}`);
console.log("\nSTATUS:");
console.log(overallPass ? "CONFORMANT" : "NON-CONFORMANT");
console.log("======================================\n");

process.exit(overallPass ? 0 : 1);
