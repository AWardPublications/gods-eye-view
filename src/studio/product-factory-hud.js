/**
 * AWardPublications Multi-Format Product Factory HUD Component
 * Interactive Studio Panel for compiling Storybooks, Coloring Books, Phygital Cards, and Fine Art Posters.
 */

import { MultiFormatProductCompiler, PRODUCT_TEMPLATES } from '../compiler/productCompiler.js';
import { ProductLayoutRenderer } from './product-renderer.js';

export function createProductFactoryHud() {
  const compiler = new MultiFormatProductCompiler();
  let hudElement = null;
  let selectedFormat = "tcg_playing_card";

  function render() {
    if (document.getElementById('product-factory-hud')) {
      document.getElementById('product-factory-hud').style.display = 'block';
      return;
    }

    hudElement = document.createElement('div');
    hudElement.id = 'product-factory-hud';
    hudElement.className = 'factory-hud-container';
    hudElement.innerHTML = `
      <style>
        .factory-hud-container {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 480px;
          background: rgba(13, 17, 23, 0.96);
          border: 1px solid rgba(88, 166, 255, 0.5);
          border-radius: 10px;
          padding: 16px;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9), 0 0 28px rgba(88, 166, 255, 0.2);
          z-index: 10001;
          backdrop-filter: blur(16px);
          font-size: 12px;
        }
        .factory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .factory-title {
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .factory-badge {
          background: #1f6feb;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }
        .factory-format-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .factory-tab-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #8b949e;
          padding: 8px 4px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 6px;
          text-align: center;
          transition: all 0.2s;
        }
        .factory-tab-btn.active {
          background: rgba(31, 111, 235, 0.3);
          border-color: #58a6ff;
          color: #fff;
        }
        .factory-preview-card {
          background: #090d13;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 12px;
          min-height: 120px;
        }
        .factory-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .factory-preview-code {
          font-family: monospace;
          color: #f0883e;
          font-size: 11px;
          font-weight: 700;
        }
        .factory-preview-dims {
          font-size: 10px;
          color: #8b949e;
        }
        .factory-style-chip {
          display: inline-block;
          background: rgba(88, 166, 255, 0.15);
          color: #58a6ff;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          margin-bottom: 8px;
        }
        .factory-seal-chip {
          display: inline-block;
          background: rgba(46, 160, 67, 0.15);
          color: #7ee787;
          border: 1px solid rgba(46, 160, 67, 0.4);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        .factory-inputs {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .factory-input-row {
          display: flex;
          gap: 6px;
        }
        .factory-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 7px 10px;
          color: #fff;
          font-size: 11px;
          outline: none;
        }
        .factory-input:focus {
          border-color: #58a6ff;
        }
        .factory-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
        }
        .factory-stat-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 4px;
          text-align: center;
        }
        .factory-stat-box label {
          display: block;
          font-size: 9px;
          color: #8b949e;
          text-transform: uppercase;
        }
        .factory-stat-box input {
          width: 100%;
          background: transparent;
          border: none;
          color: #fff;
          text-align: center;
          font-size: 11px;
          font-weight: 700;
          outline: none;
        }
        .factory-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .factory-compile-btn {
          background: #238636;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-weight: 700;
          font-size: 11px;
          padding: 8px 16px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .factory-compile-btn:hover {
          background: #2ea043;
        }
        .factory-close-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          font-size: 14px;
        }
        .factory-close-btn:hover {
          color: #fff;
        }
        .factory-output-log {
          background: #04070a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 8px;
          margin-top: 10px;
          font-family: monospace;
          font-size: 10px;
          color: #7ee787;
          max-height: 80px;
          overflow-y: auto;
        }
      </style>

      <div class="factory-header">
        <div class="factory-title">
          <span class="factory-badge">DVA FACTORY</span>
          <span>MULTI-FORMAT COMPILER</span>
        </div>
        <button id="factory-close-btn" class="factory-close-btn">✕</button>
      </div>

      <!-- Format Tabs -->
      <div class="factory-format-grid">
        <button class="factory-tab-btn active" data-format="tcg_playing_card">🃏 Phygital Card</button>
        <button class="factory-tab-btn" data-format="narrative_storybook">📖 Storybook</button>
        <button class="factory-tab-btn" data-format="coloring_book">🎨 Coloring Book</button>
        <button class="factory-tab-btn" data-format="fine_art_poster">🖼️ Art Poster</button>
      </div>

      <!-- Preview Mockup -->
      <div class="factory-preview-card">
        <div class="factory-preview-header">
          <span id="factory-preview-code" class="factory-preview-code">AWP-CRD-001-TCG</span>
          <span id="factory-preview-dims" class="factory-preview-dims">2.5x3.5" (Poker Standard) • 600 DPI</span>
        </div>
        <div id="factory-svg-viewport" style="max-height: 200px; overflow: hidden; display: flex; justify-content: center; margin: 8px 0; border-radius: 8px;"></div>
        <div id="factory-style-chip" class="factory-style-chip">collectible card dynamic splash art</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div id="factory-seal-chip" class="factory-seal-chip">● COP-ON-GENUINE-CARD-v1</div>
          <span style="font-size: 10px; color: #8b949e;">CMYK Bleed: Calibrated</span>
        </div>
      </div>

      <!-- Dynamic Inputs -->
      <div class="factory-inputs">
        <div class="factory-input-row">
          <input type="text" id="factory-headline-input" class="factory-input" placeholder="Headline / Character Name..." value="CorkMan (Alpine Legend)">
        </div>

        <!-- TCG Stats Container -->
        <div id="factory-tcg-stats-container" class="factory-stats-grid">
          <div class="factory-stat-box">
            <label>Sound</label>
            <input type="number" id="factory-stat-sound" value="6" min="0" max="24">
          </div>
          <div class="factory-stat-box">
            <label>Cop On</label>
            <input type="number" id="factory-stat-copon" value="6" min="0" max="24">
          </div>
          <div class="factory-stat-box">
            <label>Neck</label>
            <input type="number" id="factory-stat-neck" value="6" min="0" max="24">
          </div>
          <div class="factory-stat-box">
            <label>Rebel</label>
            <input type="number" id="factory-stat-rebel" value="6" min="0" max="24">
          </div>
        </div>

        <!-- Text Container for Storybook -->
        <div id="factory-text-container" style="display: none;">
          <input type="text" id="factory-story-input" class="factory-input" placeholder="Narrative text (min 50 chars)..." value="Across the high alpine ridge, the mist unveiled the legendary swing of Alex Wenger.">
        </div>
      </div>

      <!-- Actions -->
      <div class="factory-action-bar">
        <span id="factory-status-msg" style="font-size: 10px; color: #8b949e;">Ready for compilation.</span>
        <button id="factory-compile-btn" class="factory-compile-btn">⚙️ Compile & Mint</button>
      </div>

      <!-- Output Log -->
      <div id="factory-output-log" class="factory-output-log">
        [DaVinciA+ Multi-Format Compiler Engine ready. Select format and press Compile.]
      </div>
    `;

    document.body.appendChild(hudElement);
    bindEvents();
  }

  function bindEvents() {
    const tabs = hudElement.querySelectorAll('.factory-tab-btn');
    const closeBtn = hudElement.querySelector('#factory-close-btn');
    const compileBtn = hudElement.querySelector('#factory-compile-btn');
    const headlineInput = hudElement.querySelector('#factory-headline-input');
    const tcgStatsContainer = hudElement.querySelector('#factory-tcg-stats-container');
    const textContainer = hudElement.querySelector('#factory-text-container');
    const logOutput = hudElement.querySelector('#factory-output-log');
    const statusMsg = hudElement.querySelector('#factory-status-msg');

    function updatePreview() {
      const template = PRODUCT_TEMPLATES[selectedFormat];
      hudElement.querySelector('#factory-preview-code').innerText = template.product_code;
      hudElement.querySelector('#factory-preview-dims').innerText = `${template.dimensions} • ${template.dpi} DPI`;
      hudElement.querySelector('#factory-style-chip').innerText = template.visual_strategy.style_modifier.substring(0, 50) + '...';
      hudElement.querySelector('#factory-seal-chip').innerText = `● ${template.governance_stamps.visual_overlay.regulatory_seal}`;

      if (selectedFormat === 'tcg_playing_card') {
        tcgStatsContainer.style.display = 'grid';
        textContainer.style.display = 'none';
      } else if (selectedFormat === 'narrative_storybook') {
        tcgStatsContainer.style.display = 'none';
        textContainer.style.display = 'block';
      } else {
        tcgStatsContainer.style.display = 'none';
        textContainer.style.display = 'none';
      }

      // Live SVG Render
      const headline = headlineInput ? headlineInput.value.trim() : "Product Preview";
      const svg = ProductLayoutRenderer.renderSvg({
        product_type: selectedFormat,
        product_code: template.product_code,
        headline,
        character_name: headline,
        narrative_text: textContainer.querySelector('input')?.value || "Across the high alpine ridge, the legend prepared for the final approach.",
        stats: { sound: 6, cop_on: 6, neck: 6, rebel: 6 },
        stamps: template.governance_stamps
      });
      const svgViewport = hudElement.querySelector('#factory-svg-viewport');
      if (svgViewport) {
        svgViewport.innerHTML = svg;
      }
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
        updatePreview();
      });
    });

    closeBtn.addEventListener('click', () => {
      hudElement.style.display = 'none';
    });

    compileBtn.addEventListener('click', () => {
      const headline = headlineInput.value.trim();
      const inputData = { headline };

      if (selectedFormat === 'tcg_playing_card') {
        const sound = parseInt(hudElement.querySelector('#factory-stat-sound').value, 10) || 0;
        const copOn = parseInt(hudElement.querySelector('#factory-stat-copon').value, 10) || 0;
        const neck = parseInt(hudElement.querySelector('#factory-stat-neck').value, 10) || 0;
        const rebel = parseInt(hudElement.querySelector('#factory-stat-rebel').value, 10) || 0;
        inputData.stats = { sound, cop_on: copOn, neck, rebel };
        inputData.base_power = 24;
        inputData.character_name = headline;
      } else if (selectedFormat === 'narrative_storybook') {
        inputData.text = hudElement.querySelector('#factory-story-input').value;
      }

      try {
        const res = compiler.compileProduct(selectedFormat, inputData);
        statusMsg.innerText = `● Compiled ${res.product_code}`;
        statusMsg.style.color = "#7ee787";

        logOutput.innerHTML = `<strong>[COMPILED & MINTED SUCCESS]</strong><br>` +
          `Product Code: ${res.product_code}<br>` +
          `Receipt Ref: ${res.evidence.evidence_ref}<br>` +
          `Evidence Hash: ${res.evidence.evidence_hash}<br>` +
          `Layout Bleed: ${res.artifact.layout.page_style}`;
      } catch (err) {
        statusMsg.innerText = `● Error`;
        statusMsg.style.color = "#ff7b72";
        logOutput.innerHTML = `<span style="color:#ff7b72;"><strong>[COMPILATION FAILED]:</strong> ${err.message}</span>`;
      }
    });
  }

  return {
    mount: render,
    compiler
  };
}
