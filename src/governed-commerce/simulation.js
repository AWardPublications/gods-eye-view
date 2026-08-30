import { buildPassport, ParticipantTypes, PassportStates } from '../platform/passport.js';
import { issueDelegationToken } from '../agent-economy/delegation.js';
import { processAgentRequest } from '../agent-economy/api.js';
import { createLicenseAgreement } from './licensing.js';
import { clearTransaction } from './settlement.js';

export function createSeededRandom(seed) {
  let h = seed;
  return function() {
    h = (h * 1664525 + 1013904223) % 4294967296;
    return h / 4294967296;
  };
}

export async function runDeterministicSimulation(seed = 12345, transactionCount = 1000) {
  const rand = createSeededRandom(seed);
  
  const stats = {
    total_processed: 0,
    allowed_requests: 0,
    denied_requests: 0,
    settled_transactions: 0,
    failed_transactions: 0,
    unauthorized_settlements: 0,
    total_revenue_usd: 0,
    platform_fees_usd: 0,
    scenarios: {
      NORMAL: 0,
      EXPIRED_HUMAN: 0,
      EXPIRED_DELEGATION: 0,
      SCOPE_VIOLATION: 0,
      DRIFTED_ASSET: 0,
      RATE_LIMIT: 0,
      SPOOFED_HOSTILE: 0,
      CONFLICTING_POLICY: 0
    }
  };

  const records = [];

  for (let i = 0; i < transactionCount; i++) {
    stats.total_processed++;

    // Pick scenario deterministically based on random sequence
    const roll = rand();
    let scenario = "NORMAL";
    if (roll < 0.40) {
      scenario = "NORMAL";
    } else if (roll < 0.50) {
      scenario = "EXPIRED_HUMAN";
    } else if (roll < 0.60) {
      scenario = "EXPIRED_DELEGATION";
    } else if (roll < 0.70) {
      scenario = "SCOPE_VIOLATION";
    } else if (roll < 0.80) {
      scenario = "DRIFTED_ASSET";
    } else if (roll < 0.87) {
      scenario = "RATE_LIMIT";
    } else if (roll < 0.94) {
      scenario = "SPOOFED_HOSTILE";
    } else {
      scenario = "CONFLICTING_POLICY";
    }

    stats.scenarios[scenario]++;

    // 1. Build Supervisor Human Passport
    const isHumanExpired = (scenario === "EXPIRED_HUMAN");
    const humanExp = isHumanExpired 
      ? new Date(Date.now() - 3600000).toISOString() // Expired 1 hour ago
      : new Date(Date.now() + 3600000 * 24).toISOString();
      
    const humanPassport = {
      passport_id: `urn:davincia:passport:human:user-${i}`,
      passport_version: "1.0.0",
      participant_type: "HUMAN",
      status: (scenario === "EXPIRED_HUMAN" && rand() > 0.5) ? PassportStates.SUSPENDED : PassportStates.ACTIVE,
      identity: { id: `urn:davincia:identity:user:user-${i}`, name: `User ${i}` },
      declared_capabilities: ["READ", "TRANSLATE"],
      issued_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      expires_at: humanExp,
      drift_threshold_seconds: 60,
      issuer_signature: `DAVINCIA-ROOT-SIGNATURE-user-${i}`
    };

    // 2. Build AI Agent Passport
    const agentPassport = {
      passport_id: `urn:davincia:passport:ai_agent:bot-${i}`,
      passport_version: "1.0.0",
      participant_type: (scenario === "SPOOFED_HOSTILE" && rand() > 0.5) ? "ROGUE_PROCESS" : "AI_AGENT",
      status: PassportStates.ACTIVE,
      identity: { id: `urn:davincia:identity:agent:bot-${i}`, name: `Bot ${i}` },
      declared_capabilities: ["READ", "TRANSLATE"],
      issued_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      expires_at: new Date(Date.now() + 3600000 * 24).toISOString(),
      drift_threshold_seconds: 60,
      issuer_signature: `DAVINCIA-ROOT-SIGNATURE-bot-${i}`
    };

    // 3. Build Delegation Token
    const isDelegationExpired = (scenario === "EXPIRED_DELEGATION");
    const delExp = isDelegationExpired
      ? new Date(Date.now() - 60000).toISOString() // Expired 1 minute ago
      : new Date(Date.now() + 3600000).toISOString();

    const delegationToken = {
      token_id: `urn:davincia:delegation:token:${i}`,
      token_version: "1.0.0",
      delegator_id: humanPassport.passport_id,
      receiver_id: agentPassport.passport_id,
      permitted_scopes: (scenario === "SCOPE_VIOLATION") ? ["SEARCH"] : ["READ", "TRANSLATE"],
      issued_at: new Date(Date.now() - 3600000).toISOString(),
      expires_at: delExp,
      status: (scenario === "EXPIRED_DELEGATION" && rand() > 0.5) ? "REVOKED" : "ACTIVE",
      signature: `DAVINCIA-DELEGATION-SIGNATURE-${i}`
    };

    // 4. Build Knowledge Asset
    const isDrifted = (scenario === "DRIFTED_ASSET");
    const assetId = `urn:davincia:knowledge:asset:phrase-${i}`;
    const pricing = (scenario === "CONFLICTING_POLICY") ? 0.00 : 0.05;

    const licenseAgreement = createLicenseAgreement(
      assetId,
      "urn:davincia:identity:organization:brehon_ai",
      "USAGE_BASED",
      pricing
    );

    // 5. Execute Gateway Request
    const request = {
      agentPassport,
      humanPassport,
      delegationToken,
      assetId,
      action: "READ",
      purpose: "BATCH_SIMULATION_RUN",
      modelTier: "MINI",
      inputTokens: 1000,
      outputTokens: 2000
    };

    // Simulate rate-limiting check
    let accessDecision = null;
    if (scenario === "RATE_LIMIT") {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-rate-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "RATE_LIMIT_EXCEEDED"
      };
    } else if (scenario === "SPOOFED_HOSTILE" && agentPassport.participant_type !== "AI_AGENT") {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-spoof-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "INVALID_PARTICIPANT"
      };
    } else if (scenario === "EXPIRED_HUMAN" || humanPassport.status === PassportStates.SUSPENDED) {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-human-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "EXPIRED_SUPERVISOR"
      };
    } else if (scenario === "EXPIRED_DELEGATION" || delegationToken.status === "REVOKED") {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-del-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "INVALID_DELEGATION"
      };
    } else if (scenario === "SCOPE_VIOLATION") {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-scope-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "SCOPE_VIOLATION"
      };
    } else if (isDrifted) {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-drift-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "PROVENANCE_DRIFT"
      };
    } else if (scenario === "CONFLICTING_POLICY") {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-deny-conflict-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "DENY",
        reason_code: "CONFLICTING_POLICY_BLOCK"
      };
    } else {
      accessDecision = {
        decision_id: `urn:davincia:decision:mock-allow-${i}`,
        participant_id: agentPassport.passport_id,
        action: "READ",
        decision: "ALLOW"
      };
    }

    if (accessDecision.decision === "ALLOW") {
      stats.allowed_requests++;
    } else {
      stats.denied_requests++;
    }

    // Clear transaction downstream of governance decision
    const tx = clearTransaction(accessDecision, licenseAgreement, `MOCK_TOKEN_${i}`);

    if (tx.status === "SETTLED") {
      stats.settled_transactions++;
      stats.total_revenue_usd += tx.provider_share;
      stats.platform_fees_usd += tx.governor_share;

      // Sovereign validation: if settled, decision must be ALLOW
      if (accessDecision.decision !== "ALLOW" && accessDecision.decision !== "ALLOW_WITH_CONSTRAINTS") {
        stats.unauthorized_settlements++;
      }
    } else {
      stats.failed_transactions++;
      
      // Sovereign validation: if denied, price charged must be exactly 0
      if (tx.price !== 0.00 || tx.provider_share !== 0.00 || tx.governor_share !== 0.00) {
        stats.unauthorized_settlements++;
      }
    }

    records.push({
      run_index: i,
      scenario,
      decision: accessDecision.decision,
      reason_code: accessDecision.reason_code || "ALLOWED",
      settlement_status: tx.status,
      settlement_reason: tx.reason_code,
      charged_price: tx.price,
      provider_share: tx.provider_share,
      governor_share: tx.governor_share
    });
  }

  // Format statistics numerical roundings
  stats.total_revenue_usd = Number(stats.total_revenue_usd.toFixed(4));
  stats.platform_fees_usd = Number(stats.platform_fees_usd.toFixed(4));

  return { stats, records };
}
