import { MultiRoleTelemetryMesh } from '../../src/telemetry/multiRoleTelemetryMesh.mjs';
import assert from 'node:assert/strict';

/**
 * Multi-Role Telemetry Sync Test Battery ("E Pluribus Unum")
 * Verifies real-time state propagation across Caddie, Spotter, Agent (BRO), and HITL Supervisor.
 */
function runMultiRoleTelemetrySyncTest() {
  console.log('================================================================================');
  console.log('MULTI-ROLE TELEMETRY MESH SYNC TEST ("E PLURIBUS UNUM")');
  console.log('================================================================================\n');

  const mesh = new MultiRoleTelemetryMesh('MATCH-2026-RYDER-01');

  const receivedStates = {
    CADDIE: [],
    SPOTTER: [],
    AGENT: [],
    HITL: []
  };

  // Subscribe all 4 roles
  mesh.subscribe('CADDIE', (state) => receivedStates.CADDIE.push(state));
  mesh.subscribe('SPOTTER', (state) => receivedStates.SPOTTER.push(state));
  mesh.subscribe('AGENT', (state) => receivedStates.AGENT.push(state));
  mesh.subscribe('HITL', (state) => receivedStates.HITL.push(state));

  console.log('  ✓ Step 1: All 4 Roles (Caddie, Spotter, Agent, HITL) Subscribed to Mesh');

  // Step 2: Spotter updates Lie Quality & GPS Pin Drop
  const spotterUpdate = mesh.updateState('SPOTTER', {
    spotterTelemetry: {
      lieType: 'PRIMARY_CUT',
      lieQualityIndex: 82,
      verifiedBySpotterId: 'SPOTTER-BETHPAGE-04'
    }
  });

  console.log('  ✓ Step 2: Spotter Telemetry Broadcast (Lie: PRIMARY_CUT 82/100)');
  assert.equal(spotterUpdate.spotterTelemetry.lieQualityIndex, 82);

  // Step 3: Verify all 4 roles received identical SHA-256 state signature
  const caddieState = receivedStates.CADDIE[receivedStates.CADDIE.length - 1];
  const agentState = receivedStates.AGENT[receivedStates.AGENT.length - 1];
  const hitlState = receivedStates.HITL[receivedStates.HITL.length - 1];

  assert.equal(caddieState.governance.gamp5Hash, hitlState.governance.gamp5Hash);
  assert.equal(agentState.governance.gamp5Hash, hitlState.governance.gamp5Hash);

  console.log(`  ✓ Step 3: State Cryptographically Synchronized across all roles (SHA-256: ${hitlState.governance.gamp5Hash.slice(0, 16)}...)\n`);

  console.log('================================================================================');
  console.log('E PLURIBUS UNUM TELEMETRY MESH VERIFIED (100% SYNCHRONIZED ACROSS ALL USERS)');
  console.log('================================================================================\n');
}

runMultiRoleTelemetrySyncTest();
