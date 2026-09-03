import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MasterStateRegisterEngine } from '../masterStateRegisterEngine.mjs';
import { BaisSublicenseNegotiatorEngine } from '../baisSublicenseNegotiatorEngine.mjs';
import { BairOutboundCampaignEngine } from '../bairOutboundCampaignEngine.mjs';
import { NoraConsentWebhookEngine } from '../noraConsentWebhookEngine.mjs';

test('82_Master_State_Register_4_Entities: Vault master state initializes 4 corporate entities with GnuPG 0x80D0ADA1', () => {
  const vault = new MasterStateRegisterEngine();
  const init = vault.initializeMasterState();

  assert.equal(init.filing_ref, 'AWP-INIT-STATE-001');
  assert.equal(init.gpg_signature, '0x80D0ADA1');
  assert.equal(init.master_state, 'ACTIVE_EMPIRE_ENGAGED');
  assert.ok(init.entities.holdco.name.includes('A.WARD PUBLICATIONS'));
  assert.ok(init.entities.swissRnd.name.includes('BREHON AI TECHNOLOGIES'));
  assert.ok(init.entities.irishOpCo.name.includes('BREHON AI SOLUTIONS'));
  assert.ok(init.entities.ukOpCo.name.includes('BAIR RECRUITMENT'));
  assert.ok(init.system_config_hash.length === 64);
});

test('83_BAIS_Sublicense_Negotiator_Moats: Enforces 25k flat fee, no minors policy, and instant snapback to Swiss vault', () => {
  const negotiator = new BaisSublicenseNegotiatorEngine();
  const terms = negotiator.generateNegotiationTerms('Leon Marks / Luxembourg Golf School');

  assert.equal(terms.sow_reference, 'SOW-LUX-001');
  assert.equal(terms.commercial_moats.flat_fee_eur, 25000);
  assert.equal(terms.commercial_moats.upfront_retainer_eur, 12500);
  assert.equal(terms.commercial_moats.no_minors_policy, 'AUCUN_MINEUR_STRICT_HITL_OPERATORS_ONLY');
  assert.equal(terms.commercial_moats.snapback_clause, 'INSTANT_SEVERANCE_REVERSION_TO_AWP_SWISS_VAULT');
});

test('84_BAIR_Outbound_Recruitment_Wedge: Outbound sequence exploits regulatory fear with 3 offer tiers', () => {
  const bair = new BairOutboundCampaignEngine();
  const seq = bair.generateOutboundSequence('Dr. Jean-Pierre', 'Head of CSV', 'Novartis Pharma');

  assert.equal(seq.campaign_ref, 'BAIR-GOV-020');
  assert.equal(seq.offer_tiers.step_1_toolkit_eur, 99);
  assert.equal(seq.offer_tiers.step_2_workshop_eur, 7500);
  assert.ok(seq.generated_message.includes('EU AI Act compliance audit (Articles 10–19)'));
});

test('85_Nora_Consent_Webhook_Signoff: Nora review webhook signs and verifies payload with Adrian Daly 0x80D0ADA1', () => {
  const noraEngine = new NoraConsentWebhookEngine();
  const signed = noraEngine.processIncomingReviewPayload({
    reviewer_email: 'nora@editions.ch',
    review_text: 'Excellent translation of German botanical codex.'
  });

  assert.equal(signed.form_ref, 'AWP-DISC-BZ1-001');
  assert.ok(signed.signed_by_operator.includes('Adrian Daly (0x80D0ADA1)'));
  assert.equal(signed.status, 'STATE_RECONSTRUCTED_GnuPG_SIGNED_VERIFIED_EXTERNALLY');
  assert.ok(signed.payload_hash.length === 64);
});
