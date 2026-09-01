import test from 'node:test';
import assert from 'node:assert/strict';
import { EMBASSY_NODES, TRADE_CORRIDORS, EmbassyTradeCorridorsLayer, flyToEmbassyNode, flyTradeCorridor } from '../../src/data/embassyTradeCorridors.js';
import { getCombinedMarketplaceProducts, createMarketplaceHud } from '../../src/marketplace/marketplace-hud.js';
import { requestMarketplaceAccess } from '../../src/marketplace/marketplace.js';
import { registerExternalParticipant } from '../../src/governed-commerce/registration.js';
import { SettlementTelemetryStream } from '../../src/governed-commerce/telemetry-stream.js';
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

test('Sovereign Embassy: 3D Trade Corridors Layer Lifecycle & Camera Flight', () => {
  const addedEntities = [];
  const removedEntities = [];
  let flownTo = null;

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
    },
    camera: {
      flyTo: (opts) => {
        flownTo = opts;
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

  // Test Camera FlyTo Verbs
  const flewNode = flyToEmbassyNode(mockViewer, 'node-sion');
  assert.equal(flewNode, true);
  assert.ok(flownTo);

  const flewCorridor = flyTradeCorridor(mockViewer, 'node-cork', 'node-sion');
  assert.equal(flewCorridor, true);
  assert.ok(flownTo);
});

test('Sovereign Marketplace: Dynamic Corkonian Registry Ingestion & Telemetry Pub-Sub', async () => {
  const catalog = getCombinedMarketplaceProducts();
  assert.ok(catalog.length >= 5);

  // Check CorkMan TCG
  const cardProduct = catalog.find(p => p.product_code === 'AWP-CRD-001-TCG');
  assert.ok(cardProduct);
  assert.equal(cardProduct.category, 'Phygital Gaming');

  // Verify Telemetry Pub-Sub Event Dispatching
  let receivedEvent = null;
  const unsub = SettlementTelemetryStream.subscribe(event => {
    receivedEvent = event;
  });

  const humanBuyer = registerExternalParticipant({ id: "urn:id:user:sion_buyer_2", name: "Sion Alpine Buyer 2" }, "HUMAN");
  const res = await requestMarketplaceAccess(humanBuyer, "urn:davincia:knowledge:asset:brehon-ip", "READ");

  assert.equal(res.status, "SETTLED");
  assert.equal(res.decision.decision, "ALLOW");
  assert.equal(res.settlement.settlement_status, "SETTLED");
  assert.ok(res.evidence.evidence_urn.startsWith("urn:davincia:evidence:package:"));

  // Check Telemetry Stream was populated
  assert.ok(receivedEvent);
  assert.equal(receivedEvent.event_type, "TRANSACTION_SETTLED");
  assert.equal(receivedEvent.asset_id, "urn:davincia:knowledge:asset:brehon-ip");

  unsub();
});

test('Sovereign Embassy: Realtime Voice Actions Integration (Corridors & Camera)', async () => {
  let cameraFlown = null;
  const mockViewer = {
    camera: {
      flyTo: (opts) => { cameraFlown = opts; },
      moveEnd: { addEventListener() {} },
      positionWC: { x: 0, y: 0, z: 0 }
    },
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

  // 2. Open Marketplace
  const marketRes = await runner('open_marketplace');
  assert.equal(marketRes.ok, true);
  assert.equal(marketRes.status, 'OPENED');

  // 3. Fly to Embassy Node (Sion)
  const flyNodeRes = await runner('fly_to_embassy_node', { node_id: 'node-sion' });
  assert.equal(flyNodeRes.ok, true);
  assert.equal(flyNodeRes.flown, true);
  assert.equal(flyNodeRes.target_node, 'Sion / Valais Innovation Hub');

  // 4. Fly Trade Corridor (Cork -> Sion)
  const flyCorridorRes = await runner('fly_trade_corridor', { from: 'node-cork', to: 'node-sion' });
  assert.equal(flyCorridorRes.ok, true);
  assert.equal(flyCorridorRes.flown, true);
});
