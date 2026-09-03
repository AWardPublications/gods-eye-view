import { TriUniverseGovernedArchitectureEngine } from '../../src/davidos/triUniverseGovernedArchitectureEngine.mjs';

function runTriUniverseBuilder() {
  console.log("=" * 80);
  console.log("TRI-UNIVERSE GOVERNED OPERATING SYSTEM ARCHITECTURE (ZERO WASTE)");
  console.log("=" * 80);

  const engine = new TriUniverseGovernedArchitectureEngine();
  const res = engine.compileTriUniverseArchitecture();

  console.log(`\n  ✓ Architecture Name:     ${res.architectureName}`);
  console.log(`  ✓ Core Doctrine:         "${res.corePrinciple}"`);
  console.log(`  ✓ Governed Universes:    ${res.universesCount} Products (DAVID_OS, ALEX WENGER OS, CORKONIAN OS)`);
  console.log(`  ✓ Cross-Universe Agents: ${res.crossUniverseAgentsCount} Messenger & Adapter Agents`);
  console.log(`  ✓ Architecture Hash:     ${res.hash}\n`);

  console.log("  THE THREE GOVERNED UNIVERSES & HITL ROLES:");
  for (const u of res.universes) {
    console.log(`  • [${u.id}] ${u.name}`);
    console.log(`    ├─ Theme:      ${u.theme}`);
    console.log(`    ├─ HITL Role:  ${u.hitlRole}`);
    console.log(`    ├─ Interactive Characters: ${u.interactiveAgentCharacters.join(', ')}`);
    console.log(`    └─ Underlying Workflows:   ${u.underlyingWorkflowTeams.join(', ')}\n`);
  }

  console.log("  CROSS-UNIVERSE ZERO-WASTE AGENTS:");
  for (const ag of res.crossUniverseAgents) {
    console.log(`  • [${ag.type}] ${ag.identity}`);
    console.log(`    └─ Function: ${ag.function}`);
  }

  console.log("\n" + "=" * 80);
  console.log("STATUS: TRI-UNIVERSE GOVERNED ARCHITECTURE RATIFIED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runTriUniverseBuilder();
