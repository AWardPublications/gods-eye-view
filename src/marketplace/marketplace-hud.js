/**
 * Sovereign AI Embassy Interactive Marketplace HUD Component
 * Provides live browsing, filtering, dynamic Corkonian registry ingestion,
 * and active settlement telemetry event streaming.
 */

import { discoverAssets, requestMarketplaceAccess } from './marketplace.js';
import { listRegisteredAssets } from '../knowledge/registry.js';
import { SettlementTelemetryStream } from '../governed-commerce/telemetry-stream.js';

export const BASE_MARKETPLACE_PRODUCTS = [
  {
    asset_id: "urn:davincia:product:corkman-tcg-card",
    product_code: "AWP-CRD-001-TCG",
    title: "CorkMan: Cop On Phygital Card Series",
    category: "Phygital Gaming",
    price_eur: "14.99",
    price_cents: 1499,
    description: "Sovereign physical collectible card with cryptographic DPF NFC link.",
    owner: "AWardPublications Mint",
    badge: "PHYGITAL NFC"
  },
  {
    asset_id: "urn:davincia:product:wenger-storybook",
    product_code: "AWP-BOK-001-STORY",
    title: "The Chronicles of Tuath: Legend of the Filidh",
    category: "Publishing",
    price_eur: "29.50",
    price_cents: 2950,
    description: "Governed narrative storybook with rich Celtic watercolor illustration.",
    owner: "Brehon AI Solutions",
    badge: "PRINT HARDCOVER"
  },
  {
    asset_id: "urn:davincia:product:speedgolf-coloring",
    product_code: "AWP-BOK-002-COLOR",
    title: "Alpine Speedgolf & Celtic Legends Coloring Odyssey",
    category: "Publishing",
    price_eur: "12.00",
    price_cents: 1200,
    description: "High-contrast black & white line art coloring book for speedgolfers.",
    owner: "AWardPublications",
    badge: "VECTOR ART"
  },
  {
    asset_id: "urn:davincia:product:matterhorn-fineart",
    product_code: "AWP-PST-001-ART",
    title: "Alpine Speedgolf Master Series: 18th at Matterhorn",
    category: "Fine Art",
    price_eur: "85.00",
    price_cents: 8500,
    description: "Limited edition museum-grade 24x36\" giclée archival print.",
    owner: "Swiss Alpine Archive",
    badge: "ARCHIVAL GICLÉE"
  },
  {
    asset_id: "urn:davincia:knowledge:asset:munster-slang",
    product_code: "AWP-DAT-001-SLANG",
    title: "Munster Slang & Cant Vernacular Glossary",
    category: "Governance IP",
    price_eur: "45.00",
    price_cents: 4500,
    description: "Linguistic translation database and cultural slang dialect model.",
    owner: "Brehon Legal Mint",
    badge: "DATASET API"
  }
];

export function getCombinedMarketplaceProducts() {
  const products = [...BASE_MARKETPLACE_PRODUCTS];
  try {
    const registered = listRegisteredAssets();
    for (const reg of registered) {
      if (!products.some(p => p.asset_id === reg.asset_id)) {
        products.push({
          asset_id: reg.asset_id,
          product_code: `GOV-${reg.asset_id.split(':').pop().toUpperCase()}`,
          title: reg.title,
          category: reg.domain === 'LORE_AND_CULTURE' ? 'Governance IP' : 'Publishing',
          price_eur: (reg.pricing?.base_price || 20.00).toFixed(2),
          price_cents: Math.round((reg.pricing?.base_price || 20.00) * 100),
          description: `Registered governed asset from ${reg.owner || 'Brehon Court'}.`,
          owner: reg.owner,
          badge: reg.verification_state === 'VERIFIED' ? 'VERIFIED IP' : 'CANONICAL'
        });
      }
    }
  } catch (e) {}
  return products;
}

export const MARKETPLACE_PRODUCTS = getCombinedMarketplaceProducts();

