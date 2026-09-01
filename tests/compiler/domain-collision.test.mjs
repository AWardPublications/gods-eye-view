import test from 'node:test';
import assert from 'node:assert/strict';
import { DomainCollisionLinter } from '../../src/compiler/domainCollisionLinter.js';

test('Domain Linter: Pure Alpine Speedgolf Asset Compliant', () => {
  const payload = {
    title: "Alpine Speedgolf Master Series: 18th at Matterhorn",
    description: "Alex Wenger navigating the high mountain fairway in Sion, Valais with rapid tempo."
  };

  const res = DomainCollisionLinter.lintProductDomain(payload);
  assert.equal(res.compliant, true);
  assert.equal(res.primary_domain, "Alex Wenger");
  assert.ok(res.detected_domains.includes("Alex Wenger"));
});

test('Domain Linter: Pure Corkonian Folklore Asset Compliant', () => {
  const payload = {
    title: "Lee Side Legends: Shandon Bells and the Lough",
    description: "The historical folklore of the rebel county parish and the Shandon bells."
  };

  const res = DomainCollisionLinter.lintProductDomain(payload);
  assert.equal(res.compliant, true);
  assert.equal(res.primary_domain, "Lee Side Legends");
  assert.ok(res.detected_domains.includes("Lee Side Legends"));
});

test('Domain Linter: Unauthorized Water vs. Alpine Collision Rejection (FAIL-CLOSED)', () => {
  const conflictingPayload = {
    title: "River Lee Aquatic Speedgolf Sprint",
    description: "Swimming the river channel while hitting golf balls across the Sion alpine meadow."
  };

  const res = DomainCollisionLinter.lintProductDomain(conflictingPayload);
  assert.equal(res.compliant, false);
  assert.ok(res.error.includes("DOMAIN_COLLISION"));
  assert.ok(res.detected_domains.includes("CorkSwam"));
  assert.ok(res.detected_domains.includes("Alex Wenger"));
});

test('Domain Linter: Authorized Cross-Domain Hybrid Exemption', () => {
  const hybridPayload = {
    title: "Celtic-Alpine Phygital Cross-Over",
    description: "Swimming the river channel while hitting golf balls across the Sion alpine meadow.",
    allow_hybrid_domain: true
  };

  const res = DomainCollisionLinter.lintProductDomain(hybridPayload);
  assert.equal(res.compliant, true);
});
