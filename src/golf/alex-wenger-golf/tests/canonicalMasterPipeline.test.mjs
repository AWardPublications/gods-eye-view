import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYSTEM_CATEGORIES, executeCanonicalMasterPipeline } from '../core/architecture/canonicalMasterEcosystem.js';

test('SYSTEM_CATEGORIES correctly registers HUMAN_SYSTEM, EQUIPMENT_SYSTEM, and GAME_SYSTEM subagents', () => {
  assert.ok(SYSTEM_CATEGORIES.HUMAN_SYSTEM.agents.ALIEVE);
  assert.ok(SYSTEM_CATEGORIES.HUMAN_SYSTEM.agents.FITTY);
  assert.ok(SYSTEM_CATEGORIES.HUMAN_SYSTEM.agents.ZENNER);

  assert.ok(SYSTEM_CATEGORIES.EQUIPMENT_SYSTEM.agents.TAILOR);
  assert.ok(SYSTEM_CATEGORIES.EQUIPMENT_SYSTEM.agents.STICKS);

  assert.ok(SYSTEM_CATEGORIES.GAME_SYSTEM.agents.CADDY);
  assert.ok(SYSTEM_CATEGORIES.GAME_SYSTEM.agents.STATTY);
  assert.ok(SYSTEM_CATEGORIES.GAME_SYSTEM.agents.PUTTSER);
});

test('executeCanonicalMasterPipeline routes through Specialist Output -> Judge Filter -> Return to Alex -> Integrated Speech', () => {
  // 1. Human System test (Alieve)
  const humanRes = executeCanonicalMasterPipeline({
    userQuery: 'My back has strain after 14 holes',
  });
  assert.equal(humanRes.authority, 'Alex Wenger (Master Golf Intelligence / Coach / Final Voice)');
  assert.equal(humanRes.systems.category, 'HUMAN_SYSTEM');
  assert.equal(humanRes.systems.agent, 'ALIEVE');
  assert.equal(humanRes.governance_filter.evaluated, true);
  assert.equal(humanRes.return_to_alex.stage, 'SYNTHESIS_AND_DECISION');
  assert.ok(humanRes.return_to_alex.integrated_speech.includes('Alieve Wenger evaluated'));
  assert.ok(humanRes.return_to_alex.integrated_speech.includes('As your coach, here is my decision'));

  // 2. Equipment System test (Tailor)
  const equipRes = executeCanonicalMasterPipeline({
    userQuery: 'What shaft flex do I need for my driver?',
  });
  assert.equal(equipRes.systems.category, 'EQUIPMENT_SYSTEM');
  assert.equal(equipRes.systems.agent, 'TAILOR');

  // 3. Game System test (Caddy)
  const gameRes = executeCanonicalMasterPipeline({
    userQuery: 'What is my yardage target into wind?',
  });
  assert.equal(gameRes.systems.category, 'GAME_SYSTEM');
  assert.equal(gameRes.systems.agent, 'CADDY');
});
