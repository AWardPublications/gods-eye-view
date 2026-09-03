import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CopOnCorkonianGameEngine } from '../../../davidos/copOnCorkonianGameEngine.mjs';

test('1. CopOnCorkonianGameEngine incorporates COP ON game matrix and executes game turn', () => {
  const engine = new CopOnCorkonianGameEngine();
  const res = engine.compileGameEngine();

  assert.equal(res.status, 'COP_ON_CORKONIAN_GAME_FULLY_INCORPORATED');
  assert.equal(res.isbnBookVol3, '978-1-918501-02-5');
  assert.equal(res.cardsCount, 5);
  assert.equal(res.cardMatrix[0].name, 'CorkMan (Aidy O\'Dalaigh)');
  assert.equal(res.cardMatrix[1].name, 'Cork Gollum');

  const turn = engine.playGameTurn('card_cork_01', 'card_cork_02', 'LORE_VAULT_CHALLENGE');
  assert.equal(turn.status, 'COP_ON_TURN_EXECUTED');
  assert.equal(turn.playerWon, true);
  assert.equal(turn.resultStatus, 'PLAYER_GOVERNANCE_VICTORY');
  assert.ok(turn.turnHash.length === 64);
});
