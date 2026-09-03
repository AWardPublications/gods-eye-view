/**
 * Governed Evidence Package Compiler
 * Produces verifiable audit packages and dual-writes to data/evidence-packages.
 * Isomorphic: uses process.getBuiltinModule in Node.js runtime.
 */

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

  const { fs, path } = getNodeBuiltins();
  if (fs && path) {
    try {
      const evidenceDir = path.resolve(process.cwd(), 'data', 'evidence-packages');
      if (!fs.existsSync(evidenceDir)) {
        fs.mkdirSync(evidenceDir, { recursive: true });
      }
      const filePath = path.join(evidenceDir, `${transaction_id.split(':').pop()}.json`);
      fs.writeFileSync(filePath, JSON.stringify(evidencePackage, null, 2), 'utf8');
    } catch (e) {}
  }

  return evidencePackage;
}
