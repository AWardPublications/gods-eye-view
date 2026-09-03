import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TenantAwareSchemaEngine } from '../tenantAwareSchemaEngine.mjs';

test('90_Tenant_Aware_Schema_Genesis_Block: Verifies initial genesis block requires null genesis hash', () => {
  const engine = new TenantAwareSchemaEngine();
  const brehonTenant = engine.getTenantByName('Brehon AI Solutions');
  const principal = engine.registerPrincipal(brehonTenant.tenant_id, 'David Ward', 'FOUNDER');

  const log1 = engine.appendAuditLogEntry(
    brehonTenant.tenant_id,
    principal.principal_id,
    'RM-05',
    'INITIALIZE_MASTER_STATE',
    { status: 'ACTIVE_EMPIRE' },
    engine.genesisHash
  );

  assert.equal(log1.prev_hash, engine.genesisHash);
  assert.ok(log1.entry_hash.length === 64);
});

test('91_Tenant_Aware_Schema_Cross_Tenant_Hard_Reject: Hard-rejects cross-tenant audit log writes', () => {
  const engine = new TenantAwareSchemaEngine();
  const brehonTenant = engine.getTenantByName('Brehon AI Solutions');
  const glofyTenant = engine.getTenantByName('Glofy');
  const brehonUser = engine.registerPrincipal(brehonTenant.tenant_id, 'Brehon User', 'CLIENT');

  // Attempt to write audit log entry for Glofy tenant using Brehon User principal
  assert.throws(() => {
    engine.appendAuditLogEntry(
      glofyTenant.tenant_id,
      brehonUser.principal_id, // Wrong tenant principal!
      'RM-10',
      'UNAUTHORIZED_CROSS_TENANT_WRITE',
      { data: 'leak' },
      engine.genesisHash
    );
  }, /COMPOSITE_FOREIGN_KEY_VIOLATION/);
});

test('92_Tenant_Aware_Schema_Immutability_Trigger: Hard-blocks update/delete mutations on audit log', () => {
  const engine = new TenantAwareSchemaEngine();
  const awpTenant = engine.getTenantByName('A.Ward Publications');

  assert.throws(() => {
    engine.attemptLogMutation(awpTenant.tenant_id, 1);
  }, /MEMBER_TRANSACTION_MUTATION_BLOCKED/);
});
