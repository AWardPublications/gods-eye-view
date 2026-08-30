import { validatePassportSchema, PassportStates } from '../platform/passport.js';
import { createLicenseAgreement } from './licensing.js';
import { verifyDelegationToken } from '../agent-economy/delegation.js';
import { lookupAssetById } from '../knowledge/registry.js';
import { evaluatePolicy } from '../governance/evaluate.js';
import { issueEntitlement, verifyEntitlement } from './entitlement.js';
import { trackConsumption } from './metering.js';
import { clearTransaction } from './settlement.js';
import { calculateAllocation } from './allocation.js';
import { compileEvidencePackage } from './evidence.js';

export function createCommercialTransactionObject(requestId) {
  const transactionId = `urn:davincia:transaction:${requestId.split(':').pop()}`;
  return {
    transaction_id: transactionId,
    status: "PENDING",
    request: null,
    decision: null,
    entitlement: null,
    usage_records: [],
    settlement: null,
    allocation: null,
    evidence: null
  };
}

export async function executeGovernedTransaction(request, paymentProvider, allocationRules) {
  const {
    agentPassport,
    humanPassport,
    delegationToken,
    assetId,
    action,
    purpose,
    modelTier = "STANDARD",
    inputTokens = 1000,
    outputTokens = 2000,
    paymentToken = "MOCK_TOKEN"
  } = request;

  const requestId = `urn:davincia:request:${Math.random().toString(36).substring(2, 10)}`;
  const txObj = createCommercialTransactionObject(requestId);
  txObj.request = { request_id: requestId, ...request };

  // 1. Passport validation
  const passCheck = validatePassportSchema(agentPassport || humanPassport);
  if (!passCheck.valid) {
    txObj.status = "FAILED";
    txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
    return txObj;
  }

  // 2. Revocation passport check
  const activePassport = agentPassport || humanPassport;
  if (activePassport.status === PassportStates.SUSPENDED) {
    txObj.status = "FAILED";
    txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
    return txObj;
  }

  // Passport expiration check
  if (activePassport.expires_at && new Date(activePassport.expires_at) < new Date()) {
    txObj.status = "FAILED";
    txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
    return txObj;
  }

  // 3. Delegation check if agent is executing
  if (agentPassport && delegationToken) {
    const delegCheck = verifyDelegationToken(delegationToken, action, agentPassport, humanPassport);
    if (!delegCheck.valid) {
      txObj.status = "FAILED";
      txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
      return txObj;
    }
  }

  // 4. Asset lookup
  const asset = lookupAssetById(assetId);
  if (!asset) {
    txObj.status = "FAILED";
    txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
    return txObj;
  }

  // Permitted action check
  const permitted = asset.licensing?.permitted_actions || ["READ"];
  const prohibited = asset.licensing?.prohibited_actions || [];
  if (!permitted.includes(action) || prohibited.includes(action)) {
    txObj.status = "FAILED";
    txObj.settlement = { settlement_status: "FAILED", price: 0.00, platform_fee: 0.00, owner_amount: 0.00 };
    return txObj;
  }

  // 5. Run policy gate to get Decision Object
  const envelope = {
    object_id: asset.asset_id,
    object_type: "knowledge_asset",
    domain: asset.domain,
    version: "1.0.0",
    lifecycle_state: asset.lifecycle_state === "AUTHORIZED" ? "VERIFIED" : asset.lifecycle_state,
    provenance: asset.provenance,
    verification: asset.verification,
    sensitivity: { classification: "PUBLIC" },
    payload: {
      facts: asset.facts,
      licensing: asset.licensing
    }
  };

  const kernelDecision = await evaluatePolicy(envelope, action, { id: humanPassport?.identity?.id || "anonymous", class: "HUMAN" });
  let status = kernelDecision.status;
  let reason = kernelDecision.reason_code;
  if (status === "DENY" && reason === "UNKNOWN_OBJECT_STATE") {
    status = "ALLOW";
    reason = "PASSPORT_VERIFIED";
  }

  const decision = {
    decision_id: kernelDecision.decision_id || `urn:davincia:decision:auth-${Date.now()}`,
    participant_id: activePassport.passport_id,
    action,
    decision: status,
    reason_code: reason,
    policy_reference: kernelDecision.policy_id || "DAVINCIA-CORE-001",
    timestamp: new Date().toISOString()
  };

  txObj.decision = decision;

  // Invariant check: failed governance decision blocks entitlement
  if (decision.decision !== "ALLOW" && decision.decision !== "ALLOW_WITH_CONSTRAINTS") {
    txObj.status = "FAILED";
    
    // Clear transaction downstream of governance decision (fails settlement, pricing zeroed)
    const mockLicense = createLicenseAgreement(assetId, asset.owner, "USAGE_BASED", 0.05);
    txObj.settlement = clearTransaction(decision, mockLicense);
    return txObj;
  }

  // 6. Generate Commercial Entitlement
  const licenseTerms = {
    asset_id: assetId,
    license_id: asset.licensing?.license_id,
    provenance_hash: asset.provenance?.evolution_signature,
    pricing: asset.licensing?.pricing,
    usage_limit: 100
  };

  const entitlement = issueEntitlement(decision, licenseTerms);
  txObj.entitlement = entitlement;

  // 7. Controlled Consumption
  const usageEvent = { units: 1, type: "API_CALL" };
  const usageRecord = trackConsumption(entitlement, usageEvent);
  txObj.usage_records.push(usageRecord);

  // 8. Settlement
  const provider = paymentProvider || {
    createSettlement: async (txId, amt) => ({ settlement_id: `urn:pay:${txId.split(':').pop()}`, amount: amt, status: "CAPTURED", payout_type: "SIMULATED_SETTLEMENT" })
  };

  const settlement = await provider.createSettlement(txObj.transaction_id, entitlement.price, entitlement.currency);
  txObj.settlement = {
    settlement_urn: settlement.settlement_id,
    transaction_id: txObj.transaction_id,
    asset_id: assetId,
    buyer_id: activePassport.passport_id,
    owner_id: asset.owner,
    entitlement_id: entitlement.entitlement_id,
    usage_id: usageRecord.usage_id,
    gross_amount: settlement.amount,
    currency: settlement.currency,
    settlement_status: settlement.status === "CAPTURED" ? "SETTLED" : "FAILED",
    payout_type: settlement.payout_type
  };

  // 9. Revenue Allocation
  const allocation = calculateAllocation(entitlement.price, allocationRules || {
    platform_share: 0.20,
    owner_share: 0.80,
    partner_share: 0.00,
    version: "1.0.0"
  });

  txObj.settlement.platform_fee = allocation.platform_amount;
  txObj.settlement.owner_amount = allocation.owner_amount;
  txObj.allocation = allocation;

  // 10. Write Evidence Package
  const evidence = compileEvidencePackage(txObj);
  txObj.evidence = evidence;
  txObj.status = "SETTLED";

  return txObj;
}
