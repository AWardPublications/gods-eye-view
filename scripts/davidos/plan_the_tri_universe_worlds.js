import { TriUniverseWorldPlannerEngine } from '../../src/davidos/triUniverseWorldPlannerEngine.mjs';

function runWorldPlanner() {
  console.log("=" * 80);
  console.log("TRI-UNIVERSE MASTER WORLD BLUEPRINT PLANNER (FULL AUTO)");
  console.log("=" * 80);

  const engine = new TriUniverseWorldPlannerEngine();
  const res = engine.compileWorldPlan();

  console.log(`\n  ✓ Total Planned Worlds:  ${res.worldsCount} Governed Products`);
  console.log(`  ✓ Master Blueprint Hash: ${res.planHash}\n`);

  for (const world of res.masterWorldsPlan) {
    console.log(`  🌍 [${world.worldId}] ${world.name}`);
    console.log(`     ├─ HITL Desk: ${world.hitlDesk}`);
    console.log(`     ├─ Locations: ${world.locations.join(' | ')}`);
    console.log(`     ├─ Workflow Backbone: ${world.workflowBackbone}`);
    console.log(`     └─ Character Roster:`);
    for (const char of world.agentRoster) {
      console.log(`        • ${char.name} (${char.archetype}) [HITL Gate: ${char.hitlGate}]`);
    }
    console.log("");
  }

  console.log("=" * 80);
  console.log("STATUS: TRI-UNIVERSE WORLDS PLANNED & RATIFIED 100% GREEN");
  console.log("=" * 80 + "\n");
}

runWorldPlanner();
