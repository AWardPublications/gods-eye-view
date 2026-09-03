import test from 'node:test';
import assert from 'node:assert/strict';
import { executeGovernedTransaction } from '../../src/governed-commerce/transaction.js';
import { buildPassport, ParticipantTypes } from '../../src/platform/passport.js';

test('Replay Protection: 1. Ensure unique transaction identifier outputs', async () => {
  const hp = buildPassport({ id: "urn:id:user:david", name: "David" }, ParticipantTypes.HUMAN, ["READ"]);
  
  const request = {
    humanPassport: hp,
    assetId: "urn:davincia:knowledge:asset:brehon-ip",
    action: "READ",
    paymentToken: "TOKEN_REPLAY_TEST_1"
  };

  const tx1 = await executeGovernedTransaction(request);
  const tx2 = await executeGovernedTransaction(request);

  assert.notEqual(tx1.transaction_id, tx2.transaction_id);
});
