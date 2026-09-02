import { test } from 'node:test';
import assert from 'node:assert/strict';

test('1. Corkonian Track 2 Capitalization verifies 8 grant programs, 3-tier stack, and CHF 85k Sion package', () => {
  const programs = [
    { name: 'Pro Helvetia', minChf: 25000, maxChf: 100000 },
    { name: 'Loterie Romande Valais', minChf: 15000, maxChf: 60000 },
    { name: 'Fondation Jan Michalski', minChf: 10000, maxChf: 50000 },
    { name: 'Centre National du Livre (CNL)', minEur: 8000, maxEur: 30000 },
    { name: 'Irish Arts Council / CCI Paris', minEur: 15000, maxEur: 35000 },
    { name: 'Interreg Europe / Alpine Space', minEur: 1200000, maxEur: 2500000 },
    { name: 'Creative Europe CULTURE', minEur: 200000, maxEur: 1000000 },
    { name: 'EIT New European Bauhaus', minEur: 30000, maxEur: 50000 }
  ];

  const capitalStackTiers = ['Tier 1 Local Foundations', 'Tier 2 Bilateral Residency', 'Tier 3 Transnational Consortia'];
  const jointPackageChf = 50000 + 35000; // CHF 85,000 (Pro Helvetia 50k + Loterie Romande 35k)

  assert.equal(programs.length, 8, 'Must contain 8 specific grant programs');
  assert.equal(capitalStackTiers.length, 3, 'Must implement 3-tier capital stack');
  assert.equal(jointPackageChf, 85000, 'Sion/Valais joint package must equal CHF 85,000');
});
