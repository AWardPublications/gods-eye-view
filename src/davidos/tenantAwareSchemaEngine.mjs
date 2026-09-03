import { createHash, randomUUID } from 'node:crypto';

/**
 * ARIOS LAYER 1 TRUTH STACK COMPOSITE LEDGER ENGINE (TENANT-AWARE-SCHEMA-v1.0)
 * Core Principle: "Nothing is trusted because it happened. Everything is trusted because it can be reconstructed."
 */
export class TenantAwareSchemaEngine {
  constructor() {
    this.genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    this.tenants = new Map();
    this.principals = new Map(); // Composite key `${tenantId}:${principalId}`
    this.auditLogs = new Map();  // Keyed by tenantId -> array of log entries

    // Seed initial sovereign tenants
    this.seedTenants();
  }

  seedTenants() {
    const seedList = [
      { name: 'Brehon AI Solutions', domain: 'brehonaisolutions.com' },
      { name: 'Haag-Streit', domain: 'haag-streit.com' },
      { name: 'Glofy', domain: 'glofy.com' },
      { name: 'A.Ward Publications', domain: 'awardpublications.com' }
    ];

    for (const item of seedList) {
      const tenantId = randomUUID();
      this.tenants.set(tenantId, { tenant_id: tenantId, name: item.name, domain: item.domain, status: 'ACTIVE' });
      this.auditLogs.set(tenantId, []);
    }
  }

  getTenantByName(name) {
    return Array.from(this.tenants.values()).find(t => t.name === name);
  }

  registerPrincipal(tenantId, displayName, role = 'CLIENT', authorizedScopes = []) {
    if (!this.tenants.has(tenantId)) {
      throw new Error(`TENANT_NOT_FOUND: Foreign key restriction violated for tenant ${tenantId}.`);
    }

    const principalId = randomUUID();
    const compositeKey = `${tenantId}:${principalId}`;
    const principal = {
      tenant_id: tenantId,
      principal_id: principalId,
      display_name: displayName,
      role,
      authorized_scopes: authorizedScopes,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };

    this.principals.set(compositeKey, principal);
    return principal;
  }

  appendAuditLogEntry(tenantId, principalId, roomCode, actionType, payloadJson, prevHash) {
    const compositeKey = `${tenantId}:${principalId}`;

    // 1. Composite Foreign Key Constraint Check
    if (!this.principals.has(compositeKey)) {
      throw new Error(`COMPOSITE_FOREIGN_KEY_VIOLATION: User ${principalId} from tenant ${tenantId} is not a registered principal.`);
    }

    const tenantLogs = this.auditLogs.get(tenantId) || [];
    const lastEntry = tenantLogs.length > 0 ? tenantLogs[tenantLogs.length - 1] : null;
    const expectedPrevHash = lastEntry ? lastEntry.entry_hash : this.genesisHash;

    // 2. Cryptographic Spanning Chain Split Check
    if (prevHash !== expectedPrevHash) {
      throw new Error(`CRYPTOGRAPHIC_SPANNING_CHAIN_SPLIT: Provided prev_hash (${prevHash}) does not match record last hash (${expectedPrevHash}).`);
    }

    const timestamp = new Date().toISOString();
    const payloadStr = JSON.stringify(payloadJson);

    // 3. SHA-256 Entry Hash Calculation
    const calculatedHash = createHash('sha256').update(
      `${tenantId}${principalId}${roomCode}${actionType}${payloadStr}${prevHash}${timestamp}`
    ).digest('hex');

    const newLogEntry = {
      tenant_id: tenantId,
      entry_id: tenantLogs.length + 1,
      principal_id: principalId,
      room_code: roomCode,
      action_type: actionType,
      payload: payloadJson,
      prev_hash: prevHash,
      entry_hash: calculatedHash,
      timestamp
    };

    tenantLogs.push(newLogEntry);
    this.auditLogs.set(tenantId, tenantLogs);
    return newLogEntry;
  }

  attemptLogMutation(tenantId, entryId) {
    // 4. Immutability Trigger Check (Append-Only Enforcement)
    throw new Error('MEMBER_TRANSACTION_MUTATION_BLOCKED: ARIOS Truth Layer is append-only. UPDATE and DELETE are physically disallowed on audit_log table.');
  }
}
