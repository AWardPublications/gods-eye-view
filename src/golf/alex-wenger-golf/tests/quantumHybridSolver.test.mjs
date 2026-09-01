import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QuantumHybridSolverRouter } from '../core/spatial/quantumHybridSolver.js';
import { executeGovernedIntelligencePipeline } from '../core/architecture/governedIntelligenceSystem.js';

test('1. QuantumHybridSolverRouter defaults to sub-15ms Classical Edge Solver', async () => {
  const router = new QuantumHybridSolverRouter();
  const res = await router.solveBallistics({ rawYards: 160, deltaZ: 3, altitudeMeters: 50, windMph: 10 });

  assert.equal(res.solver_backend, 'CLASSICAL_EDGE_3DOF');
  assert.equal(res.exclusively_alex_responsibility, true);
  assert.ok(res.plays_like_yards > 160);
});

test('2. QuantumHybridSolverRouter handles QPU endpoint fallback gracefully', async () => {
  const router = new QuantumHybridSolverRouter({
    preferQuantum: true,
    quantumEndpoint: 'https://invalid-qpu-endpoint-offline.local/solve',
    timeoutMs: 10
  });

  const res = await router.solveBallistics({ rawYards: 180, deltaZ: 0, altitudeMeters: 0, windMph: 0 });

  // Must fall back to classical without throwing error
  assert.equal(res.solver_backend, 'CLASSICAL_EDGE_3DOF');
  assert.equal(res.plays_like_yards, 180);
});

test('3. QuantumHybridSolverRouter solves longitudinal EV tree', async () => {
  const router = new QuantumHybridSolverRouter();
  const evRes = await router.solveLongitudinalEV({ currentLie: 'fairway', targetDistanceYards: 175 });

  assert.equal(evRes.solver_backend, 'CLASSICAL_QAOA_SIMULATION');
  assert.equal(evRes.exclusively_alex_responsibility, true);
});

test('4. Governed pipeline ingests hybrid solver output and passes State 4 Judge audit', async () => {
  const router = new QuantumHybridSolverRouter();
  const solverRes = await router.solveBallistics({ rawYards: 176, deltaZ: 2, altitudeMeters: 35, windMph: 15 });

  const pipelineRes = executeGovernedIntelligencePipeline({
    userQuery: "Alex, what is the hybrid quantum-classical line for Hole 5?",
    branchId: 'COURSE_SYSTEM',
    specialistFindingText: `Hybrid solver (${solverRes.solver_backend}) calculated ${solverRes.plays_like_yards} plays-like yards.`
  });

  assert.equal(pipelineRes.judge_verdict.status, 'PASS');
  assert.ok(pipelineRes.integrated_coaching_response.length > 10);
});
