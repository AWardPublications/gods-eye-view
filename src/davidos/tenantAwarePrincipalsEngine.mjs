import { createHash } from 'node:crypto';

/**
 * TENANT-AWARE PRINCIPALS & AGR ENGINE (TENANT-AGR-DB-001)
 * Enforces multi-tenant composite isolation and Agent-Group-Role non-hierarchical permissions.
 */
export class TenantAwarePrincipalsEngine {
  constructor() {
    this.tenants = new Map();
    this.principals = new Map(); // Composite key: `${tenantId}:${principalId}`
    this.agrRoles = new Map();  // Composite key: `${tenantId}:${principalId}` -> list of roles
  }

  registerTenant(tenantId, orgName) {
    this.tenants.set(tenantId, { tenantId, orgName, registeredAt: new Date().toISOString() });
    return this.tenants.get(tenantId);
  }

  registerPrincipal(tenantId, principalId, displayName, email, authorizedScopes = []) {
    if (!this.tenants.has(tenantId)) {
      throw new Error(`Tenant ${tenantId} does not exist. Foreign key violation.`);
    }

    const key = `${tenantId}:${principalId}`;
    const record = {
      tenantId,
      principalId,
      displayName,
      email,
      authorizedScopes
    };
    this.principals.set(key, record);
    this.agrRoles.set(key, []);
    return record;
  }

  assignAgrRole(tenantId, principalId, groupName, roleName, panelType = null) {
    const key = `${tenantId}:${principalId}`;
    if (!this.principals.has(key)) {
      throw new Error(`Principal ${key} not found. Composite foreign key violation.`);
    }

    const roles = this.agrRoles.get(key);
    const roleBinding = { groupName, roleName, panelType, assignedAt: new Date().toISOString() };
    roles.push(roleBinding);
    return roleBinding;
  }

  evaluateAccessPermission(tenantId, principalId, targetScope, targetRoom = 'RM-10') {
    const key = `${tenantId}:${principalId}`;
    const principal = this.principals.get(key);
    if (!principal) {
      return { allowed: false, reason: 'FOREIGN_KEY_TENANT_PRINCIPAL_NOT_FOUND' };
    }

    const hasScope = principal.authorizedScopes.includes(targetScope);
    const roles = this.agrRoles.get(key) || [];
    const matchingRole = roles.find(r => r.groupName === targetRoom || r.roleName === targetScope);

    const allowed = hasScope || !!matchingRole;

    return {
      allowed,
      tenantId,
      principalId,
      activeRolesCount: roles.length,
      roles: roles.map(r => `${r.groupName}:${r.roleName}`)
    };
  }
}
