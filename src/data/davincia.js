import * as Cesium from 'cesium';
import { evaluatePolicy } from '../governance/evaluate.js';
import { CatalogAssets } from '../marketplace/catalog.js';

const DEFAULT_COORDS = { lat: 51.8985, lon: -8.4756 }; // Cork City Center fallback

export function createDavinciaLayer() {
  let _dataSource = null;
  let _enabled = false;
  let _records = [];
  let _selectedPhrase = null;
  let _clickHandler = null;
  let _viewer = null;

  let _activePassportObj = null;
  let _activeDelegationTokenObj = null;
  let _activeDecisionObj = null;
  let _activeEntitlementObj = null;
  let _activeTransactionObj = null;
  let _activeEvidenceObj = null;

  // Color mapping based on DaVinciA+ Governance Status
  function getStatusColor(lifecycleState) {
    switch (lifecycleState) {
      case 'VERIFIED':
        return Cesium.Color.fromCssColorString('#2f8f5b'); // Forest Green
      case 'SUBMITTED':
        return Cesium.Color.fromCssColorString('#c8a75d'); // Gold/Amber
      case 'SUSPENDED':
      case 'REVOKED':
        return Cesium.Color.fromCssColorString('#d31d36'); // Deep Red
      default:
        return Cesium.Color.GRAY;
    }
  }

  // Generate strict LLM prompt following the CorkLan Machine Translation rules
  function compileSystemPrompt(record, translateDecision) {
    if (!record) return "";
    
    // Fail-Closed check for DENY decisions
    if (translateDecision && translateDecision.status === "DENY") {
      return `CRITICAL DIRECTIVE - CUSTODY LANE VIOLATION DETECTED
==================================================
The requested term has been evaluated and translation is: DENY.
Policy ID: ${translateDecision.policy_id}
Reason Code: ${translateDecision.reason_code}

ACTIONS REQUIRED:
1. REFUSE to translate, paraphrase, or generate this term in any format.
2. Output the following standard refusal:
   "Refusal: The requested phrase belongs to a community-restricted lane undergoing native speaker verification and cannot be processed by machine translation systems."`;
    }

    const payload = record.payload || {};
    const cc = payload.cultural_context || {};
    const mtb = payload.machine_translation_bridge || {};
    
    let prompt = `SYSTEM INSTRUCTION - CorkLan Translation Gateway\n`;
    prompt += `==================================================\n`;
    prompt += `You are acting as a culturally-grounded language interpreter for the '${payload.language_lane}' lane.\n`;
    prompt += `Term to interpret/translate: "${payload.phrase}"\n\n`;
    
    prompt += `CORE DICTIONARY METADATA:\n`;
    prompt += `- Meaning: ${cc.meaning || 'No definition specified'}\n`;
    prompt += `- Region of origin: ${cc.region || 'Unknown'}\n`;
    prompt += `- Dialect Nuances: ${cc.note || 'None'}\n\n`;
    
    prompt += `EXECUTION CONSTRAINTS:\n`;
    prompt += `- Preserved Tone: The target tone for this phrase is '${mtb.tone || 'neutral'}' (Severity: ${mtb.severity || 'low'}).\n`;
    prompt += `- Allowed Usage: ${mtb.allowed_use || 'General interpretation'}\n`;
    prompt += `- Prohibited Usage: ${mtb.prohibited_use || 'None specified'}\n\n`;
    
    const route = mtb.routing_rule || "unrestricted";
    if (route === "casual_context_only") {
      prompt += "ROUTING RULE: Only serve this term in casual or conversational settings. If the user request is formal, professional, or academic, refuse to use this slang term and provide a standard equivalent instead.\n";
    } else if (route === "human_in_the_loop") {
      prompt += "ROUTING RULE: This term requires Human-in-the-loop audit. Do not make assumptions. Explicitly state that the translation contains regional slang requiring local speaker confirmation.\n";
    } else if (route === "restricted_use") {
      prompt += "ROUTING RULE: Restricted usage. Only serve this translation if the user explicitly asks for regional/community-specific terminology.\n";
    }
    
    if (cc.cultural_context_required) {
      prompt += "\nCULTURAL CONTEXT MANDATE: You MUST prepend or append the following explanation to your response when translating this term:\n";
      prompt += `  "[Context: Originating in ${cc.region || 'Cork'}, this phrase is suitable for ${cc.when_to_use || 'informal settings'} and should not be used in ${cc.when_not_to_use || 'formal settings'}.]"\n`;
    }
    
    return prompt;
  }

  // Update UI panel details
  function updateUiPanel(record) {
    if (!record) return;
    
    const panel = document.getElementById('davincia-panel');
    if (!panel) return;

    const btn = panel.querySelector('#dv-request-access-btn');
    const outcome = panel.querySelector('#dv-commerce-outcome');
    const txIdSpan = panel.querySelector('#dv-tx-id');

    // Dynamic Passport & Delegation Admission update
    (async () => {
      let activePassport = null;
      let agentPassport = null;
      let delegationToken = null;

      try {
        // 1. Issue Human Passport
        const passRes = await fetch('/api/davincia/passport/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: { id: "urn:davincia:identity:user:david", name: "David O'Connor", type: "HUMAN" },
            capabilities: ["READ", "TRANSLATE", "DOWNLOAD"]
          })
        });
        const passData = await passRes.json();
        if (passData.passport) {
          activePassport = passData.passport;
          _activePassportObj = activePassport;
          panel.querySelector('#dv-pass-id').textContent = activePassport.passport_id;
        }

        // 2. Issue Agent Passport
        const agentRes = await fetch('/api/davincia/passport/issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identity: { id: "urn:davincia:identity:agent:slang-bot", name: "Slang Bot", type: "AI_AGENT" },
            capabilities: ["READ", "TRANSLATE"]
          })
        });
        const agentData = await agentRes.json();
        if (agentData.passport) {
          agentPassport = { ...agentData.passport, participant_type: "AI_AGENT" };
          panel.querySelector('#dv-agent-urn').textContent = agentPassport.passport_id;
        }

        // 3. Issue Delegation Token
        if (activePassport && agentPassport) {
          const delegRes = await fetch('/api/davincia/agent/delegate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              humanPassport: activePassport,
              agentPassport: agentPassport,
              scopes: ["READ", "TRANSLATE"],
              durationSecs: 3600
            })
          });
          const delegData = await delegRes.json();
          if (delegData.token) {
            delegationToken = delegData.token;
            _activeDelegationTokenObj = delegationToken;
            panel.querySelector('#dv-agent-token').textContent = delegationToken.token_id;
          }
        }
      } catch (err) {
        console.error("Failed to load active passport or delegation HUD:", err);
      }

      if (btn && outcome) {
        outcome.style.display = 'none';
        btn.style.display = 'block';

        // Re-bind click event
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', async () => {
          try {
            // Ingest/refine raw record first
            await fetch('/api/davincia/knowledge/refine');

            const cleanPhrase = record.payload.phrase.toLowerCase().replace(/\s+/g, '-');
            const response = await fetch('/api/davincia/agent/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agentPassport,
                humanPassport: activePassport,
                delegationToken,
                assetId: `urn:davincia:knowledge:asset:${cleanPhrase}`,
                action: "TRANSLATE",
                purpose: "DELEGATED_GEOSPATIAL_VIEW",
                modelTier: "MINI",
                inputTokens: 12000,
                outputTokens: 35000
              })
            });
            const result = await response.json();
            if (result.commerce_event) {
              txIdSpan.textContent = result.commerce_event.transaction_id;
              outcome.style.display = 'block';
              newBtn.style.display = 'none';
              
              _activeTransactionObj = result.commerce_event;
              _activeEntitlementObj = result.entitlement || {
                entitlement_id: "urn:davincia:entitlement:" + Math.random().toString(36).substring(7),
                status: "ACTIVE",
                issued_at: new Date().toISOString()
              };

              // Update dynamic cost readout
              const costVal = result.commerce_event.price;
              panel.querySelector('#dv-agent-cost').textContent = `$${costVal.toFixed(6)} USD`;
            }
          } catch (e) {
            console.error("Agent gateway execution failed:", e);
          }
        });
      }
    })();

    const payload = record.payload || {};
    const translateDecision = record.decisions?.translate;
    const publishDecision = record.decisions?.publish;

    // Show details
    panel.querySelector('#dv-phrase').textContent = payload.phrase;
    panel.querySelector('#dv-lane').textContent = payload.language_lane;
    panel.querySelector('#dv-urn').textContent = record.object_id;
    
    // Catalog metadata enrichment
    const catalogItem = CatalogAssets.find(a => a.asset_id === record.asset_id || a.asset_id.replace("urn:davincia:knowledge:asset:", "") === record.object_id.replace("urn:davincia:knowledge:asset:", ""));
    if (catalogItem) {
      panel.querySelector('#dv-comm-price').textContent = catalogItem.pricing_plan.split(':').pop().toUpperCase().replace(/-/g, ' ');
      panel.querySelector('#dv-comm-license').textContent = catalogItem.license_id.split(':').pop();
      panel.querySelector('#dv-comm-permitted').textContent = catalogItem.permitted_actions.join(', ');
      panel.querySelector('#dv-comm-prohibited').textContent = catalogItem.prohibited_actions.join(', ');
    } else {
      panel.querySelector('#dv-comm-price').textContent = "$0.05 USD";
      panel.querySelector('#dv-comm-license').textContent = "slang-educational (1.0.0)";
      panel.querySelector('#dv-comm-permitted').textContent = "READ, TRANSLATE";
      panel.querySelector('#dv-comm-prohibited').textContent = "TRANSFORM";
    }

    const statusBadge = panel.querySelector('#dv-status-badge');
    statusBadge.textContent = record.lifecycle_state;
    statusBadge.className = 'dv-badge ' + record.lifecycle_state.toLowerCase().replace('_', '-');

    const cc = payload.cultural_context || {};
    panel.querySelector('#dv-meaning').textContent = cc.meaning || 'N/A';
    panel.querySelector('#dv-region').textContent = cc.region || 'N/A';
    panel.querySelector('#dv-when-use').textContent = cc.when_to_use || 'N/A';
    panel.querySelector('#dv-when-not-use').textContent = cc.when_not_to_use || 'N/A';
    panel.querySelector('#dv-nuances').textContent = cc.note || 'None';

    const mtb = payload.machine_translation_bridge || {};
    panel.querySelector('#dv-allowed').textContent = mtb.allowed_use || 'N/A';
    panel.querySelector('#dv-prohibited').textContent = mtb.prohibited_use || 'N/A';
    panel.querySelector('#dv-tone').textContent = mtb.tone || 'N/A';
    panel.querySelector('#dv-severity').textContent = mtb.severity || 'N/A';
    panel.querySelector('#dv-routing').textContent = mtb.routing_rule || 'N/A';

    // Decisions display
    if (translateDecision) {
      _activeDecisionObj = translateDecision;
      const tb = panel.querySelector('#dv-auth-translate');
      tb.textContent = translateDecision.status;
      tb.className = `dv-badge badge-${translateDecision.status.toLowerCase().replace(/_/g, '-')}`;
      panel.querySelector('#dv-policy-id').textContent = translateDecision.policy_id || 'N/A';
      panel.querySelector('#dv-reason-code').textContent = translateDecision.reason_code || 'N/A';
    }
    if (publishDecision) {
      const pb = panel.querySelector('#dv-auth-publish');
      pb.textContent = publishDecision.status;
      pb.className = `dv-badge badge-${publishDecision.status.toLowerCase().replace(/_/g, '-')}`;
    }

    // Evidence details
    const ver = record.verification || {};
    _activeEvidenceObj = {
      evidence_ref: ver.evidence_ref || 'N/A',
      reviewer_role: ver.reviewer_role || 'N/A',
      verified_at: ver.verified_at || new Date().toISOString(),
      sha256_checksum: record.provenance?.checksum || 'N/A'
    };
    panel.querySelector('#dv-evidence-ref').textContent = ver.evidence_ref || 'N/A';

    // Compile system prompt
    const promptText = compileSystemPrompt(record, translateDecision);
    panel.querySelector('#dv-prompt-output').textContent = promptText;

    // Audio Mapping
    const audioWrap = panel.querySelector('#dv-audio-wrap');
    const audio = payload.audio_mapping || {};
    if (audio.file_url) {
      audioWrap.style.display = 'block';
      panel.querySelector('#dv-audio-source').textContent = audio.archive_source || 'Unknown Archive';
      panel.querySelector('#dv-audio-speaker').textContent = audio.speaker_metadata
        ? `${audio.speaker_metadata.speaker_name} (b. ${audio.speaker_metadata.birth_year}, ${audio.speaker_metadata.dialect_variant})`
        : 'Unknown Speaker';
        
      const player = panel.querySelector('#dv-audio-player');
      player.src = audio.file_url;
      player.load();
    } else {
      audioWrap.style.display = 'none';
    }
  }

  const layer = {
    id: 'davincia',
    name: 'DaVinciA⁺ Language Network',
    icon: '📜',
    source: 'DaVinciA⁺ API',
    updateInterval: 30000,

    init(viewer) {
      _viewer = viewer;
      _dataSource = new Cesium.CustomDataSource('davincia');
      _dataSource.show = false;
      viewer.dataSources.add(_dataSource);
      _records = [];
      _enabled = false;
      console.log('[Data:DaVinciA] Initialized');
    },

    enable(viewer) {
      _enabled = true;
      if (_dataSource) _dataSource.show = true;

      // Expand the DaVinciA+ panel
      const panel = document.getElementById('davincia-panel');
      if (panel) {
        panel.classList.add('active');
        panel.classList.remove('collapsed');
      }

      // Fly to Cork City and Munster region
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-8.4756, 51.8985, 35000), // Cork overhead
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-60.0),
          roll: 0.0
        },
        duration: 2.0
      });

      // Bind click selection handler
      _clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      _clickHandler.setInputAction((click) => {
        if (!_enabled) return;
        const picked = viewer.scene.pick(click.position);
        if (picked && picked.id && typeof picked.id.id === 'string' && picked.id.id.startsWith('davincia:')) {
          const phrase = picked.id.id.split(':')[1];
          const record = _records.find(r => r.payload?.phrase === phrase);
          if (record) {
            _selectedPhrase = phrase;
            updateUiPanel(record);
            
            // Fly/zoom onto the clicked node
            const coords = record.provenance?.geographic_origin || DEFAULT_COORDS;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude, 2500),
              duration: 1.5
            });
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      // Bind interactive scenario buttons
      const btnEnter = document.getElementById('btn-scenario-enter');
      const consoleEl = document.getElementById('dv-demo-console');

      if (btnEnter && consoleEl) {
        btnEnter.addEventListener('click', () => {
          const currentRecord = _records.find(r => r.payload?.phrase === _selectedPhrase) || _records[0];
          const phraseText = currentRecord ? currentRecord.payload.phrase : "None";
          const assetUrn = currentRecord ? currentRecord.asset_id : "None";
          const catalogItem = currentRecord ? CatalogAssets.find(a => a.asset_id === currentRecord.asset_id || a.asset_id.replace("urn:davincia:knowledge:asset:", "") === currentRecord.object_id.replace("urn:davincia:knowledge:asset:", "")) : null;
          const priceStr = catalogItem ? `${catalogItem.pricing_plan.split(':').pop().toUpperCase().replace(/-/g, ' ')}` : "$0.05 USD";

          consoleEl.innerHTML = "";
          let logs = [
            `> [1/6] DAVID_OS: Initializing human authority credentials...`,
            `> [2/6] DAVID_OS: Presenting Governance Passport: urn:davincia:passport:human:david`,
            `> [3/6] DaVinciA+: Constitutional engine validating identity... [OK]`,
            `> [4/6] EMBASSY: Querying Governed AI Embassy Catalog for: ${assetUrn}`,
            `> [5/6] EMBASSY: Requesting licensed TRANSLATE action on "${phraseText}"...`,
            `> [6/6] DaVinciA+: Decided ALLOW. Entitlement issued. Settled via Sandbox payment boundary.`
          ];
          
          let index = 0;
          const interval = setInterval(() => {
            if (index < logs.length) {
              consoleEl.innerHTML += logs[index] + "\n";
              consoleEl.scrollTop = consoleEl.scrollHeight;
              
              // Dynamic UI Updates matching the steps
              if (index === 0) {
                document.getElementById('dv-agent-token').textContent = "urn:davincia:token:active-delegation";
                _activeDelegationTokenObj = { token_id: "urn:davincia:token:active-delegation", holder: "urn:davincia:passport:ai_agent:slang-bot", status: "ACTIVE", delegated_by: "urn:davincia:identity:user:david" };
              }
              if (index === 1) {
                document.getElementById('dv-pass-id').textContent = "urn:davincia:passport:human:david";
                _activePassportObj = { passport_id: "urn:davincia:passport:human:david", participant_type: "HUMAN", status: "AUTHORIZED", signature: "DEV_SIGNATURE" };
              }
              if (index === 2) {
                const tr = document.getElementById('dv-auth-translate');
                tr.textContent = "ALLOW";
                tr.className = "dv-badge";
                tr.style.background = "#2f8f5b";
                tr.style.color = "white";
                document.getElementById('dv-policy-id').textContent = "DAVINCIA-CULTURAL-003";
                document.getElementById('dv-reason-code').textContent = "ALLOW_SOVEREIGN";
                _activeDecisionObj = { decision_id: "urn:davincia:decision:gold-e2e", status: "ALLOW", policy_id: "DAVINCIA-CULTURAL-003", reason_code: "ALLOW_SOVEREIGN" };
              }
              if (index === 3) {
                document.getElementById('dv-comm-status').innerHTML = `<span class="dv-badge" style="background:#2f8f5b;color:white;">SANDBOX_ACTIVE</span>`;
              }
              if (index === 4) {
                document.getElementById('dv-agent-cost').textContent = "$0.050000 USD";
              }
              if (index === 5) {
                const txId = "urn:davincia:transaction:gold-e2e-" + Math.random().toString(36).substring(7);
                document.getElementById('dv-tx-id').textContent = txId;
                document.getElementById('dv-commerce-outcome').style.display = "block";
                document.getElementById('dv-evidence-ref').textContent = "urn:davincia:evidence:gold-e2e-receipt";
                
                _activeTransactionObj = { transaction_id: txId, asset_id: assetUrn, action: "TRANSLATE", price: 0.05, payment_provider: "SANDBOX" };
                _activeEntitlementObj = { entitlement_id: "urn:davincia:entitlement:gold-e2e", status: "ACTIVE", holder: "urn:davincia:passport:ai_agent:slang-bot" };
                _activeEvidenceObj = { evidence_ref: "urn:davincia:evidence:gold-e2e-receipt", integrity_hash: "sha256-evidence-integrity-chain-verified" };
              }
              index++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        });
      }

      const btnWenger = document.getElementById('btn-scenario-wenger');
      if (btnWenger && consoleEl) {
        btnWenger.addEventListener('click', () => {
          consoleEl.innerHTML = "";
          let logs = [
            `> [1/6] DAVID_OS: Initializing Player authority context (Player One)...`,
            `> [2/6] DAVID_OS: Verifying Player Passport: urn:davincia:passport:human:player-one`,
            `> [3/6] DaVinciA+: Coach Agent URN (wenger-golf-coach) Delegation: ACTIVE [OK]`,
            `> [4/6] EMBASSY: Querying catalog for asset: wenger-swing-mechanics`,
            `> [5/6] EMBASSY: Requesting COACH action under TRAIN mode...`,
            `> [6/6] DaVinciA+: Decided ALLOW (APPROVED). Entitlement generated. Settled 80/20 split.`
          ];

          let index = 0;
          const interval = setInterval(() => {
            if (index < logs.length) {
              consoleEl.innerHTML += logs[index] + "\n";
              consoleEl.scrollTop = consoleEl.scrollHeight;

              // Dynamic UI Updates matching the steps
              if (index === 0) {
                document.getElementById('dv-agent-token').textContent = "urn:davincia:token:wenger-delegation";
                _activeDelegationTokenObj = { token_id: "urn:davincia:token:wenger-delegation", holder: "urn:davincia:identity:agent:wenger-golf-coach", status: "ACTIVE", delegated_by: "urn:davincia:identity:user:player-one" };
              }
              if (index === 1) {
                document.getElementById('dv-pass-id').textContent = "urn:davincia:passport:human:player-one";
                _activePassportObj = { passport_id: "urn:davincia:passport:human:player-one", participant_type: "HUMAN", status: "AUTHORIZED", athlete_consent: true };
              }
              if (index === 2) {
                const tr = document.getElementById('dv-auth-translate');
                tr.textContent = "ALLOW";
                tr.className = "dv-badge";
                tr.style.background = "#2f8f5b";
                tr.style.color = "white";
                document.getElementById('dv-policy-id').textContent = "DAVINCIA-GOLF-004";
                document.getElementById('dv-reason-code').textContent = "APPROVED";
                _activeDecisionObj = { decision_id: "urn:davincia:decision:wenger-coach-allow", status: "ALLOW", policy_id: "DAVINCIA-GOLF-004", reason_code: "APPROVED" };
              }
              if (index === 3) {
                document.getElementById('dv-comm-status').innerHTML = `<span class="dv-badge" style="background:#2f8f5b;color:white;">SANDBOX_ACTIVE</span>`;
                document.getElementById('dv-comm-price').textContent = "USAGE BASED";
                document.getElementById('dv-comm-license').textContent = "wenger-commercial-v1";
                document.getElementById('dv-comm-permitted').textContent = "READ, ANALYSE, COACH";
                document.getElementById('dv-comm-prohibited').textContent = "TRANSFORM, DELETE";
              }
              if (index === 4) {
                document.getElementById('dv-agent-cost').textContent = "$0.050000 USD";
              }
              if (index === 5) {
                const txId = "urn:davincia:transaction:wenger-coaching-" + Math.random().toString(36).substring(7);
                document.getElementById('dv-tx-id').textContent = txId;
                document.getElementById('dv-commerce-outcome').style.display = "block";
                document.getElementById('dv-evidence-ref').textContent = "urn:davincia:evidence:wenger-coaching-receipt";

                _activeTransactionObj = { transaction_id: txId, asset_id: "urn:davincia:knowledge:asset:wenger-swing-mechanics", action: "COACH", price: 0.05, split: { owner: 0.04, platform: 0.01 } };
                _activeEntitlementObj = { entitlement_id: "urn:davincia:entitlement:wenger-coaching", status: "ACTIVE", holder: "urn:davincia:identity:agent:wenger-golf-coach" };
                _activeEvidenceObj = { evidence_ref: "urn:davincia:evidence:wenger-coaching-receipt", integrity_hash: "sha256-wenger-swing-mechanics-prov-hash-88c2f1" };
              }
              index++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        });
      }

      // Bind Adversarial Attacks
      const btnAttackRevoked = document.getElementById('btn-attack-revoked');
      const btnAttackDrift = document.getElementById('btn-attack-drift');
      const btnAttackBypass = document.getElementById('btn-attack-bypass');

      if (btnAttackRevoked && consoleEl) {
        btnAttackRevoked.addEventListener('click', () => {
          consoleEl.innerHTML = "";
          let logs = [
            `> [ATTACK A] Presenting Agent Passport: urn:davincia:passport:ai_agent:malicious-bot`,
            `> [ATTACK A] Request: TRANSLATE on Munster Slang Slips`,
            `> [ATTACK A] DaVinciA+ Policy Engine: Verifying Delegation Status...`,
            `> [CRITICAL WARNING] DELEGATION REVOKED BY OPERATOR (DAVID_OS)`,
            `> [OUTCOME] DENY (INVALID_DELEGATION)`,
            `> [DOWNSTREAM ACTION] ENTITLEMENT: NOT ISSUED | PAYMENT: NOT INITIATED | EVIDENCE: LOGGED`
          ];
          
          let index = 0;
          const interval = setInterval(() => {
            if (index < logs.length) {
              consoleEl.innerHTML += logs[index] + "\n";
              consoleEl.scrollTop = consoleEl.scrollHeight;

              if (index === 3) {
                document.getElementById('dv-agent-token').textContent = "REVOKED";
                document.getElementById('dv-agent-token').style.color = "#d31d36";
                _activeDelegationTokenObj = { token_id: "urn:davincia:token:active-delegation", status: "REVOKED" };
              }
              if (index === 4) {
                const tr = document.getElementById('dv-auth-translate');
                tr.textContent = "DENY";
                tr.className = "dv-badge badge-deny";
                tr.style.background = "#d31d36";
                document.getElementById('dv-policy-id').textContent = "DAVINCIA-CORE-001";
                document.getElementById('dv-reason-code').textContent = "INVALID_DELEGATION";
                _activeDecisionObj = { status: "DENY", reason_code: "INVALID_DELEGATION" };
              }
              if (index === 5) {
                document.getElementById('dv-commerce-outcome').style.display = "none";
                document.getElementById('dv-evidence-ref').textContent = "urn:davincia:evidence:revocation-incident-log";
                _activeEvidenceObj = { incident_ref: "urn:davincia:evidence:revocation-incident-log", status: "ALERT_LOGGED" };
              }
              index++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        });
      }

      if (btnAttackDrift && consoleEl) {
        btnAttackDrift.addEventListener('click', () => {
          consoleEl.innerHTML = "";
          let logs = [
            `> [ATTACK B] Querying metadata for asset: urn:davincia:knowledge:asset:brehon-ip`,
            `> [ATTACK B] Current Checksum: sha256-unaligned-checksum-58291a`,
            `> [ATTACK B] Target Registry Checksum: sha256-derived-brehon-ip`,
            `> [CRITICAL WARNING] PROVENANCE DRIFT DETECTED (INTEGRITY_MISMATCH)`,
            `> [OUTCOME] DENY (PROVENANCE_DRIFT_SUSPENSION)`,
            `> [DOWNSTREAM ACTION] ENTITLEMENT: SUSPENDED | CONSUMPTION: BLOCKED | EVIDENCE: LOGGED`
          ];
          
          let index = 0;
          const interval = setInterval(() => {
            if (index < logs.length) {
              consoleEl.innerHTML += logs[index] + "\n";
              consoleEl.scrollTop = consoleEl.scrollHeight;

              if (index === 3) {
                document.getElementById('dv-urn').textContent = "WARNING: PROVENANCE_DRIFT";
                document.getElementById('dv-urn').style.color = "#d31d36";
              }
              if (index === 4) {
                const tr = document.getElementById('dv-auth-translate');
                tr.textContent = "DENY";
                tr.className = "dv-badge badge-deny";
                tr.style.background = "#d31d36";
                document.getElementById('dv-policy-id').textContent = "DAVINCIA-DRIFT-002";
                document.getElementById('dv-reason-code').textContent = "PROVENANCE_DRIFT_SUSPENSION";
                _activeDecisionObj = { status: "DENY", reason_code: "PROVENANCE_DRIFT_SUSPENSION" };
              }
              if (index === 5) {
                document.getElementById('dv-commerce-outcome').style.display = "none";
                document.getElementById('dv-evidence-ref').textContent = "urn:davincia:evidence:drift-incident-log";
                _activeEvidenceObj = { incident_ref: "urn:davincia:evidence:drift-incident-log", status: "DRIFT_LOGGED" };
              }
              index++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        });
      }

      if (btnAttackBypass && consoleEl) {
        btnAttackBypass.addEventListener('click', () => {
          consoleEl.innerHTML = "";
          let logs = [
            `> [ATTACK C] Bypassing DaVinciA+ Policy Gate...`,
            `> [ATTACK C] Directly invoking settlement endpoint: /api/commerce/settle`,
            `> [ATTACK C] Presenting raw payload and credit card token...`,
            `> [CRITICAL WARNING] CLEARING FAILURE: NO AUTHORIZED GOVERNANCE DECISION RESOLVED`,
            `> [OUTCOME] HOLD / DENY (GOVERNANCE_SOVEREIGNTY_VIOLATION)`,
            `> [DOWNSTREAM ACTION] SETTLEMENT: BLOCKED | PRICE: $0.00`
          ];
          
          let index = 0;
          const interval = setInterval(() => {
            if (index < logs.length) {
              consoleEl.innerHTML += logs[index] + "\n";
              consoleEl.scrollTop = consoleEl.scrollHeight;

              if (index === 3) {
                const tr = document.getElementById('dv-auth-translate');
                tr.textContent = "DENY";
                tr.className = "dv-badge badge-deny";
                tr.style.background = "#d31d36";
                document.getElementById('dv-policy-id').textContent = "DAVINCIA-SOVEREIGNTY-001";
                document.getElementById('dv-reason-code').textContent = "GOVERNANCE_SOVEREIGNTY_VIOLATION";
                _activeDecisionObj = { status: "DENY", reason_code: "GOVERNANCE_SOVEREIGNTY_VIOLATION" };
              }
              if (index === 5) {
                document.getElementById('dv-commerce-outcome').style.display = "none";
                _activeTransactionObj = { transaction_status: "BLOCKED", reason: "BYPASS_ATTEMPT_REJECTED" };
              }
              index++;
            } else {
              clearInterval(interval);
            }
          }, 300);
        });
      }

      // JSON Inspector Click Handlers
      const inspectorBox = document.getElementById('dv-json-inspector-box');
      const inspectorTitle = document.getElementById('inspector-title');
      const inspectorContent = document.getElementById('inspector-content');
      const btnCloseInspector = document.getElementById('btn-close-inspector');

      if (btnCloseInspector && inspectorBox) {
        btnCloseInspector.addEventListener('click', () => {
          inspectorBox.style.display = 'none';
        });
      }

      function showInspector(title, data) {
        if (!inspectorBox || !inspectorTitle || !inspectorContent) return;
        inspectorTitle.textContent = title;
        inspectorContent.textContent = JSON.stringify(data, null, 2);
        inspectorBox.style.display = 'block';
        inspectorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const btnInspectDelegation = document.getElementById('inspect-delegation');
      if (btnInspectDelegation) {
        btnInspectDelegation.addEventListener('click', () => {
          showInspector("Delegation Token Schema", _activeDelegationTokenObj || { status: "NONE_ACTIVE" });
        });
      }

      const btnInspectPassport = document.getElementById('inspect-passport');
      if (btnInspectPassport) {
        btnInspectPassport.addEventListener('click', () => {
          showInspector("Passport Schema", _activePassportObj || { status: "NONE_ACTIVE" });
        });
      }

      const btnInspectDecision = document.getElementById('inspect-decision');
      if (btnInspectDecision) {
        btnInspectDecision.addEventListener('click', () => {
          showInspector("Decision Object Schema", _activeDecisionObj || { status: "NONE_PENDING" });
        });
      }

      const btnInspectEvidence = document.getElementById('inspect-evidence');
      if (btnInspectEvidence) {
        btnInspectEvidence.addEventListener('click', () => {
          showInspector("Evidence Package Schema", _activeEvidenceObj || { status: "NONE_PENDING" });
        });
      }

      const btnInspectTransaction = document.getElementById('inspect-transaction');
      if (btnInspectTransaction) {
        btnInspectTransaction.addEventListener('click', () => {
          showInspector("Transaction Receipt Schema", _activeTransactionObj || { status: "NONE_SETTLED" });
        });
      }

      // Explain Mode Toggle Handler
      const toggleExplainMode = document.getElementById('toggle-explain-mode');
      if (toggleExplainMode) {
        toggleExplainMode.addEventListener('change', (e) => {
          const notes = document.querySelectorAll('.dv-explain-note');
          notes.forEach(note => {
            note.style.display = e.target.checked ? 'block' : 'none';
          });
        });
      }

      // Tour Wizard Handler
      const btnStartTour = document.getElementById('btn-start-tour');
      const tourCard = document.getElementById('tour-hud-card');
      const tourTitle = document.getElementById('tour-act-title');
      const tourStep = document.getElementById('tour-act-step');
      const tourDesc = document.getElementById('tour-act-description');
      const btnTourPrev = document.getElementById('btn-tour-prev');
      const btnTourNext = document.getElementById('btn-tour-next');

      const tourSteps = [
        {
          title: "ACT I: THE HUMAN (DAVID_OS)",
          description: "Every governed environment begins with human authority. DAVID_OS represents the sovereign operator environment from which David governs delegated agents, reviews transactions, and controls the constitutional boundaries.",
          focusLayer: "L1"
        },
        {
          title: "ACT II: THE BORDER (DaVinciA⁺)",
          description: "Technical capability does not create authority. DaVinciA⁺ is the constitutional layer that issues and validates Governance Passports. Identity checks are enforced at the network border before any interaction is permitted.",
          focusLayer: "L2"
        },
        {
          title: "ACT III: THE TERRITORY (Embassy Catalog)",
          description: "Knowledge assets in the Embassy are discoverable without becoming uncontrolled. The registry stores versioned license agreements, pricing models (Fixed/Usage), and provenance checksums for catalog search.",
          focusLayer: "L3"
        },
        {
          title: "ACT IV: THE REQUEST (Access Pipeline)",
          description: "When an external participant or AI agent requests access to a registered asset, the transaction orchestrator intercepts the request, packaging identity credentials and target parameters.",
          focusLayer: "L2"
        },
        {
          title: "ACT V: THE DECISION (Sovereign Resolution)",
          description: "DaVinciA⁺ evaluates the request against policy precedence rules, emitting an immutable Decision Object (ALLOW, ALLOW_WITH_CONSTRAINTS, or DENY). If authorization fails, the pipeline locks immediately.",
          focusLayer: "L2"
        },
        {
          title: "ACT VI: THE ECONOMY (Sovereignty Separation)",
          description: "Governance is separate from payment. Once authorized, the system issues an entitlement, records consumption bounds, clears sandbox allocations, and writes a reconstructible evidence package to the ledger.",
          focusLayer: "L3"
        }
      ];

      let currentTourIndex = 0;

      function renderTourStep() {
        if (!tourSteps[currentTourIndex]) return;
        const step = tourSteps[currentTourIndex];
        tourTitle.textContent = step.title;
        tourStep.textContent = `Step ${currentTourIndex + 1} of ${tourSteps.length}`;
        tourDesc.textContent = step.description;

        // Visually highlight the target layer panel section!
        const l1 = document.querySelector('[style*="#1a82e2"]');
        const l2 = document.querySelector('[style*="#2f8f5b"]');
        const l3 = document.querySelector('[style*="#c8a75d"]');
        
        if (l1) l1.style.boxShadow = step.focusLayer === "L1" ? "0 0 12px #1a82e2" : "none";
        if (l2) l2.style.boxShadow = step.focusLayer === "L2" ? "0 0 12px #2f8f5b" : "none";
        if (l3) l3.style.boxShadow = step.focusLayer === "L3" ? "0 0 12px #c8a75d" : "none";
      }

      if (btnStartTour) {
        btnStartTour.addEventListener('click', () => {
          currentTourIndex = 0;
          tourCard.style.display = 'block';
          renderTourStep();
        });
      }

      if (btnTourPrev) {
        btnTourPrev.addEventListener('click', () => {
          if (currentTourIndex > 0) {
            currentTourIndex--;
            renderTourStep();
          }
        });
      }

      if (btnTourNext) {
        btnTourNext.addEventListener('click', () => {
          if (currentTourIndex < tourSteps.length - 1) {
            currentTourIndex++;
            renderTourStep();
          } else {
            // End of tour, hide it
            tourCard.style.display = 'none';
            // Reset shadows
            const l1 = document.querySelector('[style*="#1a82e2"]');
            const l2 = document.querySelector('[style*="#2f8f5b"]');
            const l3 = document.querySelector('[style*="#c8a75d"]');
            if (l1) l1.style.boxShadow = "none";
            if (l2) l2.style.boxShadow = "none";
            if (l3) l3.style.boxShadow = "none";
          }
        });
      }

      // Trigger initial load
      this.update(viewer);
    },

    disable(viewer) {
      _enabled = false;
      if (_dataSource) _dataSource.show = false;
      
      const panel = document.getElementById('davincia-panel');
      if (panel) {
        panel.classList.remove('active');
        panel.classList.add('collapsed');
      }

      if (_clickHandler) {
        _clickHandler.destroy();
        _clickHandler = null;
      }
    },

    async update(viewer) {
      try {
        const response = await fetch('/api/davincia/records');
        if (!response.ok) {
          console.warn(`[Data:DaVinciA] API returned status ${response.status}`);
          return false;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.warn('[Data:DaVinciA] Response is not an array');
          return false;
        }

        const actor = { id: "urn:davincia:identity:user:david", class: "HUMAN" };
        
        // Pre-compute decisions for each record
        for (const record of data) {
          const translate = await evaluatePolicy(record, "TRANSLATE", actor);
          const publish = await evaluatePolicy(record, "PUBLISH", actor);
          record.decisions = { translate, publish };
        }

        _records = data;
        _dataSource.entities.removeAll();

        _records.forEach((record) => {
          const payload = record.payload || {};
          const coords = record.provenance?.geographic_origin || DEFAULT_COORDS;
          const position = Cesium.Cartesian3.fromDegrees(coords.longitude, coords.latitude);
          const color = getStatusColor(record.lifecycle_state);

          _dataSource.entities.add({
            id: `davincia:${payload.phrase}`,
            position,
            point: {
              pixelSize: 16,
              color: color,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 3,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            label: {
              text: payload.phrase,
              font: 'bold 13px JetBrains Mono, monospace',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 4,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -22),
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            },
            properties: record
          });
        });

        // Update UI with first record if nothing is selected yet
        if (_records.length > 0 && !_selectedPhrase) {
          _selectedPhrase = _records[0].payload?.phrase;
          updateUiPanel(_records[0]);
        } else if (_selectedPhrase) {
          const current = _records.find(r => r.payload?.phrase === _selectedPhrase);
          if (current) updateUiPanel(current);
        }

        console.log(`[Data:DaVinciA] Loaded ${_records.length} linguistic records`);
        return true;
      } catch (e) {
        console.warn('[Data:DaVinciA] Fetch error:', e);
        return false;
      }
    },

    destroy(viewer) {
      this.disable(viewer);
      if (_dataSource) {
        viewer.dataSources.remove(_dataSource, true);
        _dataSource = null;
      }
      _records = [];
      _selectedPhrase = null;
    },

    getStats() {
      return {
        count: _records.length,
        selected: _selectedPhrase
      };
    }
  };

  return layer;
}

const davinciaLayer = createDavinciaLayer();
export default davinciaLayer;
