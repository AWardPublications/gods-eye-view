import { createLicenseAgreement } from './licensing.js';
import { clearTransaction } from './settlement.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMERCE_LOG = path.join(__dirname, '../../data/commerce-ledger.jsonl');

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
