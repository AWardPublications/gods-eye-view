import { validateLicenseAgreement } from './licensing.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMERCE_LOG = path.join(__dirname, '../../data/commerce-ledger.jsonl');

function logAppend(filePath, record) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
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
      currency: licenseAgreement.pricing.currency,
      provider_share: 0.00,
      governor_share: 0.00,
      authorization_ref: accessDecision.decision_id,
      timestamp: new Date().toISOString()
    };
    logAppend(COMMERCE_LOG, failedTx);
    return failedTx;
  }

  // Calculate revenue share allocations
  const price = licenseAgreement.pricing.price;
  const pShare = Number((price * licenseAgreement.attributions.provider_share).toFixed(6));
  const gShare = Number((price * licenseAgreement.attributions.governor_share).toFixed(6));

  const settledTx = {
    transaction_id: transactionId,
    status: "SETTLED",
    reason_code: "PAYMENT_CLEARED",
    asset_id: licenseAgreement.asset_id,
    consumer: accessDecision.participant_id,
    provider: licenseAgreement.owner_urn,
    price: price,
    currency: licenseAgreement.pricing.currency,
    provider_share: pShare,
    governor_share: gShare,
    authorization_ref: accessDecision.decision_id,
    payment_token: paymentToken,
    timestamp: new Date().toISOString()
  };

  logAppend(COMMERCE_LOG, settledTx);
  return settledTx;
}

/** Calculate accumulated provider attribution analytics */
export function calculateProviderAttributions(providerUrn) {
  if (!fs.existsSync(COMMERCE_LOG)) return { total_revenue: 0, transactions_count: 0 };

  const lines = fs.readFileSync(COMMERCE_LOG, 'utf8').trim().split('\n');
  let totalRevenue = 0;
  let count = 0;

  for (const line of lines) {
    if (!line) continue;
    const tx = JSON.parse(line);
    if (tx.provider === providerUrn && tx.status === "SETTLED") {
      totalRevenue += tx.provider_share;
      count++;
    }
  }

  return {
    total_revenue: Number(totalRevenue.toFixed(6)),
    transactions_count: count
  };
}
