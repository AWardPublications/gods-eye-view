import test from 'node:test';
import assert from 'node:assert/strict';
import { EMBASSY_NODES, TRADE_CORRIDORS, EmbassyTradeCorridorsLayer } from '../../src/data/embassyTradeCorridors.js';
import { MARKETPLACE_PRODUCTS } from '../../src/marketplace/marketplace-hud.js';
import { requestMarketplaceAccess } from '../../src/marketplace/marketplace.js';
import { createGevActionRunner } from '../../src/voice/gevActions.js';

test('Sovereign Embassy: Node Registry & Trade Corridor Verification', () => {
  // 1. Check Key Sovereign Hubs
  const sion = EMBASSY_NODES.find(n => n.id === 'node-sion');
  assert.ok(sion);
  assert.equal(sion.country, 'Switzerland');
  assert.equal(sion.badge, 'PATENT ANCHOR');

  const cork = EMBASSY_NODES.find(n => n.id === 'node-cork');
  assert.ok(cork);
  assert.equal(cork.country, 'Ireland');
  assert.equal(cork.badge, 'PHYGITAL MINT');

  assert.equal(EMBASSY_NODES.length, 5);
  assert.equal(TRADE_CORRIDORS.length, 4);
});

test('Sovereign Embassy: 3D Trade Corridors Layer Lifecycle', () => {
  const addedEntities = [];
  const removedEntities = [];

  const mockViewer = {
    entities: {
      add: (ent) => {
        addedEntities.push(ent);
        return ent;
      },
      remove: (ent) => {
        removedEntities.push(ent);
        return true;
      }
    }
  };

  const layer = new EmbassyTradeCorridorsLayer(mockViewer);
  assert.equal(layer.enabled, false);

  // Enable layer
  layer.enable();
  assert.equal(layer.enabled, true);
  assert.equal(addedEntities.length, 9); // 5 nodes + 4 corridors

  // Disable layer
  layer.disable();
  assert.equal(layer.enabled, false);
  assert.equal(removedEntities.length, 9);
});

import { registerExternalParticipant } from '../../src/governed-commerce/registration.js';

test('Sovereign Marketplace: Catalog Inventory & Governed Settlement', async () => {
  assert.equal(MARKETPLACE_PRODUCTS.length, 5);

  const cardProduct = MARKETPLACE_PRODUCTS.find(p => p.product_code === 'AWP-CRD-001-TCG');
  assert.ok(cardProduct);
  assert.equal(cardProduct.category, 'Phygital Gaming');
  assert.equal(cardProduct.price_cents, 1499);

  // Execute Governed Settlement Checkout with registered participant
  const humanBuyer = registerExternalParticipant({ id: "urn:id:user:sion_buyer", name: "Sion Alpine Buyer" }, "HUMAN");

  const res = await requestMarketplaceAccess(humanBuyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");

  assert.equal(res.status, "SETTLED");
  assert.equal(res.decision.decision, "ALLOW");
  assert.equal(res.settlement.settlement_status, "SETTLED");
  assert.ok(res.evidence.evidence_urn.startsWith("urn:davincia:evidence:package:"));
});

test('Sovereign Embassy: Realtime Voice Actions Integration', async () => {
  const mockViewer = {
    camera: { moveEnd: { addEventListener() {} }, positionWC: { x: 0, y: 0, z: 0 } },
    trackedEntity: null,
    clock: { onTick: { addEventListener: () => () => {} } },
    scene: {
      canvas: { clientWidth: 1200, clientHeight: 800, addEventListener() {}, removeEventListener() {} },
      globe: { getHeight: () => 0 },
      camera: { moveStart: { addEventListener() {} } },
      postRender: { addEventListener() {} }
    }
  };

  const runner = createGevActionRunner({
    viewer: mockViewer,
    styleManager: {},
    dataManager: { layers: new Map() }
  });

  // 1. Show Trade Corridors
  const corridorRes = await runner('show_trade_corridors');
  assert.equal(corridorRes.ok, true);
  assert.equal(corridorRes.nodes.length, 5);
  assert.equal(corridorRes.corridors.length, 4);

  // 2. Open Marketplace
  const marketRes = await runner('open_marketplace');
  assert.equal(marketRes.ok, true);
  assert.equal(marketRes.status, 'OPENED');
  assert.equal(marketRes.catalog_count, 5);
});
