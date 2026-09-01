/**
 * Interactive Prompt Testing Harness for Alex Wenger Ecosystem V4.0.0
 * Executes Scenarios A, B, C, and D through the 6-State Governed Pipeline.
 */

import { executeV4StatePipeline } from './masterArchitectureV4.js';

export const SCENARIOS = [
  {
    id: 'Scenario A (Equipment & Wind Collision)',
    query: "I'm facing a 25mph Atlantic crosswind at Ballybunion Hole 11 into Mrs. Simpson. I'm torn between holding off a dynamic 4-iron or fitting a lower-spinning static utility head.",
    expected_agents: ['CADDY', 'TAILOR', 'STICKS'],
  },
  {
    id: 'Scenario B (Physical Guardrail & Bio-Strain)',
    query: "My lower back is seizing up during my follow-through on the back nine, but I want to finish the round. What swing tweak can get me through 18?",
    expected_agents: ['ALIEVE'],
  },
  {
    id: 'Scenario C (Rules Governance Filter)',
    query: "My ball came to rest on the stone boundary wall at Lahinch. Can I claim relief without a penalty stroke?",
    expected_agents: ['JUDGE'],
  },
  {
    id: 'Scenario D (Putting Micro-Break under Pressure)',
    query: "Downhill 6-foot slider on Amen Corner 12 with tournament pressure spiked. How do I make this put?",
    expected_agents: ['ZENNER', 'PUTTSER'],
  },
];

export function runAllScenarios() {
  console.log('=== ALEX WENGER ECOSYSTEM V4.0.0 — LIVE SCENARIO STRESS TEST ===\n');

  SCENARIOS.forEach((sc, idx) => {
    console.log(`----------------------------------------------------------------`);
    console.log(`[TEST ${idx + 1}/4] ${sc.id}`);
    console.log(`PROMPT: "${sc.query}"\n`);

    const result = executeV4StatePipeline({ userQuery: sc.query });

    result.states.forEach(st => {
      if (st.state === 'STATE_0_INGESTION') console.log(`  🔹 [State 0 Ingestion] Raw Query Ingested`);
      else if (st.state === 'STATE_1_MODE_SELECTION') console.log(`  🔹 [State 1 Mode] Selected Mode: ${st.mode}`);
      else if (st.state === 'STATE_2_SPECIALIST_DISPATCH') console.log(`  🔹 [State 2 Dispatch] Dispatched Subagent: ${st.dispatched_agent || 'Alex Native'}`);
      else if (st.state === 'STATE_3_SPECIALIST_EXECUTION') console.log(`  🔹 [State 3 Execution] Payload: "${st.finding}"`);
      else if (st.state === 'STATE_4_JUDGE_FILTER') console.log(`  🔹 [State 4 Judge] Rules Found: ${st.rules_found ? 'YES' : 'NO'} | Patent: ${st.patent}`);
      else if (st.state === 'STATE_5_RETURN_TO_ALEX') console.log(`  🔹 [State 5 Synthesis] Authority: ${st.synthesis_authority}`);
    });

    console.log(`\n🗣️ INTEGRATED SPEECH:`);
    console.log(`"${result.final_output}"\n`);
  });
}

if (process.argv[1] && process.argv[1].endsWith('runScenarioTests.js')) {
  runAllScenarios();
}
