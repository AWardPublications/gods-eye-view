import { createHash } from 'node:crypto';

/**
 * PRODUCTION PACK SHOP ENGINE (DAVINCIA-SHOP-SYMBIOSIS-v1.0)
 * Integrates physical & digital products via unified Production Packs ("One Pack -> Many Outputs")
 * and links Governed Agents directly as Product Merchants & Stewards.
 */
export class ProductionPackShopEngine {
  constructor() {
    this.productSeriesRegistry = [
      {
        series_id: 'SERIES_01_ACTIVE',
        name: 'COP ON: Series One — The Corkonian Game',
        status: 'ACTIVE_SHOP',
        steward_agent: 'CorkMan (Aidy O\'Dalaigh)',
        steward_gpg: '0x80D0ADA1_CORK',
        products: [
          { id: 'prod_tcg_deck_01', title: 'COP ON Series One Master Starter Deck (60 Cards + Foil Aidy O\'Dalaigh)', priceEur: 29.99, format: 'PHYGITAL_TCG' },
          { id: 'prod_tcg_booster_01', title: 'Shandon Bell Ringer 15-Card Foil Booster Pack', priceEur: 6.99, format: 'PHYGITAL_TCG' },
          { id: 'prod_tcg_binder_01', title: 'Lee Side Collector Binder & NFC Entitlement Chip', priceEur: 19.99, format: 'PHYSICAL_ACCESSORY' }
        ]
      },
      {
        series_id: 'SERIES_02_INCOMING',
        name: 'Alex Wenger Alpine Aerodynamics Pro-Kit',
        status: 'WAITING_FOR_PRODUCTION_PACK',
        steward_agent: 'Alex Wenger',
        steward_gpg: '0x80D0ADA1_WENGER',
        products: [
          { id: 'prod_wenger_ballistics_01', title: 'Alpine WASM Aero Trajectory Suite (1-Year Sub)', priceEur: 149.00, format: 'DIGITAL_WASM' },
          { id: 'prod_wenger_sensor_01', title: 'Physical Clubhead Radar Sensor & Calibration NFC Tag', priceEur: 299.00, format: 'HARDWARE_SENSOR' }
        ]
      },
      {
        series_id: 'SERIES_03_INCOMING',
        name: 'A.Ward Publications Leatherbound Hardcover Vault',
        status: 'WAITING_FOR_PRODUCTION_PACK',
        steward_agent: 'Nora',
        steward_gpg: '0x80D0ADA1_NORA',
        products: [
          { id: 'prod_award_book_01', title: 'Bisse du Ro Alpine-Atlantic Codex (Numbered Limited Edition)', priceEur: 89.00, format: 'HARDCOVER_PRINT' },
          { id: 'prod_award_book_02', title: 'Sovereign Embassy History ISBN Collector Box Set', priceEur: 199.00, format: 'HARDCOVER_PRINT' }
        ]
      },
      {
        series_id: 'SERIES_04_INCOMING',
        name: 'GRANT GEDHI Capital OS Enterprise Licensing',
        status: 'WAITING_FOR_PRODUCTION_PACK',
        steward_agent: 'Grant GEDHI',
        steward_gpg: '0x80D0ADA1_GEDHI',
        products: [
          { id: 'prod_gedhi_sub_01', title: 'GRANT GEDHI Sub-12s Enterprise Provisioner Token', priceEur: 2500.00, format: 'ENTERPRISE_TOKEN' }
        ]
      }
    ];
  }

  getSeries(seriesId) {
    return this.productSeriesRegistry.find(s => s.series_id === seriesId);
  }

  createProductionPack(seriesId, productId, primaryAssetHash) {
    const series = this.getSeries(seriesId);
    if (!series) throw new Error(`Series ${seriesId} not found.`);

    const product = series.products.find(p => p.id === productId);
    if (!product) throw new Error(`Product ${productId} not found in series ${seriesId}.`);

    const timestamp = new Date().toISOString();
    const packId = `pack_${createHash('md5').update(`${productId}:${primaryAssetHash}:${timestamp}`).digest('hex').substring(0, 10)}`;

    const productionPack = {
      pack_id: packId,
      series_id: seriesId,
      product_id: productId,
      title: product.title,
      steward_agent: series.steward_agent,
      primary_asset_hash: primaryAssetHash,
      evidence_root: {
        gpgSignature: '0x80D0ADA1',
        alcoaPlusLogged: true,
        lifecycleStage: 'STAGE_09_FULFILLMENT_READY'
      },
      outputs: ['PHYGITAL_PRODUCT', 'DIGITAL_ENTITLEMENT_TOKEN', 'NFC_PROVENANCE_CHIP'],
      created_at: timestamp,
      pack_hash: createHash('sha256').update(productId + primaryAssetHash).digest('hex')
    };

    return productionPack;
  }
}
