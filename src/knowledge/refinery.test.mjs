import test from 'node:test';
import assert from 'node:assert/strict';
import { runRefinery, promoteToGoverned } from './refinery.js';
import { processAccessRequest } from './api.js';

test('Knowledge Fabric: Refinery extracts RAW and DERIVED strata', () => {
  const rawRecord = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "CorkLan Community Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "NATIVE_SPEAKER",
      evidence_ref: "urn:davincia:evidence:corklan:c35bd28b-9d41-4c6e-8a2b-ef792a549db6"
    },
    sensitivity: { classification: "PUBLIC" },
    payload: {
      phrase: "Acting the gowl",
      language_lane: "Cork Slang",
      cultural_context: {
        meaning: "behaving foolishly",
        region: "Cork"
      },
      machine_translation_bridge: {
        routing_rule: "casual_context_only"
      }
    }
  };

  const { derivedRecord } = runRefinery(rawRecord);
  assert.equal(derivedRecord.asset_type, "knowledge_asset");
  assert.equal(derivedRecord.domain, "corklan");
  assert.equal(derivedRecord.licensing.commercial_available, true);
  assert.equal(derivedRecord.licensing.pricing.price, 0.05);
});

test('Knowledge Fabric: Access request generates simulated commercial entitlement', async () => {
  const rawRecord = {
    object_id: "urn:davincia:corklan:linguistic_record:acting-the-gowl",
    domain: "corklan",
    version: "1.1.0",
    lifecycle_state: "VERIFIED",
    provenance: {
      source_type: "COMMUNITY",
      source_reference: "Archive",
      geographic_origin: { latitude: 51.8985, longitude: -8.4756 },
      collected_at: "2026-08-28T12:00:00Z"
    },
    verification: {
      state: "VERIFIED",
      reviewer_role: "NATIVE_SPEAKER",
      evidence_ref: "urn:evidence:ref"
    },
    sensitivity: { classification: "PUBLIC" },
    payload: {
      phrase: "Acting the gowl",
      language_lane: "Cork Slang",
      cultural_context: { meaning: "behaving foolishly" },
      machine_translation_bridge: {
        routing_rule: "casual_context_only"
      }
    }
  };

  const { derivedRecord } = runRefinery(rawRecord);
  const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
  await promoteToGoverned(derivedRecord, actor);

  const request = {
    requester: { id: "urn:davincia:identity:user:david", class: "HUMAN" },
    assetId: "urn:davincia:knowledge:asset:acting-the-gowl",
    action: "TRANSLATE",
    purpose: "TEST_COMMERCE"
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.status, "ALLOW_WITH_CONSTRAINTS");
  assert.ok(result.commerce_event);
  assert.equal(result.commerce_event.consumer, "urn:davincia:identity:user:david");
  assert.equal(result.commerce_event.price, 0.05);
  assert.equal(result.commerce_event.entitlement, "SIMULATION_ONLY");
});

test('Knowledge Fabric: AI Agent without human authority is blocked', async () => {
  const request = {
    requester: { id: "urn:davincia:identity:agent:unauthorized-bot", class: "AI_AGENT" },
    assetId: "urn:davincia:knowledge:asset:acting-the-gowl",
    action: "TRANSLATE",
    purpose: "BOT_ACCESS"
  };

  const result = await processAccessRequest(request);
  assert.equal(result.decision.status, "DENY");
  assert.equal(result.decision.reason_code, "EXECUTION_DENIED");
});