export function createMarketplaceHud() {
  let hudElement = null;
  let activeCategory = "All";
  let telemetryUnsub = null;

  function render() {
    if (document.getElementById('sovereign-marketplace-hud')) {
      document.getElementById('sovereign-marketplace-hud').style.display = 'block';
      return;
    }

    hudElement = document.createElement('div');
    hudElement.id = 'sovereign-marketplace-hud';
    hudElement.className = 'marketplace-hud-container';
    hudElement.innerHTML = `
      <style>
        .marketplace-hud-container {
          position: absolute;
          top: 24px;
          left: 24px;
          width: 540px;
          max-height: 85vh;
          background: rgba(13, 17, 23, 0.96);
          border: 1px solid rgba(46, 160, 67, 0.6);
          border-radius: 10px;
          padding: 16px;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9), 0 0 28px rgba(46, 160, 67, 0.2);
          z-index: 10002;
          backdrop-filter: blur(16px);
          font-size: 12px;
          display: flex;
          flex-direction: column;
        }
        .market-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .market-title {
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .market-badge {
          background: #238636;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .market-filter-bar {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .market-filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #8b949e;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 20px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .market-filter-btn.active {
          background: rgba(46, 160, 67, 0.25);
          border-color: #2ea043;
          color: #fff;
        }
        .market-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 400px;
          padding-right: 4px;
          margin-bottom: 12px;
        }
        .market-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: border-color 0.2s;
        }
        .market-card:hover {
          border-color: rgba(46, 160, 67, 0.5);
        }
        .market-card-title {
          font-weight: 700;
          color: #fff;
          font-size: 12px;
          margin-bottom: 2px;
        }
        .market-card-sub {
          font-size: 10px;
          color: #8b949e;
          margin-bottom: 4px;
        }
        .market-card-badge {
          display: inline-block;
          font-size: 9px;
          background: rgba(88, 166, 255, 0.15);
          color: #58a6ff;
          padding: 1px 5px;
          border-radius: 3px;
        }
        .market-card-price {
          font-size: 14px;
          font-weight: 700;
          color: #7ee787;
          text-align: right;
          margin-bottom: 4px;
        }
        .market-buy-btn {
          background: #238636;
          border: none;
          border-radius: 4px;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 5px 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .market-buy-btn:hover {
          background: #2ea043;
        }
        .market-terminal {
          background: #04070a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px;
          font-family: monospace;
          font-size: 10px;
          color: #7ee787;
          max-height: 80px;
          overflow-y: auto;
        }
        .market-close-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          font-size: 14px;
        }
        .market-close-btn:hover {
          color: #fff;
        }
      </style>

      <div class="market-header">
        <div class="market-title">
          <span class="market-badge">EMBASSY MINT</span>
          <span>SOVEREIGN COMMERCE CATALOG</span>
        </div>
        <button id="market-close-btn" class="market-close-btn">✕</button>
      </div>

      <!-- Category Filter Bar -->
      <div class="market-filter-bar">
        <button class="market-filter-btn active" data-cat="All">All Assets</button>
        <button class="market-filter-btn" data-cat="Phygital Gaming">🃏 Phygital Cards</button>
        <button class="market-filter-btn" data-cat="Publishing">📖 Storybooks & Lore</button>
        <button class="market-filter-btn" data-cat="Fine Art">🖼️ Fine Art</button>
        <button class="market-filter-btn" data-cat="Governance IP">⚖️ Legal IP</button>
      </div>

      <!-- Assets Grid -->
      <div id="market-items-grid" class="market-grid"></div>

      <!-- Live Settlement Terminal -->
      <div id="market-terminal-output" class="market-terminal">
        [Sovereign Embassy Trade Engine ready. Select an asset to clear settlement.]
      </div>
    `;

    document.body.appendChild(hudElement);
    bindEvents();
    renderCards();
    subscribeToTelemetry();
  }

  function subscribeToTelemetry() {
    if (telemetryUnsub) telemetryUnsub();
    telemetryUnsub = SettlementTelemetryStream.subscribe(event => {
      const term = hudElement?.querySelector('#market-terminal-output');
      if (term) {
        const timeShort = new Date().toLocaleTimeString();
        term.innerHTML = `<span style="color:#7ee787;">[${timeShort} LIVE CLEARING] Tx: ${event.transaction_id} | Asset: ${event.asset_id} | Settled: ${event.amount} ${event.currency}</span><br>` + term.innerHTML;
      }
    });
  }

  function renderCards() {
    const grid = hudElement.querySelector('#market-items-grid');
    grid.innerHTML = "";

    const catalog = getCombinedMarketplaceProducts();
    const items = activeCategory === "All"
      ? catalog
      : catalog.filter(p => p.category === activeCategory);

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'market-card';
      card.innerHTML = `
        <div>
          <div class="market-card-title">${item.title}</div>
          <div class="market-card-sub">${item.description}</div>
          <span class="market-card-badge">${item.badge}</span>
          <span style="font-size:9px; color:#8b949e; margin-left:6px;">${item.product_code}</span>
        </div>
        <div style="min-width: 90px; text-align: right;">
          <div class="market-card-price">€${item.price_eur}</div>
          <button class="market-buy-btn" data-id="${item.asset_id}">Checkout</button>
        </div>
      `;
      grid.appendChild(card);
    }

    // Bind checkout buttons
    grid.querySelectorAll('.market-buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        handleCheckout(btn.dataset.id);
      });
    });
  }

  async function handleCheckout(assetId) {
    const catalog = getCombinedMarketplaceProducts();
    const item = catalog.find(p => p.asset_id === assetId);
    if (!item) return;

    const term = hudElement.querySelector('#market-terminal-output');
    term.innerHTML = `[Initiating governed settlement for '${item.product_code}' (Price: €${item.price_eur})...]`;

    try {
      const passport = {
        id: "urn:davincia:passport:investor:sion_alpine",
        type: "INVESTOR",
        status: "ACTIVE",
        role: "EXTERNAL_BUYER",
        jurisdiction: "CH"
      };

      const result = await requestMarketplaceAccess(passport, item.asset_id, "READ", "SOVEREIGN_ESCROW_PASS");

      if (result.status === "DENIED" || result.settlement?.settlement_status === "FAILED") {
        term.innerHTML = `<span style="color:#ff7b72;">[TRANSACTION REJECTED]: ${result.decision?.reason_code || 'UNAUTHORIZED'}</span>`;
      } else {
        const hashShort = result.evidence?.evidence_urn ? result.evidence.evidence_urn.substring(0, 24) + '...' : 'verified';
        term.innerHTML = `<span style="color:#7ee787;"><strong>[SETTLEMENT CLEARED]</strong><br>` +
          `Asset: ${item.product_code} (€${item.price_eur})<br>` +
          `Status: AUTHORIZED & SETTLED<br>` +
          `Evidence Package: ${hashShort}</span>`;
      }
    } catch (err) {
      term.innerHTML = `<span style="color:#ff7b72;">[ERROR]: ${err.message}</span>`;
    }
  }

  function bindEvents() {
    const closeBtn = hudElement.querySelector('#market-close-btn');
    const filterBtns = hudElement.querySelectorAll('.market-filter-btn');

    closeBtn.addEventListener('click', () => {
      hudElement.style.display = 'none';
    });

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        renderCards();
      });
    });
  }

  return {
    mount: render
  };
}
