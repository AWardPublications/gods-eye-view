import { createLicenseAgreement } from './licensing.js';
import { clearTransaction } from './settlement.js';
import { executeGovernedTransaction } from './transaction.js';
import { trackConsumption } from './metering.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMERCE_LOG = path.join(__dirname, '../../data/commerce-ledger.jsonl');
const EVIDENCE_DIR = path.join(__dirname, '../../data/evidence-packages');

export function createAgreementApi(request) {
  const { assetId, owner, pricingType, price, options } = request;
  return createLicenseAgreement(assetId, owner, pricingType, price, options);
}

export function transactApi(request) {
  const { accessDecision, licenseAgreement, paymentToken } = request;
  return clearTransaction(accessDecision, licenseAgreement, paymentToken);
}

export function getLedgerApi() {
  if (!fs.existsSync(COMMERCE_LOG)) return [];
  const lines = fs.readFileSync(COMMERCE_LOG, 'utf8').trim().split('\n');
  return lines.filter(Boolean).map(line => JSON.parse(line));
}

export function getTransactionStatusApi(transactionId) {
  const ledger = getLedgerApi();
  return ledger.find(tx => tx.transaction_id === transactionId) || null;
}

export async function executeCommerceTransactionApi(request) {
  return executeGovernedTransaction(request);
}

export function consumeEntitlementApi(entitlement, usageEvent) {
  return trackConsumption(entitlement, usageEvent);
}

export function getTransactionDetailsApi(transactionId) {
  const ledger = getLedgerApi();
  return ledger.find(tx => tx.transaction_id === transactionId) || null;
}

export function getEvidencePackageApi(transactionId) {
  const fileId = transactionId.split(':').pop();
  const filePath = path.join(EVIDENCE_DIR, `${fileId}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
