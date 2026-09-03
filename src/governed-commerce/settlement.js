/**
 * Sovereign Transaction Settlement & Clearing Engine
 * Implements the core invariant: Commerce NEVER overrides Governance.
 * Isomorphic: uses process.getBuiltinModule in Node.js runtime.
 */

import { validateLicenseAgreement } from './licensing.js';

function getNodeBuiltins() {
  if (typeof process !== 'undefined' && typeof process.getBuiltinModule === 'function') {
    try {
      const fs = process.getBuiltinModule('node:fs');
      const path = process.getBuiltinModule('node:path');
      return { fs, path };
    } catch (e) {}
  }
  return { fs: null, path: null };
}

function logAppend(record) {
  const { fs, path } = getNodeBuiltins();
  if (fs && path) {
    try {
      const commerceLog = path.resolve(process.cwd(), 'data', 'commerce-ledger.jsonl');
      const dir = path.dirname(commerceLog);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(commerceLog, JSON.stringify(record) + '\n', 'utf8');
    } catch (e) {}
  }
}

/** Sovereign transaction clearing */
export function clearTransaction(accessDecision, licenseAgreement, paymentToken = "DEVELOPMENT_TOKEN") {
  const checkLicense = validateLicenseAgreement(licenseAgreement);
  if (!checkLicense.valid) {
    throw new Error(`Invalid license agreement: ${checkLicense.error}`);
  }

  const transactionId = `urn:davincia:transaction:settlement:${Math.random().toString(36).substring(2, 10)}`;

  // Enforce Sovereign Rule: Commerce never overrides Governance
  if (accessDecision.decision !== "ALLOW" && accessDecision.decision !== "ALLOW_WITH_CONSTRAINTS") {
    const failedTx = {
      transaction_id: transactionId,
      status: "FAILED",
      reason_code: "GOVERNANCE_DENIED",
      message: "Access was blocked by the DaVinciA+ policy gate. Transaction aborted.",
      asset_id: licenseAgreement.asset_id,
      consumer: accessDecision.participant_id,
      provider: licenseAgreement.owner_urn,
      price: 0.00,
      currency: licenseAgreement.pricing.currency || "USD",
      provider_share: 0.00,
      governor_share: 0.00,
      platform_fee: 0.00,
      payment_token: paymentToken,
      settlement_timestamp: new Date().toISOString()
    };
    logAppend(failedTx);
    return failedTx;
  }

  const price = licenseAgreement.pricing.price ?? licenseAgreement.pricing.base_price ?? 0.00;
  const platformFee = parseFloat((price * 0.20).toFixed(2));
  const providerShare = parseFloat((price - platformFee).toFixed(2));

  const successfulTx = {
    transaction_id: transactionId,
    status: "SETTLED",
    settlement_status: "SETTLED",
    reason_code: "AUTHORIZED_SETTLEMENT",
    asset_id: licenseAgreement.asset_id,
    consumer: accessDecision.participant_id,
    provider: licenseAgreement.owner_urn,
    price: price,
    currency: licenseAgreement.pricing.currency || "USD",
    provider_share: providerShare,
    governor_share: platformFee,
    platform_fee: platformFee,
    payment_token: paymentToken,
    payment_reference: `pay_ref_${Math.random().toString(36).substring(2, 8)}`,
    settlement_timestamp: new Date().toISOString()
  };

  logAppend(successfulTx);
  return successfulTx;
}

/**
 * Calculates revenue attribution totals for a given provider
 */
export function calculateProviderAttributions(providerUrn) {
  const { fs, path } = getNodeBuiltins();
  if (!fs || !path) {
    return { provider: providerUrn, transactions_count: 0, total_revenue: 0.00 };
  }

  const commerceLog = path.resolve(process.cwd(), 'data', 'commerce-ledger.jsonl');
  if (!fs.existsSync(commerceLog)) {
    return { provider: providerUrn, transactions_count: 0, total_revenue: 0.00 };
  }

  const lines = fs.readFileSync(commerceLog, 'utf8').trim().split('\n').filter(Boolean);
  let count = 0;
  let revenue = 0.0;

  for (const line of lines) {
    try {
      const tx = JSON.parse(line);
      if (tx.provider === providerUrn && tx.status === "SETTLED") {
        count++;
        revenue += (Number(tx.provider_share) || 0);
      }
    } catch (e) {}
  }

  return {
    provider: providerUrn,
    transactions_count: count,
    total_revenue: parseFloat(revenue.toFixed(2))
  };
}
