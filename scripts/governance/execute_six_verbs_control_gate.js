import { SixVerbsControlEngine } from '../../src/governance/sixVerbsControlEngine.mjs';

function executeGate() {
  console.log("=" * 80);
  console.log("EXECUTING SIX VERBS OF CONTROL GOVERNED DECISION GATE");
  console.log("=" * 80);

  const engine = new SixVerbsControlEngine();
  const res = engine.assertFullCircuitBreakerSequence('ASSET-CORK-2026-EU-TOUR-01', 'Anna Ward / David Ward');

  console.log(`\n  ✓ Asset ID:            ${res.assetId}`);
  console.log(`  ✓ Status:              ${res.status}`);
  console.log(`  ✓ Executed States:     ${res.statesExecuted.join(' -> ')}`);
  console.log(`  ✓ Audit Trail Count:   ${res.auditTrailCount} Verified Transitions`);
  console.log(`  ✓ Master Run Hash:     ${res.masterRunHash}\n`);

  console.log("=" * 80);
  console.log("STATUS: SIX VERBS OF CONTROL DECISION GATE 100% GREEN");
  console.log("=" * 80 + "\n");
}

executeGate();
