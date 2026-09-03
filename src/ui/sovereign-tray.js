/**
 * Sovereign AI Embassy Quick Launch Tray Component
 * Mounts an ergonomic floating dock at the bottom of God's Eye View to toggle
 * the 5-Mode Coaching HUD, Product Factory, Marketplace, Trade Corridors, and Speedgolf Simulator.
 */

import { createWengerHud } from '../wenger/wenger-hud.js';
import { createProductFactoryHud } from '../studio/product-factory-hud.js';
import { createMarketplaceHud } from '../marketplace/marketplace-hud.js';
import { createAuditViewerHud } from './audit-viewer-hud.js';
import { EmbassyTradeCorridorsLayer } from '../data/embassyTradeCorridors.js';
import { SpeedgolfTelemetrySimulator } from '../golf/simulator/speedgolf-sim.js';

export function createSovereignTray(options = {}) {
  const viewer = options.viewer || null;
  let trayElement = null;

  const wengerHud = createWengerHud();
  const factoryHud = createProductFactoryHud();
  const marketHud = createMarketplaceHud();
  const auditHud = createAuditViewerHud();
  const corridorsLayer = viewer ? new EmbassyTradeCorridorsLayer(viewer) : null;
  const speedgolfSim = new SpeedgolfTelemetrySimulator();

  function render() {
    if (document.getElementById('sovereign-tray-dock')) return;

    trayElement = document.createElement('div');
    trayElement.id = 'sovereign-tray-dock';
    trayElement.className = 'sovereign-tray-container';
    trayElement.innerHTML = `
      <style>
        .sovereign-tray-container {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(13, 17, 23, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 30px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 9999;
          backdrop-filter: blur(16px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(88, 166, 255, 0.2);
        }
        .sovereign-tray-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #c9d1d9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sovereign-tray-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.3);
        }
        .sovereign-tray-btn.active {
          background: rgba(88, 166, 255, 0.25);
          border-color: #58a6ff;
          color: #fff;
        }
      </style>

      <button id="tray-btn-wenger" class="sovereign-tray-btn">
        <span>🎙️</span>
        <span>Alex Wenger²</span>
      </button>

      <button id="tray-btn-factory" class="sovereign-tray-btn">
        <span>🏭</span>
        <span>Product Factory</span>
      </button>

      <button id="tray-btn-market" class="sovereign-tray-btn">
        <span>🏛️</span>
        <span>Marketplace</span>
      </button>

      <button id="tray-btn-corridors" class="sovereign-tray-btn">
        <span>🌐</span>
        <span>Trade Corridors</span>
      </button>

      <button id="tray-btn-audit" class="sovereign-tray-btn">
        <span>📜</span>
        <span>Audit Dossier</span>
      </button>

      <button id="tray-btn-sim" class="sovereign-tray-btn">
        <span>⛳</span>
        <span>Simulate Round</span>
      </button>
    `;

    document.body.appendChild(trayElement);
    bindEvents();
  }

  function bindEvents() {
    const wengerBtn = trayElement.querySelector('#tray-btn-wenger');
    const factoryBtn = trayElement.querySelector('#tray-btn-factory');
    const marketBtn = trayElement.querySelector('#tray-btn-market');
    const corridorsBtn = trayElement.querySelector('#tray-btn-corridors');
    const auditBtn = trayElement.querySelector('#tray-btn-audit');
    const simBtn = trayElement.querySelector('#tray-btn-sim');

    wengerBtn.addEventListener('click', () => {
      wengerHud.mount();
    });

    factoryBtn.addEventListener('click', () => {
      factoryHud.mount();
    });

    marketBtn.addEventListener('click', () => {
      marketHud.mount();
    });

    auditBtn.addEventListener('click', () => {
      auditHud.mount();
    });

    corridorsBtn.addEventListener('click', () => {
      if (corridorsLayer) {
        if (corridorsLayer.enabled) {
          corridorsLayer.disable();
          corridorsBtn.classList.remove('active');
        } else {
          corridorsLayer.enable();
          corridorsBtn.classList.add('active');
        }
      }
    });

    simBtn.addEventListener('click', async () => {
      simBtn.innerText = "⏳ Playing...";
      const result = await speedgolfSim.simulateFullRound();
      simBtn.innerText = `⛳ Score: ${result.final_speedgolf_score}`;
      alert(`Alpine Speedgolf Round Completed!\nCourse: ${result.course}\nStrokes: ${result.total_strokes}\nTime: ${result.total_time_min} mins\nFinal Speedgolf Score: ${result.final_speedgolf_score}`);
    });
  }

  return {
    mount: render,
    wengerHud,
    factoryHud,
    marketHud,
    auditHud,
    corridorsLayer,
    speedgolfSim
  };
}
