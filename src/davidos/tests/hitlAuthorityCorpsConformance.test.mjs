import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HitlConstitutionEngine } from '../hitlConstitutionEngine.mjs';
import { HitlRouterEngine } from '../hitlRouterEngine.mjs';
import { HitlCoverageEngine } from '../hitlCoverageEngine.mjs';

test('61_Hitl_Constitution_50_Seat_Count: 12 Domains provide 48 expert seats + 2 executives = 50 total human authority', () => {
  const constitution = new HitlConstitutionEngine();
  const seats = constitution.getTotalSeatCount();

  assert.equal(seats.expertSeats, 48);
  assert.equal(seats.executiveSeats, 2);
  assert.equal(seats.totalCoreHumanAuthority, 50);
  assert.equal(constitution.executiveViceAuthority.holder, 'Adrian Daly');
  assert.equal(constitution.executiveViceAuthority.certLevel, 'HITL_5_MASTER');
});

test('62_Hitl_Router_Risk_Escalation: Router escalates critical capital actions to Sovereign David Ward', () => {
  const router = new HitlRouterEngine();
  const route = router.routeAgentAction('agent_gedhi_01', 'SUBMIT_GRANT_PROPOSAL', 'CRITICAL', 75000);

  assert.equal(route.assigned_domain.id, 'dom_07'); // Finance / Capital
  assert.equal(route.required_authority_level, 'LEVEL_0_SOVEREIGN');
  assert.equal(route.assigned_human_reviewer, 'David Ward (Founder / Sovereign Ambassador)');
});

test('63_Hitl_Coverage_HACI_Audit: Ecosystem audit achieves 100% Human Authority Coverage Index', () => {
  const auditEngine = new HitlCoverageEngine();
  const audit = auditEngine.auditEcosystemCoverage();

  assert.equal(audit.humanAuthorityCoverageIndex, 100.0);
  assert.equal(audit.totalCoreHumanAuthority, 50);
  assert.equal(audit.gapsIdentified, 0);
  assert.equal(audit.status, 'FULL_HUMAN_AUTHORITY_COVERAGE_ACHIEVED');
});
