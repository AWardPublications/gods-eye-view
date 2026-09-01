/**
 * Alex Wenger 5-Mode Interactive Coaching HUD Component
 * Implements interactive visual controls for Article 19 Adaptive Coaching, DaVinciA+ Consent Gates,
 * and Live Voice/Audio Speech Synthesis with Dynamic Tone Pacing.
 */

import { AlexWengerSubsystem, OPERATING_MODES } from '../golf/index.js';
import { WengerVoiceProxy } from '../voice/wengerVoiceProxy.js';

export function createWengerHud() {
  const subsystem = new AlexWengerSubsystem({ storageFilePath: 'data/athlete_sessions.jsonl' });
  const voiceProxy = new WengerVoiceProxy({
    onStateChange: (state) => updateVoiceIndicator(state)
  });

  let hudElement = null;
  let currentMode = "TRAIN";
  let audioEnabled = true;

  function render() {
    if (document.getElementById('wenger-coaching-hud')) {
      document.getElementById('wenger-coaching-hud').style.display = 'block';
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
          width: 460px;
          background: rgba(14, 18, 24, 0.95);
          border: 1px solid rgba(211, 29, 54, 0.6);
          border-radius: 8px;
          padding: 16px;
          color: #e6edf3;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.85), 0 0 24px rgba(211, 29, 54, 0.25);
          z-index: 10000;
          backdrop-filter: blur(14px);
          font-size: 12px;
        }
        .wenger-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
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
          letter-spacing: 0.5px;
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
          background: rgba(211, 29, 54, 0.25);
          border-color: #d31d36;
          color: #fff;
        }
        .wenger-consent-bar {
          background: rgba(0, 0, 0, 0.4);
          padding: 8px 10px;
          border-radius: 6px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .wenger-toggle-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #c9d1d9;
          cursor: pointer;
        }
        .wenger-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-bottom: 12px;
        }
        .wenger-metric-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 8px 4px;
          text-align: center;
        }
        .wenger-metric-val {
          font-size: 13px;
          font-weight: 700;
          color: #58a6ff;
          margin-bottom: 2px;
        }
        .wenger-metric-lbl {
          font-size: 9px;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .wenger-visualizer-bar {
          height: 18px;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 10px;
          color: #8b949e;
        }
        .wenger-visualizer-bar.speaking {
          border-color: #58a6ff;
          color: #58a6ff;
          background: rgba(88, 166, 255, 0.15);
          animation: pulse-border 1s infinite alternate;
        }
        .wenger-visualizer-bar.listening {
          border-color: #d31d36;
          color: #ff7b72;
          background: rgba(211, 29, 54, 0.15);
          animation: pulse-border 0.8s infinite alternate;
        }
        @keyframes pulse-border {
          from { opacity: 0.7; }
          to { opacity: 1.0; }
        }
        .wenger-terminal {
          background: #090d13;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 10px;
          height: 110px;
          overflow-y: auto;
          font-family: monospace;
          color: #7ee787;
          font-size: 11px;
          line-height: 1.4;
          margin-bottom: 12px;
        }
        .wenger-terminal.denied {
          color: #ff7b72;
          border-color: rgba(211, 29, 54, 0.6);
        }
        .wenger-input-bar {
          display: flex;
          gap: 6px;
        }
        .wenger-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 8px 10px;
          color: #fff;
          font-size: 11px;
          outline: none;
        }
        .wenger-input:focus {
          border-color: #d31d36;
        }
        .wenger-send-btn, .wenger-voice-btn {
          background: #d31d36;
          border: none;
          border-radius: 4px;
          color: #fff;
          font-weight: 600;
          font-size: 11px;
          padding: 0 12px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .wenger-send-btn:hover, .wenger-voice-btn:hover {
          background: #b5152b;
        }
        .wenger-voice-btn.active {
          background: #238636;
        }
        .wenger-close-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          cursor: pointer;
          font-size: 14px;
          line-height: 1;
        }
        .wenger-close-btn:hover {
          color: #fff;
        }
      </style>

      <!-- Header -->
      <div class="wenger-header">
        <div class="wenger-title">
          <span class="wenger-badge">WENGER² AI</span>
          <span>ALPINE SPEEDGOLF COACH</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span id="wenger-policy-status" style="font-size: 10px; color: #7ee787;">● AUTHORIZED</span>
          <button id="wenger-close-btn" class="wenger-close-btn">✕</button>
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

      <!-- Consent & Audio Controls -->
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
        <label class="wenger-toggle-label">
          <input type="checkbox" id="wenger-audio-toggle" checked>
          Voice Audio
        </label>
      </div>

      <!-- Article 19 Metric Gauges -->
      <div class="wenger-metrics-grid">
        <div class="wenger-metric-box">
          <div id="wenger-compliance-val" class="wenger-metric-val">80%</div>
          <div class="wenger-metric-lbl">Compliance</div>
        </div>
        <div class="wenger-metric-box">
          <div id="wenger-sentiment-val" class="wenger-metric-val">+0.40</div>
          <div class="wenger-metric-lbl">Sentiment</div>
        </div>
        <div class="wenger-metric-box">
          <div id="wenger-tone-val" class="wenger-metric-val" style="color: #58a6ff;">BASELINE</div>
          <div class="wenger-metric-lbl">Tone State</div>
        </div>
        <div class="wenger-metric-box">
          <div id="wenger-pacing-val" class="wenger-metric-val">1.0x</div>
          <div class="wenger-metric-lbl">Pacing</div>
        </div>
      </div>

      <!-- Voice Waveform / Status Indicator -->
      <div id="wenger-voice-indicator" class="wenger-visualizer-bar">
        <span>● Voice Ready (Web Speech / Realtime Audio Bridge)</span>
      </div>

      <!-- Coaching Output Terminal -->
      <div id="wenger-terminal-output" class="wenger-terminal">
        [Alex Wenger Voice Coach ready. Mode: TRAIN. Awaiting athlete natural language input.]
      </div>

      <!-- Input Bar -->
      <div class="wenger-input-bar">
        <input type="text" id="wenger-input-text" class="wenger-input" placeholder="Type or speak (e.g. 'Completed 20 reps of tempo drill')...">
        <button id="wenger-mic-btn" class="wenger-voice-btn" title="Voice Input">🎙️</button>
        <button id="wenger-send-btn" class="wenger-send-btn">Send</button>
      </div>
    `;

    document.body.appendChild(hudElement);
    bindEvents();
  }

  function updateVoiceIndicator(state) {
    if (!hudElement) return;
    const bar = hudElement.querySelector('#wenger-voice-indicator');
    if (!bar) return;

    if (state.isSpeaking) {
      bar.className = 'wenger-visualizer-bar speaking';
      bar.innerHTML = `<span>🔊 Alex Wenger speaking (${state.toneState || 'BASELINE'} cadence)...</span>`;
    } else if (state.isListening) {
      bar.className = 'wenger-visualizer-bar listening';
      bar.innerHTML = `<span>🎙️ Listening to athlete speech...</span>`;
    } else {
      bar.className = 'wenger-visualizer-bar';
      bar.innerHTML = `<span>● Voice Ready (Web Speech / Realtime Audio Bridge)</span>`;
    }
  }

  function bindEvents() {
    const tabs = hudElement.querySelectorAll('.wenger-tab-btn');
    const athleteConsentBox = hudElement.querySelector('#wenger-athlete-consent');
    const humanSupervisionBox = hudElement.querySelector('#wenger-human-supervision');
    const careerOptinBox = hudElement.querySelector('#wenger-career-optin');
    const audioToggle = hudElement.querySelector('#wenger-audio-toggle');
    const inputField = hudElement.querySelector('#wenger-input-text');
    const sendBtn = hudElement.querySelector('#wenger-send-btn');
    const micBtn = hudElement.querySelector('#wenger-mic-btn');
    const closeBtn = hudElement.querySelector('#wenger-close-btn');
    const terminal = hudElement.querySelector('#wenger-terminal-output');
    const policyStatus = hudElement.querySelector('#wenger-policy-status');

    function updatePolicyBadge() {
      const modeConfig = OPERATING_MODES[currentMode] || OPERATING_MODES.TRAIN;
      const consent = athleteConsentBox.checked;
      const supervision = humanSupervisionBox.checked;
      const career = careerOptinBox.checked;

      if (!consent) {
        policyStatus.innerText = "● DENIED (CUSTODY)";
        policyStatus.style.color = "#ff7b72";
      } else if (currentMode === "COMPETE" && !supervision) {
        policyStatus.innerText = "● DENIED (SUPERVISION)";
        policyStatus.style.color = "#ff7b72";
      } else if (currentMode === "CAREER" && !career) {
        policyStatus.innerText = "● DENIED (OPT-IN)";
        policyStatus.style.color = "#ff7b72";
      } else {
        policyStatus.innerText = "● AUTHORIZED";
        policyStatus.style.color = "#7ee787";
      }
    }

    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        updatePolicyBadge();
        terminal.innerText = `[Switched to Mode: ${currentMode} - Action: ${OPERATING_MODES[currentMode]?.action || 'TRAIN'}]`;
        terminal.classList.remove('denied');
      });
    });

    athleteConsentBox.addEventListener('change', updatePolicyBadge);
    humanSupervisionBox.addEventListener('change', updatePolicyBadge);
    careerOptinBox.addEventListener('change', updatePolicyBadge);
    audioToggle.addEventListener('change', () => {
      audioEnabled = audioToggle.checked;
      if (!audioEnabled) voiceProxy.stopAll();
    });

    closeBtn.addEventListener('click', () => {
      voiceProxy.stopAll();
      hudElement.style.display = 'none';
    });

    async function executeTurn(text) {
      if (!text || !text.trim()) return;

      const consent = athleteConsentBox.checked;
      const supervision = humanSupervisionBox.checked;
      const career = careerOptinBox.checked;

      const res = await subsystem.executeCoachingTurn(text.trim(), {
        mode: currentMode,
        athlete_consent: consent,
        human_supervision: supervision,
        career_opt_in: career,
        run_id: `hud-run-${Date.now()}`
      });

      if (res.status === "DENIED") {
        terminal.classList.add('denied');
        terminal.innerHTML = `<strong>[GOVERNANCE BLOCKED]</strong><br>${res.routing_result?.message || 'Access Denied'}<br><small style="color:#8b949e;">Reason: ${res.routing_result?.reason_code || 'DENIED'}</small>`;
      } else {
        terminal.classList.remove('denied');
        const out = res.output;
        const sigs = res.signals;
        const comp = res.compliance;

        // Update metric gauges
        hudElement.querySelector('#wenger-compliance-val').innerText = `${Math.round(comp.score * 100)}%`;
        hudElement.querySelector('#wenger-sentiment-val').innerText = (sigs.sentiment_polarity >= 0 ? "+" : "") + sigs.sentiment_polarity.toFixed(2);
        
        const toneVal = hudElement.querySelector('#wenger-tone-val');
        toneVal.innerText = res.tone_state;
        if (res.tone_state === 'MODULATED') toneVal.style.color = '#d29922';
        else if (res.tone_state === 'DECAYED') toneVal.style.color = '#f85149';
        else if (res.tone_state === 'RECOVERING') toneVal.style.color = '#7ee787';
        else toneVal.style.color = '#58a6ff';

        hudElement.querySelector('#wenger-pacing-val').innerText = `${out.pacing_units.toFixed(2)}x`;

        terminal.innerHTML = `<strong>[Coach - ${out.tone_framing}]:</strong><br>${out.text}<br><br><small style="color: #8b949e;">Modality: ${out.delivery_modality} | Pacing: ${out.pacing_units}x | Hash: ${res.evidence?.evidence_hash ? res.evidence.evidence_hash.substring(0, 16) + '...' : 'N/A'}</small>`;

        // Trigger live tone-adapted speech synthesis if audio is enabled
        if (audioEnabled) {
          voiceProxy.speakCoachingResponse({
            text: out.text,
            tone_state: res.tone_state,
            delivery_modality: out.delivery_modality
          });
        }
      }
      updatePolicyBadge();
    }

    sendBtn.addEventListener('click', () => {
      const text = inputField.value;
      inputField.value = "";
      executeTurn(text);
    });

    inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = inputField.value;
        inputField.value = "";
        executeTurn(text);
      }
    });

    micBtn.addEventListener('click', () => {
      if (voiceProxy.isListening) {
        voiceProxy.stopAll();
      } else {
        voiceProxy.startListening((transcript) => {
          inputField.value = transcript;
          executeTurn(transcript);
        }, (err) => {
          terminal.innerHTML += `<br><span style="color:#ff7b72;">[Voice Error]: ${err.message || err}</span>`;
        });
      }
    });
  }

  return {
    mount: render,
    subsystem,
    voiceProxy
  };
}
