import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MasterOrchestratorEcosystem } from '../core/orchestration/masterOrchestratorEcosystem.js';

test('1. MasterOrchestratorEcosystem — Tournament Matchplay Mode (State 4 Rule 4.3a Gate)', () => {
  const orchestrator = new MasterOrchestratorEcosystem();

  const result = orchestrator.processGolfQuery({
    queryText: 'What is my yardage to the 18th pin at Adare Manor?',
    rawLaserYards: 224.0,
    isTournament: true,
    mode: 'MATCHPLAY_COMPETITION'
  });

  assert.equal(result.fsm_state, 4);
  assert.equal(result.governance.rule_4_3a_compliant, true);
  assert.equal(result.governance.plays_like_suppressed, true);
  assert.equal(result.spoken_distance_yards, 224.0);
  assert.ok(result.alex_voice_response.startsWith('Mais oui, my friend!'));
  assert.ok(result.alex_voice_response.includes('224 yards'));
});

test('2. MasterOrchestratorEcosystem — Practice Strategy Mode (State 5 Plays-Like & Risk-Reward)', () => {
  const orchestrator = new MasterOrchestratorEcosystem();

  const result = orchestrator.processGolfQuery({
    queryText: 'Should I attack this tucked pin 160 yards out?',
    rawLaserYards: 160.0,
    isTournament: false,
    executionProbability: 0.65, // < 0.70 threshold -> Take Your Medicine
    environment: { pressureHpa: 980.0, tempC: 22.0, humidityPct: 40.0, windVx: -4 }
  });

  assert.equal(result.fsm_state, 5);
  assert.equal(result.governance.plays_like_suppressed, false);
  assert.equal(result.risk_reward_decision.protocol, 'TAKE_YOUR_MEDICINE');
  assert.equal(result.governance.exclusively_alex_responsibility, true);
  assert.ok(result.alex_voice_response.includes('Take your medicine'));
});

test('3. MasterOrchestratorEcosystem — Ecosystem Version & Patent Metadata', () => {
  const orchestrator = new MasterOrchestratorEcosystem();
  assert.equal(orchestrator.version, 'v4.7.0-rc.1');
  assert.equal(orchestrator.patent, 'WO/2026/150385');
});
