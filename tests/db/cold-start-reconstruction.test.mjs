import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { PostgresGovernanceAdapter } from '../../src/db/postgres-adapter.js';
import { Part11SignatureEngine } from '../../src/compliance/part11-signatures.js';

test('GAMP 5 PQ: Cold-Start Genesis State Reconstruction from Evidence Packages', async () => {
  const pkgDir = path.resolve(process.cwd(), 'data', 'evidence-packages');
  assert.ok(existsSync(pkgDir), "Evidence directory data/evidence-packages must exist");

  const files = readdirSync(pkgDir).filter(f => f.endsWith('.json'));
  assert.ok(files.length > 50, `Expected abundant evidence packages on disk, found ${files.length}`);

  // Create a completely clean, cold database adapter
  const coldAdapter = new PostgresGovernanceAdapter({ forceMemory: true });
  assert.equal(coldAdapter.tables.evidence_ledger.size, 0);
  assert.equal(coldAdapter.tables.audit_events.size, 0);

  let validPackagesIngested = 0;

  for (const file of files) {
    try {
      const content = readFileSync(path.join(pkgDir, file), 'utf8');
      const pkg = JSON.parse(content);

      if (pkg.evidence_urn || pkg.evidence_ref) {
        await coldAdapter.appendAuditEvent({
          transaction_urn: pkg.evidence_urn || pkg.evidence_ref,
          actor_passport: pkg.chain?.passport_ref || "urn:davincia:system",
          target_resource: pkg.chain?.asset_ref || "urn:davincia:resource:generic",
          action: "GENESIS_RECONSTRUCTION",
          status: "RECOVERED",
          signature: pkg.evidence_hash || "sha256-verified",
          payload: pkg.payload || {}
        });
        validPackagesIngested++;
      }
    } catch (e) {
      // ignore empty scratch test files
    }
  }

  assert.ok(validPackagesIngested > 50);
  assert.equal(coldAdapter.tables.audit_events.size, validPackagesIngested);

  // Retrieve reconstructed events
  const auditEvents = await coldAdapter.getAuditEvents(100);
  assert.ok(auditEvents.length > 0);
  for (const evt of auditEvents) {
    assert.equal(evt.status, "RECOVERED");
    assert.ok(evt.transaction_urn);
  }
});

test('21 CFR Part 11: Electronic Signature Generation and Tamper-Evidence Verification', () => {
  const settlementBatchSummary = {
    batch_id: "sunday-settlement-1788259025078",
    cleared_count: 42,
    total_eur: "1,248.50",
    escrow_account: "urn:davincia:escrow:master"
  };

  // Sign report
  const signed = Part11SignatureEngine.signReport(settlementBatchSummary, {
    name: "David Ward",
    role: "Lead Compliance Auditor",
    intent: "SETTLEMENT_BATCH_RATIFICATION"
  });

  assert.ok(signed.signature_manifest);
  assert.equal(signed.signature_manifest.signer.name, "David Ward");
  assert.equal(signed.signature_manifest.signature_status, "CRYPTOGRAPHICALLY_VERIFIED");
  assert.ok(signed.signature_manifest.payload_digest.startsWith("sha256-"));

  // Verify signature
  const verResult = Part11SignatureEngine.verifySignature(signed);
  assert.equal(verResult.valid, true);
  assert.equal(verResult.signer, "David Ward");

  // Verify tampering detection
  const tampered = JSON.parse(JSON.stringify(signed));
  tampered.payload.total_eur = "9,999,999.00"; // fraudulent modification
  const tamperedResult = Part11SignatureEngine.verifySignature(tampered);
  assert.equal(tamperedResult.valid, false);
  assert.equal(tamperedResult.error, "SIGNATURE_DIGEST_MISMATCH");
});
