import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FederatedSovereignLicensingEngine } from '../federatedSovereignLicensingEngine.mjs';

test('130_Federated_Licensing_Initiation: Initiates Tier 1 Node with Option A Fixed Royalty (€19.25M Total First Year)', () => {
  const engine = new FederatedSovereignLicensingEngine();
  const res = engine.initiateFederatedNode({
    name: 'Haag-Streit Global Biopharma Enclave',
    tier: 'Tier 1',
    accepts_append_only_ledger: true,
    accepts_gpg_sovereignty: true,
    rejects_black_box_automation: true,
    preserves_life_safety_decoupling: true
  }, 'Tier 1', 'OPTION_A');

  assert.equal(res.status, 'FEDERATED_NODE_INITIATED_SUCCESSFUL');
  assert.equal(res.term_sheet_id, 'TS-DAVINCIA-FED-2026-V1');
  assert.equal(res.gpg_key, '0x80D0ADA1');
  assert.equal(res.nodeRecord.financials.initiation_fee_eur, 15000000);
  assert.equal(res.nodeRecord.financials.gamp5_fee_eur, 750000);
  assert.equal(res.nodeRecord.financials.royalty_fee_eur, 3500000);
  assert.equal(res.nodeRecord.financials.total_first_year_eur, 19250000);
});

test('131_Federated_Licensing_Option_B: Initiates Tier 2 Sovereign Node with Option B Transaction Royalty (€0.0025/tx)', () => {
  const engine = new FederatedSovereignLicensingEngine();
  const res = engine.initiateFederatedNode({
    name: 'Cantonal Government of Valais Sovereign Node',
    tier: 'Tier 2',
    accepts_append_only_ledger: true,
    accepts_gpg_sovereignty: true,
    rejects_black_box_automation: true,
    preserves_life_safety_decoupling: true
  }, 'Tier 2', 'OPTION_B', 2000000); // 2,000,000 transactions * €0.0025 = €5,000

  assert.equal(res.status, 'FEDERATED_NODE_INITIATED_SUCCESSFUL');
  assert.equal(res.nodeRecord.financials.initiation_fee_eur, 25000000);
  assert.equal(res.nodeRecord.financials.royalty_fee_eur, 5000);
});

test('132_Federated_Licensing_Brehon_Court_Slashing: Slashes node and revokes ZK tokens on CONSTITUTION-v1.0 breach', () => {
  const engine = new FederatedSovereignLicensingEngine();
  const init = engine.initiateFederatedNode({
    name: 'Un-compliant Test Node',
    tier: 'Tier 1',
    accepts_append_only_ledger: true,
    accepts_gpg_sovereignty: true,
    rejects_black_box_automation: true,
    preserves_life_safety_decoupling: true
  });

  const nodeId = init.nodeRecord.node_id;
  const slashRes = engine.executeBrehonCourtArbitrationSlashing(nodeId, 'anti_black_box_prohibition');

  assert.equal(slashRes.status, 'BREHON_COURT_STATE_SLASHING_EXECUTED');
  assert.equal(slashRes.new_status, 'DOWNGRADED_ISOLATED_LOCAL_SANDBOX');
  assert.equal(slashRes.zk_tokens_revoked, true);
  assert.equal(slashRes.merkle_bridge_suspended, true);
  assert.ok(slashRes.slashing_receipt_hash.length === 64);
});
