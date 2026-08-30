import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EVIDENCE_DIR = path.join(__dirname, '../../data/evidence-packages');

export function compileEvidencePackage(transaction) {
  const {
    transaction_id,
    request,
    decision,
    entitlement,
    usage_records = [],
    settlement,
    allocation
  } = transaction;

  if (!transaction_id) {
    throw new Error("Cannot compile evidence package without a transaction ID.");
  }

  const timestamp = new Date().toISOString();

  const evidencePackage = {
    evidence_urn: `urn:davincia:evidence:package:${transaction_id.split(':').pop()}`,
    transaction_id,
    timestamp,
    chain: {
      request_ref: request?.request_id || null,
      passport_ref: request?.agentPassport?.passport_id || request?.humanPassport?.passport_id || null,
      asset_ref: request?.assetId || null,
      policy_ref: decision?.policy_reference || null,
      decision_ref: decision?.decision_id || null,
      entitlement_ref: entitlement?.entitlement_id || null,
      usage_refs: usage_records.map(u => u.usage_id),
      settlement_ref: settlement?.settlement_urn || null,
      allocation_reconciled: allocation?.reconciled || false
    },
    payload: {
      request,
      decision,
      entitlement,
      usage_records,
      settlement,
      allocation
    }
  };

  // Ensure logging folder exists
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }

  const filePath = path.join(EVIDENCE_DIR, `${transaction_id.split(':').pop()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(evidencePackage, null, 2), 'utf8');

  return evidencePackage;
}
