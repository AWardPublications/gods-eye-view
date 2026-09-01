/**
 * Alex Wenger 5-Mode Interactive Coaching HUD Component
 * Implements interactive visual controls for Article 19 Adaptive Coaching & DaVinciA+ Consent Gates
 */

import { WengerCoachingController, WENGER_MODES } from './coaching-controller.js';

export function createWengerHud() {
  const controller = new WengerCoachingController();
  let hudElement = null;

  function render() {
    if (document.getElementById('wenger-coaching-hud')) {
      return;
    }

    hudElement = document.createElement('div');
    hudElement.id = 'wenger-coaching-hud';
    hudElement.className = 'wenger-hud-container';
    hudElement.innerHTML = `
      <style>
        .wenger-hud-container {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 440px;
          background: rgba(14, 18, 24, 0.95);
          border: 1px solid rgba(211, 29, 54, 0.5);
          border-radius: 8px;
          padding: 16px;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(211, 29, 54, 0.2);
          z-index: 10000;
          backdrop-filter: blur(12px);
          font-size: 12px;
        }
        .wenger-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .wenger-title {
          font-weight: 700;
          font-size: 13px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .wenger-badge {
          background: #d31d36;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .wenger-mode-tabs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 4px;
          margin-bottom: 12px;
        }
        .wenger-tab-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #8b949e;
          padding: 6px 2px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 4px;
          text-align: center;
          transition: all 0.2s;
        }
        .wenger-tab-btn.active {
          background: rgba(211, 29, 54, 0.2);
          border-color: #d31d36;
          color: #fff;
        }
        .wenger-consent-bar {
          background: rgba(0, 0, 0, 0.4);
          padding: 8px;
          border-radius: 6px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
        }
        .wenger-toggle-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          color: #c9d1d9;
          cursor: pointer;
        }
        .wenger-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          margin-bottom: 12px;
        }
        .wenger-metric-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 6px;
          text-align: center;
        }
        .wenger-metric-val {
          font-weight: 700;
          font-size: 13px;
          color: #58a6ff;
        }
        .wenger-metric-lbl {
          font-size: 9px;
          color: #8b949e;
          text-transform: uppercase;
        }
        .wenger-terminal {
          background: #090d13;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 10px;
          min-height: 80px;
          max-height: 120px;
          overflow-y: auto;
          font-family: monospace;
          font-size: 11px;
          line-height: 1.4;
          color: #7ee787;
          margin-bottom: 10px;
        }
        .wenger-terminal.denied {
          color: #ff7b72;
          border-color: #d31d36;
        }
        .wenger-input-bar {
          display: flex;
          gap: 6px;
        }
        .wenger-input {
          flex: 1;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 6px 10px;
          color: #fff;
          font-size: 11px;
        }
        .wenger-send-btn {
          background: #238636;
          border: none;
          color: #fff;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>

      <div class="wenger-header">
        <div class="wenger-title">
          <span>ALEX WENGER²</span>
          <span class="wenger-badge">PCT/IE2025/050001</span>
        </div>
        <div id="wenger-policy-status" style="color: #7ee787; font-weight: 700; font-size: 10px;">
          ● AUTHORIZED
        </div>
      </div>

      <!-- 5-Mode Tabs -->
      <div class="wenger-mode-tabs">
        <button class="wenger-tab-btn active" data-mode="TRAIN">TRAIN</button>
        <button class="wenger-tab-btn" data-mode="PREPARE">PREPARE</button>
        <button class="wenger-tab-btn" data-mode="COMPETE">COMPETE</button>
        <button class="wenger-tab-btn" data-mode="REVIEW">REVIEW</button>
        <button class="wenger-tab-btn" data-mode="CAREER">CAREER</button>
      </div>

      <!-- Consent Controls -->
      <div class="wenger-consent-bar">
        <label class="wenger-toggle-label">
          <input type="checkbox" id="wenger-athlete-consent" checked>
          Athlete Consent
        </label>
        <label class="wenger-toggle-label">
          <input type="checkbox" id="wenger-human-supervision">
          Supervision
        </label>
        <label class="wenger-toggle-label">
          <input type="checkbox" id="wenger-career-optin">
          Career Opt-In
        </label>
      </div>

      <!-- Article 19 Metric Gauges -->
      <div class="wenger-metrics-grid">
        <div class="wenger-metric-box">
          <div id="wenger-compliance-val" class="wenger-metric-val">85%</div>
          <div class="wenger-metric-lbl">Compliance</div>
        </div>
        <div class="wenger-metric-box">
          <div id="wenger-sentiment-val" class="wenger-metric-val">+0.40</div>
          <div class="wenger-metric-lbl">Sentiment</div>
        </div>
        <div class="wenger-metric-box">
          <div id="wenger-tone-val" class="wenger-metric-val" style="color: #f0883e;">BASELINE</div>
          <div class="wenger-metric-lbl">Tone State</div>
        </div>
      </div>

      <!-- Coaching Output Terminal -->
      <div id="wenger-terminal-output" class="wenger-terminal">
        [Alex Wenger Voice Coach ready. Mode: TRAIN. Awaiting athlete natural language input.]
      </div>

      <!-- Input Bar -->
      <div class="wenger-input-bar">
        <input type="text" id="wenger-input-text" class="wenger-input" placeholder="Type feedback (e.g. 'Completed 10 reps of tempo drill')...">
        <button id="wenger-send-btn" class="wenger-send-btn">Send</button>
      </div>
    `;

    document.body.appendChild(hudElement);
    bindEvents();
  }

  function bindEvents() {
    const tabs = hudElement.querySelectorAll('.wenger-tab-btn');
    const athleteConsentBox = hudElement.querySelector('#wenger-athlete-consent');
    const humanSupervisionBox = hudElement.querySelector('#wenger-human-supervision');
    const careerOptinBox = hudElement.querySelector('#wenger-career-optin');
    const inputField = hudElement.querySelector('#wenger-input-text');
    const sendBtn = hudElement.querySelector('#wenger-send-btn');
    const terminal = hudElement.querySelector('#wenger-terminal-output');
    const policyStatus = hudElement.querySelector('#wenger-policy-status');

    function syncConsent() {
      controller.setConsent(
        athleteConsentBox.checked,
        careerOptinBox.checked,
        humanSupervisionBox.checked
      );
      updatePolicyBadge();
    }

    function updatePolicyBadge() {
      const modeKey = controller.currentMode;
      const modeConfig = WENGER_MODES[modeKey];
      const decision = controller.evaluateAccess(modeConfig.action);
      
      if (decision.status === "ALLOW") {
        policyStatus.innerText = "● AUTHORIZED";
        policyStatus.style.color = "#7ee787";
      } else {
        policyStatus.innerText = `● ${decision.reason_code}`;
        policyStatus.style.color = "#ff7b72";
      }
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        controller.setMode(btn.dataset.mode);
        syncConsent();
        terminal.innerText = `[Switched to Mode: ${btn.dataset.mode} - ${WENGER_MODES[btn.dataset.mode].description}]`;
        terminal.classList.remove('denied');
      });
    });

    athleteConsentBox.addEventListener('change', syncConsent);
    humanSupervisionBox.addEventListener('change', syncConsent);
    careerOptinBox.addEventListener('change', syncConsent);

    function handleSubmit() {
      const text = inputField.value.trim();
      if (!text) return;

      const res = controller.processCoachingTurn(text);
      inputField.value = "";

      if (res.status === "DENIED") {
        terminal.classList.add('denied');
        terminal.innerHTML = `<strong>[GOVERNANCE BLOCK]</strong><br>${res.message}<br><small>Reason: ${res.reason_code}</small>`;
      } else {
        terminal.classList.remove('denied');
        const out = res.coaching_output;
        const metrics = res.result.evaluation_metrics;
        
        // Update metric gauges
        hudElement.querySelector('#wenger-compliance-val').innerText = `${Math.round(res.result.structured_input.compliance_score * 100)}%`;
        hudElement.querySelector('#wenger-sentiment-val').innerText = (res.result.structured_input.sentiment_polarity >= 0 ? "+" : "") + res.result.structured_input.sentiment_polarity.toFixed(2);
        hudElement.querySelector('#wenger-tone-val').innerText = out.tone_state;

        terminal.innerHTML = `<strong>[Coach Response - ${out.tone_framing}]:</strong><br>${out.text}<br><br><small style="color: #8b949e;">Modality: ${out.delivery_modality} | Complexity: ${out.complexity}</small>`;
      }
      updatePolicyBadge();
    }

    sendBtn.addEventListener('click', handleSubmit);
    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
    });
  }

  return {
    mount: render,
    controller
  };
}
