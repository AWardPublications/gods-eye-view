import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TenantAwarePrincipalsEngine } from '../tenantAwarePrincipalsEngine.mjs';

test('88_Tenant_Aware_Composite_FK_Enforcement: Hard-rejects principal registration for unregistered tenant', () => {
  const engine = new TenantAwarePrincipalsEngine();
  assert.throws(() => {
    engine.registerPrincipal('tenant_invalid', 'u_01', 'Test User', 'test@test.com');
  }, /Foreign key violation/);
});

test('89_AGR_Non_Hierarchical_Overlapping_Roles: Evaluates multiple active roles for single principal across spatial thresholds', () => {
  const engine = new TenantAwarePrincipalsEngine();
  engine.registerTenant('tenant_swiss_pharma', 'Swiss Pharma AG');
  engine.registerPrincipal('tenant_swiss_pharma', 'p_50k_01', 'Dr. Aris Thorne', 'aris@swisspharma.ch', ['READ_TELEMETRY']);

  engine.assignAgrRole('tenant_swiss_pharma', 'p_50k_01', 'FLOOR-1', 'PEDESTRIAN');
  engine.assignAgrRole('tenant_swiss_pharma', 'p_50k_01', 'LIBRARY', 'PARENT');
  engine.assignAgrRole('tenant_swiss_pharma', 'p_50k_01', 'RM-10', 'POLICE_OFFICER', 'PANEL_D');

  const evalRm10 = engine.evaluateAccessPermission('tenant_swiss_pharma', 'p_50k_01', 'VETO_AUTHORITY', 'RM-10');

  assert.equal(evalRm10.allowed, true);
  assert.equal(evalRm10.activeRolesCount, 3);
  assert.ok(evalRm10.roles.includes('RM-10:POLICE_OFFICER'));
});
